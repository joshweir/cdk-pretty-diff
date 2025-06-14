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
        console.log('context check:', this.node.tryGetContext('foo'), this.node.tryGetContext('hello'));
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
                'hello': this.node.tryGetContext('hello'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9zaC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jZGstdGVzdC9qb3NoLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUE2QjtBQUU3Qiw2Q0FBMEU7QUFDMUUsdURBQXNFO0FBQ3RFLDJEQUE2RTtBQUM3RSxpREFBNEM7QUFDNUMsaURBQTZEO0FBQzdELGlEQUE0QztBQUM1Qyw2RUFBb0U7QUFFcEUsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDO0FBQ2hDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQztBQUUzQixNQUFhLFNBQVUsU0FBUSxtQkFBSztJQUNsQyxZQUFZLEtBQVUsRUFBRSxFQUFVLEVBQUUsS0FBa0I7UUFDcEQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRWhHLE1BQU0sS0FBSyxHQUFHLElBQUksb0JBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ3hDLFlBQVksRUFBRTtnQkFDWixJQUFJLEVBQUUsYUFBYTtnQkFDbkIsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTTthQUMzQjtZQUNELFdBQVcsRUFBRSwwQkFBVyxDQUFDLGVBQWU7U0FDekMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNwQyxTQUFTLEVBQUUsSUFBSSwwQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQztTQUNyRCxDQUFDLENBQUM7UUFFSCxJQUFJLHFCQUFRLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUMvQixPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxJQUFJLHNCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDckQsV0FBVyxFQUFFO2dCQUNYLE1BQU0sRUFBRSxNQUFNO2dCQUNkLEtBQUssRUFBRSxLQUFLO2dCQUNaLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7YUFDMUM7U0FDRixDQUFDLENBQUE7UUFFRixNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDN0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFLGFBQWEsRUFBRSxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLHVDQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUV0RCxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFOUIsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQztDQUNGO0FBckNELDhCQXFDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcblxuaW1wb3J0IHsgU3RhY2ssIFN0YWNrUHJvcHMsIEFwcCwgRHVyYXRpb24sIENmbk91dHB1dCB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgUnVudGltZSwgRnVuY3Rpb24sIEFzc2V0Q29kZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGVUeXBlLCBCaWxsaW5nTW9kZSwgVGFibGUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiXCI7XG5pbXBvcnQgeyBUb3BpYyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc25zXCI7XG5pbXBvcnQgeyBSb2xlLCBTZXJ2aWNlUHJpbmNpcGFsIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zcXNcIjtcbmltcG9ydCB7IFNxc1N1YnNjcmlwdGlvbiB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc25zLXN1YnNjcmlwdGlvbnNcIjtcblxuY29uc3QgVEFCTEVfTkFNRSA9IFwiam9zaC1wb29wM1wiO1xuY29uc3QgUEFSVElUSU9OX0tFWSA9IFwiaWRcIjtcblxuZXhwb3J0IGNsYXNzIEpvc2hTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IEFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zb2xlLmxvZygnY29udGV4dCBjaGVjazonLCB0aGlzLm5vZGUudHJ5R2V0Q29udGV4dCgnZm9vJyksIHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdoZWxsbycpKTtcblxuICAgIGNvbnN0IHRhYmxlID0gbmV3IFRhYmxlKHRoaXMsIFRBQkxFX05BTUUsIHtcbiAgICAgIHBhcnRpdGlvbktleToge1xuICAgICAgICBuYW1lOiBQQVJUSVRJT05fS0VZLFxuICAgICAgICB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyxcbiAgICAgIH0sXG4gICAgICBiaWxsaW5nTW9kZTogQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxuICAgIH0pO1xuXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBSb2xlKHRoaXMsICdNeVJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdzbnMuYW1hem9uYXdzLmNvbScpLFxuICAgIH0pO1xuXG4gICAgbmV3IEZ1bmN0aW9uKHRoaXMsICdKb3NoTGFtYmRhJywge1xuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTJfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4vbGFtYmRhJykpLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgJ1BPT1AnOiAnRk9PMicsXG4gICAgICAgICdCQVonOiAnQkFSJyxcbiAgICAgICAgJ2hlbGxvJzogdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ2hlbGxvJyksXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IG15VG9waWMgPSBuZXcgVG9waWModGhpcywgJ0pvc2hUb3BpYycpO1xuICAgIGNvbnN0IG15UXVldWUgPSBuZXcgUXVldWUodGhpcywgJ0pvc2hRdWV1ZScsIHsgZGVsaXZlcnlEZWxheTogRHVyYXRpb24uc2Vjb25kcyg1KSB9KTtcbiAgICBteVRvcGljLmFkZFN1YnNjcmlwdGlvbihuZXcgU3FzU3Vic2NyaXB0aW9uKG15UXVldWUpKTtcblxuICAgIG5ldyBRdWV1ZSh0aGlzLCAnSm9zaFF1ZXVlMicpO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAndGhlcXVldWUnLCB7IHZhbHVlOiBteVRvcGljLnRvcGljQXJuIH0pO1xuICB9XG59XG4iXX0=