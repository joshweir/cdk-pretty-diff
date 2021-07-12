import * as cfnDiff from '@aws-cdk/cloudformation-diff';

export const cdkDiffCategories = ['iamChanges', 'securityGroup', 'resources', 'parameters', 'metadata', 'mappings', 'conditions', 'outputs', 'unknown'] as const;
export type CdkDiffCategories = typeof cdkDiffCategories;
export type CdkDiffCategory = CdkDiffCategories[number];
export type StackRawDiff = { 
  stackName: string; 
  rawDiff: cfnDiff.TemplateDiff, 
  logicalToPathMap: Record<string, string> 
};

export type NicerDiffChange = {
  label: string;
  from: any;
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
export type NicerStackDiff = {
  diff?: NicerDiff[];
  raw: string;
  stackName: string;
}

export const guardResourceDiff = (thing: any): thing is cfnDiff.ResourceDifference =>
  typeof thing === 'object' &&
  typeof thing.forEachDifference === 'function';


export const diffValidator = (thing: any): { diffCollectionKey: CdkDiffCategory; diffCollection: cfnDiff.DifferenceCollection<any, cfnDiff.Difference<any>> } => {
  if (typeof thing === 'object') {
    if (thing.length === 2) {
      const [diffCollectionKey, diffCollection] = thing;
      if (!cdkDiffCategories.includes(diffCollectionKey)) {
        throw new Error(`unexpected diff category: ${diffCollectionKey}`);
      }

      if (typeof diffCollection === 'object' && diffCollection.hasOwnProperty('diffs')) {
        return { diffCollectionKey, diffCollection };
      }
    }
  }

  throw new Error(`invalid diff: ${JSON.stringify(thing, null, 2)}`);
}
  