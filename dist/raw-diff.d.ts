import { ConfigurationProps } from 'aws-cdk/lib/settings';
import { StackRawDiff } from './types';
export declare const getRawDiff: (configProps?: ConfigurationProps) => Promise<StackRawDiff[]>;
