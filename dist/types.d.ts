import * as cfnDiff from '@aws-cdk/cloudformation-diff';
import { CdkToolkitProps } from 'aws-cdk/lib/cdk-toolkit';
export declare const cdkDiffCategories: readonly ["iamChanges", "securityGroup", "resources", "parameters", "metadata", "mappings", "conditions", "outputs", "unknown"];
export type CdkDiffCategories = typeof cdkDiffCategories;
export type CdkDiffCategory = CdkDiffCategories[number];
export type StackRawDiff = {
    stackName: string;
    rawDiff: cfnDiff.TemplateDiff;
    logicalToPathMap: Record<string, string>;
};
export type NicerDiffChange = {
    label: string;
    from?: any;
    to: any;
    action: 'ADDITION' | 'UPDATE' | 'REMOVAL';
};
export type NicerDiff = {
    label: string;
    cdkDiffRaw: string;
    nicerDiff?: {
        cdkDiffCategory: CdkDiffCategory;
        resourceAction: 'ADDITION' | 'UPDATE' | 'REMOVAL';
        resourceType: string;
        resourceLabel: string;
        changes: NicerDiffChange[];
    };
};
export declare const nicerDiffGuard: (thing: any) => thing is NicerDiff;
export type NicerStackDiff = {
    diff?: NicerDiff[];
    raw: string;
    stackName: string;
};
export declare const nicerStackDiffGuard: (thing: any) => thing is NicerStackDiff;
export declare const nicerStackDiffValidator: (thing: any) => NicerStackDiff[];
export declare const guardResourceDiff: (thing: any) => thing is cfnDiff.ResourceDifference;
export declare const diffValidator: (thing: any) => {
    diffCollectionKey: CdkDiffCategory;
    diffCollection: cfnDiff.DifferenceCollection<any, cfnDiff.Difference<any>>;
};
export type CdkToolkitDeploymentsProp = 'cloudFormation' | 'deployments';
export type CustomCdkToolkitExtraProps = {
    cdkToolkitDeploymentsProp: CdkToolkitDeploymentsProp;
};
export type CustomCdkToolkitProps = CdkToolkitProps & CustomCdkToolkitExtraProps;
