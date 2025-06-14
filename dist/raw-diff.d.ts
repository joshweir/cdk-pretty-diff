import { ConfigurationProps } from 'aws-cdk/lib/cli/user-configuration';
import { StackRawDiff } from './types';
export declare const getRawDiff: (configProps?: ConfigurationProps) => Promise<StackRawDiff[]>;
