import { NicerStackDiff } from './types';
import { bootstrapCdkToolkit } from './cdk-reverse-engineered';
import { transformDiff } from './transform';

export * from './types';

export const getCustomDiff = async (): Promise<NicerStackDiff[]> => {
  const cdkToolkit = await bootstrapCdkToolkit();
  const rawDiffs = await cdkToolkit.getDiffObject({
    stackNames: [],
  });
  // console.log('raw diffs:');
  // console.log(JSON.stringify(rawDiffs, null, 2));

  const nicerDiffs: NicerStackDiff[] = [];
  for (const rawDiff of rawDiffs) {
    nicerDiffs.push(await transformDiff(rawDiff));
  }

  return nicerDiffs;
}
