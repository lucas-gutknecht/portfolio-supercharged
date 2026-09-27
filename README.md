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
| `infra/`    | CDK stack: S3, CloudFront, API Gateway, Lambda, Route 53 and IAM           |

The site content (bio, skills, experience, education) lives in [`frontend/src/app/data/profile.ts`](frontend/src/app/data/profile.ts). Static files such as the resume, headshot and favicon are in `frontend/public/`.

## Run locally

Requirements: Node 22 and npm 10.

```sh
npm run setup   # install the root, frontend, api and infra packages
npm run dev     # API on http://localhost:3000 + site on http://localhost:4200
```

Open http://localhost:4200. The Angular dev server proxies `/api/*` to the local API (see `frontend/proxy.conf.json`), so the site behaves the same way it does behind CloudFront.

By default the email endpoint runs in **dry-run mode**: it logs the email instead of sending it. To send real email locally, copy `api/.env.example` to `api/.env` and set `GMAIL_APP_PASSWORD`.

## Deploy

Prerequisites:

- The AWS CLI is configured for the account in `infra/config/prod.json`, and CDK has been bootstrapped (`npx cdk bootstrap`).
- The domain in `infra/config/prod.json` has a Route 53 hosted zone in the same account. Registering the domain through Route 53 creates the zone automatically. The stack creates the ACM certificate and validates it through DNS, unless you set `certificateArn` to use an existing one.
- The Gmail app password is stored as an SSM SecureString (one-time setup):

  ```sh
  aws ssm put-parameter --name /portfolio/gmail-app-password --type SecureString --value "<app password>"
  ```

Then run:

```sh
npm run diff     # build the site and preview the changes
npm run deploy   # build the site and deploy it
```

`deploy` builds the Angular app, bundles the Lambda with esbuild, uploads the site to S3 and invalidates the CloudFront cache.

## API

| Method | Path                          | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| GET    | `/api/hello`                  | Hello-world round trip             |
| POST   | `/api/send_portfolio_email`   | `{ "recipient_email": "..." }`     |
| GET    | `/api/openapi.json`           | OpenAPI 3 spec                     |

You can try them in the site's **Live API** console at `/live-api`. The old `/apidocs` link redirects there.

## License

MIT
