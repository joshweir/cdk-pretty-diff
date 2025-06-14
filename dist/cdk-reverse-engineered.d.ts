import * as cdk from 'aws-cdk-lib';
import { StackRawDiff } from './types';
export declare const deepSubstituteBracedLogicalIds: (logicalToPathMap: any) => (rows: any) => any;
export interface DiffOptions {
    context?: Record<string, string>;
}
export declare function getDiffObject(app: cdk.App, options?: DiffOptions): Promise<StackRawDiff[]>;
