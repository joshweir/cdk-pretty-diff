import * as cfnDiff from "@aws-cdk/cloudformation-diff";
import * as through2 from "through2";

import { streamToString } from "./util";
import {
  CdkDiffCategory,
  diffValidator,
  guardResourceDiff,
  NicerDiff,
  NicerDiffChange,
  NicerStackDiff,
  StackRawDiff,
} from "./types";
import { deepSubstituteBracedLogicalIds } from "./cdk-reverse-engineered";

const buildRaw = async (diff: StackRawDiff): Promise<string> => {
  const strm = through2();
  cfnDiff.formatDifferences(strm, diff.rawDiff, diff.logicalToPathMap);
  strm.end();
  const raw = await streamToString(strm);
  return raw;
};

const buildChangeAction = (oldValue: any, newValue: any) => {
  if (oldValue !== undefined && newValue !== undefined) {
    return "UPDATE";
  } else if (oldValue !== undefined /* && newValue === undefined*/) {
    return "REMOVAL";
  } /* if (oldValue === undefined && newValue !== undefined) */ else {
    return "ADDITION";
  }
};

const transformIamChanges = async (
  diff: StackRawDiff
): Promise<NicerDiff[]> => {
  if (!diff.rawDiff.iamChanges.hasChanges) {
    return [];
  }

  const result: NicerDiff[] = [];
  if (diff.rawDiff.iamChanges.statements.hasChanges) {
    const statementsSummarized = diff.rawDiff.iamChanges.summarizeStatements();
    result.push({
      label: "IAM Statement Changes",
      cdkDiffRaw: cfnDiff.formatTable(
        deepSubstituteBracedLogicalIds(diff.logicalToPathMap)(
          statementsSummarized
        ),
        undefined
      ),
    });
  }

  if (diff.rawDiff.iamChanges.managedPolicies.hasChanges) {
    const managedPoliciesSummarized =
      diff.rawDiff.iamChanges.summarizeManagedPolicies();
    result.push({
      label: "IAM Policy Changes",
      cdkDiffRaw: cfnDiff.formatTable(
        deepSubstituteBracedLogicalIds(diff.logicalToPathMap)(
          managedPoliciesSummarized
        ),
        undefined
      ),
    });
  }

  return result;
};

const transformSecurityGroupChanges = async (
  diff: StackRawDiff
): Promise<NicerDiff[]> => {
  if (!diff.rawDiff.securityGroupChanges.hasChanges) {
    return [];
  }

  const summarized = diff.rawDiff.securityGroupChanges.summarize();

  return [
    {
      label: "Security Group Changes",
      cdkDiffRaw: cfnDiff.formatTable(
        deepSubstituteBracedLogicalIds(diff.logicalToPathMap)(summarized),
        undefined
      ),
    },
  ];
};

const processIndividualDiff =
  (result: NicerDiff[], cdkDiffCategory: CdkDiffCategory) =>
  (id: string, rdiff: cfnDiff.Difference<any>) => {
    // console.log('chk', id);
    // console.log(JSON.stringify(rdiff, null, 2));
    if (rdiff.isDifferent) {
      const resourceType: string = guardResourceDiff(rdiff)
        ? (rdiff.isRemoval ? rdiff.oldResourceType : rdiff.newResourceType) ||
          cdkDiffCategory
        : cdkDiffCategory;
      const changes: NicerDiffChange[] = [];
      if (guardResourceDiff(rdiff) && rdiff.isUpdate) {
        rdiff.forEachDifference((_, label, values) => {
          changes.push({
            label,
            action: buildChangeAction(values.oldValue, values.newValue),
            from: values.oldValue,
            to: values.newValue,
          });
        });
      }

      result.push({
        label: cdkDiffCategory,
        cdkDiffRaw: JSON.stringify({ id, diff: rdiff }, null, 2),
        nicerDiff: {
          resourceType,
          changes,
          cdkDiffCategory,
          resourceAction: rdiff.isAddition
            ? "ADDITION"
            : rdiff.isRemoval
            ? "REMOVAL"
            : "UPDATE",
          resourceLabel: id,
        },
      });
    }
  };

const transformDiffForResourceTypes = async (
  diff: StackRawDiff
): Promise<NicerDiff[]> => {
  const result: NicerDiff[] = [];
  for (const d of Object.entries(diff.rawDiff).filter(
    ([k]) => !["iamChanges", "securityGroupChanges"].includes(k)
  )) {
    const { diffCollectionKey, diffCollection } = diffValidator(d);
    if (diffCollection.differenceCount > 0) {
      diffCollection.forEachDifference(
        processIndividualDiff(result, diffCollectionKey)
      );
    }
  }

  return result;
};

export const transformDiff = async (
  diff: StackRawDiff
): Promise<NicerStackDiff> => {
  if (diff.rawDiff.isEmpty) {
    return {
      raw: "There were no differences",
      diff: [],
    };
  }

  return {
    raw: await buildRaw(diff),
    diff: [
      ...(await transformIamChanges(diff)),
      ...(await transformSecurityGroupChanges(diff)),
      ...(await transformDiffForResourceTypes(diff)),
    ],
  };
};
