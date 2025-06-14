import { NicerStackDiff, StackRawDiff } from './types';
import * as cdk from "aws-cdk-lib";
import { DiffOptions } from './cdk-reverse-engineered';
export declare const getCustomDiff: (app: cdk.App, props?: {
    rawDiff?: StackRawDiff[];
    options?: DiffOptions;
}) => Promise<NicerStackDiff[]>;
