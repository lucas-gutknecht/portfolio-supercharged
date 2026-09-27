import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REPO_URL } from '../../data/profile';
import { Icon, IconName } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

interface Point {
  text: string;
  /** GitHub link to the lines that implement this point. */
  href: string;
}

interface Layer {
  icon: IconName;
  title: string;
  summary: string;
  points: Point[];
  file: string;
}

/** Links to a file on GitHub, optionally highlighting a range of lines. */
const src = (path: string, from?: number, to?: number) =>
  `${REPO_URL}/blob/main/${path}` + (from ? `#L${from}` + (to ? `-L${to}` : '') : '');
const tree = (path: string) => `${REPO_URL}/tree/main/${path}`;

const STACK = 'infra/lib/portfolio-stack.ts';

@Component({
  selector: 'app-this-website',
  imports: [RouterLink, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './this-website.html',
  styleUrl: './this-website.scss',
})
export class ThisWebsite {
  protected readonly repoUrl = REPO_URL;

  protected readonly layers: Layer[] = [
    {
      icon: 'code',
      title: 'Frontend',
      summary: 'Angular 21 single-page app written in TypeScript.',
      points: [
        {
          text: 'Standalone components, signals and zoneless change detection',
          href: src('frontend/src/app/app.config.ts', 12, 23),
        },
        {
          text: 'Lazy-loaded routes with view transitions',
          href: src('frontend/src/app/app.routes.ts', 3, 22),
        },
        {
          text: 'Hand-built SCSS design system: no UI framework',
          href: src('frontend/src/styles.scss', 1, 32),
        },
        {
          text: 'Canvas "data network" background that respects reduced motion',
          href: src('frontend/src/app/shared/data-field.ts', 22, 145),
        },
      ],
      file: tree('frontend/src/app'),
    },
    {
      icon: 'bolt',
      title: 'API',
      summary: 'TypeScript Lambda on Node 22 (ARM / Graviton).',
      points: [
        {
          text: 'One transport-agnostic router shared by Lambda and the local dev server',
          href: src('api/src/router.ts', 22, 56),
        },
        {
          text: 'Email sent over Gmail SMTP with nodemailer',
          href: src('api/src/email.ts', 39, 45),
        },
        {
          text: 'Secrets read from SSM Parameter Store and cached per container',
          href: src('api/src/email.ts', 17, 28),
        },
        {
          text: 'OpenAPI 3 spec served at /api/openapi.json',
          href: src('api/src/router.ts', 30, 32),
        },
      ],
      file: tree('api/src'),
    },
    {
      icon: 'cloud',
      title: 'Delivery',
      summary: 'CloudFront in front of both S3 and API Gateway.',
      points: [
        {
          text: 'Private S3 bucket reachable only through Origin Access Control',
          href: src(STACK, 124),
        },
        {
          text: 'HTTP/2 and HTTP/3, compression, and managed security headers',
          href: src(STACK, 121, 128),
        },
        {
          text: 'A CloudFront Function rewrites deep links to index.html',
          href: src(STACK, 95, 105),
        },
        { text: '/api/* routed to API Gateway with caching disabled', href: src(STACK, 134, 140) },
        {
          text: 'API Gateway throttled to protect the public email endpoint',
          href: src(STACK, 73, 83),
        },
      ],
      file: src(STACK),
    },
    {
      icon: 'pipeline',
      title: 'Infrastructure as code',
      summary: 'Everything is defined in a single AWS CDK stack in TypeScript.',
      points: [
        { text: 'esbuild bundles the Lambda during synth', href: src(STACK, 44, 62) },
        {
          text: 'BucketDeployment uploads the Angular build and invalidates the cache',
          href: src(STACK, 144, 150),
        },
        { text: 'ACM certificate validated through Route 53 DNS', href: src(STACK, 109, 114) },
        { text: 'Route 53 A and AAAA alias records to CloudFront', href: src(STACK, 153, 156) },
        {
          text: 'Least-privilege IAM: the Lambda can read only its own parameter',
          href: src(STACK, 64, 71),
        },
      ],
      file: src(STACK),
    },
  ];

  protected readonly commands = [
    { cmd: 'npm run setup', note: 'install the root, frontend, api and infra packages' },
    { cmd: 'npm run dev', note: 'API on :3000 + Angular on :4200 with an /api proxy' },
    { cmd: 'npm run deploy', note: 'build Angular, then run cdk deploy' },
  ];
}
