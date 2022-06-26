import { Stack, StackProps } from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';

export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repository = new codecommit.Repository(this, 'Repository', {
      repositoryName: 'lambda-experiments',
    });
  }
}
