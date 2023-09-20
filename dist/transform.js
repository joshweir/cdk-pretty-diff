"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDiff = void 0;
const cfnDiff = require("@aws-cdk/cloudformation-diff");
const through2 = require("through2");
const util_1 = require("./util");
const types_1 = require("./types");
const cdk_reverse_engineered_1 = require("./cdk-reverse-engineered");
// unable to emulate the --no-colors option, (tried passing no-colors option to cdk Configuration class to no avail)
// this is workaround to remove the colors tty elements
const fixRemoveColors = (input) => JSON.parse(JSON.stringify(input).replace(/\\u001b\[[^m]+m/g, ''));
const buildRaw = async (diff) => {
    const strm = through2();
    cfnDiff.formatDifferences(strm, diff.rawDiff, diff.logicalToPathMap);
    strm.end();
    return fixRemoveColors(await (0, util_1.streamToString)(strm));
};
const buildChangeAction = (oldValue, newValue) => {
    if (oldValue !== undefined && newValue !== undefined) {
        return "UPDATE";
    }
    else if (oldValue !== undefined) {
        return "REMOVAL";
    }
    else {
        return "ADDITION";
    }
};
const transformIamChanges = async (diff) => {
    if (!diff.rawDiff.iamChanges.hasChanges) {
        return [];
    }
    const result = [];
    if (diff.rawDiff.iamChanges.statements.hasChanges) {
        const statementsSummarized = diff.rawDiff.iamChanges.summarizeStatements();
        result.push({
            label: "IAM Statement Changes",
            cdkDiffRaw: fixRemoveColors(cfnDiff.formatTable((0, cdk_reverse_engineered_1.deepSubstituteBracedLogicalIds)(diff.logicalToPathMap)(statementsSummarized), undefined)),
        });
    }
    if (diff.rawDiff.iamChanges.managedPolicies.hasChanges) {
        const managedPoliciesSummarized = diff.rawDiff.iamChanges.summarizeManagedPolicies();
        result.push({
            label: "IAM Policy Changes",
            cdkDiffRaw: fixRemoveColors(cfnDiff.formatTable((0, cdk_reverse_engineered_1.deepSubstituteBracedLogicalIds)(diff.logicalToPathMap)(managedPoliciesSummarized), undefined)),
        });
    }
    return result;
};
const transformSecurityGroupChanges = async (diff) => {
    if (!diff.rawDiff.securityGroupChanges.hasChanges) {
        return [];
    }
    const summarized = diff.rawDiff.securityGroupChanges.summarize();
    return [
        {
            label: "Security Group Changes",
            cdkDiffRaw: fixRemoveColors(cfnDiff.formatTable((0, cdk_reverse_engineered_1.deepSubstituteBracedLogicalIds)(diff.logicalToPathMap)(summarized), undefined)),
        },
    ];
};
const processIndividualDiff = (result, cdkDiffCategory) => (id, rdiff) => {
    var _a, _b, _c, _d;
    if (rdiff.isDifferent) {
        const resourceType = (0, types_1.guardResourceDiff)(rdiff)
            ? (rdiff.isRemoval ? (_a = rdiff.oldValue) === null || _a === void 0 ? void 0 : _a.Type : (_b = rdiff.newValue) === null || _b === void 0 ? void 0 : _b.Type) ||
                cdkDiffCategory
            : (((_c = rdiff.oldValue) === null || _c === void 0 ? void 0 : _c.Type) || ((_d = rdiff.newValue) === null || _d === void 0 ? void 0 : _d.Type) || cdkDiffCategory);
        const changes = [];
        if ((0, types_1.guardResourceDiff)(rdiff) && rdiff.isUpdate) {
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
const transformDiffForResourceTypes = async (diff) => {
    const result = [];
    for (const d of Object.entries(diff.rawDiff).filter(([k]) => !["iamChanges", "securityGroupChanges"].includes(k))) {
        const validatedDiff = (0, types_1.diffValidator)(d);
        if ('diffCollection' in validatedDiff) {
            const { diffCollectionKey, diffCollection } = validatedDiff;
            if (diffCollection.differenceCount > 0) {
                diffCollection.forEachDifference(processIndividualDiff(result, diffCollectionKey));
            }
        }
        else if ('diffKey' in validatedDiff) {
            const { diffKey, diff } = validatedDiff;
            if (diff.isDifferent) {
                result.push({
                    label: diffKey,
                    cdkDiffRaw: JSON.stringify({ id: diffKey, diff }, null, 2),
                });
            }
        }
    }
    return result;
};
const transformDescriptionChanges = (diff) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if ((_a = diff.rawDiff.description) === null || _a === void 0 ? void 0 : _a.isDifferent) {
        return {
            label: 'Description',
            cdkDiffRaw: JSON.stringify({ description: diff.rawDiff.description }, null, 2),
            nicerDiff: {
                resourceType: 'Description',
                changes: [{
                        label: 'Description',
                        action: buildChangeAction((_b = diff.rawDiff.description) === null || _b === void 0 ? void 0 : _b.oldValue, (_c = diff.rawDiff.description) === null || _c === void 0 ? void 0 : _c.newValue),
                        from: (_d = diff.rawDiff.description) === null || _d === void 0 ? void 0 : _d.oldValue,
                        to: (_e = diff.rawDiff.description) === null || _e === void 0 ? void 0 : _e.newValue
                    }],
                cdkDiffCategory: 'description',
                resourceAction: ((_f = diff.rawDiff.description) === null || _f === void 0 ? void 0 : _f.isAddition)
                    ? "ADDITION"
                    : ((_g = diff.rawDiff.description) === null || _g === void 0 ? void 0 : _g.isRemoval)
                        ? "REMOVAL"
                        : "UPDATE",
                resourceLabel: 'Description',
            },
        };
    }
    return null;
};
const transformDiff = async (diff) => {
    if (diff.rawDiff.isEmpty) {
        return {
            stackName: diff.stackName,
            raw: "There were no differences",
            diff: [],
        };
    }
    const descriptionDiff = transformDescriptionChanges(diff);
    return {
        stackName: diff.stackName,
        raw: await buildRaw(diff),
        diff: [
            ...(await transformIamChanges(diff)),
            ...(await transformSecurityGroupChanges(diff)),
            ...(await transformDiffForResourceTypes(diff)),
            ...(descriptionDiff ? [descriptionDiff] : []),
        ],
    };
};
exports.transformDiff = transformDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBd0Q7QUFDeEQscUNBQXFDO0FBRXJDLGlDQUF3QztBQUN4QyxtQ0FRaUI7QUFDakIscUVBQTBFO0FBRTFFLG9IQUFvSDtBQUNwSCx1REFBdUQ7QUFDdkQsTUFBTSxlQUFlLEdBQUcsQ0FBQyxLQUFhLEVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUVwSCxNQUFNLFFBQVEsR0FBRyxLQUFLLEVBQUUsSUFBa0IsRUFBbUIsRUFBRTtJQUM3RCxNQUFNLElBQUksR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN4QixPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDckUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1gsT0FBTyxlQUFlLENBQUMsTUFBTSxJQUFBLHFCQUFjLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRCxDQUFDLENBQUM7QUFFRixNQUFNLGlCQUFpQixHQUFHLENBQUMsUUFBYSxFQUFFLFFBQWEsRUFBRSxFQUFFO0lBQ3pELElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1FBQ3BELE9BQU8sUUFBUSxDQUFDO0tBQ2pCO1NBQU0sSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1FBQ2pDLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO1NBQU07UUFDTCxPQUFPLFVBQVUsQ0FBQztLQUNuQjtBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUMvQixJQUFrQixFQUNJLEVB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LElBQUksQ0FBQyxDQUFDO1lBQzlDLEdBQUcsQ0FBQyxNQUFNLDZCQUE2QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUM5QztLQUNGLENBQUM7QUFDSixDQUFDLENBQUM7QUF0QlcsUUFBQSxhQUFhLGlCQXNCeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZm5EaWZmIGZyb20gXCJAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmXCI7XG5pbXBvcnQgKiBhcyB0aHJvdWdoMiBmcm9tIFwidGhyb3VnaDJcIjtcblxuaW1wb3J0IHsgc3RyZWFtVG9TdHJpbmcgfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQge1xuICBDZGtEaWZmQ2F0ZWdvcnksXG4gIGRpZmZWYWxpZGF0b3IsXG4gIGd1YXJkUmVzb3VyY2VEaWZmLFxuICBOaWNlckRpZmYsXG4gIE5pY2VyRGlmZkNoYW5nZSxcbiAgTmljZXJTdGFja0RpZmYsXG4gIFN0YWNrUmF3RGlmZixcbn0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGRlZXBTdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyB9IGZyb20gXCIuL2Nkay1yZXZlcnNlLWVuZ2luZWVyZWRcIjtcblxuLy8gdW5hYmxlIHRvIGVtdWxhdGUgdGhlIC0tbm8tY29sb3JzIG9wdGlvbiwgKHRyaWVkIHBhc3Npbmcgbm8tY29sb3JzIG9wdGlvbiB0byBjZGsgQ29uZmlndXJhdGlvbiBjbGFzcyB0byBubyBhdmFpbClcbi8vIHRoaXMgaXMgd29ya2Fyb3VuZCB0byByZW1vdmUgdGhlIGNvbG9ycyB0dHkgZWxlbWVudHNcbmNvbnN0IGZpeFJlbW92ZUNvbG9ycyA9IChpbnB1dDogc3RyaW5nKTogc3RyaW5nID0+IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaW5wdXQpLnJlcGxhY2UoL1xcXFx1MDAxYlxcW1tebV0rbS9nLCAnJykpXG5cbmNvbnN0IGJ1aWxkUmF3ID0gYXN5bmMgKGRpZmY6IFN0YWNrUmF3RGlmZik6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IHN0cm0gPSB0aHJvdWdoMigpO1xuICBjZm5EaWZmLmZvcm1hdERpZmZlcmVuY2VzKHN0cm0sIGRpZmYucmF3RGlmZiwgZGlmZi5sb2dpY2FsVG9QYXRoTWFwKTtcbiAgc3RybS5lbmQoKTtcbiAgcmV0dXJuIGZpeFJlbW92ZUNvbG9ycyhhd2FpdCBzdHJlYW1Ub1N0cmluZyhzdHJtKSk7XG59O1xuXG5jb25zdCBidWlsZENoYW5nZUFjdGlvbiA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB7XG4gIGlmIChvbGRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIG5ld1ZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gXCJVUERBVEVcIjtcbiAgfSBlbHNlIGlmIChvbGRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIFwiUkVNT1ZBTFwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBcIkFERElUSU9OXCI7XG4gIH1cbn07XG5cbmNvbnN0IHRyYW5zZm9ybUlhbUNoYW5nZXMgPSBhc3luYyAoXG4gIGRpZmY6IFN0YWNrUmF3RGlmZlxuKTogUHJvbWlzZTxOaWNlckRpZmZbXT4gPT4ge1xuICBpZiAoIWRpZmYucmF3RGlmZi5pYW1DaGFuZ2VzLmhhc0NoYW5nZXMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCByZXN1bHQ6IE5pY2VyRGlmZltdID0gW107XG4gIGlmIChkaWZmLnJhd0RpZmYuaWFtQ2hhbmdlcy5zdGF0ZW1lbnRzLmhhc0NoYW5nZXMpIHtcbiAgICBjb25zdCBzdGF0ZW1lbnRzU3VtbWFyaXplZCA9IGRpZmYucmF3RGlmZi5pYW1DaGFuZ2VzLnN1bW1hcml6ZVN0YXRlbWVudHMoKTtcbiAgICByZXN1bHQucHVzaCh7XG4gICAgICBsYWJlbDogXCJJQU0gU3RhdGVtZW50IENoYW5nZXNcIixcbiAgICAgIGNka0RpZmZSYXc6IGZpeFJlbW92ZUNvbG9ycyhcbiAgICAgICAgY2ZuRGlmZi5mb3JtYXRUYWJsZShcbiAgICAgICAgICBkZWVwU3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMoZGlmZi5sb2dpY2FsVG9QYXRoTWFwKShcbiAgICAgICAgICAgIHN0YXRlbWVudHNTdW1tYXJpemVkXG4gICAgICAgICAgKSxcbiAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChkaWZmLnJhd0RpZmYuaWFtQ2hhbmdlcy5tYW5hZ2VkUG9saWNpZXMuaGFzQ2hhbmdlcykge1xuICAgIGNvbnN0IG1hbmFnZWRQb2xpY2llc1N1bW1hcml6ZWQgPVxuICAgICAgZGlmZi5yYXdEaWZmLmlhbUNoYW5nZXMuc3VtbWFyaXplTWFuYWdlZFBvbGljaWVzKCk7XG4gICAgcmVzdWx0LnB1c2goe1xuICAgICAgbGFiZWw6IFwiSUFNIFBvbGljeSBDaGFuZ2VzXCIsXG4gICAgICBjZGtEaWZmUmF3OiBmaXhSZW1vdmVDb2xvcnMoXG4gICAgICAgIGNmbkRpZmYuZm9ybWF0VGFibGUoXG4gICAgICAgICAgZGVlcFN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzKGRpZmYubG9naWNhbFRvUGF0aE1hcCkoXG4gICAgICAgICAgICBtYW5hZ2VkUG9saWNpZXNTdW1tYXJpemVkXG4gICAgICAgICAgKSxcbiAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCB0cmFuc2Zvcm1TZWN1cml0eUdyb3VwQ2hhbmdlcyA9IGFzeW5jIChcbiAgZGlmZjogU3RhY2tSYXdEaWZmXG4pOiBQcm9taXNlPE5pY2VyRGlmZltdPiA9PiB7XG4gIGlmICghZGlmZi5yYXdEaWZmLnNlY3VyaXR5R3JvdXBDaGFuZ2VzLmhhc0NoYW5nZXMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBzdW1tYXJpemVkID0gZGlmZi5yYXdEaWZmLnNlY3VyaXR5R3JvdXBDaGFuZ2VzLnN1bW1hcml6ZSgpO1xuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbGFiZWw6IFwiU2VjdXJpdHkgR3JvdXAgQ2hhbmdlc1wiLFxuICAgICAgY2RrRGlmZlJhdzogZml4UmVtb3ZlQ29sb3JzKFxuICAgICAgICBjZm5EaWZmLmZvcm1hdFRhYmxlKFxuICAgICAgICAgIGRlZXBTdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyhkaWZmLmxvZ2ljYWxUb1BhdGhNYXApKHN1bW1hcml6ZWQpLFxuICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICApXG4gICAgICApLFxuICAgIH0sXG4gIF07XG59O1xuXG5jb25zdCBwcm9jZXNzSW5kaXZpZHVhbERpZmYgPVxuICAocmVzdWx0OiBOaWNlckRpZmZbXSwgY2RrRGlmZkNhdGVnb3J5OiBDZGtEaWZmQ2F0ZWdvcnkpID0+XG4gICAgKGlkOiBzdHJpbmcsIHJkaWZmOiBjZm5EaWZmLkRpZmZlcmVuY2U8YW55PikgPT4ge1xuICAgICAgaWYgKHJkaWZmLmlzRGlmZmVyZW50KSB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlVHlwZTogc3RyaW5nID0gZ3VhcmRSZXNvdXJjZURpZmYocmRpZmYpXG4gICAgICAgICAgPyAocmRpZmYuaXNSZW1vdmFsID8gcmRpZmYub2xkVmFsdWU/LlR5cGUgOiByZGlmZi5uZXdWYWx1ZT8uVHlwZSkgfHxcbiAgICAgICAgICBjZGtEaWZmQ2F0ZWdvcnlcbiAgICAgICAgICA6IChyZGlmZi5vbGRWYWx1ZT8uVHlwZSB8fCByZGlmZi5uZXdWYWx1ZT8uVHlwZSB8fCBjZGtEaWZmQ2F0ZWdvcnkpO1xuICAgICAgICBjb25zdCBjaGFuZ2VzOiBOaWNlckRpZmZDaGFuZ2VbXSA9IFtdO1xuICAgICAgICBpZiAoZ3VhcmRSZXNvdXJjZURpZmYocmRpZmYpICYmIHJkaWZmLmlzVXBkYXRlKSB7XG4gICAgICAgICAgcmRpZmYuZm9yRWFjaERpZmZlcmVuY2UoKF8sIGxhYmVsLCB2YWx1ZXMpID0+IHtcbiAgICAgICAgICAgIGNoYW5nZXMucHVzaCh7XG4gICAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICAgICAgICBhY3Rpb246IGJ1aWxkQ2hhbmdlQWN0aW9uKHZhbHVlcy5vbGRWYWx1ZSwgdmFsdWVzLm5ld1ZhbHVlKSxcbiAgICAgICAgICAgICAgZnJvbTogdmFsdWVzLm9sZFZhbHVlLFxuICAgICAgICAgICAgICB0bzogdmFsdWVzLm5ld1ZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgbGFiZWw6IGNka0RpZmZDYXRlZ29yeSxcbiAgICAgICAgICBjZGtEaWZmUmF3OiBKU09OLnN0cmluZ2lmeSh7IGlkLCBkaWZmOiByZGlmZiB9LCBudWxsLCAyKSxcbiAgICAgICAgICBuaWNlckRpZmY6IHtcbiAgICAgICAgICAgIHJlc291cmNlVHlwZSxcbiAgICAgICAgICAgIGNoYW5nZXMsXG4gICAgICAgICAgICBjZGtEaWZmQ2F0ZWdvcnksXG4gICAgICAgICAgICByZXNvdXJjZUFjdGlvbjogcmRpZmYuaXNBZGRpdGlvblxuICAgICAgICAgICAgICA/IFwiQURESVRJT05cIlxuICAgICAgICAgICAgICA6IHJkaWZmLmlzUmVtb3ZhbFxuICAgICAgICAgICAgICAgID8gXCJSRU1PVkFMXCJcbiAgICAgICAgICAgICAgICA6IFwiVVBEQVRFXCIsXG4gICAgICAgICAgICByZXNvdXJjZUxhYmVsOiBpZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG5jb25zdCB0cmFuc2Zvcm1EaWZmRm9yUmVzb3VyY2VUeXBlcyA9IGFzeW5jIChkaWZmOiBTdGFja1Jhd0RpZmYpOiBQcm9taXNlPE5pY2VyRGlmZltdPiA9PiB7XG4gIGNvbnN0IHJlc3VsdDogTmljZXJEaWZmW10gPSBbXTtcbiAgZm9yIChjb25zdCBkIG9mIE9iamVjdC5lbnRyaWVzKGRpZmYucmF3RGlmZikuZmlsdGVyKChba10pID0+ICFbXCJpYW1DaGFuZ2VzXCIsIFwic2VjdXJpdHlHcm91cENoYW5nZXNcIl0uaW5jbHVkZXMoaykpKSB7XG4gICAgY29uc3QgdmFsaWRhdGVkRGlmZiA9IGRpZmZWYWxpZGF0b3IoZCk7XG4gICAgaWYgKCdkaWZmQ29sbGVjdGlvbicgaW4gdmFsaWRhdGVkRGlmZikge1xuICAgICAgY29uc3QgeyBkaWZmQ29sbGVjdGlvbktleSwgZGlmZkNvbGxlY3Rpb24gfSA9IHZhbGlkYXRlZERpZmY7XG4gICAgICBpZiAoZGlmZkNvbGxlY3Rpb24uZGlmZmVyZW5jZUNvdW50ID4gMCkge1xuICAgICAgICBkaWZmQ29sbGVjdGlvbi5mb3JFYWNoRGlmZmVyZW5jZShcbiAgICAgICAgICBwcm9jZXNzSW5kaXZpZHVhbERpZmYocmVzdWx0LCBkaWZmQ29sbGVjdGlvbktleSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCdkaWZmS2V5JyBpbiB2YWxpZGF0ZWREaWZmKSB7XG4gICAgICBjb25zdCB7IGRpZmZLZXksIGRpZmYgfSA9IHZhbGlkYXRlZERpZmY7XG4gICAgICBpZiAoZGlmZi5pc0RpZmZlcmVudCkge1xuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgbGFiZWw6IGRpZmZLZXksXG4gICAgICAgICAgY2RrRGlmZlJhdzogSlNPTi5zdHJpbmdpZnkoeyBpZDogZGlmZktleSwgZGlmZiB9LCBudWxsLCAyKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IHRyYW5zZm9ybURlc2NyaXB0aW9uQ2hhbmdlcyA9IChkaWZmOiBTdGFja1Jhd0RpZmYpOiBOaWNlckRpZmYgfCBudWxsID0+IHtcbiAgaWYgKGRpZmYucmF3RGlmZi5kZXNjcmlwdGlvbj8uaXNEaWZmZXJlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdEZXNjcmlwdGlvbicsXG4gICAgICBjZGtEaWZmUmF3OiBKU09OLnN0cmluZ2lmeSh7IGRlc2NyaXB0aW9uOiBkaWZmLnJhd0RpZmYuZGVzY3JpcHRpb24gfSwgbnVsbCwgMiksXG4gICAgICBuaWNlckRpZmY6IHtcbiAgICAgICAgcmVzb3VyY2VUeXBlOiAnRGVzY3JpcHRpb24nLFxuICAgICAgICBjaGFuZ2VzOiBbe1xuICAgICAgICAgIGxhYmVsOiAnRGVzY3JpcHRpb24nLFxuICAgICAgICAgIGFjdGlvbjogYnVpbGRDaGFuZ2VBY3Rpb24oZGlmZi5yYXdEaWZmLmRlc2NyaXB0aW9uPy5vbGRWYWx1ZSwgZGlmZi5yYXdEaWZmLmRlc2NyaXB0aW9uPy5uZXdWYWx1ZSksXG4gICAgICAgICAgZnJvbTogZGlmZi5yYXdEaWZmLmRlc2NyaXB0aW9uPy5vbGRWYWx1ZSxcbiAgICAgICAgICB0bzogZGlmZi5yYXdEaWZmLmRlc2NyaXB0aW9uPy5uZXdWYWx1ZVxuICAgICAgICB9XSxcbiAgICAgICAgY2RrRGlmZkNhdGVnb3J5OiAnZGVzY3JpcHRpb24nLFxuICAgICAgICByZXNvdXJjZUFjdGlvbjogZGlmZi5yYXdEaWZmLmRlc2NyaXB0aW9uPy5pc0FkZGl0aW9uXG4gICAgICAgICAgPyBcIkFERElUSU9OXCJcbiAgICAgICAgICA6IGRpZmYucmF3RGlmZi5kZXNjcmlwdGlvbj8uaXNSZW1vdmFsXG4gICAgICAgICAgICA/IFwiUkVNT1ZBTFwiXG4gICAgICAgICAgICA6IFwiVVBEQVRFXCIsXG4gICAgICAgIHJlc291cmNlTGFiZWw6ICdEZXNjcmlwdGlvbicsXG4gICAgICB9LFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtRGlmZiA9IGFzeW5jIChcbiAgZGlmZjogU3RhY2tSYXdEaWZmXG4pOiBQcm9taXNlPE5pY2VyU3RhY2tEaWZmPiA9PiB7XG4gIGlmIChkaWZmLnJhd0RpZmYuaXNFbXB0eSkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFja05hbWU6IGRpZmYuc3RhY2tOYW1lLFxuICAgICAgcmF3OiBcIlRoZXJlIHdlcmUgbm8gZGlmZmVyZW5jZXNcIixcbiAgICAgIGRpZmY6IFtdLFxuICAgIH07XG4gIH1cblxuICBjb25zdCBkZXNjcmlwdGlvbkRpZmYgPSB0cmFuc2Zvcm1EZXNjcmlwdGlvbkNoYW5nZXMoZGlmZik7XG4gIHJldHVybiB7XG4gICAgc3RhY2tOYW1lOiBkaWZmLnN0YWNrTmFtZSxcbiAgICByYXc6IGF3YWl0IGJ1aWxkUmF3KGRpZmYpLFxuICAgIGRpZmY6IFtcbiAgICAgIC4uLihhd2FpdCB0cmFuc2Zvcm1JYW1DaGFuZ2VzKGRpZmYpKSxcbiAgICAgIC4uLihhd2FpdCB0cmFuc2Zvcm1TZWN1cml0eUdyb3VwQ2hhbmdlcyhkaWZmKSksXG4gICAgICAuLi4oYXdhaXQgdHJhbnNmb3JtRGlmZkZvclJlc291cmNlVHlwZXMoZGlmZikpLFxuICAgICAgLi4uKGRlc2NyaXB0aW9uRGlmZiA/IFtkZXNjcmlwdGlvbkRpZmZdIDogW10pLFxuICAgIF0sXG4gIH07XG59O1xuXG4iXX0=