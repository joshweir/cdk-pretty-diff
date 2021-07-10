import * as path from "path";

import * as cdk from "@aws-cdk/core";
import * as apigatewayv2 from "@aws-cdk/aws-apigatewayv2";
import * as apigatewayv2Integrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cognito from "@aws-cdk/aws-cognito";
import * as customResource from "@aws-cdk/custom-resources";
import * as certificateManager from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as targets from "@aws-cdk/aws-route53-targets";
import * as iam from "@aws-cdk/aws-iam";

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
  }
}
