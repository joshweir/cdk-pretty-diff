import { ConfigurationProps } from 'aws-cdk/lib/settings';
import { NicerStackDiff, StackRawDiff } from './types';
export declare const getCustomDiff: (props?: {
    rawDiff?: StackRawDiff[];
    configProps?: ConfigurationProps;
}) => Promise<NicerStackDiff[]>;
