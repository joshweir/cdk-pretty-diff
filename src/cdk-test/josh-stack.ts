import * as path from "path";

import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sns from '@aws-cdk/aws-sns';
import * as iam from "@aws-cdk/aws-iam";
import * as sqs from '@aws-cdk/aws-sqs';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';

const TABLE_NAME = "josh-poop3";
const PARTITION_KEY = "id";

export class JoshStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, TABLE_NAME, {
      partitionKey: {
        name: PARTITION_KEY,
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const role = new iam.Role(this, 'MyRole', {
      assumedBy: new iam.ServicePrincipal('sns.amazonaws.com'),
    });

    new lambda.Function(this, 'JoshLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      environment: {
        'POOP': 'FOO2',
        'BAZ': 'BAR',
      }
    })

    const myTopic = new sns.Topic(this, 'JoshTopic');
    const myQueue = new sqs.Queue(this, 'JoshQueue', { deliveryDelay: cdk.Duration.seconds(5) });
    myTopic.addSubscription(new subscriptions.SqsSubscription(myQueue));

    new sqs.Queue(this, 'JoshQueue2');

    new cdk.CfnOutput(this, 'thequeue', { value: myTopic.topicArn });
  }
}
