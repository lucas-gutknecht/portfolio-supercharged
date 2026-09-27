import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REPO_URL } from '../../data/profile';
import { Icon, IconName } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

interface Layer {
  icon: IconName;
  title: string;
  summary: string;
  points: string[];
  file: string;
}

const src = (path: string) => `${REPO_URL}/blob/main/${path}`;

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
        'Standalone components, signals and zoneless change detection',
        'Lazy-loaded routes with view transitions',
        'Hand-built SCSS design system: no UI framework',
        'Canvas "data network" background that respects reduced motion',
      ],
      file: src('frontend/src/app'),
    },
    {
      icon: 'bolt',
      title: 'API',
      summary: 'TypeScript Lambda on Node 22 (ARM / Graviton).',
      points: [
        'One transport-agnostic router shared by Lambda and the local dev server',
        'Email sent over Gmail SMTP with nodemailer',
        'Secrets read from SSM Parameter Store and cached per container',
        'OpenAPI 3 spec served at /api/openapi.json',
      ],
      file: src('api/src/router.ts'),
    },
    {
      icon: 'cloud',
      title: 'Delivery',
      summary: 'CloudFront in front of both S3 and API Gateway.',
      points: [
        'Private S3 bucket reachable only through Origin Access Control',
        'HTTP/2 and HTTP/3, compression, and managed security headers',
        'A CloudFront Function rewrites deep links to index.html',
        '/api/* routed to API Gateway with caching disabled and throttling on',
      ],
      file: src('infra/lib/portfolio-stack.ts'),
    },
    {
      icon: 'pipeline',
      title: 'Infrastructure as code',
      summary: 'Everything is defined in a single AWS CDK stack in TypeScript.',
      points: [
        'esbuild bundles the Lambda during synth',
        'BucketDeployment uploads the Angular build and invalidates the cache',
        'Route 53 A and AAAA alias records plus an ACM certificate',
        'Least-privilege IAM: the Lambda can read only its own parameter',
      ],
      file: src('infra/lib/portfolio-stack.ts'),
    },
  ];

  protected readonly commands = [
    { cmd: 'npm run setup', note: 'install the root, frontend, api and infra packages' },
    { cmd: 'npm run dev', note: 'API on :3000 + Angular on :4200 with an /api proxy' },
    { cmd: 'npm run deploy', note: 'build Angular, then run cdk deploy' },
  ];
}
