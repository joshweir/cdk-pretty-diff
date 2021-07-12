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

// unable to emulate the --no-colors option, (tried passing no-colors option to cdk Configuration class to no avail)
// this is workaround to remove the colors tty elements
const fixRemoveColors = (input: string): string => JSON.parse(JSON.stringify(input).replace(/\\u001b\[[^m]+m/g, ''))

const buildRaw = async (diff: StackRawDiff): Promise<string> => {
  const strm = through2();
  cfnDiff.formatDifferences(strm, diff.rawDiff, diff.logicalToPathMap);
  strm.end();
  return fixRemoveColors(await streamToString(strm));
};

const buildChangeAction = (oldValue: any, newValue: any) => {
  if (oldValue !== undefined && newValue !== undefined) {
    return "UPDATE";
  } else if (oldValue !== undefined) {
    return "REMOVAL";
  } else {
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
      cdkDiffRaw: fixRemoveColors(
        cfnDiff.formatTable(
          deepSubstituteBracedLogicalIds(diff.logicalToPathMap)(
            statementsSummarized
          ),
          undefined
        )
      ),
    });
  }

  if (diff.rawDiff.iamChanges.managedPolicies.hasChanges) {
    const managedPoliciesSummarized =
      diff.rawDiff.iamChanges.summarizeManagedPolicies();
    result.push({
      label: "IAM Policy Changes",
      cdkDiffRaw: fixRemoveColors(
        cfnDiff.formatTable(
          deepSubstituteBracedLogicalIds(diff.logicalToPathMap)(
            managedPoliciesSummarized
          ),
          undefined
        )
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
      cdkDiffRaw: fixRemoveColors(
        cfnDiff.formatTable(
          deepSubstituteBracedLogicalIds(diff.logicalToPathMap)(summarized),
          undefined
        )
      ),
    },
  ];
};

const processIndividualDiff =
  (result: NicerDiff[], cdkDiffCategory: CdkDiffCategory) =>
  (id: string, rdiff: cfnDiff.Difference<any>) => {
    if (rdiff.isDifferent) {
      const resourceType: string = guardResourceDiff(rdiff)
        ? (rdiff.isRemoval ? rdiff.oldValue?.Type : rdiff.newValue?.Type) ||
          cdkDiffCategory
        : (rdiff.oldValue?.Type || rdiff.newValue?.Type || cdkDiffCategory);
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
      stackName: diff.stackName,
      raw: "There were no differences",
      diff: [],
    };
  }

  return {
    stackName: diff.stackName,
    raw: await buildRaw(diff),
    diff: [
      ...(await transformIamChanges(diff)),
      ...(await transformSecurityGroupChanges(diff)),
      ...(await transformDiffForResourceTypes(diff)),
    ],
  };
};
