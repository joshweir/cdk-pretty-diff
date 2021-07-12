import { CdkToolkit, CdkToolkitProps, DiffOptions } from 'aws-cdk/lib/cdk-toolkit';
import { StackRawDiff } from './types';
export declare const deepSubstituteBracedLogicalIds: (logicalToPathMap: any) => (rows: any) => any;
declare class CustomCdkToolkit extends CdkToolkit {
    constructor(props: CdkToolkitProps);
    getDiffObject(options: DiffOptions): Promise<StackRawDiff[]>;
}
export declare const bootstrapCdkToolkit: () => Promise<CustomCdkToolkit>;
export {};
