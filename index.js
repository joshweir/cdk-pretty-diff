"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const apigatewayv2 = require("@aws-cdk/aws-apigatewayv2");
const apigatewayv2Integrations = require("@aws-cdk/aws-apigatewayv2-integrations");
const lambda = require("@aws-cdk/aws-lambda");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const short_domain_name_1 = require("./lambda-mosh-pit/short-domain-name");
const cognito = require("@aws-cdk/aws-cognito");
const customResource = require("@aws-cdk/custom-resources");
const TABLE_NAME = 'comm-shortened-urls';
const PARTITION_KEY = 'id';
const DOMAIN_HOSTED_ZONE_ID = 'Z0568078P1NA11TADPFM';
class CommUrlShortner extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const table = new dynamodb.Table(this, TABLE_NAME, {
            partitionKey: { name: PARTITION_KEY, type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
        });
        const urlShortnerLambda = new lambda.Function(this, "url-shortner", {
            code: new lambda.AssetCode("lambda-mosh-pit"),
            handler: "url-shortner-handler.handler",
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: table.tableName,
            },
        });
        table.grantReadWriteData(urlShortnerLambda);
        const urlRedirectionLambda = new lambda.Function(this, "url-redirection", {
            code: new lambda.AssetCode("lambda-mosh-pit"),
            handler: "url-redirection-handler.handler",
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: table.tableName,
            },
        });
        table.grantReadData(urlRedirectionLambda);
        // const certificate = certificateManager.Certificate.fromCertificateArn(this, 'cert', CERT_ARN)
        // const certificate = new certificateManager.Certificate(this, 'cert', {
        //   domainName: DOMAIN_NAME,
        // })
        // const domainName = new apigatewayv2.DomainName(this, 'DN', {
        //   certificate,
        //   domainName: DOMAIN_NAME,
        // });
        const domainName = apigatewayv2.DomainName.fromDomainNameAttributes(this, 'DN', {
            domainName: short_domain_name_1.DOMAIN_NAME,
            regionalDomainName: short_domain_name_1.DOMAIN_NAME,
            regionalHostedZoneId: DOMAIN_HOSTED_ZONE_ID,
        });
        const userPool = new cognito.UserPool(this, 'commurlshortneruserpool', {
            userPoolName: 'commurlshortner-userpool',
        });
        userPool.addDomain('CognitoDomain', {
            cognitoDomain: {
                domainPrefix: 'commurlshortner',
            },
        });
        const createShortUrlScope = new cognito.ResourceServerScope({ scopeName: 'createshorturl', scopeDescription: 'Access to create short urls' });
        const createShortUrlResourceServer = userPool.addResourceServer('ResourceServer', {
            identifier: 'createshorturl',
            scopes: [createShortUrlScope],
        });
        const createShortUrlClient = userPool.addClient('commurlshortner-app-client', {
            authFlows: {
                custom: true,
            },
            generateSecret: true,
            oAuth: {
                flows: {
                    clientCredentials: true,
                },
                scopes: [cognito.OAuthScope.resourceServer(createShortUrlResourceServer, createShortUrlScope)],
            }
        });
        const describeCognitoUserPoolClient = new customResource.AwsCustomResource(this, 'DescribeCognitoUserPoolClient', {
            resourceType: 'Custom::DescribeCognitoUserPoolClient',
            onCreate: {
                region: this.region,
                service: 'CognitoIdentityServiceProvider',
                action: 'describeUserPoolClient',
                parameters: {
                    UserPoolId: userPool.userPoolId,
                    ClientId: createShortUrlClient.userPoolClientId,
                },
                physicalResourceId: customResource.PhysicalResourceId.of(createShortUrlClient.userPoolClientId),
            },
            // TODO: can we restrict this policy more?
            policy: customResource.AwsCustomResourcePolicy.fromSdkCalls({
                resources: customResource.AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        });
        const userPoolClientSecret = describeCognitoUserPoolClient.getResponseField('UserPoolClient.ClientSecret');
        new cdk.CfnOutput(this, 'UserPoolClientSecret', {
            value: userPoolClientSecret,
        });
        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: createShortUrlClient.userPoolClientId,
        });
        const api = new apigatewayv2.HttpApi(this, 'comm-url-shortner2', {
            defaultIntegration: new apigatewayv2Integrations.LambdaProxyIntegration({
                handler: urlRedirectionLambda,
            }),
            defaultDomainMapping: { domainName },
            createDefaultStage: true,
        });
        const authorizer = new apigatewayv2.CfnAuthorizer(this, 'CognitoAuthorizer', {
            name: 'CognitoAuthorizer',
            identitySource: ['$request.header.Authorization'],
            apiId: api.httpApiId,
            authorizerType: 'JWT',
            jwtConfiguration: {
                audience: [createShortUrlClient.userPoolClientId],
                issuer: `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`,
            },
        });
        const routes = api.addRoutes({
            path: '/create',
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new apigatewayv2Integrations.LambdaProxyIntegration({
                handler: urlShortnerLambda,
            }),
        });
        routes.forEach((route) => {
            if (route.path === '/create') {
                const routeCfn = route.node.defaultChild;
                routeCfn.authorizerId = authorizer.ref;
                routeCfn.authorizationType = "JWT";
            }
        });
    }
}
exports.CommUrlShortner = CommUrlShortner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUNyQywwREFBMEQ7QUFDMUQsbUZBQW1GO0FBRW5GLDhDQUE4QztBQUM5QyxrREFBa0Q7QUFFbEQsMkVBQWtFO0FBQ2xFLGdEQUFnRDtBQUNoRCw0REFBNEQ7QUFFNUQsTUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUM7QUFDekMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzNCLE1BQU0scUJBQXFCLEdBQUcsc0JBQXNCLENBQUM7QUFFckQsTUFBYSxlQUFnQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzVDLFlBQVksS0FBYyxFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNqRCxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUMxRSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1NBQ2xELENBQUMsQ0FBQztRQUVILE1BQU0saUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDbEUsSUFBSSxFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztZQUM3QyxPQUFPLEVBQUUsOEJBQThCO1lBQ3ZDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsV0FBVyxFQUFFO2dCQUNYLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUzthQUM1QjtTQUNGLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxrQkFBa0Is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QUU7WUFDekMsV0FBVyxFQUFFLElBQUksd0JBQXdCLENBQUMsc0JBQXNCLENBQUM7Z0JBQy9ELE9BQU8sRUFBRSxpQkFBaUI7YUFDM0IsQ0FBQztTQUNILENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN2QixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUM1QixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQXFDLENBQUM7Z0JBQ2xFLFFBQVEsQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDdkMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQzthQUNwQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBMUlELDBDQTBJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheXYyIGZyb20gXCJAYXdzLWNkay9hd3MtYXBpZ2F0ZXdheXYyXCI7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5djJJbnRlZ3JhdGlvbnMgZnJvbSBcIkBhd3MtY2RrL2F3cy1hcGlnYXRld2F5djItaW50ZWdyYXRpb25zXCI7XG5pbXBvcnQgKiBhcyBjZXJ0aWZpY2F0ZU1hbmFnZXIgZnJvbSBcIkBhd3MtY2RrL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXJcIjtcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiQGF3cy1jZGsvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSBcIkBhd3MtY2RrL2F3cy1keW5hbW9kYlwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJAYXdzLWNkay9hd3MtaWFtXCI7XG5pbXBvcnQgeyBET01BSU5fTkFNRSB9IGZyb20gJy4vbGFtYmRhLW1vc2gtcGl0L3Nob3J0LWRvbWFpbi1uYW1lJztcbmltcG9ydCAqIGFzIGNvZ25pdG8gZnJvbSBcIkBhd3MtY2RrL2F3cy1jb2duaXRvXCI7XG5pbXBvcnQgKiBhcyBjdXN0b21SZXNvdXJjZSBmcm9tIFwiQGF3cy1jZGsvY3VzdG9tLXJlc291cmNlc1wiO1xuXG5jb25zdCBUQUJMRV9OQU1FID0gJ2NvbW0tc2hvcnRlbmVkLXVybHMnO1xuY29uc3QgUEFSVElUSU9OX0tFWSA9ICdpZCc7XG5jb25zdCBET01BSU5fSE9TVEVEX1pPTkVfSUQgPSAnWjA1NjgwNzhQMU5BMTFUQURQRk0nO1xuXG5leHBvcnQgY2xhc3MgQ29tbVVybFNob3J0bmVyIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5BcHAsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsIFRBQkxFX05BTUUsIHtcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiBQQVJUSVRJT05fS0VZLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVFxuICAgIH0pO1xuICAgIFxuICAgIGNvbnN0IHVybFNob3J0bmVyTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcInVybC1zaG9ydG5lclwiLCB7XG4gICAgICBjb2RlOiBuZXcgbGFtYmRhLkFzc2V0Q29kZShcImxhbWJkYS1tb3NoLXBpdFwiKSxcbiAgICAgIGhhbmRsZXI6IFwidXJsLXNob3J0bmVyLWhhbmRsZXIuaGFuZGxlclwiLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEyX1gsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBUQUJMRV9OQU1FOiB0YWJsZS50YWJsZU5hbWUsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIHRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh1cmxTaG9ydG5lckxhbWJkYSk7XG5cbiAgICBjb25zdCB1cmxSZWRpcmVjdGlvbkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJ1cmwtcmVkaXJlY3Rpb25cIiwge1xuICAgICAgY29kZTogbmV3IGxhbWJkYS5Bc3NldENvZGUoXCJsYW1iZGEtbW9zaC1waXRcIiksXG4gICAgICBoYW5kbGVyOiBcInVybC1yZWRpcmVjdGlvbi1oYW5kbGVyLmhhbmRsZXJcIixcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xMl9YLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgVEFCTEVfTkFNRTogdGFibGUudGFibGVOYW1lLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICB0YWJsZS5ncmFudFJlYWREYXRhKHVybFJlZGlyZWN0aW9uTGFtYmRhKTtcblxuICAgIC8vIGNvbnN0IGNlcnRpZmljYXRlID0gY2VydGlmaWNhdGVNYW5hZ2VyLkNlcnRpZmljYXRlLmZyb21DZXJ0aWZpY2F0ZUFybih0aGlzLCAnY2VydCcsIENFUlRfQVJOKVxuICAgIC8vIGNvbnN0IGNlcnRpZmljYXRlID0gbmV3IGNlcnRpZmljYXRlTWFuYWdlci5DZXJ0aWZpY2F0ZSh0aGlzLCAnY2VydCcsIHtcbiAgICAvLyAgIGRvbWFpbk5hbWU6IERPTUFJTl9OQU1FLFxuICAgIC8vIH0pXG5cbiAgICAvLyBjb25zdCBkb21haW5OYW1lID0gbmV3IGFwaWdhdGV3YXl2Mi5Eb21haW5OYW1lKHRoaXMsICdETicsIHtcbiAgICAvLyAgIGNlcnRpZmljYXRlLFxuICAgIC8vICAgZG9tYWluTmFtZTogRE9NQUlOX05BTUUsXG4gICAgLy8gfSk7XG4gICAgY29uc3QgZG9tYWluTmFtZSA9IGFwaWdhdGV3YXl2Mi5Eb21haW5OYW1lLmZyb21Eb21haW5OYW1lQXR0cmlidXRlcyh0aGlzLCAnRE4nLCB7XG4gICAgICBkb21haW5OYW1lOiBET01BSU5fTkFNRSxcbiAgICAgIHJlZ2lvbmFsRG9tYWluTmFtZTogRE9NQUlOX05BTUUsXG4gICAgICByZWdpb25hbEhvc3RlZFpvbmVJZDogRE9NQUlOX0hPU1RFRF9aT05FX0lELFxuICAgIH0pO1xuXG4gICAgY29uc3QgdXNlclBvb2wgPSBuZXcgY29nbml0by5Vc2VyUG9vbCh0aGlzLCAnY29tbXVybHNob3J0bmVydXNlcnBvb2wnLCB7XG4gICAgICB1c2VyUG9vbE5hbWU6ICdjb21tdXJsc2hvcnRuZXItdXNlcnBvb2wnLFxuICAgIH0pO1xuICAgIHVzZXJQb29sLmFkZERvbWFpbignQ29nbml0b0RvbWFpbicsIHtcbiAgICAgIGNvZ25pdG9Eb21haW46IHtcbiAgICAgICAgZG9tYWluUHJlZml4OiAnY29tbXVybHNob3J0bmVyJyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBjcmVhdGVTaG9ydFVybFNjb3BlID0gbmV3IGNvZ25pdG8uUmVzb3VyY2VTZXJ2ZXJTY29wZSh7IHNjb3BlTmFtZTogJ2NyZWF0ZXNob3J0dXJsJywgc2NvcGVEZXNjcmlwdGlvbjogJ0FjY2VzcyB0byBjcmVhdGUgc2hvcnQgdXJscycgfSk7XG4gICAgY29uc3QgY3JlYXRlU2hvcnRVcmxSZXNvdXJjZVNlcnZlciA9IHVzZXJQb29sLmFkZFJlc291cmNlU2VydmVyKCdSZXNvdXJjZVNlcnZlcicsIHtcbiAgICAgIGlkZW50aWZpZXI6ICdjcmVhdGVzaG9ydHVybCcsXG4gICAgICBzY29wZXM6IFsgY3JlYXRlU2hvcnRVcmxTY29wZSBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgY3JlYXRlU2hvcnRVcmxDbGllbnQgPSB1c2VyUG9vbC5hZGRDbGllbnQoJ2NvbW11cmxzaG9ydG5lci1hcHAtY2xpZW50Jywge1xuICAgICAgYXV0aEZsb3dzOiB7XG4gICAgICAgIGN1c3RvbTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBnZW5lcmF0ZVNlY3JldDogdHJ1ZSxcbiAgICAgIG9BdXRoOiB7XG4gICAgICAgIGZsb3dzOiB7XG4gICAgICAgICAgY2xpZW50Q3JlZGVudGlhbHM6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3BlczogWyBjb2duaXRvLk9BdXRoU2NvcGUucmVzb3VyY2VTZXJ2ZXIoY3JlYXRlU2hvcnRVcmxSZXNvdXJjZVNlcnZlciwgY3JlYXRlU2hvcnRVcmxTY29wZSkgXSxcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGRlc2NyaWJlQ29nbml0b1VzZXJQb29sQ2xpZW50ID0gbmV3IGN1c3RvbVJlc291cmNlLkF3c0N1c3RvbVJlc291cmNlKFxuICAgICAgdGhpcyxcbiAgICAgICdEZXNjcmliZUNvZ25pdG9Vc2VyUG9vbENsaWVudCcsXG4gICAgICB7XG4gICAgICAgIHJlc291cmNlVHlwZTogJ0N1c3RvbTo6RGVzY3JpYmVDb2duaXRvVXNlclBvb2xDbGllbnQnLFxuICAgICAgICBvbkNyZWF0ZToge1xuICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24sXG4gICAgICAgICAgc2VydmljZTogJ0NvZ25pdG9JZGVudGl0eVNlcnZpY2VQcm92aWRlcicsXG4gICAgICAgICAgYWN0aW9uOiAnZGVzY3JpYmVVc2VyUG9vbENsaWVudCcsXG4gICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgVXNlclBvb2xJZDogdXNlclBvb2wudXNlclBvb2xJZCxcbiAgICAgICAgICAgIENsaWVudElkOiBjcmVhdGVTaG9ydFVybENsaWVudC51c2VyUG9vbENsaWVudElkLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGh5c2ljYWxSZXNvdXJjZUlkOiBjdXN0b21SZXNvdXJjZS5QaHlzaWNhbFJlc291cmNlSWQub2YoY3JlYXRlU2hvcnRVcmxDbGllbnQudXNlclBvb2xDbGllbnRJZCksXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRPRE86IGNhbiB3ZSByZXN0cmljdCB0aGlzIHBvbGljeSBtb3JlP1xuICAgICAgICBwb2xpY3k6IGN1c3RvbVJlc291cmNlLkF3c0N1c3RvbVJlc291cmNlUG9saWN5LmZyb21TZGtDYWxscyh7XG4gICAgICAgICAgcmVzb3VyY2VzOiBjdXN0b21SZXNvdXJjZS5Bd3NDdXN0b21SZXNvdXJjZVBvbGljeS5BTllfUkVTT1VSQ0UsXG4gICAgICAgIH0pLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCB1c2VyUG9vbENsaWVudFNlY3JldCA9IGRlc2NyaWJlQ29nbml0b1VzZXJQb29sQ2xpZW50LmdldFJlc3BvbnNlRmllbGQoXG4gICAgICAnVXNlclBvb2xDbGllbnQuQ2xpZW50U2VjcmV0J1xuICAgIClcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnVXNlclBvb2xDbGllbnRTZWNyZXQnLCB7XG4gICAgICB2YWx1ZTogdXNlclBvb2xDbGllbnRTZWNyZXQsXG4gICAgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VzZXJQb29sQ2xpZW50SWQnLCB7XG4gICAgICB2YWx1ZTogY3JlYXRlU2hvcnRVcmxDbGllbnQudXNlclBvb2xDbGllbnRJZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5djIuSHR0cEFwaSh0aGlzLCAnY29tbS11cmwtc2hvcnRuZXIyJywge1xuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgYXBpZ2F0ZXdheXYySW50ZWdyYXRpb25zLkxhbWJkYVByb3h5SW50ZWdyYXRpb24oe1xuICAgICAgICBoYW5kbGVyOiB1cmxSZWRpcmVjdGlvbkxhbWJkYSxcbiAgICAgIH0pLFxuICAgICAgZGVmYXVsdERvbWFpbk1hcHBpbmc6IHsgZG9tYWluTmFtZSB9LFxuICAgICAgY3JlYXRlRGVmYXVsdFN0YWdlOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXV0aG9yaXplciA9IG5ldyBhcGlnYXRld2F5djIuQ2ZuQXV0aG9yaXplcih0aGlzLCAnQ29nbml0b0F1dGhvcml6ZXInLCB7XG4gICAgICBuYW1lOiAnQ29nbml0b0F1dGhvcml6ZXInLFxuICAgICAgaWRlbnRpdHlTb3VyY2U6IFsnJHJlcXVlc3QuaGVhZGVyLkF1dGhvcml6YXRpb24nXSxcbiAgICAgIGFwaUlkOiBhcGkuaHR0cEFwaUlkLFxuICAgICAgYXV0aG9yaXplclR5cGU6ICdKV1QnLFxuICAgICAgand0Q29uZmlndXJhdGlvbjoge1xuICAgICAgICBhdWRpZW5jZTogW2NyZWF0ZVNob3J0VXJsQ2xpZW50LnVzZXJQb29sQ2xpZW50SWRdLFxuICAgICAgICBpc3N1ZXI6IGBodHRwczovL2NvZ25pdG8taWRwLiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb20vJHt1c2VyUG9vbC51c2VyUG9vbElkfWAsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IHJvdXRlcyA9IGFwaS5hZGRSb3V0ZXMoe1xuICAgICAgcGF0aDogJy9jcmVhdGUnLFxuICAgICAgbWV0aG9kczogWyBhcGlnYXRld2F5djIuSHR0cE1ldGhvZC5QT1NUIF0sXG4gICAgICBpbnRlZ3JhdGlvbjogbmV3IGFwaWdhdGV3YXl2MkludGVncmF0aW9ucy5MYW1iZGFQcm94eUludGVncmF0aW9uKHtcbiAgICAgICAgaGFuZGxlcjogdXJsU2hvcnRuZXJMYW1iZGEsXG4gICAgICB9KSxcbiAgICB9KTtcblxuICAgIHJvdXRlcy5mb3JFYWNoKChyb3V0ZSkgPT4ge1xuICAgICAgaWYgKHJvdXRlLnBhdGggPT09ICcvY3JlYXRlJykge1xuICAgICAgICBjb25zdCByb3V0ZUNmbiA9IHJvdXRlLm5vZGUuZGVmYXVsdENoaWxkIGFzIGFwaWdhdGV3YXl2Mi5DZm5Sb3V0ZTtcbiAgICAgICAgcm91dGVDZm4uYXV0aG9yaXplcklkID0gYXV0aG9yaXplci5yZWY7XG4gICAgICAgIHJvdXRlQ2ZuLmF1dGhvcml6YXRpb25UeXBlID0gXCJKV1RcIjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19