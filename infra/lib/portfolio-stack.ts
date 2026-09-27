import { join } from 'node:path';
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import type { Construct } from 'constructs';

export interface PortfolioConfig {
  account: string;
  region: string;
  applicationTag: string;
  domainName: string;
  zoneName: string;
  /** Existing us-east-1 certificate. When omitted, the stack creates one validated through the hosted zone. */
  certificateArn?: string;
  gmailPasswordParameter: string;
  /** Google Search Console domain-verification token, published as a TXT record on the zone apex. */
  googleSiteVerification?: string;
}

interface PortfolioStackProps extends StackProps {
  config: PortfolioConfig;
}

const REPO_ROOT = join(__dirname, '..', '..');

/**
 * Angular SPA in a private S3 bucket, served by CloudFront. Requests to /api/*
 * are routed by CloudFront to API Gateway, which proxies to a TypeScript Lambda.
 */
export class PortfolioStack extends Stack {
  constructor(scope: Construct, id: string, props: PortfolioStackProps) {
    super(scope, id, props);
    const { config } = props;

    // ---------- API: Lambda + API Gateway ----------
    const apiFunction = new nodejs.NodejsFunction(this, 'ApiFunction', {
      entry: join(REPO_ROOT, 'api', 'src', 'lambda.ts'),
      projectRoot: join(REPO_ROOT, 'api'),
      depsLockFilePath: join(REPO_ROOT, 'api', 'package-lock.json'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(15),
      logGroup: new logs.LogGroup(this, 'ApiLogs', {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      environment: {
        GMAIL_SENDER_EMAIL: 'lucas.gutknecht.portfolio@gmail.com',
        GMAIL_PASSWORD_PARAM: config.gmailPasswordParameter,
      },
      bundling: { minify: true, sourceMap: true },
    });

    apiFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter${config.gmailPasswordParameter}`,
        ],
      }),
    );

    const api = new apigateway.LambdaRestApi(this, 'PortfolioApi', {
      handler: apiFunction,
      restApiName: 'portfolio-api',
      description: 'API behind the professional portfolio site.',
      deployOptions: {
        stageName: 'prod',
        // Keep the public email endpoint from being abused.
        throttlingRateLimit: 5,
        throttlingBurstLimit: 10,
      },
    });

    // ---------- Static site: S3 + CloudFront ----------
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Send deep links like /this-website to index.html so the Angular router handles them.
    const spaRewrite = new cloudfront.Function(this, 'SpaRewrite', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  if (!request.uri.includes('.')) {
    request.uri = '/index.html';
  }
  return request;
}`),
    });

    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', { domainName: config.zoneName });

    const certificate = config.certificateArn
      ? acm.Certificate.fromCertificateArn(this, 'Certificate', config.certificateArn)
      : new acm.Certificate(this, 'Certificate', {
          domainName: config.domainName,
          validation: acm.CertificateValidation.fromDns(zone),
        });

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      comment: 'Portfolio website',
      domainNames: [config.domainName],
      certificate,
      defaultRootObject: 'index.html',
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        compress: true,
        functionAssociations: [
          { function: spaRewrite, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
    });

    new s3deploy.BucketDeployment(this, 'DeploySite', {
      sources: [s3deploy.Source.asset(join(REPO_ROOT, 'frontend', 'dist', 'frontend', 'browser'))],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
    });

    // ---------- DNS ----------
    const recordName = config.domainName.replace(`.${config.zoneName}`, '');
    const aliasTarget = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution));
    new route53.ARecord(this, 'SiteARecord', { zone, recordName, target: aliasTarget });
    new route53.AaaaRecord(this, 'SiteAaaaRecord', { zone, recordName, target: aliasTarget });

    // Search Console "Domain" property verification; on the apex so it covers www and any subdomain.
    if (config.googleSiteVerification) {
      new route53.TxtRecord(this, 'GoogleSiteVerification', {
        zone,
        values: [config.googleSiteVerification],
        ttl: Duration.minutes(5),
      });
    }

    new CfnOutput(this, 'SiteUrl', { value: `https://${config.domainName}` });
    new CfnOutput(this, 'CloudFrontUrl', { value: `https://${distribution.distributionDomainName}` });
    new CfnOutput(this, 'ApiGatewayUrl', { value: api.url });
  }
}
