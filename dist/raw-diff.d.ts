import { DiffOptions, StackRawDiff } from './types';
import * as cdk from "aws-cdk-lib";
export declare const getRawDiff: (app: cdk.App, options?: DiffOptions) => Promise<StackRawDiff[]>;
