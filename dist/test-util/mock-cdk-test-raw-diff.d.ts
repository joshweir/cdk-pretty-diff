export declare const mockCdkTestRawDiff: () => {
    stackName: string;
    rawDiff: {
        conditions: {
            diffs: {
                CDKMetadataAvailable: {
                    oldValue: {
                        "Fn::Or": {
                            "Fn::Or": {
                                "Fn::Equals": (string | {
                                    Ref: string;
                                })[];
                            }[];
                        }[];
                    };
                    newValue: {
                        "Fn::Or": {
                            "Fn::Or": {
                                "Fn::Equals": (string | {
                                    Ref: string;
                                })[];
                            }[];
                        }[];
                    };
                    isDifferent: boolean;
                };
            };
        };
        mappings: {
            diffs: {};
        };
        metadata: {
            diffs: {};
        };
        outputs: {
            diffs: {
                thequeue: {
                    oldValue: {
                        Value: {
                            "Fn::GetAtt": string[];
                        };
                    };
                    newValue: {
                        Value: {
                            Ref: string;
                        };
                    };
                    isDifferent: boolean;
                };
            };
        };
        parameters: {
            diffs: {
                AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3Bucket302ABB09: {
                    oldValue: {
                        Type: string;
                        Description: string;
                    };
                    isDifferent: boolean;
                };
                AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97S3VersionKey4C878B0E: {
                    oldValue: {
                        Type: string;
                        Description: string;
                    };
                    isDifferent: boolean;
                };
                AssetParameters804034ebb823673f97b6ff287df451eb98d6cf368cbf2fe6f877d61a431b2a97ArtifactHash6F137924: {
                    oldValue: {
                        Type: string;
                        Description: string;
                    };
                    isDifferent: boolean;
                };
                AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B: {
                    newValue: {
                        Type: string;
                        Description: string;
                    };
                    isDifferent: boolean;
                };
                AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949: {
                    newValue: {
                        Type: string;
                        Description: string;
                    };
                    isDifferent: boolean;
                };
                AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3ArtifactHashE106A955: {
                    newValue: {
                        Type: string;
                        Description: string;
                    };
                    isDifferent: boolean;
                };
            };
        };
        resources: {
            diffs: {
                JoshLambdaC8236207: {
                    oldValue: {
                        Type: string;
                        Properties: {
                            Code: {
                                S3Bucket: {
                                    Ref: string;
                                };
                                S3Key: {
                                    "Fn::Join": (string | {
                                        "Fn::Select": (number | {
                                            "Fn::Split": (string | {
                                                Ref: string;
                                            })[];
                                        })[];
                                    }[])[];
                                };
                            };
                            Handler: string;
                            Role: {
                                "Fn::GetAtt": string[];
                            };
                            Runtime: string;
                            Environment: {
                                Variables: {
                                    POOP: string;
                                };
                            };
                        };
                        DependsOn: string[];
                        Metadata: {
                            "aws:cdk:path": string;
                            "aws:asset:path": string;
                            "aws:asset:property": string;
                        };
                    };
                    newValue: {
                        Type: string;
                        Properties: {
                            Code: {
                                S3Bucket: {
                                    Ref: string;
                                };
                                S3Key: {
                                    "Fn::Join": (string | {
                                        "Fn::Select": (number | {
                                            "Fn::Split": (string | {
                                                Ref: string;
                                            })[];
                                        })[];
                                    }[])[];
                                };
                            };
                            Role: {
                                "Fn::GetAtt": string[];
                            };
                            Environment: {
                                Variables: {
                                    POOP: string;
                                    BAZ: string;
                                };
                            };
                            Handler: string;
                            Runtime: string;
                        };
                        DependsOn: string[];
                        Metadata: {
                            "aws:cdk:path": string;
                            "aws:asset:path": string;
                            "aws:asset:property": string;
                        };
                    };
                    resourceTypes: {
                        oldType: string;
                        newType: string;
                    };
                    propertyDiffs: {
                        Code: {
                            oldValue: {
                                S3Bucket: {
                                    Ref: string;
                                };
                                S3Key: {
                                    "Fn::Join": (string | {
                                        "Fn::Select": (number | {
                                            "Fn::Split": (string | {
                                                Ref: string;
                                            })[];
                                        })[];
                                    }[])[];
                                };
                            };
                            newValue: {
                                S3Bucket: {
                                    Ref: string;
                                };
                                S3Key: {
                                    "Fn::Join": (string | {
                                        "Fn::Select": (number | {
                                            "Fn::Split": (string | {
                                                Ref: string;
                                            })[];
                                        })[];
                                    }[])[];
                                };
                            };
                            isDifferent: boolean;
                            changeImpact: string;
                        };
                        Handler: {
                            oldValue: string;
                            newValue: string;
                            isDifferent: boolean;
                            changeImpact: string;
                        };
                        Role: {
                            oldValue: {
                                "Fn::GetAtt": string[];
                            };
                            newValue: {
                                "Fn::GetAtt": string[];
                            };
                            isDifferent: boolean;
                            changeImpact: string;
                        };
                        Runtime: {
                            oldValue: string;
                            newValue: string;
                            isDifferent: boolean;
                            changeImpact: string;
                        };
                        Environment: {
                            oldValue: {
                                Variables: {
                                    POOP: string;
                                };
                            };
                            newValue: {
                                Variables: {
                                    POOP: string;
                                    BAZ: string;
                                };
                            };
                            isDifferent: boolean;
                            changeImpact: string;
                        };
                    };
                    otherDiffs: {
                        Type: {
                            oldValue: string;
                            newValue: string;
                            isDifferent: boolean;
                        };
                        DependsOn: {
                            oldValue: string[];
                            newValue: string[];
                            isDifferent: boolean;
                        };
                        Metadata: {
                            oldValue: {
                                "aws:cdk:path": string;
                                "aws:asset:path": string;
                                "aws:asset:property": string;
                            };
                            newValue: {
                                "aws:cdk:path": string;
                                "aws:asset:path": string;
                                "aws:asset:property": string;
                            };
                            isDifferent: boolean;
                        };
                    };
                    isAddition: boolean;
                    isRemoval: boolean;
                };
                JoshQueueEB99F847: {
                    oldValue: {
                        Type: string;
                        Metadata: {
                            "aws:cdk:path": string;
                        };
                    };
                    newValue: {
                        Type: string;
                        Properties: {
                            DelaySeconds: number;
                        };
                        UpdateReplacePolicy: string;
                        DeletionPolicy: string;
                        Metadata: {
                            "aws:cdk:path": string;
                        };
                    };
                    resourceTypes: {
                        oldType: string;
                        newType: string;
                    };
                    propertyDiffs: {
                        DelaySeconds: {
                            newValue: number;
                            isDifferent: boolean;
                            changeImpact: string;
                        };
                    };
                    otherDiffs: {
                        Type: {
                            oldValue: string;
                            newValue: string;
                            isDifferent: boolean;
                        };
                        Metadata: {
                            oldValue: {
                                "aws:cdk:path": string;
                            };
                            newValue: {
                                "aws:cdk:path": string;
                            };
                            isDifferent: boolean;
                        };
                        UpdateReplacePolicy: {
                            newValue: string;
                            isDifferent: boolean;
                        };
                        DeletionPolicy: {
                            newValue: string;
                            isDifferent: boolean;
                        };
                    };
                    isAddition: boolean;
                    isRemoval: boolean;
                };
                JoshQueue2C9D19A77: {
                    newValue: {
                        Type: string;
                        UpdateReplacePolicy: string;
                        DeletionPolicy: string;
                        Metadata: {
                            "aws:cdk:path": string;
                        };
                    };
                    resourceTypes: {
                        newType: string;
                    };
                    propertyDiffs: {};
                    otherDiffs: {};
                    isAddition: boolean;
                    isRemoval: boolean;
                };
            };
        };
        unknown: {
            diffs: {};
        };
        iamChanges: {
            statements: {
                additions: never[];
                removals: never[];
                oldElements: never[];
                newElements: never[];
            };
            managedPolicies: {
                additions: never[];
                removals: never[];
                oldElements: never[];
                newElements: never[];
            };
        };
        securityGroupChanges: {
            ingress: {
                additions: never[];
                removals: never[];
                oldElements: never[];
                newElements: never[];
            };
            egress: {
                additions: never[];
                removals: never[];
                oldElements: never[];
                newElements: never[];
            };
        };
    };
    logicalToPathMap: {
        joshpoop360D5A6B7: string;
        MyRoleF48FFE04: string;
        JoshLambdaServiceRoleDEC0C426: string;
        JoshLambdaC8236207: string;
        AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3Bucket77CF327B: string;
        AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3S3VersionKey0F68B949: string;
        AssetParameters476c839c35f9d3d72e0e6b896683458e4943fdbeb6bb6a1393f2dda249c90de3ArtifactHashE106A955: string;
        JoshTopicA4ECB805: string;
        JoshQueueEB99F847: string;
        JoshQueuePolicy5D4DD568: string;
        JoshQueueJoshStackJoshTopicA950703A630F8DC9: string;
        JoshQueue2C9D19A77: string;
        thequeue: string;
        CDKMetadata: string;
        CDKMetadataAvailable: string;
    };
}[];
