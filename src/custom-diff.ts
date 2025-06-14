import { ConfigurationProps } from 'aws-cdk/lib/cli/user-configuration';
import { NicerStackDiff, StackRawDiff } from './types';
import { transformDiff } from './transform';
import { getRawDiff } from './raw-diff';
import * as cdk from "aws-cdk-lib";
import { DiffOptions } from './cdk-reverse-engineered';

export const getCustomDiff = async (app: cdk.App, props?: { rawDiff?: StackRawDiff[]; options?: DiffOptions }): Promise<NicerStackDiff[]> => {
  const rawDiffs = props?.rawDiff || await getRawDiff(app, props?.options);
  const nicerDiffs: NicerStackDiff[] = [];
  for (const rawDiff of rawDiffs) {
    nicerDiffs.push(await transformDiff(rawDiff));
  }

  return nicerDiffs;
};
