import { DiffOptions, StackRawDiff } from './types';
import { getDiffObject } from './cdk-reverse-engineered';
import * as cdk from "aws-cdk-lib";

export const getRawDiff = async (app: cdk.App, options?: DiffOptions): Promise<StackRawDiff[]> => {
  return await getDiffObject(app, options);
};
