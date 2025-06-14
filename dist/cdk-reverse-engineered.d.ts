import * as cdk from 'aws-cdk-lib';
import { DiffOptions, StackRawDiff } from './types';
export declare const deepSubstituteBracedLogicalIds: (logicalToPathMap: any) => (rows: any) => any;
export declare function getDiffObject(app: cdk.App, options?: DiffOptions): Promise<StackRawDiff[]>;
