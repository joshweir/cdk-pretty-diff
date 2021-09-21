import { NicerStackDiff, StackRawDiff } from './types';
import { transformDiff } from './transform';
import { getRawDiff } from './raw-diff';

export const getCustomDiff = async (rawDiff?: StackRawDiff[]): Promise<NicerStackDiff[]> => {
  const rawDiffs = rawDiff || await getRawDiff();
  const nicerDiffs: NicerStackDiff[] = [];
  for (const rawDiff of rawDiffs) {
    nicerDiffs.push(await transformDiff(rawDiff));
  }

  return nicerDiffs;
};
