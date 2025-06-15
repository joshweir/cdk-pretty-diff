import { DiffOptions, NicerStackDiff, StackRawDiff } from './types';
import * as cdk from "aws-cdk-lib";
export declare const getCustomDiff: (app: cdk.App, props?: {
    rawDiff?: StackRawDiff[];
    options?: DiffOptions;
}) => Promise<NicerStackDiff[]>;
