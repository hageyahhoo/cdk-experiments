import * as cdk from 'aws-cdk-lib';
import { BuildSpec, ReportGroup } from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export class CdkPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new codecommit.Repository(this, 'Repository', {
      repositoryName: 'lambda-experiments',
    });

    const lambdaArn = `arn:aws:lambda:${this.region}:${this.account}:function:LambdaExperiments`;
    const testReportGroup = new ReportGroup(this, 'TestReportGroup', {
      reportGroupName: 'TestReportGroup',
    });
    const coverageReportGroup = new ReportGroup(this, 'CoverageReportGroup', {
      reportGroupName: 'CoverageReportGroup',
    });
    // CDKのバグ対策
    (coverageReportGroup.node.children[0] as any).type = 'CODE_COVERAGE';
    (coverageReportGroup.node.children[0] as any)._cfnProperties.type = 'CODE_COVERAGE';

    const pipeline = new CodePipeline(this, 'LambdaExperimentsPipeline', {
      pipelineName: 'LambdaExperimentsPipeline',
      selfMutation: false,
      codeBuildDefaults: {
        rolePolicy: [
          new cdk.aws_iam.PolicyStatement({
            actions: ['lambda:UpdateFunctionCode'],
            resources: [lambdaArn],
          }),
          new cdk.aws_iam.PolicyStatement({
            actions: ['codebuild:BatchPutCodeCoverages'],
            resources: [coverageReportGroup.reportGroupArn],
          }),
        ],
      },
      synth: new ShellStep('SynthStep', {
        input: CodePipelineSource.codeCommit(repository, 'master'),
        installCommands: [],
        commands: [],
        primaryOutputDirectory: './',
      }),
    });

    pipeline.addWave('Lint', {
      pre: [
        new ShellStep('BuildStep', {
          commands: [
            'go vet ./...',
          ],
        }),
      ],
    });

    const reportDir = './reports';
    const testBuildStep = new CodeBuildStep('BuildStep', {
      installCommands: [
        'go get github.com/jstemmer/go-junit-report',
        'go get github.com/boumenot/gocover-cobertura',
      ],
      commands: [
        `mkdir ${reportDir}`,
        `export TEST_RESULTS=${reportDir}`,
        // UT
        'go test -v 2>&1 ./... | go-junit-report -set-exit-code > ${TEST_RESULTS}/go-test-report.xml',
        // Coverage
        'go test ./... -coverprofile=coverage.txt -covermode count github.com/gorilla/mux',
        'gocover-cobertura < coverage.txt > ${TEST_RESUTS}/coverage.xml',
      ],
      partialBuildSpec: BuildSpec.fromObject({
        version: '0.2',
        reports: {
          [testReportGroup.reportGroupArn]: {
            files: 'go-test-report.xml',
            'file-format': 'JUNITXML',
            'base-directory': `${reportDir}`,
          },
          [coverageReportGroup.reportGroupArn]: {
            files: 'coverage.xml',
            'file-format': 'COVERTURAXML',
            'base-directory': `${reportDir}`,
          },
        }
      }),
    });
    pipeline.addWave('Test', {
      pre: [
        testBuildStep,
      ],
    });

    pipeline.addWave('Deploy', {
      pre: [
        new ShellStep('BuildStep', {
          commands: [
            'GOOS=linux GOARCH=arm64 go build -o bootstrap',
            'zip function.zip bootstrap',
            `aws lambda update-function-code --function-name ${lambdaArn} --zip-file fileb://function.zip`,
          ],
        }),
      ],
    });

    pipeline.buildPipeline();
    testReportGroup.grantWrite(testBuildStep);
    coverageReportGroup.grantWrite(testBuildStep);
  }
}
