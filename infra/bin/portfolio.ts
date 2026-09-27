#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { App, Tags } from 'aws-cdk-lib';
import { PortfolioStack, type PortfolioConfig } from '../lib/portfolio-stack';

const app = new App();
const env = app.node.tryGetContext('env') ?? 'prod';
const config: PortfolioConfig = JSON.parse(
  readFileSync(join(__dirname, '..', 'config', `${env}.json`), 'utf8'),
);

const stack = new PortfolioStack(app, 'PortfolioWeb', {
  stackName: 'portfolio-web-stack',
  env: { account: config.account, region: config.region },
  config,
});
Tags.of(stack).add('application', config.applicationTag);

app.synth();
