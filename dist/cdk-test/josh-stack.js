"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoshStack = void 0;
const path = require("path");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const aws_sns_1 = require("aws-cdk-lib/aws-sns");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_sqs_1 = require("aws-cdk-lib/aws-sqs");
const aws_sns_subscriptions_1 = require("aws-cdk-lib/aws-sns-subscriptions");
const TABLE_NAME = "josh-poop3";
const PARTITION_KEY = "id";
class JoshStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const table = new aws_dynamodb_1.Table(this, TABLE_NAME, {
            partitionKey: {
                name: PARTITION_KEY,
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
        });
        const role = new aws_iam_1.Role(this, 'MyRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('sns.amazonaws.com'),
        });
        new aws_lambda_1.Function(this, 'JoshLambda', {
            runtime: aws_lambda_1.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: new aws_lambda_1.AssetCode(path.join(__dirname, './lambda')),
            environment: {
                'POOP': 'FOO2',
                'BAZ': 'BAR',
            }
        });
        const myTopic = new aws_sns_1.Topic(this, 'JoshTopic');
        const myQueue = new aws_sqs_1.Queue(this, 'JoshQueue', { deliveryDelay: aws_cdk_lib_1.Duration.seconds(5) });
        myTopic.addSubscription(new aws_sns_subscriptions_1.SqsSubscription(myQueue));
        new aws_sqs_1.Queue(this, 'JoshQueue2');
        new aws_cdk_lib_1.CfnOutput(this, 'thequeue', { value: myTopic.topicArn });
    }
}
exports.JoshStack = JoshStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9zaC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jZGstdGVzdC9qb3NoLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUE2QjtBQUU3Qiw2Q0FBMEU7QUFDMUUsdURBQXNFO0FBQ3RFLDJEQUE2RTtBQUM3RSxpREFBNEM7QUFDNUMsaURBQTZEO0FBQzdELGlEQUE0QztBQUM1Qyw2RUFBb0U7QUFFcEUsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDO0FBQ2hDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQztBQUUzQixNQUFhLFNBQVUsU0FBUSxtQkFBSztJQUNsQyxZQUFZLEtBQVUsRUFBRSxFQUFVLEVBQUUsS0FBa0I7UUFDcEQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxvQkFBSyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDeEMsWUFBWSxFQUFFO2dCQUNaLElBQUksRUFBRSxhQUFhO2dCQUNuQixJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNO2FBQzNCO1lBQ0QsV0FBVyxFQUFFLDBCQUFXLENBQUMsZUFBZTtTQUN6QyxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ3BDLFNBQVMsRUFBRSxJQUFJLDBCQUFnQixDQUFDLG1CQUFtQixDQUFDO1NBQ3JELENBQUMsQ0FBQztRQUVILElBQUkscUJBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQy9CLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLElBQUksc0JBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNyRCxXQUFXLEVBQUU7Z0JBQ1gsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsS0FBSyxFQUFFLEtBQUs7YUFDYjtTQUNGLENBQUMsQ0FBQTtRQUVGLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsYUFBYSxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyRixPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksdUNBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRXRELElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUU5QixJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0Y7QUFsQ0QsOEJBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5pbXBvcnQgeyBTdGFjaywgU3RhY2tQcm9wcywgQXBwLCBEdXJhdGlvbiwgQ2ZuT3V0cHV0IH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBSdW50aW1lLCBGdW5jdGlvbiwgQXNzZXRDb2RlIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZVR5cGUsIEJpbGxpbmdNb2RlLCBUYWJsZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGJcIjtcbmltcG9ydCB7IFRvcGljIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zbnNcIjtcbmltcG9ydCB7IFJvbGUsIFNlcnZpY2VQcmluY2lwYWwgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHsgUXVldWUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXNxc1wiO1xuaW1wb3J0IHsgU3FzU3Vic2NyaXB0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zbnMtc3Vic2NyaXB0aW9uc1wiO1xuXG5jb25zdCBUQUJMRV9OQU1FID0gXCJqb3NoLXBvb3AzXCI7XG5jb25zdCBQQVJUSVRJT05fS0VZID0gXCJpZFwiO1xuXG5leHBvcnQgY2xhc3MgSm9zaFN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHRhYmxlID0gbmV3IFRhYmxlKHRoaXMsIFRBQkxFX05BTUUsIHtcbiAgICAgIHBhcnRpdGlvbktleToge1xuICAgICAgICBuYW1lOiBQQVJUSVRJT05fS0VZLFxuICAgICAgICB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyxcbiAgICAgIH0sXG4gICAgICBiaWxsaW5nTW9kZTogQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxuICAgIH0pO1xuXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBSb2xlKHRoaXMsICdNeVJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdzbnMuYW1hem9uYXdzLmNvbScpLFxuICAgIH0pO1xuXG4gICAgbmV3IEZ1bmN0aW9uKHRoaXMsICdKb3NoTGFtYmRhJywge1xuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTJfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4vbGFtYmRhJykpLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgJ1BPT1AnOiAnRk9PMicsXG4gICAgICAgICdCQVonOiAnQkFSJyxcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uc3QgbXlUb3BpYyA9IG5ldyBUb3BpYyh0aGlzLCAnSm9zaFRvcGljJyk7XG4gICAgY29uc3QgbXlRdWV1ZSA9IG5ldyBRdWV1ZSh0aGlzLCAnSm9zaFF1ZXVlJywgeyBkZWxpdmVyeURlbGF5OiBEdXJhdGlvbi5zZWNvbmRzKDUpIH0pO1xuICAgIG15VG9waWMuYWRkU3Vic2NyaXB0aW9uKG5ldyBTcXNTdWJzY3JpcHRpb24obXlRdWV1ZSkpO1xuXG4gICAgbmV3IFF1ZXVlKHRoaXMsICdKb3NoUXVldWUyJyk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICd0aGVxdWV1ZScsIHsgdmFsdWU6IG15VG9waWMudG9waWNBcm4gfSk7XG4gIH1cbn1cbiJdfQ==