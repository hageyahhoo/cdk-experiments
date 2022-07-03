import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as CdkPipelineStack from '../lib/cdk-pipeline-stack';

test('CodeCommit Repository Created', () => {
  const app = new cdk.App();

  // WHEN
  const stack = new CdkPipelineStack.CdkPipelineStack(app, 'TestStack');

  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::CodeCommit::Repository', {
    RepositoryName: 'lambda-experiments',
  });

  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Name: 'LambdaExperimentsPipeline',
  });

  template.hasResourceProperties('AWS::CodeBuild::ReportGroup', {
    Name: 'TestReportGroup',
    Type: 'TEST',
  });
  template.hasResourceProperties('AWS::CodeBuild::ReportGroup', {
    Name: 'CoverageReportGroup',
    Type: 'CODE_COVERAGE',
  });
});
