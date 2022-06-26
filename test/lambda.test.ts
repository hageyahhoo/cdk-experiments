import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as LambdaStack from '../lib/lambda-stack';

test('CodeCommit Repository Created', () => {
  const app = new cdk.App();

  // WHEN
  const stack = new LambdaStack.LambdaStack(app, 'TestStack');

  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'LambdaExperiments',
    Runtime: 'provided.al2',
    Architectures: [ 'arm64' ],
    Handler: 'main',
  });
});
