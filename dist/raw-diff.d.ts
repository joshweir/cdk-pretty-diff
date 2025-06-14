import { StackRawDiff } from './types';
import { DiffOptions } from './cdk-reverse-engineered';
import * as cdk from "aws-cdk-lib";
export declare const getRawDiff: (app: cdk.App, options?: DiffOptions) => Promise<StackRawDiff[]>;
