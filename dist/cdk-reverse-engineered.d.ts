import { CdkToolkit, DiffOptions } from 'aws-cdk/lib/cdk-toolkit';
import { ConfigurationProps } from 'aws-cdk/lib/settings';
import { CustomCdkToolkitProps, StackRawDiff } from './types';
export declare const deepSubstituteBracedLogicalIds: (logicalToPathMap: any) => (rows: any) => any;
declare class CustomCdkToolkit extends CdkToolkit {
    private cdkToolkitDeploymentsProp;
    constructor({ cdkToolkitDeploymentsProp, ...props }: CustomCdkToolkitProps);
    getDiffObject(options: DiffOptions): Promise<StackRawDiff[]>;
}
export declare const bootstrapCdkToolkit: (configProps?: ConfigurationProps) => Promise<CustomCdkToolkit>;
export {};
