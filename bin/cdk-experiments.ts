#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkPipelineStack } from '../lib/cdk-pipeline-stack';
import { LambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();

new CdkPipelineStack(app, 'CdkPipelineStack');
new LambdaStack(app, 'LambdaStack');
