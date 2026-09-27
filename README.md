# Lucas Gutknecht · Portfolio

Source for [www.lucas-gutknecht-supercharged.com](https://www.lucas-gutknecht-supercharged.com): a professional portfolio built with **Angular and TypeScript**, served from **CloudFront**, with a small **TypeScript Lambda** API. All of the infrastructure is defined in **AWS CDK (TypeScript)**.

```
Visitor ─▶ Route 53 ─▶ CloudFront ─┬─ /*      ─▶ S3 (Angular build, private via OAC)
                                   └─ /api/*  ─▶ API Gateway ─▶ Lambda (Node 22) ─▶ SSM · Gmail SMTP
```

## Repository layout

| Folder      | What it is                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| `frontend/` | Angular 21 SPA: pages, design system and animations                        |
| `api/`      | TypeScript API: shared router, Lambda handler and local dev server         |
| `infra/`    | CDK stack: S3, CloudFront, API Gateway, Lambda, Route 53, ACM and IAM      |

## Site features

### Pages

| Route           | Page                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| `/`             | Home: the portfolio itself (sections below)                                           |
| `/this-website` | How the site is built: frontend, API, delivery and IaC layers, with links to the source |
| `/live-api`     | Live API console for calling the real Lambda from the browser                         |
| `/apidocs`      | Redirects to `/live-api`, so the old Swagger link keeps working                       |
| anything else   | Redirects to `/`                                                                      |

Every route is [lazy-loaded](frontend/src/app/app.routes.ts#L3-L22), and navigation uses [view transitions](frontend/src/app/app.config.ts#L16-L21). Deep links work on CloudFront because a [CloudFront Function](infra/lib/portfolio-stack.ts#L95-L105) rewrites any path without a file extension to `index.html`.

### Home page

- **Hero:** name, headshot, a typewriter that cycles through roles, the tagline, and buttons for the resume download, email and GitHub.
- **Stats band:** counters that count up when they scroll into view.
- **About (`#about`):** bio and focus-area cards.
- **Skills (`#skills`):** skill bars scaled by years of experience that animate on first view, plus a grouped toolbox of technologies.
- **Experience (`#experience`):** a timeline that shows the three most recent roles, with a button to expand the earlier ones.
- **Education:** degrees and certifications.
- **Resume (`#resume`):** an inline PDF preview that can be toggled open, plus a download button.
- **Contact (`#contact`):** a mailto link and a live demo form. Entering an email address calls `POST /api/send_portfolio_email`, which sends a real intro email, and the form reports how long the Lambda took to answer.

### Live API console

- Pick one of the three endpoints, edit the JSON body for `POST` requests (the body is validated as JSON before sending), and send the request.
- Shows the HTTP status (colored by success, client error or server error), the latency in milliseconds, and the JSON response with syntax highlighting.
- Generates the equivalent `curl` command for the current origin.

### Shared UI

- **Navigation:** links to the home sections and the other pages. It changes style once you scroll, collapses into a menu on small screens, and closes with Escape.
- **Animated background:** a [full-screen canvas](frontend/src/app/shared/data-field.ts#L22-L145) of drifting nodes that link up when close and lean toward the cursor.
- **Scroll reveal:** the [`appReveal` directive](frontend/src/app/shared/reveal.directive.ts) fades sections in the first time they enter the viewport.
- **Footer:** email, GitHub and resume links, plus links to `/this-website` and the source repo.
- **Accessibility:** a skip-to-content link, labelled icon links, and support for `prefers-reduced-motion` (the typewriter, background and other animations stop).
- **SEO and sharing:** page titles per route, a meta description, and Open Graph tags that use the headshot.

### Editing content

All site content (name, roles, bio, stats, focus areas, skills, toolbox, experience and education) lives in [`frontend/src/app/data/profile.ts`](frontend/src/app/data/profile.ts). Static files are in `frontend/public/`:

| File                     | Used for                          |
| ------------------------ | --------------------------------- |
| `files/resume.pdf`       | Resume preview and download       |
| `images/headshot.jpg`    | Hero portrait and Open Graph image |
| `favicon.png`            | Browser tab icon                  |
| `google*.html`           | Google Search Console verification |

## API

The API is one transport-agnostic router ([`api/src/router.ts`](api/src/router.ts#L22-L56)) used by both the [Lambda handler](api/src/lambda.ts#L4-L15) and the [local dev server](api/src/local.ts#L12-L25). Every response is JSON.

| Method | Path                          | Description                                                      |
| ------ | ----------------------------- | ---------------------------------------------------------------- |
| GET    | `/api/hello`                  | Hello-world round trip                                           |
| POST   | `/api/send_portfolio_email`   | Sends an intro email. Body: `{ "recipient_email": "..." }`       |
| GET    | `/api/openapi.json`           | OpenAPI 3 spec for this API                                      |

`POST /api/send_portfolio_email` behaves as follows:

- It [returns `400`](api/src/router.ts#L35-L48) if the body isn't JSON, if `recipient_email` is missing, or if the address isn't valid.
- It [sends the email](api/src/email.ts#L39-L45) from `lucas.gutknecht.portfolio@gmail.com` over Gmail SMTP with nodemailer and returns `200` on success or `500` if sending fails.
- It gets the Gmail app password from the `GMAIL_APP_PASSWORD` environment variable when running locally. In AWS it [reads the password](api/src/email.ts#L17-L28) once per Lambda container from an SSM SecureString parameter and caches it.
- If no password is configured, it runs in [**dry-run mode**](api/src/email.ts#L34-L37): it logs the email instead of sending it and still returns `200`.

Unknown routes return `404`. In AWS, API Gateway [throttles the API](infra/lib/portfolio-stack.ts#L77-L82) to 5 requests per second (bursts up to 10) to stop the public email endpoint from being abused.

## Infrastructure

Everything is in one CDK stack, `PortfolioWeb` (CloudFormation name `portfolio-web-stack`), in [`infra/lib/portfolio-stack.ts`](infra/lib/portfolio-stack.ts):

- **[Lambda](infra/lib/portfolio-stack.ts#L44-L62):** Node 22 on ARM (Graviton), 256 MB, 15-second timeout. It is bundled and minified with esbuild during synth, and its logs are kept for one month.
- **[API Gateway](infra/lib/portfolio-stack.ts#L73-L83):** a REST API with a `prod` stage that proxies every request to the Lambda.
- **[S3](infra/lib/portfolio-stack.ts#L86-L92):** a private, encrypted bucket that only accepts SSL, reachable only through CloudFront Origin Access Control.
- **[CloudFront](infra/lib/portfolio-stack.ts#L116-L142):** serves the site over HTTP/2 and HTTP/3 with compression, managed security headers and an HTTPS redirect. It routes `/api/*` to API Gateway with caching disabled.
- **[Site upload](infra/lib/portfolio-stack.ts#L144-L150):** a `BucketDeployment` uploads the Angular build and invalidates the CloudFront cache on every deploy.
- **DNS and TLS:** an [ACM certificate](infra/lib/portfolio-stack.ts#L109-L114) validated through DNS (or an existing one set with `certificateArn`), plus [Route 53 A and AAAA alias records](infra/lib/portfolio-stack.ts#L153-L156) for the site's domain.
- **[IAM](infra/lib/portfolio-stack.ts#L64-L71):** least privilege; the Lambda can read only its own SSM parameter.
- **[Tags](infra/bin/portfolio.ts#L19):** every resource is tagged `application=<applicationTag>`.

Settings come from `infra/config/<env>.json`, [chosen with](infra/bin/portfolio.ts#L8-L11) `-c env=<env>` (the default is `prod`):

| Key                      | Meaning                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `account`, `region`      | AWS account and region to deploy to (must be `us-east-1` for the CloudFront certificate) |
| `applicationTag`         | Value of the `application` tag                                   |
| `domainName`             | The site's hostname, e.g. `www.lucas-gutknecht-supercharged.com` |
| `zoneName`               | The Route 53 hosted zone that contains `domainName`              |
| `certificateArn`         | Optional. An existing us-east-1 certificate to use instead of creating one |
| `gmailPasswordParameter` | Name of the SSM parameter that holds the Gmail app password      |

## Run locally

Requirements: Node 22 and npm 10.

```sh
npm run setup   # install the root, frontend, api and infra packages
npm run dev     # API on http://localhost:3000 + site on http://localhost:4200
```

Open http://localhost:4200. The Angular dev server proxies `/api/*` to the local API (see [`frontend/proxy.conf.json`](frontend/proxy.conf.json)), so the site behaves the same way it does behind CloudFront. The API restarts automatically when you edit it.

By default the email endpoint runs in **dry-run mode**. To send real email locally, copy `api/.env.example` to `api/.env` and set `GMAIL_APP_PASSWORD`. That file also sets `GMAIL_SENDER_EMAIL` and `PORT`.

## Scripts

Run these from the repo root:

| Command             | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `npm run setup`     | Installs the root, frontend, api and infra packages            |
| `npm run dev`       | Runs the API and the Angular dev server together               |
| `npm run build`     | Builds the Angular app into `frontend/dist/frontend/browser`   |
| `npm run typecheck` | Type-checks the API and the CDK code                           |
| `npm run synth`     | Builds the site and synthesizes the CloudFormation template    |
| `npm run diff`      | Builds the site and shows what a deploy would change           |
| `npm run deploy`    | Builds the site and deploys the stack                          |

Always use the root `synth`, `diff` and `deploy` scripts rather than running `cdk` inside `infra/` directly. The stack uploads the Angular build output, so it has to be built first.

## Deploy

Prerequisites:

- The AWS CLI is configured for the account in `infra/config/prod.json`, and CDK has been bootstrapped (`npx cdk bootstrap`).
- CDK CLI 2.1143.0 or later. The project pins it in `infra/package.json`. An older globally installed `cdk` fails with a "Cloud assembly schema version mismatch" error.
- The domain in `infra/config/prod.json` has a Route 53 hosted zone in the same account. Registering the domain through Route 53 creates the zone automatically. Wait for registration to finish before the first deploy, or the certificate's DNS validation can't complete.
- The Gmail app password is stored as an SSM SecureString (one-time setup):

  ```sh
  aws ssm put-parameter --name /portfolio/gmail-app-password --type SecureString --value "<app password>"
  ```

Then run:

```sh
npm run diff     # build the site and preview the changes
npm run deploy   # build the site and deploy it
```

`deploy` builds the Angular app, bundles the Lambda with esbuild, uploads the site to S3 and invalidates the CloudFront cache. The first deploy takes about 10–20 minutes, mostly for CloudFront and the certificate. The stack outputs `SiteUrl`, `CloudFrontUrl` and `ApiGatewayUrl`.

Notes:

- The stack only creates DNS records for `domainName` (the `www` host). The bare domain doesn't serve the site.
- CDK caches the hosted-zone lookup in `infra/cdk.context.json`. Commit that file.

## License

MIT
