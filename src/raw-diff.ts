import { ConfigurationProps } from 'aws-cdk/lib/settings';
import { StackRawDiff } from './types';
import { bootstrapCdkToolkit } from './cdk-reverse-engineered';

export const getRawDiff = async (configProps?: ConfigurationProps): Promise<StackRawDiff[]> => {
  const cdkToolkit = await bootstrapCdkToolkit(configProps);
  return cdkToolkit.getDiffObject({
    stackNames: [],
  });
};
