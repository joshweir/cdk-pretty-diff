import { NicerStackDiff } from "../types";

// This is generated from `getCustomDiff` for the cdk stack in cdk-test/ directory
export const mockCdkTestCustomDiff = (): NicerStackDiff[] => [
  {
    stackName: "JoshStack",
    raw: 'Parameters\n[-] Parameter AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09: {"Type":"String","Description":"S3 bucket for asset \\"804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97\\""}\n[-] Parameter AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E: {"Type":"String","Description":"S3 key for asset version \\"804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97\\""}\n[-] Parameter AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97ArtifactHash6F137924: {"Type":"String","Description":"Artifact hash for asset \\"804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97\\""}\n[+] Parameter AssetParameters/476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3/S3Bucket AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B: {"Type":"String","Description":"S3 bucket for asset \\"476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3\\""}\n[+] Parameter AssetParameters/476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3/S3VersionKey AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949: {"Type":"String","Description":"S3 key for asset version \\"476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3\\""}\n[+] Parameter AssetParameters/476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3/ArtifactHash AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3ArtifactHashE106A955: {"Type":"String","Description":"Artifact hash for asset \\"476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3\\""}\n\nConditions\n[~] Condition CDKMetadata/Condition CDKMetadataAvailable: {"Fn::Or":[{"Fn::Or":[{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-northeast-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-northeast-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-southeast-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-southeast-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ca-central-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"cn-north-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"cn-northwest-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-central-1"]}]},{"Fn::Or":[{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-north-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-3"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"me-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"sa-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-east-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-west-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-west-2"]}]}]} to {"Fn::Or":[{"Fn::Or":[{"Fn::Equals":[{"Ref":"AWS::Region"},"af-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-northeast-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-northeast-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-southeast-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-southeast-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ca-central-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"cn-north-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"cn-northwest-1"]}]},{"Fn::Or":[{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-central-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-north-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-3"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"me-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"sa-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-east-2"]}]},{"Fn::Or":[{"Fn::Equals":[{"Ref":"AWS::Region"},"us-west-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-west-2"]}]}]}\n\nResources\n[+] AWS::SQS::Queue JoshQueue2 JoshQueue2C9D19A77 \n[~] AWS::Lambda::Function JoshLambda JoshLambdaC8236207 \n ├─ [~] Code\n │   ├─ [~] .S3Bucket:\n │   │   └─ [~] .Ref:\n │   │       ├─ [-] AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09\n │   │       └─ [+] AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B\n │   └─ [~] .S3Key:\n │       └─ [~] .Fn::Join:\n │           └─ @@ -8,7 +8,7 @@\n │              [ ]   "Fn::Split": [\n │              [ ]     "||",\n │              [ ]     {\n │              [-]       "Ref": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E"\n │              [+]       "Ref": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949"\n │              [ ]     }\n │              [ ]   ]\n │              [ ] }\n │              @@ -21,7 +21,7 @@\n │              [ ]   "Fn::Split": [\n │              [ ]     "||",\n │              [ ]     {\n │              [-]       "Ref": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E"\n │              [+]       "Ref": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949"\n │              [ ]     }\n │              [ ]   ]\n │              [ ] }\n ├─ [~] Environment\n │   └─ [~] .Variables:\n │       ├─ [+] Added: .BAZ\n │       └─ [~] .POOP:\n │           ├─ [-] FOO\n │           └─ [+] FOO2\n ├─ [~] Runtime\n │   ├─ [-] nodejs10.x\n │   └─ [+] nodejs12.x\n └─ [~] Metadata\n     └─ [~] .aws:asset:path:\n         ├─ [-] asset.804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97\n         └─ [+] asset.476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3\n[~] AWS::SQS::Queue JoshQueue JoshQueueEB99F847 \n ├─ [+] DelaySeconds\n │   └─ 5\n ├─ [+] DeletionPolicy\n │   └─ Delete\n └─ [+] UpdateReplacePolicy\n     └─ Delete\n\nOutputs\n[~] Output thequeue thequeue: {"Value":{"Fn::GetAtt":["JoshQueueEB99F847","Arn"]}} to {"Value":{"Ref":"JoshTopicA4ECB805"}}\n\n',
    diff: [
      {
        label: "conditions",
        cdkDiffRaw:
          '{\n  "id": "CDKMetadataAvailable",\n  "diff": {\n    "oldValue": {\n      "Fn::Or": [\n        {\n          "Fn::Or": [\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-east-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-northeast-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-northeast-2"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-south-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-southeast-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-southeast-2"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ca-central-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "cn-north-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "cn-northwest-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-central-1"\n              ]\n            }\n          ]\n        },\n        {\n          "Fn::Or": [\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-north-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-west-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-west-2"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-west-3"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "me-south-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "sa-east-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "us-east-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "us-east-2"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "us-west-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "us-west-2"\n              ]\n            }\n          ]\n        }\n      ]\n    },\n    "newValue": {\n      "Fn::Or": [\n        {\n          "Fn::Or": [\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "af-south-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-east-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-northeast-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-northeast-2"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-south-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-southeast-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ap-southeast-2"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "ca-central-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "cn-north-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "cn-northwest-1"\n              ]\n            }\n          ]\n        },\n        {\n          "Fn::Or": [\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-central-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-north-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-south-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-west-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-west-2"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "eu-west-3"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "me-south-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "sa-east-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "us-east-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "us-east-2"\n              ]\n            }\n          ]\n        },\n        {\n          "Fn::Or": [\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "us-west-1"\n              ]\n            },\n            {\n              "Fn::Equals": [\n                {\n                  "Ref": "AWS::Region"\n                },\n                "us-west-2"\n              ]\n            }\n          ]\n        }\n      ]\n    },\n    "isDifferent": true\n  }\n}',
        nicerDiff: {
          resourceType: "conditions",
          changes: [],
          cdkDiffCategory: "conditions",
          resourceAction: "UPDATE",
          resourceLabel: "CDKMetadataAvailable",
        },
      },
      {
        label: "outputs",
        cdkDiffRaw:
          '{\n  "id": "thequeue",\n  "diff": {\n    "oldValue": {\n      "Value": {\n        "Fn::GetAtt": [\n          "JoshQueueEB99F847",\n          "Arn"\n        ]\n      }\n    },\n    "newValue": {\n      "Value": {\n        "Ref": "JoshTopicA4ECB805"\n      }\n    },\n    "isDifferent": true\n  }\n}',
        nicerDiff: {
          resourceType: "outputs",
          changes: [],
          cdkDiffCategory: "outputs",
          resourceAction: "UPDATE",
          resourceLabel: "thequeue",
        },
      },
      {
        label: "parameters",
        cdkDiffRaw:
          '{\n  "id": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09",\n  "diff": {\n    "oldValue": {\n      "Type": "String",\n      "Description": "S3 bucket for asset \\"804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97\\""\n    },\n    "isDifferent": true\n  }\n}',
        nicerDiff: {
          resourceType: "String",
          changes: [],
          cdkDiffCategory: "parameters",
          resourceAction: "REMOVAL",
          resourceLabel:
            "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09",
        },
      },
      {
        label: "parameters",
        cdkDiffRaw:
          '{\n  "id": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E",\n  "diff": {\n    "oldValue": {\n      "Type": "String",\n      "Description": "S3 key for asset version \\"804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97\\""\n    },\n    "isDifferent": true\n  }\n}',
        nicerDiff: {
          resourceType: "String",
          changes: [],
          cdkDiffCategory: "parameters",
          resourceAction: "REMOVAL",
          resourceLabel:
            "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E",
        },
      },
      {
        label: "parameters",
        cdkDiffRaw:
          '{\n  "id": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97ArtifactHash6F137924",\n  "diff": {\n    "oldValue": {\n      "Type": "String",\n      "Description": "Artifact hash for asset \\"804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97\\""\n    },\n    "isDifferent": true\n  }\n}',
        nicerDiff: {
          resourceType: "String",
          changes: [],
          cdkDiffCategory: "parameters",
          resourceAction: "REMOVAL",
          resourceLabel:
            "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97ArtifactHash6F137924",
        },
      },
      {
        label: "parameters",
        cdkDiffRaw:
          '{\n  "id": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B",\n  "diff": {\n    "newValue": {\n      "Type": "String",\n      "Description": "S3 bucket for asset \\"476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3\\""\n    },\n    "isDifferent": true\n  }\n}',
        nicerDiff: {
          resourceType: "String",
          changes: [],
          cdkDiffCategory: "parameters",
          resourceAction: "ADDITION",
          resourceLabel:
            "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B",
        },
      },
      {
        label: "parameters",
        cdkDiffRaw:
          '{\n  "id": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949",\n  "diff": {\n    "newValue": {\n      "Type": "String",\n      "Description": "S3 key for asset version \\"476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3\\""\n    },\n    "isDifferent": true\n  }\n}',
        nicerDiff: {
          resourceType: "String",
          changes: [],
          cdkDiffCategory: "parameters",
          resourceAction: "ADDITION",
          resourceLabel:
            "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949",
        },
      },
      {
        label: "parameters",
        cdkDiffRaw:
          '{\n  "id": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3ArtifactHashE106A955",\n  "diff": {\n    "newValue": {\n      "Type": "String",\n      "Description": "Artifact hash for asset \\"476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3\\""\n    },\n    "isDifferent": true\n  }\n}',
        nicerDiff: {
          resourceType: "String",
          changes: [],
          cdkDiffCategory: "parameters",
          resourceAction: "ADDITION",
          resourceLabel:
            "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3ArtifactHashE106A955",
        },
      },
      {
        label: "resources",
        cdkDiffRaw:
          '{\n  "id": "JoshQueue2C9D19A77",\n  "diff": {\n    "newValue": {\n      "Type": "AWS::SQS::Queue",\n      "UpdateReplacePolicy": "Delete",\n      "DeletionPolicy": "Delete",\n      "Metadata": {\n        "aws:cdk:path": "JoshStack/JoshQueue2/Resource"\n      }\n    },\n    "resourceTypes": {\n      "newType": "AWS::SQS::Queue"\n    },\n    "propertyDiffs": {},\n    "otherDiffs": {},\n    "isAddition": true,\n    "isRemoval": false\n  }\n}',
        nicerDiff: {
          resourceType: "AWS::SQS::Queue",
          changes: [],
          cdkDiffCategory: "resources",
          resourceAction: "ADDITION",
          resourceLabel: "JoshQueue2C9D19A77",
        },
      },
      {
        label: "resources",
        cdkDiffRaw:
          '{\n  "id": "JoshLambdaC8236207",\n  "diff": {\n    "oldValue": {\n      "Type": "AWS::Lambda::Function",\n      "Properties": {\n        "Code": {\n          "S3Bucket": {\n            "Ref": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09"\n          },\n          "S3Key": {\n            "Fn::Join": [\n              "",\n              [\n                {\n                  "Fn::Select": [\n                    0,\n                    {\n                      "Fn::Split": [\n                        "||",\n                        {\n                          "Ref": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E"\n                        }\n                      ]\n                    }\n                  ]\n                },\n                {\n                  "Fn::Select": [\n                    1,\n                    {\n                      "Fn::Split": [\n                        "||",\n                        {\n                          "Ref": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E"\n                        }\n                      ]\n                    }\n                  ]\n                }\n              ]\n            ]\n          }\n        },\n        "Handler": "index.handler",\n        "Role": {\n          "Fn::GetAtt": [\n            "JoshLambdaServiceRoleDEC0C426",\n            "Arn"\n          ]\n        },\n        "Runtime": "nodejs10.x",\n        "Environment": {\n          "Variables": {\n            "POOP": "FOO"\n          }\n        }\n      },\n      "DependsOn": [\n        "JoshLambdaServiceRoleDEC0C426"\n      ],\n      "Metadata": {\n        "aws:cdk:path": "JoshStack/JoshLambda/Resource",\n        "aws:asset:path": "asset.804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97",\n        "aws:asset:property": "Code"\n      }\n    },\n    "newValue": {\n      "Type": "AWS::Lambda::Function",\n      "Properties": {\n        "Code": {\n          "S3Bucket": {\n            "Ref": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B"\n          },\n          "S3Key": {\n            "Fn::Join": [\n              "",\n              [\n                {\n                  "Fn::Select": [\n                    0,\n                    {\n                      "Fn::Split": [\n                        "||",\n                        {\n                          "Ref": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949"\n                        }\n                      ]\n                    }\n                  ]\n                },\n                {\n                  "Fn::Select": [\n                    1,\n                    {\n                      "Fn::Split": [\n                        "||",\n                        {\n                          "Ref": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949"\n                        }\n                      ]\n                    }\n                  ]\n                }\n              ]\n            ]\n          }\n        },\n        "Role": {\n          "Fn::GetAtt": [\n            "JoshLambdaServiceRoleDEC0C426",\n            "Arn"\n          ]\n        },\n        "Environment": {\n          "Variables": {\n            "POOP": "FOO2",\n            "BAZ": "BAR"\n          }\n        },\n        "Handler": "index.handler",\n        "Runtime": "nodejs12.x"\n      },\n      "DependsOn": [\n        "JoshLambdaServiceRoleDEC0C426"\n      ],\n      "Metadata": {\n        "aws:cdk:path": "JoshStack/JoshLambda/Resource",\n        "aws:asset:path": "asset.476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3",\n        "aws:asset:property": "Code"\n      }\n    },\n    "resourceTypes": {\n      "oldType": "AWS::Lambda::Function",\n      "newType": "AWS::Lambda::Function"\n    },\n    "propertyDiffs": {\n      "Code": {\n        "oldValue": {\n          "S3Bucket": {\n            "Ref": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09"\n          },\n          "S3Key": {\n            "Fn::Join": [\n              "",\n              [\n                {\n                  "Fn::Select": [\n                    0,\n                    {\n                      "Fn::Split": [\n                        "||",\n                        {\n                          "Ref": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E"\n                        }\n                      ]\n                    }\n                  ]\n                },\n                {\n                  "Fn::Select": [\n                    1,\n                    {\n                      "Fn::Split": [\n                        "||",\n                        {\n                          "Ref": "AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E"\n                        }\n                      ]\n                    }\n                  ]\n                }\n              ]\n            ]\n          }\n        },\n        "newValue": {\n          "S3Bucket": {\n            "Ref": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B"\n          },\n          "S3Key": {\n            "Fn::Join": [\n              "",\n              [\n                {\n                  "Fn::Select": [\n                    0,\n                    {\n                      "Fn::Split": [\n                        "||",\n                        {\n                          "Ref": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949"\n                        }\n                      ]\n                    }\n                  ]\n                },\n                {\n                  "Fn::Select": [\n                    1,\n                    {\n                      "Fn::Split": [\n                        "||",\n                        {\n                          "Ref": "AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949"\n                        }\n                      ]\n                    }\n                  ]\n                }\n              ]\n            ]\n          }\n        },\n        "isDifferent": true,\n        "changeImpact": "WILL_UPDATE"\n      },\n      "Handler": {\n        "oldValue": "index.handler",\n        "newValue": "index.handler",\n        "isDifferent": false,\n        "changeImpact": "NO_CHANGE"\n      },\n      "Role": {\n        "oldValue": {\n          "Fn::GetAtt": [\n            "JoshLambdaServiceRoleDEC0C426",\n            "Arn"\n          ]\n        },\n        "newValue": {\n          "Fn::GetAtt": [\n            "JoshLambdaServiceRoleDEC0C426",\n            "Arn"\n          ]\n        },\n        "isDifferent": false,\n        "changeImpact": "NO_CHANGE"\n      },\n      "Runtime": {\n        "oldValue": "nodejs10.x",\n        "newValue": "nodejs12.x",\n        "isDifferent": true,\n        "changeImpact": "WILL_UPDATE"\n      },\n      "Environment": {\n        "oldValue": {\n          "Variables": {\n            "POOP": "FOO"\n          }\n        },\n        "newValue": {\n          "Variables": {\n            "POOP": "FOO2",\n            "BAZ": "BAR"\n          }\n        },\n        "isDifferent": true,\n        "changeImpact": "WILL_UPDATE"\n      }\n    },\n    "otherDiffs": {\n      "Type": {\n        "oldValue": "AWS::Lambda::Function",\n        "newValue": "AWS::Lambda::Function",\n        "isDifferent": false\n      },\n      "DependsOn": {\n        "oldValue": [\n          "JoshLambdaServiceRoleDEC0C426"\n        ],\n        "newValue": [\n          "JoshLambdaServiceRoleDEC0C426"\n        ],\n        "isDifferent": false\n      },\n      "Metadata": {\n        "oldValue": {\n          "aws:cdk:path": "JoshStack/JoshLambda/Resource",\n          "aws:asset:path": "asset.804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97",\n          "aws:asset:property": "Code"\n        },\n        "newValue": {\n          "aws:cdk:path": "JoshStack/JoshLambda/Resource",\n          "aws:asset:path": "asset.476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3",\n          "aws:asset:property": "Code"\n        },\n        "isDifferent": true\n      }\n    },\n    "isAddition": false,\n    "isRemoval": false\n  }\n}',
        nicerDiff: {
          resourceType: "AWS::Lambda::Function",
          changes: [
            {
              label: "Code",
              action: "UPDATE",
              from: {
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
              to: {
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
            },
            {
              label: "Environment",
              action: "UPDATE",
              from: {
                Variables: {
                  POOP: "FOO",
                },
              },
              to: {
                Variables: {
                  POOP: "FOO2",
                  BAZ: "BAR",
                },
              },
            },
            {
              label: "Runtime",
              action: "UPDATE",
              from: "nodejs10.x",
              to: "nodejs12.x",
            },
            {
              label: "Metadata",
              action: "UPDATE",
              from: {
                "aws:cdk:path": "JoshStack/JoshLambda/Resource",
                "aws:asset:path":
                  "asset.804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97",
                "aws:asset:property": "Code",
              },
              to: {
                "aws:cdk:path": "JoshStack/JoshLambda/Resource",
                "aws:asset:path":
                  "asset.476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3",
                "aws:asset:property": "Code",
              },
            },
          ],
          cdkDiffCategory: "resources",
          resourceAction: "UPDATE",
          resourceLabel: "JoshLambdaC8236207",
        },
      },
      {
        label: "resources",
        cdkDiffRaw:
          '{\n  "id": "JoshQueueEB99F847",\n  "diff": {\n    "oldValue": {\n      "Type": "AWS::SQS::Queue",\n      "Metadata": {\n        "aws:cdk:path": "JoshStack/JoshQueue/Resource"\n      }\n    },\n    "newValue": {\n      "Type": "AWS::SQS::Queue",\n      "Properties": {\n        "DelaySeconds": 5\n      },\n      "UpdateReplacePolicy": "Delete",\n      "DeletionPolicy": "Delete",\n      "Metadata": {\n        "aws:cdk:path": "JoshStack/JoshQueue/Resource"\n      }\n    },\n    "resourceTypes": {\n      "oldType": "AWS::SQS::Queue",\n      "newType": "AWS::SQS::Queue"\n    },\n    "propertyDiffs": {\n      "DelaySeconds": {\n        "newValue": 5,\n        "isDifferent": true,\n        "changeImpact": "WILL_UPDATE"\n      }\n    },\n    "otherDiffs": {\n      "Type": {\n        "oldValue": "AWS::SQS::Queue",\n        "newValue": "AWS::SQS::Queue",\n        "isDifferent": false\n      },\n      "Metadata": {\n        "oldValue": {\n          "aws:cdk:path": "JoshStack/JoshQueue/Resource"\n        },\n        "newValue": {\n          "aws:cdk:path": "JoshStack/JoshQueue/Resource"\n        },\n        "isDifferent": false\n      },\n      "UpdateReplacePolicy": {\n        "newValue": "Delete",\n        "isDifferent": true\n      },\n      "DeletionPolicy": {\n        "newValue": "Delete",\n        "isDifferent": true\n      }\n    },\n    "isAddition": false,\n    "isRemoval": false\n  }\n}',
        nicerDiff: {
          resourceType: "AWS::SQS::Queue",
          changes: [
            {
              label: "DelaySeconds",
              action: "ADDITION",
              to: 5,
            },
            {
              label: "DeletionPolicy",
              action: "ADDITION",
              to: "Delete",
            },
            {
              label: "UpdateReplacePolicy",
              action: "ADDITION",
              to: "Delete",
            },
          ],
          cdkDiffCategory: "resources",
          resourceAction: "UPDATE",
          resourceLabel: "JoshQueueEB99F847",
        },
      },
    ],
  },
];
