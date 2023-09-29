import { ConfigurationProps } from 'aws-cdk/lib/settings';
import { NicerStackDiff, StackRawDiff } from './types';
import { transformDiff } from './transform';
import { getRawDiff } from './raw-diff';

export const getCustomDiff = async (props?: { rawDiff?: StackRawDiff[]; configProps?: ConfigurationProps }): Promise<NicerStackDiff[]> => {
  const rawDiffs = props?.rawDiff || await getRawDiff(props?.configProps);
  const nicerDiffs: NicerStackDiff[] = [];
  for (const rawDiff of rawDiffs) {
    nicerDiffs.push(await transformDiff(rawDiff));
  }

  return nicerDiffs;
};
