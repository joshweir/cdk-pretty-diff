import { StackRawDiff } from './types';
import { bootstrapCdkToolkit } from './cdk-reverse-engineered';

export const getRawDiff = async (): Promise<StackRawDiff[]> => {
  const cdkToolkit = await bootstrapCdkToolkit();
  return cdkToolkit.getDiffObject({
    stackNames: [],
  });
};
