import { NicerStackDiff } from './types';
import { bootstrapCdkToolkit } from './cdk-reverse-engineered';
import { transformDiff } from './transform';

export * from './types';
export * from './render';

export const getCustomDiff = async (): Promise<NicerStackDiff[]> => {
  const cdkToolkit = await bootstrapCdkToolkit();
  const rawDiffs = await cdkToolkit.getDiffObject({
    stackNames: [],
  });

  const nicerDiffs: NicerStackDiff[] = [];
  for (const rawDiff of rawDiffs) {
    nicerDiffs.push(await transformDiff(rawDiff));
  }

  return nicerDiffs;
}
