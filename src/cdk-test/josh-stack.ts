import * as path from "path";

import { Stack, StackProps, App, Duration, CfnOutput } from "aws-cdk-lib";
import { Runtime, Function, AssetCode } from "aws-cdk-lib/aws-lambda";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

const TABLE_NAME = "josh-poop3";
const PARTITION_KEY = "id";

export class JoshStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, TABLE_NAME, {
      partitionKey: {
        name: PARTITION_KEY,
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const role = new Role(this, 'MyRole', {
      assumedBy: new ServicePrincipal('sns.amazonaws.com'),
    });

    new Function(this, 'JoshLambda', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: new AssetCode(path.join(__dirname, './lambda')),
      environment: {
        'POOP': 'FOO2',
        'BAZ': 'BAR',
      }
    })

    const myTopic = new Topic(this, 'JoshTopic');
    const myQueue = new Queue(this, 'JoshQueue', { deliveryDelay: Duration.seconds(5) });
    myTopic.addSubscription(new SqsSubscription(myQueue));

    new Queue(this, 'JoshQueue2');

    new CfnOutput(this, 'thequeue', { value: myTopic.topicArn });
  }
}
