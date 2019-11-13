#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { GoingGlobalWithServerlessStack } from '../lib/going-global-with-serverless-stack';

const envIreland = {
    region: "eu-west-1",
};
const envVirginia = {
    region: "us-east-1",
};
const envCalifornia = {
    region: "us-west-1",
};
const envTokyo = {
    region: "ap-northeast-1",
};

const app = new cdk.App();
new GoingGlobalWithServerlessStack(app, 'euWest1',{
    env: envIreland,
    certArn: "arn:aws:acm:eu-west-1:824852318651:certificate/8a8e8612-7ffe-45e1-92d5-44bd7fbcbf83",
    customDomain: "globalddb.rup12.xyz"
});

new GoingGlobalWithServerlessStack(app, 'usEast1',{
    env: envVirginia,
    certArn: "arn:aws:acm:us-east-1:824852318651:certificate/b66cfe74-6930-438b-b43a-aa1bb12ab9c2",
    customDomain: "globalddb.rup12.xyz"
});

new GoingGlobalWithServerlessStack(app, 'usWest1',{
    env: envCalifornia,
    certArn: "arn:aws:acm:us-west-1:824852318651:certificate/70d7903c-f536-4db6-96b3-157851614367",
    customDomain: "globalddb.rup12.xyz"
});

new GoingGlobalWithServerlessStack(app, 'apNortheast1',{
    env: envTokyo,
    certArn: "arn:aws:acm:ap-northeast-1:824852318651:certificate/39f03902-6ab5-4430-a9e8-60c85ccbb88c",
    customDomain: "globalddb.rup12.xyz"
});