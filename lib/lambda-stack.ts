import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const functionName = 'LambdaExperiments';

    const lambdaFunction = new lambda.Function(this, functionName, {
      functionName: functionName,
      runtime: lambda.Runtime.PROVIDED_AL2,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset(join(__dirname, '.')),
      handler: 'main',
      environment: {},
    });
  }
}
