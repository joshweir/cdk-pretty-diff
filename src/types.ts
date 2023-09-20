import * as cfnDiff from '@aws-cdk/cloudformation-diff';
import { CdkToolkitProps } from 'aws-cdk/lib/cdk-toolkit';

export const cdkDiffCategories = ['iamChanges', 'securityGroup', 'resources', 'parameters', 'metadata', 'mappings', 'conditions', 'outputs', 'unknown', 'description'] as const;
export type CdkDiffCategories = typeof cdkDiffCategories;
export type CdkDiffCategory = CdkDiffCategories[number];
export type StackRawDiff = {
  stackName: string;
  rawDiff: cfnDiff.TemplateDiff,
  logicalToPathMap: Record<string, string>
};

export type NicerDiffChange = {
  label: string;
  from?: any;
  to: any;
  action: 'ADDITION' | 'UPDATE' | 'REMOVAL';
}
export type NicerDiff = {
  label: string;
  cdkDiffRaw: string;
  nicerDiff?: {
    cdkDiffCategory: CdkDiffCategory;
    resourceAction: 'ADDITION' | 'UPDATE' | 'REMOVAL';
    resourceType: string;
    resourceLabel: string;
    changes: NicerDiffChange[];
  }
}
export const nicerDiffGuard = (thing: any): thing is NicerDiff =>
  typeof thing === 'object' &&
  typeof thing.label === 'string' &&
  typeof thing.cdkDiffRaw === 'string' &&
  ['undefined', 'object'].includes(typeof thing.nicerDiff);

export type NicerStackDiff = {
  diff?: NicerDiff[];
  raw: string;
  stackName: string;
}

export const nicerStackDiffGuard = (thing: any): thing is NicerStackDiff => {
  if (typeof thing === 'object') {
    if (typeof thing.raw === 'string' && typeof thing.stackName === 'string') {
      if (!!thing.diff) {
        if (thing.diff.filter(nicerDiffGuard).length === thing.diff.length) {
          return true;
        }
      }

      return true;
    }
  }

  return false;
}

export const nicerStackDiffValidator = (thing: any): NicerStackDiff[] => {
  if (typeof thing === 'object') {
    if (thing.filter(nicerStackDiffGuard).length === thing.length) {
      return thing;
    }
  }

  throw new Error(`input is not a NicerStackDiff[]: ${JSON.stringify(thing, null, 2)}`);
}

export const guardResourceDiff = (thing: any): thing is cfnDiff.ResourceDifference =>
  typeof thing === 'object' &&
  typeof thing.forEachDifference === 'function';

export const diffValidator = (thing: any): { diffCollectionKey: CdkDiffCategory; diffCollection: cfnDiff.DifferenceCollection<any, cfnDiff.Difference<any>> } | { diffKey: CdkDiffCategory; diff: cfnDiff.Difference<any> } => {
  if (typeof thing === 'object') {
    if (thing.length === 2) {
      const [diffKey, diff] = thing;

      if (!cdkDiffCategories.includes(diffKey)) {
        throw new Error(`unexpected diff category: ${diffKey}`);
      }

      if (diffKey === 'description') {
        return { diffKey, diff };
      } else if (typeof diff === 'object' && diff.hasOwnProperty('diffs')) {
        return { diffCollectionKey: diffKey, diffCollection: diff };
      }
    }
  }

  throw new Error(`invalid diff: ${JSON.stringify(thing, null, 2)}`);
}


export type CdkToolkitDeploymentsProp = 'cloudFormation' | 'deployments';

export type CustomCdkToolkitExtraProps = {
  cdkToolkitDeploymentsProp: CdkToolkitDeploymentsProp;
}

export type CustomCdkToolkitProps = CdkToolkitProps & CustomCdkToolkitExtraProps