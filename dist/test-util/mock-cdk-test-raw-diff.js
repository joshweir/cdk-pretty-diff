"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCdkTestRawDiff = void 0;
// This is generated from `getRawDiff` for the cdk stack in cdk-test/ directory
const mockCdkTestRawDiff = () => {
    return [
        {
            stackName: "JoshStack",
            rawDiff: {
                conditions: {
                    diffs: {
                        CDKMetadataAvailable: {
                            oldValue: {
                                "Fn::Or": [
                                    {
                                        "Fn::Or": [
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-east-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-northeast-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-northeast-2",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-south-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-southeast-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-southeast-2",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ca-central-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "cn-north-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "cn-northwest-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-central-1",
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        "Fn::Or": [
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-north-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-west-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-west-2",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-west-3",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "me-south-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "sa-east-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "us-east-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "us-east-2",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "us-west-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "us-west-2",
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            newValue: {
                                "Fn::Or": [
                                    {
                                        "Fn::Or": [
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "af-south-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-east-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-northeast-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-northeast-2",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-south-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-southeast-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ap-southeast-2",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "ca-central-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "cn-north-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "cn-northwest-1",
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        "Fn::Or": [
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-central-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-north-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-south-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-west-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-west-2",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "eu-west-3",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "me-south-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "sa-east-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "us-east-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "us-east-2",
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        "Fn::Or": [
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "us-west-1",
                                                ],
                                            },
                                            {
                                                "Fn::Equals": [
                                                    {
                                                        Ref: "AWS::Region",
                                                    },
                                                    "us-west-2",
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            isDifferent: true,
                        },
                    },
                },
                mappings: {
                    diffs: {},
                },
                metadata: {
                    diffs: {},
                },
                outputs: {
                    diffs: {
                        thequeue: {
                            oldValue: {
                                Value: {
                                    "Fn::GetAtt": ["JoshQueueEB99F847", "Arn"],
                                },
                            },
                            newValue: {
                                Value: {
                                    Ref: "JoshTopicA4ECB805",
                                },
                            },
                            isDifferent: true,
                        },
                    },
                },
                parameters: {
                    diffs: {
                        AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09: {
                            oldValue: {
                                Type: "String",
                                Description: 'S3 bucket for asset "804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97"',
                            },
                            isDifferent: true,
                        },
                        AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E: {
                            oldValue: {
                                Type: "String",
                                Description: 'S3 key for asset version "804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97"',
                            },
                            isDifferent: true,
                        },
                        AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97ArtifactHash6F137924: {
                            oldValue: {
                                Type: "String",
                                Description: 'Artifact hash for asset "804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97"',
                            },
                            isDifferent: true,
                        },
                        AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B: {
                            newValue: {
                                Type: "String",
                                Description: 'S3 bucket for asset "476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3"',
                            },
                            isDifferent: true,
                        },
                        AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949: {
                            newValue: {
                                Type: "String",
                                Description: 'S3 key for asset version "476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3"',
                            },
                            isDifferent: true,
                        },
                        AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3ArtifactHashE106A955: {
                            newValue: {
                                Type: "String",
                                Description: 'Artifact hash for asset "476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3"',
                            },
                            isDifferent: true,
                        },
                    },
                },
                resources: {
                    diffs: {
                        JoshLambdaC8236207: {
                            oldValue: {
                                Type: "AWS::Lambda::Function",
                                Properties: {
                                    Code: {
                                        S3Bucket: {
                                            Ref: "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09",
                                        },
                                        S3Key: {
                                            "Fn::Join": [
                                                "",
                                                [
                                                    {
                                                        "Fn::Select": [
                                                            0,
                                                            {
                                                                "Fn::Split": [
                                                                    "||",
                                                                    {
                                                                        Ref: "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        "Fn::Select": [
                                                            1,
                                                            {
                                                                "Fn::Split": [
                                                                    "||",
                                                                    {
                                                                        Ref: "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            ],
                                        },
                                    },
                                    Handler: "index.handler",
                                    Role: {
                                        "Fn::GetAtt": ["JoshLambdaServiceRoleDEC0C426", "Arn"],
                                    },
                                    Runtime: "nodejs10.x",
                                    Environment: {
                                        Variables: {
                                            POOP: "FOO",
                                        },
                                    },
                                },
                                DependsOn: ["JoshLambdaServiceRoleDEC0C426"],
                                Metadata: {
                                    "aws:cdk:path": "JoshStack/JoshLambda/Resource",
                                    "aws:asset:path": "asset.804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97",
                                    "aws:asset:property": "Code",
                                },
                            },
                            newValue: {
                                Type: "AWS::Lambda::Function",
                                Properties: {
                                    Code: {
                                        S3Bucket: {
                                            Ref: "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B",
                                        },
                                        S3Key: {
                                            "Fn::Join": [
                                                "",
                                                [
                                                    {
                                                        "Fn::Select": [
                                                            0,
                                                            {
                                                                "Fn::Split": [
                                                                    "||",
                                                                    {
                                                                        Ref: "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        "Fn::Select": [
                                                            1,
                                                            {
                                                                "Fn::Split": [
                                                                    "||",
                                                                    {
                                                                        Ref: "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            ],
                                        },
                                    },
                                    Role: {
                                        "Fn::GetAtt": ["JoshLambdaServiceRoleDEC0C426", "Arn"],
                                    },
                                    Environment: {
                                        Variables: {
                                            POOP: "FOO2",
                                            BAZ: "BAR",
                                        },
                                    },
                                    Handler: "index.handler",
                                    Runtime: "nodejs12.x",
                                },
                                DependsOn: ["JoshLambdaServiceRoleDEC0C426"],
                                Metadata: {
                                    "aws:cdk:path": "JoshStack/JoshLambda/Resource",
                                    "aws:asset:path": "asset.476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3",
                                    "aws:asset:property": "Code",
                                },
                            },
                            resourceTypes: {
                                oldType: "AWS::Lambda::Function",
                                newType: "AWS::Lambda::Function",
                            },
                            propertyDiffs: {
                                Code: {
                                    oldValue: {
                                        S3Bucket: {
                                            Ref: "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09",
                                        },
                                        S3Key: {
                                            "Fn::Join": [
                                                "",
                                                [
                                                    {
                                                        "Fn::Select": [
                                                            0,
                                                            {
                                                                "Fn::Split": [
                                                                    "||",
                                                                    {
                                                                        Ref: "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        "Fn::Select": [
                                                            1,
                                                            {
                                                                "Fn::Split": [
                                                                    "||",
                                                                    {
                                                                        Ref: "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            ],
                                        },
                                    },
                                    newValue: {
                                        S3Bucket: {
                                            Ref: "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B",
                                        },
                                        S3Key: {
                                            "Fn::Join": [
                                                "",
                                                [
                                                    {
                                                        "Fn::Select": [
                                                            0,
                                                            {
                                                                "Fn::Split": [
                                                                    "||",
                                                                    {
                                                                        Ref: "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        "Fn::Select": [
                                                            1,
                                                            {
                                                                "Fn::Split": [
                                                                    "||",
                                                                    {
                                                                        Ref: "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            ],
                                        },
                                    },
                                    isDifferent: true,
                                    changeImpact: "WILL_UPDATE",
                                },
                                Handler: {
                                    oldValue: "index.handler",
                                    newValue: "index.handler",
                                    isDifferent: false,
                                    changeImpact: "NO_CHANGE",
                                },
                                Role: {
                                    oldValue: {
                                        "Fn::GetAtt": ["JoshLambdaServiceRoleDEC0C426", "Arn"],
                                    },
                                    newValue: {
                                        "Fn::GetAtt": ["JoshLambdaServiceRoleDEC0C426", "Arn"],
                                    },
                                    isDifferent: false,
                                    changeImpact: "NO_CHANGE",
                                },
                                Runtime: {
                                    oldValue: "nodejs10.x",
                                    newValue: "nodejs12.x",
                                    isDifferent: true,
                                    changeImpact: "WILL_UPDATE",
                                },
                                Environment: {
                                    oldValue: {
                                        Variables: {
                                            POOP: "FOO",
                                        },
                                    },
                                    newValue: {
                                        Variables: {
                                            POOP: "FOO2",
                                            BAZ: "BAR",
                                        },
                                    },
                                    isDifferent: true,
                                    changeImpact: "WILL_UPDATE",
                                },
                            },
                            otherDiffs: {
                                Type: {
                                    oldValue: "AWS::Lambda::Function",
                                    newValue: "AWS::Lambda::Function",
                                    isDifferent: false,
                                },
                                DependsOn: {
                                    oldValue: ["JoshLambdaServiceRoleDEC0C426"],
                                    newValue: ["JoshLambdaServiceRoleDEC0C426"],
                                    isDifferent: false,
                                },
                                Metadata: {
                                    oldValue: {
                                        "aws:cdk:path": "JoshStack/JoshLambda/Resource",
                                        "aws:asset:path": "asset.804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97",
                                        "aws:asset:property": "Code",
                                    },
                                    newValue: {
                                        "aws:cdk:path": "JoshStack/JoshLambda/Resource",
                                        "aws:asset:path": "asset.476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3",
                                        "aws:asset:property": "Code",
                                    },
                                    isDifferent: true,
                                },
                            },
                            isAddition: false,
                            isRemoval: false,
                        },
                        JoshQueueEB99F847: {
                            oldValue: {
                                Type: "AWS::SQS::Queue",
                                Metadata: {
                                    "aws:cdk:path": "JoshStack/JoshQueue/Resource",
                                },
                            },
                            newValue: {
                                Type: "AWS::SQS::Queue",
                                Properties: {
                                    DelaySeconds: 5,
                                },
                                UpdateReplacePolicy: "Delete",
                                DeletionPolicy: "Delete",
                                Metadata: {
                                    "aws:cdk:path": "JoshStack/JoshQueue/Resource",
                                },
                            },
                            resourceTypes: {
                                oldType: "AWS::SQS::Queue",
                                newType: "AWS::SQS::Queue",
                            },
                            propertyDiffs: {
                                DelaySeconds: {
                                    newValue: 5,
                                    isDifferent: true,
                                    changeImpact: "WILL_UPDATE",
                                },
                            },
                            otherDiffs: {
                                Type: {
                                    oldValue: "AWS::SQS::Queue",
                                    newValue: "AWS::SQS::Queue",
                                    isDifferent: false,
                                },
                                Metadata: {
                                    oldValue: {
                                        "aws:cdk:path": "JoshStack/JoshQueue/Resource",
                                    },
                                    newValue: {
                                        "aws:cdk:path": "JoshStack/JoshQueue/Resource",
                                    },
                                    isDifferent: false,
                                },
                                UpdateReplacePolicy: {
                                    newValue: "Delete",
                                    isDifferent: true,
                                },
                                DeletionPolicy: {
                                    newValue: "Delete",
                                    isDifferent: true,
                                },
                            },
                            isAddition: false,
                            isRemoval: false,
                        },
                        JoshQueue2C9D19A77: {
                            newValue: {
                                Type: "AWS::SQS::Queue",
                                UpdateReplacePolicy: "Delete",
                                DeletionPolicy: "Delete",
                                Metadata: {
                                    "aws:cdk:path": "JoshStack/JoshQueue2/Resource",
                                },
                            },
                            resourceTypes: {
                                newType: "AWS::SQS::Queue",
                            },
                            propertyDiffs: {},
                            otherDiffs: {},
                            isAddition: true,
                            isRemoval: false,
                        },
                    },
                },
                unknown: {
                    diffs: {},
                },
                iamChanges: {
                    statements: {
                        additions: [],
                        removals: [],
                        oldElements: [],
                        newElements: [],
                    },
                    managedPolicies: {
                        additions: [],
                        removals: [],
                        oldElements: [],
                        newElements: [],
                    },
                },
                securityGroupChanges: {
                    ingress: {
                        additions: [],
                        removals: [],
                        oldElements: [],
                        newElements: [],
                    },
                    egress: {
                        additions: [],
                        removals: [],
                        oldElements: [],
                        newElements: [],
                    },
                },
            },
            logicalToPathMap: {
                joshpoop360D5A6B7: "/JoshStack/josh-poop3/Resource",
                MyRoleF48FFE04: "/JoshStack/MyRole/Resource",
                JoshLambdaServiceRoleDEC0C426: "/JoshStack/JoshLambda/ServiceRole/Resource",
                JoshLambdaC8236207: "/JoshStack/JoshLambda/Resource",
                AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B: "/JoshStack/AssetParameters/476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3/S3Bucket",
                AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949: "/JoshStack/AssetParameters/476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3/S3VersionKey",
                AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3ArtifactHashE106A955: "/JoshStack/AssetParameters/476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3/ArtifactHash",
                JoshTopicA4ECB805: "/JoshStack/JoshTopic/Resource",
                JoshQueueEB99F847: "/JoshStack/JoshQueue/Resource",
                JoshQueuePolicy5D4DD568: "/JoshStack/JoshQueue/Policy/Resource",
                JoshQueueJoshStackJoshTopicA950703A630F8DC9: "/JoshStack/JoshQueue/JoshStackJoshTopicA950703A/Resource",
                JoshQueue2C9D19A77: "/JoshStack/JoshQueue2/Resource",
                thequeue: "/JoshStack/thequeue",
                CDKMetadata: "/JoshStack/CDKMetadata/Default",
                CDKMetadataAvailable: "/JoshStack/CDKMetadata/Condition",
            },
        },
    ];
};
exports.mockCdkTestRawDiff = mockCdkTestRawDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1jZGstdGVzdC1yYXctZGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0LXV0aWwvbW9jay1jZGstdGVzdC1yYXctZGlmZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrRUFBK0U7QUFDeEUsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLEVBQUU7SUFDckMsT0FBTztRQUNMO1lBQ0UsU0FBUyxFQUFFLFdBQVc7WUFDdEIsT0FBTyxFQUFFO2dCQUNQLFVBQVUsRUFBRTtvQkFDVixLQUFLLEVBQUU7d0JBQ0wsb0JBQW9CLEVBQUU7NEJBQ3BCLFFBQVEsRUFBRTtnQ0FDUixRQUFRLEVBQUU7b0NBQ1I7d0NBQ0UsUUFBUSxFQUFFOzRDQUNSO2dEQUNFLFlBQVksRUFBRTtvREFDWjt3REFDRSxHQUFHLEVBQUUsYUFBYTtxREFDbkI7b0RBQ0QsV0FBVztpREFDWjs2Q0FDRjs0Q0FDRDtnREFDRSxZQUFZLEVBQUU7b0RBQ1o7d0RBQ0UsR0FBRyxFQUFFLGFBQWE7cURBQ25CO29EQUNELGdCQUFnQjtpREFDakI7NkNBQ0Y7NENBQ0Q7Z0RBQ0UsWUFBWSxFQUFFO29EQUNaO3dEQUNFLEdBQUcsRUFBRSxhQUFhO3FEQUNuQjtvREFDRCxnQkFBZ0I7aURBQ2pCOzZDQUNGOzRDQUNEO2dEQUNFLFlBQVksRUFBRTtvREFDWjt3REFDRSxHQUFHLEVBQUUsYUFBYTtxREFDbkI7b0RBQ0QsWUFBWTtpREFDYjs2Q0FDRjs0Q0FDRDtnREFDRSxZQUFZLEVBQUU7b0RBQ1o7d0RBQ0UsR0FBRyxFQUFFLGFBQWE7cURBQ25CO29EQUNELGdCQUFnQjtpREFDakI7NkNBQ0Y7NENBQ0Q7Z0RBQ0UsWUFBWSxFQUFFO29EQUNaO3dEQUNFLEdBQUcsRUFBRSxhQUFhO3FEQUNuQjtvREFDRCxnQkFBZ0I7aURBQ2pCOzZDQUNGOzRDQUNEO2dEQUNFLFlBQVksRUFBRTtvREFDWjt3REFDRSxHQUFHLEVBQUUsYUFBYTtxREFDbkI7b0RBQ0Qs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QUFvQixFQUFFLGtDQUFrQzthQUN6RDtTQUNGO0tBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQztBQWoyQlcsUUFBQSxrQkFBa0Isc0JBaTJCN0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGlzIGdlbmVyYXRlZCBmcm9tIGBnZXRSYXdEaWZmYCBmb3IgdGhlIGNkayBzdGFjayBpbiBjZGstdGVzdC8gZGlyZWN0b3J5XG5leHBvcnQgY29uc3QgbW9ja0Nka1Rlc3RSYXdEaWZmID0gKCkgPT4ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIHN0YWNrTmFtZTogXCJKb3NoU3RhY2tcIixcbiAgICAgIHJhd0RpZmY6IHtcbiAgICAgICAgY29uZGl0aW9uczoge1xuICAgICAgICAgIGRpZmZzOiB7XG4gICAgICAgICAgICBDREtNZXRhZGF0YUF2YWlsYWJsZToge1xuICAgICAgICAgICAgICBvbGRWYWx1ZToge1xuICAgICAgICAgICAgICAgIFwiRm46Ok9yXCI6IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJGbjo6T3JcIjogW1xuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcC1lYXN0LTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXAtbm9ydGhlYXN0LTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXAtbm9ydGhlYXN0LTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXAtc291dGgtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcC1zb3V0aGVhc3QtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcC1zb3V0aGVhc3QtMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYS1jZW50cmFsLTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiY24tbm9ydGgtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbi1ub3J0aHdlc3QtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJldS1jZW50cmFsLTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwiRm46Ok9yXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiZXUtbm9ydGgtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJldS13ZXN0LTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiZXUtd2VzdC0yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6RXF1YWxzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBV1M6OlJlZ2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImV1LXdlc3QtM1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZS1zb3V0aC0xXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6RXF1YWxzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBV1M6OlJlZ2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInNhLWVhc3QtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1cy1lYXN0LTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwidXMtZWFzdC0yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6RXF1YWxzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBV1M6OlJlZ2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInVzLXdlc3QtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1cy13ZXN0LTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbmV3VmFsdWU6IHtcbiAgICAgICAgICAgICAgICBcIkZuOjpPclwiOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwiRm46Ok9yXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWYtc291dGgtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcC1lYXN0LTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXAtbm9ydGhlYXN0LTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXAtbm9ydGhlYXN0LTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXAtc291dGgtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcC1zb3V0aGVhc3QtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcC1zb3V0aGVhc3QtMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYS1jZW50cmFsLTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiY24tbm9ydGgtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbi1ub3J0aHdlc3QtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJGbjo6T3JcIjogW1xuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJldS1jZW50cmFsLTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiZXUtbm9ydGgtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJldS1zb3V0aC0xXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6RXF1YWxzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBV1M6OlJlZ2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImV1LXdlc3QtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJldS13ZXN0LTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiZXUtd2VzdC0zXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6RXF1YWxzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBV1M6OlJlZ2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1lLXNvdXRoLTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic2EtZWFzdC0xXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6RXF1YWxzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBV1M6OlJlZ2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInVzLWVhc3QtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkVxdWFsc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQVdTOjpSZWdpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1cy1lYXN0LTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwiRm46Ok9yXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpFcXVhbHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFXUzo6UmVnaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwidXMtd2VzdC0xXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6RXF1YWxzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBV1M6OlJlZ2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInVzLXdlc3QtMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc0RpZmZlcmVudDogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgbWFwcGluZ3M6IHtcbiAgICAgICAgICBkaWZmczoge30sXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgZGlmZnM6IHt9LFxuICAgICAgICB9LFxuICAgICAgICBvdXRwdXRzOiB7XG4gICAgICAgICAgZGlmZnM6IHtcbiAgICAgICAgICAgIHRoZXF1ZXVlOiB7XG4gICAgICAgICAgICAgIG9sZFZhbHVlOiB7XG4gICAgICAgICAgICAgICAgVmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIFwiRm46OkdldEF0dFwiOiBbXCJKb3NoUXVldWVFQjk5Rjg0N1wiLCBcIkFyblwiXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBuZXdWYWx1ZToge1xuICAgICAgICAgICAgICAgIFZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICBSZWY6IFwiSm9zaFRvcGljQTRFQ0I4MDVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc0RpZmZlcmVudDogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgIGRpZmZzOiB7XG4gICAgICAgICAgICBBc3NldFBhcmFtZXRlcnM4MDQwMzRlYmI4MjM2NzNmOTdiNmZmMjg3ZGY0NTFlYjk4ZDZjZjM2OGNiZjJmZTZmODc3ZDYxYTQzMWIyYTk3UzNCdWNrZXQzMDJBQkIwOTpcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICBUeXBlOiBcIlN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgRGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAgICdTMyBidWNrZXQgZm9yIGFzc2V0IFwiODA0MDM0ZWJiODIzNjczZjk3YjZmZjI4N2RmNDUxZWI5OGQ2Y2YzNjhjYmYyZmU2Zjg3N2Q2MWE0MzFiMmE5N1wiJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzRGlmZmVyZW50OiB0cnVlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgQXNzZXRQYXJhbWV0ZXJzODA0MDM0ZWJiODIzNjczZjk3YjZmZjI4N2RmNDUxZWI5OGQ2Y2YzNjhjYmYyZmU2Zjg3N2Q2MWE0MzFiMmE5N1MzVmVyc2lvbktleTRDODc4QjBFOlxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIFR5cGU6IFwiU3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICBEZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgJ1MzIGtleSBmb3IgYXNzZXQgdmVyc2lvbiBcIjgwNDAzNGViYjgyMzY3M2Y5N2I2ZmYyODdkZjQ1MWViOThkNmNmMzY4Y2JmMmZlNmY4NzdkNjFhNDMxYjJhOTdcIicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpc0RpZmZlcmVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEFzc2V0UGFyYW1ldGVyczgwNDAzNGViYjgyMzY3M2Y5N2I2ZmYyODdkZjQ1MWViOThkNmNmMzY4Y2JmMmZlNmY4NzdkNjFhNDMxYjJhOTdBcnRpZmFjdEhhc2g2RjEzNzkyNDpcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICBUeXBlOiBcIlN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgRGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAgICdBcnRpZmFjdCBoYXNoIGZvciBhc3NldCBcIjgwNDAzNGViYjgyMzY3M2Y5N2I2ZmYyODdkZjQ1MWViOThkNmNmMzY4Y2JmMmZlNmY4NzdkNjFhNDMxYjJhOTdcIicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpc0RpZmZlcmVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEFzc2V0UGFyYW1ldGVyczQ3NmM4MzljMzVmOWQzZDcyZTBlNmI4OTY2ODM0NThlNDk0M2ZkYmViNmJiNmExMzkzZjJkZGEyNDljOTBkZTNTM0J1Y2tldDc3Q0YzMjdCOlxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIFR5cGU6IFwiU3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICBEZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgJ1MzIGJ1Y2tldCBmb3IgYXNzZXQgXCI0NzZjODM5YzM1ZjlkM2Q3MmUwZTZiODk2NjgzNDU4ZTQ5NDNmZGJlYjZiYjZhMTM5M2YyZGRhMjQ5YzkwZGUzXCInLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaXNEaWZmZXJlbnQ6IHRydWUsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBBc3NldFBhcmFtZXRlcnM0NzZjODM5YzM1ZjlkM2Q3MmUwZTZiODk2NjgzNDU4ZTQ5NDNmZGJlYjZiYjZhMTM5M2YyZGRhMjQ5YzkwZGUzUzNWZXJzaW9uS2V5MEY2OEI5NDk6XG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZToge1xuICAgICAgICAgICAgICAgICAgVHlwZTogXCJTdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgIERlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgICAnUzMga2V5IGZvciBhc3NldCB2ZXJzaW9uIFwiNDc2YzgzOWMzNWY5ZDNkNzJlMGU2Yjg5NjY4MzQ1OGU0OTQzZmRiZWI2YmI2YTEzOTNmMmRkYTI0OWM5MGRlM1wiJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzRGlmZmVyZW50OiB0cnVlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgQXNzZXRQYXJhbWV0ZXJzNDc2YzgzOWMzNWY5ZDNkNzJlMGU2Yjg5NjY4MzQ1OGU0OTQzZmRiZWI2YmI2YTEzOTNmMmRkYTI0OWM5MGRlM0FydGlmYWN0SGFzaEUxMDZBOTU1OlxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIFR5cGU6IFwiU3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICBEZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgJ0FydGlmYWN0IGhhc2ggZm9yIGFzc2V0IFwiNDc2YzgzOWMzNWY5ZDNkNzJlMGU2Yjg5NjY4MzQ1OGU0OTQzZmRiZWI2YmI2YTEzOTNmMmRkYTI0OWM5MGRlM1wiJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzRGlmZmVyZW50OiB0cnVlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHJlc291cmNlczoge1xuICAgICAgICAgIGRpZmZzOiB7XG4gICAgICAgICAgICBKb3NoTGFtYmRhQzgyMzYyMDc6IHtcbiAgICAgICAgICAgICAgb2xkVmFsdWU6IHtcbiAgICAgICAgICAgICAgICBUeXBlOiBcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLFxuICAgICAgICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgICAgICAgUzNCdWNrZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQXNzZXRQYXJhbWV0ZXJzODA0MDM0ZWJiODIzNjczZjk3YjZmZjI4N2RmNDUxZWI5OGQ2Y2YzNjhjYmYyZmU2Zjg3N2Q2MWE0MzFiMmE5N1MzQnVja2V0MzAyQUJCMDlcIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgUzNLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpKb2luXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpTZWxlY3RcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6U3BsaXRcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifHxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQXNzZXRQYXJhbWV0ZXJzODA0MDM0ZWJiODIzNjczZjk3YjZmZjI4N2RmNDUxZWI5OGQ2Y2YzNjhjYmYyZmU2Zjg3N2Q2MWE0MzFiMmE5N1MzVmVyc2lvbktleTRDODc4QjBFXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OlNlbGVjdFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpTcGxpdFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ8fFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBc3NldFBhcmFtZXRlcnM4MDQwMzRlYmI4MjM2NzNmOTdiNmZmMjg3ZGY0NTFlYjk4ZDZjZjM2OGNiZjJmZTZmODc3ZDYxYTQzMWIyYTk3UzNWZXJzaW9uS2V5NEM4NzhCMEVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIEhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgICAgICAgICAgUm9sZToge1xuICAgICAgICAgICAgICAgICAgICBcIkZuOjpHZXRBdHRcIjogW1wiSm9zaExhbWJkYVNlcnZpY2VSb2xlREVDMEM0MjZcIiwgXCJBcm5cIl0sXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgUnVudGltZTogXCJub2RlanMxMC54XCIsXG4gICAgICAgICAgICAgICAgICBFbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgICAgICBWYXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBQT09QOiBcIkZPT1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIERlcGVuZHNPbjogW1wiSm9zaExhbWJkYVNlcnZpY2VSb2xlREVDMEM0MjZcIl0sXG4gICAgICAgICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgIFwiYXdzOmNkazpwYXRoXCI6IFwiSm9zaFN0YWNrL0pvc2hMYW1iZGEvUmVzb3VyY2VcIixcbiAgICAgICAgICAgICAgICAgIFwiYXdzOmFzc2V0OnBhdGhcIjpcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldC44MDQwMzRlYmI4MjM2NzNmOTdiNmZmMjg3ZGY0NTFlYjk4ZDZjZjM2OGNiZjJmZTZmODc3ZDYxYTQzMWIyYTk3XCIsXG4gICAgICAgICAgICAgICAgICBcImF3czphc3NldDpwcm9wZXJ0eVwiOiBcIkNvZGVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBuZXdWYWx1ZToge1xuICAgICAgICAgICAgICAgIFR5cGU6IFwiQVdTOjpMYW1iZGE6OkZ1bmN0aW9uXCIsXG4gICAgICAgICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICAgICAgICBTM0J1Y2tldDoge1xuICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBc3NldFBhcmFtZXRlcnM0NzZjODM5YzM1ZjlkM2Q3MmUwZTZiODk2NjgzNDU4ZTQ5NDNmZGJlYjZiYjZhMTM5M2YyZGRhMjQ5YzkwZGUzUzNCdWNrZXQ3N0NGMzI3QlwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBTM0tleToge1xuICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkpvaW5cIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OlNlbGVjdFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpTcGxpdFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ8fFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBc3NldFBhcmFtZXRlcnM0NzZjODM5YzM1ZjlkM2Q3MmUwZTZiODk2NjgzNDU4ZTQ5NDNmZGJlYjZiYjZhMTM5M2YyZGRhMjQ5YzkwZGUzUzNWZXJzaW9uS2V5MEY2OEI5NDlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6U2VsZWN0XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OlNwbGl0XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInx8XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFzc2V0UGFyYW1ldGVyczQ3NmM4MzljMzVmOWQzZDcyZTBlNmI4OTY2ODM0NThlNDk0M2ZkYmViNmJiNmExMzkzZjJkZGEyNDljOTBkZTNTM1ZlcnNpb25LZXkwRjY4Qjk0OVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgUm9sZToge1xuICAgICAgICAgICAgICAgICAgICBcIkZuOjpHZXRBdHRcIjogW1wiSm9zaExhbWJkYVNlcnZpY2VSb2xlREVDMEM0MjZcIiwgXCJBcm5cIl0sXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgRW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgVmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgUE9PUDogXCJGT08yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgQkFaOiBcIkJBUlwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIEhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgICAgICAgICAgUnVudGltZTogXCJub2RlanMxMi54XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBEZXBlbmRzT246IFtcIkpvc2hMYW1iZGFTZXJ2aWNlUm9sZURFQzBDNDI2XCJdLFxuICAgICAgICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICBcImF3czpjZGs6cGF0aFwiOiBcIkpvc2hTdGFjay9Kb3NoTGFtYmRhL1Jlc291cmNlXCIsXG4gICAgICAgICAgICAgICAgICBcImF3czphc3NldDpwYXRoXCI6XG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXQuNDc2YzgzOWMzNWY5ZDNkNzJlMGU2Yjg5NjY4MzQ1OGU0OTQzZmRiZWI2YmI2YTEzOTNmMmRkYTI0OWM5MGRlM1wiLFxuICAgICAgICAgICAgICAgICAgXCJhd3M6YXNzZXQ6cHJvcGVydHlcIjogXCJDb2RlXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVzb3VyY2VUeXBlczoge1xuICAgICAgICAgICAgICAgIG9sZFR5cGU6IFwiQVdTOjpMYW1iZGE6OkZ1bmN0aW9uXCIsXG4gICAgICAgICAgICAgICAgbmV3VHlwZTogXCJBV1M6OkxhbWJkYTo6RnVuY3Rpb25cIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJvcGVydHlEaWZmczoge1xuICAgICAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgICAgIG9sZFZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgIFMzQnVja2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFzc2V0UGFyYW1ldGVyczgwNDAzNGViYjgyMzY3M2Y5N2I2ZmYyODdkZjQ1MWViOThkNmNmMzY4Y2JmMmZlNmY4NzdkNjFhNDMxYjJhOTdTM0J1Y2tldDMwMkFCQjA5XCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFMzS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgXCJGbjo6Sm9pblwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6U2VsZWN0XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OlNwbGl0XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInx8XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFzc2V0UGFyYW1ldGVyczgwNDAzNGViYjgyMzY3M2Y5N2I2ZmYyODdkZjQ1MWViOThkNmNmMzY4Y2JmMmZlNmY4NzdkNjFhNDMxYjJhOTdTM1ZlcnNpb25LZXk0Qzg3OEIwRVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpTZWxlY3RcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6U3BsaXRcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifHxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWY6IFwiQXNzZXRQYXJhbWV0ZXJzODA0MDM0ZWJiODIzNjczZjk3YjZmZjI4N2RmNDUxZWI5OGQ2Y2YzNjhjYmYyZmU2Zjg3N2Q2MWE0MzFiMmE5N1MzVmVyc2lvbktleTRDODc4QjBFXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBuZXdWYWx1ZToge1xuICAgICAgICAgICAgICAgICAgICBTM0J1Y2tldDoge1xuICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBc3NldFBhcmFtZXRlcnM0NzZjODM5YzM1ZjlkM2Q3MmUwZTZiODk2NjgzNDU4ZTQ5NDNmZGJlYjZiYjZhMTM5M2YyZGRhMjQ5YzkwZGUzUzNCdWNrZXQ3N0NGMzI3QlwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBTM0tleToge1xuICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkpvaW5cIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OlNlbGVjdFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZuOjpTcGxpdFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ8fFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZjogXCJBc3NldFBhcmFtZXRlcnM0NzZjODM5YzM1ZjlkM2Q3MmUwZTZiODk2NjgzNDU4ZTQ5NDNmZGJlYjZiYjZhMTM5M2YyZGRhMjQ5YzkwZGUzUzNWZXJzaW9uS2V5MEY2OEI5NDlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGbjo6U2VsZWN0XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OlNwbGl0XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInx8XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmOiBcIkFzc2V0UGFyYW1ldGVyczQ3NmM4MzljMzVmOWQzZDcyZTBlNmI4OTY2ODM0NThlNDk0M2ZkYmViNmJiNmExMzkzZjJkZGEyNDljOTBkZTNTM1ZlcnNpb25LZXkwRjY4Qjk0OVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgaXNEaWZmZXJlbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICBjaGFuZ2VJbXBhY3Q6IFwiV0lMTF9VUERBVEVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEhhbmRsZXI6IHtcbiAgICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgICAgICAgICAgICAgIGlzRGlmZmVyZW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGNoYW5nZUltcGFjdDogXCJOT19DSEFOR0VcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFJvbGU6IHtcbiAgICAgICAgICAgICAgICAgIG9sZFZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiRm46OkdldEF0dFwiOiBbXCJKb3NoTGFtYmRhU2VydmljZVJvbGVERUMwQzQyNlwiLCBcIkFyblwiXSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBuZXdWYWx1ZToge1xuICAgICAgICAgICAgICAgICAgICBcIkZuOjpHZXRBdHRcIjogW1wiSm9zaExhbWJkYVNlcnZpY2VSb2xlREVDMEM0MjZcIiwgXCJBcm5cIl0sXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgaXNEaWZmZXJlbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgY2hhbmdlSW1wYWN0OiBcIk5PX0NIQU5HRVwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgUnVudGltZToge1xuICAgICAgICAgICAgICAgICAgb2xkVmFsdWU6IFwibm9kZWpzMTAueFwiLFxuICAgICAgICAgICAgICAgICAgbmV3VmFsdWU6IFwibm9kZWpzMTIueFwiLFxuICAgICAgICAgICAgICAgICAgaXNEaWZmZXJlbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICBjaGFuZ2VJbXBhY3Q6IFwiV0lMTF9VUERBVEVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgICBvbGRWYWx1ZToge1xuICAgICAgICAgICAgICAgICAgICBWYXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBQT09QOiBcIkZPT1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgIFZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICAgIFBPT1A6IFwiRk9PMlwiLFxuICAgICAgICAgICAgICAgICAgICAgIEJBWjogXCJCQVJcIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBpc0RpZmZlcmVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGNoYW5nZUltcGFjdDogXCJXSUxMX1VQREFURVwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG90aGVyRGlmZnM6IHtcbiAgICAgICAgICAgICAgICBUeXBlOiB7XG4gICAgICAgICAgICAgICAgICBvbGRWYWx1ZTogXCJBV1M6OkxhbWJkYTo6RnVuY3Rpb25cIixcbiAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLFxuICAgICAgICAgICAgICAgICAgaXNEaWZmZXJlbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRGVwZW5kc09uOiB7XG4gICAgICAgICAgICAgICAgICBvbGRWYWx1ZTogW1wiSm9zaExhbWJkYVNlcnZpY2VSb2xlREVDMEM0MjZcIl0sXG4gICAgICAgICAgICAgICAgICBuZXdWYWx1ZTogW1wiSm9zaExhbWJkYVNlcnZpY2VSb2xlREVDMEM0MjZcIl0sXG4gICAgICAgICAgICAgICAgICBpc0RpZmZlcmVudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgb2xkVmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJhd3M6Y2RrOnBhdGhcIjogXCJKb3NoU3RhY2svSm9zaExhbWJkYS9SZXNvdXJjZVwiLFxuICAgICAgICAgICAgICAgICAgICBcImF3czphc3NldDpwYXRoXCI6XG4gICAgICAgICAgICAgICAgICAgICAgXCJhc3NldC44MDQwMzRlYmI4MjM2NzNmOTdiNmZmMjg3ZGY0NTFlYjk4ZDZjZjM2OGNiZjJmZTZmODc3ZDYxYTQzMWIyYTk3XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXdzOmFzc2V0OnByb3BlcnR5XCI6IFwiQ29kZVwiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiYXdzOmNkazpwYXRoXCI6IFwiSm9zaFN0YWNrL0pvc2hMYW1iZGEvUmVzb3VyY2VcIixcbiAgICAgICAgICAgICAgICAgICAgXCJhd3M6YXNzZXQ6cGF0aFwiOlxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXQuNDc2YzgzOWMzNWY5ZDNkNzJlMGU2Yjg5NjY4MzQ1OGU0OTQzZmRiZWI2YmI2YTEzOTNmMmRkYTI0OWM5MGRlM1wiLFxuICAgICAgICAgICAgICAgICAgICBcImF3czphc3NldDpwcm9wZXJ0eVwiOiBcIkNvZGVcIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBpc0RpZmZlcmVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc0FkZGl0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgaXNSZW1vdmFsOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBKb3NoUXVldWVFQjk5Rjg0Nzoge1xuICAgICAgICAgICAgICBvbGRWYWx1ZToge1xuICAgICAgICAgICAgICAgIFR5cGU6IFwiQVdTOjpTUVM6OlF1ZXVlXCIsXG4gICAgICAgICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgIFwiYXdzOmNkazpwYXRoXCI6IFwiSm9zaFN0YWNrL0pvc2hRdWV1ZS9SZXNvdXJjZVwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG5ld1ZhbHVlOiB7XG4gICAgICAgICAgICAgICAgVHlwZTogXCJBV1M6OlNRUzo6UXVldWVcIixcbiAgICAgICAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICBEZWxheVNlY29uZHM6IDUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBVcGRhdGVSZXBsYWNlUG9saWN5OiBcIkRlbGV0ZVwiLFxuICAgICAgICAgICAgICAgIERlbGV0aW9uUG9saWN5OiBcIkRlbGV0ZVwiLFxuICAgICAgICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICBcImF3czpjZGs6cGF0aFwiOiBcIkpvc2hTdGFjay9Kb3NoUXVldWUvUmVzb3VyY2VcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICByZXNvdXJjZVR5cGVzOiB7XG4gICAgICAgICAgICAgICAgb2xkVHlwZTogXCJBV1M6OlNRUzo6UXVldWVcIixcbiAgICAgICAgICAgICAgICBuZXdUeXBlOiBcIkFXUzo6U1FTOjpRdWV1ZVwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9wZXJ0eURpZmZzOiB7XG4gICAgICAgICAgICAgICAgRGVsYXlTZWNvbmRzOiB7XG4gICAgICAgICAgICAgICAgICBuZXdWYWx1ZTogNSxcbiAgICAgICAgICAgICAgICAgIGlzRGlmZmVyZW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgY2hhbmdlSW1wYWN0OiBcIldJTExfVVBEQVRFXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb3RoZXJEaWZmczoge1xuICAgICAgICAgICAgICAgIFR5cGU6IHtcbiAgICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBcIkFXUzo6U1FTOjpRdWV1ZVwiLFxuICAgICAgICAgICAgICAgICAgbmV3VmFsdWU6IFwiQVdTOjpTUVM6OlF1ZXVlXCIsXG4gICAgICAgICAgICAgICAgICBpc0RpZmZlcmVudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgb2xkVmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJhd3M6Y2RrOnBhdGhcIjogXCJKb3NoU3RhY2svSm9zaFF1ZXVlL1Jlc291cmNlXCIsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgbmV3VmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJhd3M6Y2RrOnBhdGhcIjogXCJKb3NoU3RhY2svSm9zaFF1ZXVlL1Jlc291cmNlXCIsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgaXNEaWZmZXJlbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgVXBkYXRlUmVwbGFjZVBvbGljeToge1xuICAgICAgICAgICAgICAgICAgbmV3VmFsdWU6IFwiRGVsZXRlXCIsXG4gICAgICAgICAgICAgICAgICBpc0RpZmZlcmVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIERlbGV0aW9uUG9saWN5OiB7XG4gICAgICAgICAgICAgICAgICBuZXdWYWx1ZTogXCJEZWxldGVcIixcbiAgICAgICAgICAgICAgICAgIGlzRGlmZmVyZW50OiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzQWRkaXRpb246IGZhbHNlLFxuICAgICAgICAgICAgICBpc1JlbW92YWw6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEpvc2hRdWV1ZTJDOUQxOUE3Nzoge1xuICAgICAgICAgICAgICBuZXdWYWx1ZToge1xuICAgICAgICAgICAgICAgIFR5cGU6IFwiQVdTOjpTUVM6OlF1ZXVlXCIsXG4gICAgICAgICAgICAgICAgVXBkYXRlUmVwbGFjZVBvbGljeTogXCJEZWxldGVcIixcbiAgICAgICAgICAgICAgICBEZWxldGlvblBvbGljeTogXCJEZWxldGVcIixcbiAgICAgICAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgXCJhd3M6Y2RrOnBhdGhcIjogXCJKb3NoU3RhY2svSm9zaFF1ZXVlMi9SZXNvdXJjZVwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHJlc291cmNlVHlwZXM6IHtcbiAgICAgICAgICAgICAgICBuZXdUeXBlOiBcIkFXUzo6U1FTOjpRdWV1ZVwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9wZXJ0eURpZmZzOiB7fSxcbiAgICAgICAgICAgICAgb3RoZXJEaWZmczoge30sXG4gICAgICAgICAgICAgIGlzQWRkaXRpb246IHRydWUsXG4gICAgICAgICAgICAgIGlzUmVtb3ZhbDogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHVua25vd246IHtcbiAgICAgICAgICBkaWZmczoge30sXG4gICAgICAgIH0sXG4gICAgICAgIGlhbUNoYW5nZXM6IHtcbiAgICAgICAgICBzdGF0ZW1lbnRzOiB7XG4gICAgICAgICAgICBhZGRpdGlvbnM6IFtdLFxuICAgICAgICAgICAgcmVtb3ZhbHM6IFtdLFxuICAgICAgICAgICAgb2xkRWxlbWVudHM6IFtdLFxuICAgICAgICAgICAgbmV3RWxlbWVudHM6IFtdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiB7XG4gICAgICAgICAgICBhZGRpdGlvbnM6IFtdLFxuICAgICAgICAgICAgcmVtb3ZhbHM6IFtdLFxuICAgICAgICAgICAgb2xkRWxlbWVudHM6IFtdLFxuICAgICAgICAgICAgbmV3RWxlbWVudHM6IFtdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHNlY3VyaXR5R3JvdXBDaGFuZ2VzOiB7XG4gICAgICAgICAgaW5ncmVzczoge1xuICAgICAgICAgICAgYWRkaXRpb25zOiBbXSxcbiAgICAgICAgICAgIHJlbW92YWxzOiBbXSxcbiAgICAgICAgICAgIG9sZEVsZW1lbnRzOiBbXSxcbiAgICAgICAgICAgIG5ld0VsZW1lbnRzOiBbXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVncmVzczoge1xuICAgICAgICAgICAgYWRkaXRpb25zOiBbXSxcbiAgICAgICAgICAgIHJlbW92YWxzOiBbXSxcbiAgICAgICAgICAgIG9sZEVsZW1lbnRzOiBbXSxcbiAgICAgICAgICAgIG5ld0VsZW1lbnRzOiBbXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGxvZ2ljYWxUb1BhdGhNYXA6IHtcbiAgICAgICAgam9zaHBvb3AzNjBENUE2Qjc6IFwiL0pvc2hTdGFjay9qb3NoLXBvb3AzL1Jlc291cmNlXCIsXG4gICAgICAgIE15Um9sZUY0OEZGRTA0OiBcIi9Kb3NoU3RhY2svTXlSb2xlL1Jlc291cmNlXCIsXG4gICAgICAgIEpvc2hMYW1iZGFTZXJ2aWNlUm9sZURFQzBDNDI2OlxuICAgICAgICAgIFwiL0pvc2hTdGFjay9Kb3NoTGFtYmRhL1NlcnZpY2VSb2xlL1Jlc291cmNlXCIsXG4gICAgICAgIEpvc2hMYW1iZGFDODIzNjIwNzogXCIvSm9zaFN0YWNrL0pvc2hMYW1iZGEvUmVzb3VyY2VcIixcbiAgICAgICAgQXNzZXRQYXJhbWV0ZXJzNDc2YzgzOWMzNWY5ZDNkNzJlMGU2Yjg5NjY4MzQ1OGU0OTQzZmRiZWI2YmI2YTEzOTNmMmRkYTI0OWM5MGRlM1MzQnVja2V0NzdDRjMyN0I6XG4gICAgICAgICAgXCIvSm9zaFN0YWNrL0Fzc2V0UGFyYW1ldGVycy80NzZjODM5YzM1ZjlkM2Q3MmUwZTZiODk2NjgzNDU4ZTQ5NDNmZGJlYjZiYjZhMTM5M2YyZGRhMjQ5YzkwZGUzL1MzQnVja2V0XCIsXG4gICAgICAgIEFzc2V0UGFyYW1ldGVyczQ3NmM4MzljMzVmOWQzZDcyZTBlNmI4OTY2ODM0NThlNDk0M2ZkYmViNmJiNmExMzkzZjJkZGEyNDljOTBkZTNTM1ZlcnNpb25LZXkwRjY4Qjk0OTpcbiAgICAgICAgICBcIi9Kb3NoU3RhY2svQXNzZXRQYXJhbWV0ZXJzLzQ3NmM4MzljMzVmOWQzZDcyZTBlNmI4OTY2ODM0NThlNDk0M2ZkYmViNmJiNmExMzkzZjJkZGEyNDljOTBkZTMvUzNWZXJzaW9uS2V5XCIsXG4gICAgICAgIEFzc2V0UGFyYW1ldGVyczQ3NmM4MzljMzVmOWQzZDcyZTBlNmI4OTY2ODM0NThlNDk0M2ZkYmViNmJiNmExMzkzZjJkZGEyNDljOTBkZTNBcnRpZmFjdEhhc2hFMTA2QTk1NTpcbiAgICAgICAgICBcIi9Kb3NoU3RhY2svQXNzZXRQYXJhbWV0ZXJzLzQ3NmM4MzljMzVmOWQzZDcyZTBlNmI4OTY2ODM0NThlNDk0M2ZkYmViNmJiNmExMzkzZjJkZGEyNDljOTBkZTMvQXJ0aWZhY3RIYXNoXCIsXG4gICAgICAgIEpvc2hUb3BpY0E0RUNCODA1OiBcIi9Kb3NoU3RhY2svSm9zaFRvcGljL1Jlc291cmNlXCIsXG4gICAgICAgIEpvc2hRdWV1ZUVCOTlGODQ3OiBcIi9Kb3NoU3RhY2svSm9zaFF1ZXVlL1Jlc291cmNlXCIsXG4gICAgICAgIEpvc2hRdWV1ZVBvbGljeTVENERENTY4OiBcIi9Kb3NoU3RhY2svSm9zaFF1ZXVlL1BvbGljeS9SZXNvdXJjZVwiLFxuICAgICAgICBKb3NoUXVldWVKb3NoU3RhY2tKb3NoVG9waWNBOTUwNzAzQTYzMEY4REM5OlxuICAgICAgICAgIFwiL0pvc2hTdGFjay9Kb3NoUXVldWUvSm9zaFN0YWNrSm9zaFRvcGljQTk1MDcwM0EvUmVzb3VyY2VcIixcbiAgICAgICAgSm9zaFF1ZXVlMkM5RDE5QTc3OiBcIi9Kb3NoU3RhY2svSm9zaFF1ZXVlMi9SZXNvdXJjZVwiLFxuICAgICAgICB0aGVxdWV1ZTogXCIvSm9zaFN0YWNrL3RoZXF1ZXVlXCIsXG4gICAgICAgIENES01ldGFkYXRhOiBcIi9Kb3NoU3RhY2svQ0RLTWV0YWRhdGEvRGVmYXVsdFwiLFxuICAgICAgICBDREtNZXRhZGF0YUF2YWlsYWJsZTogXCIvSm9zaFN0YWNrL0NES01ldGFkYXRhL0NvbmRpdGlvblwiLFxuICAgICAgfSxcbiAgICB9LFxuICBdO1xufTtcbiJdfQ==