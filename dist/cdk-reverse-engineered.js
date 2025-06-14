"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiffObject = exports.deepSubstituteBracedLogicalIds = void 0;
const cdk = require("aws-cdk-lib");
const cfnDiff = require("@aws-cdk/cloudformation-diff");
const cxschema = require("@aws-cdk/cloud-assembly-schema");
const aws_auth_1 = require("aws-cdk/lib/api/aws-auth");
const colors = require("colors/safe");
// reverse engineered from:
// aws-cdk/lib/diff (printStackDiff)
const filterCDKMetadata = (diff) => {
    // filter out 'AWS::CDK::Metadata' resources from the template
    if (diff.resources) {
        diff.resources = diff.resources.filter((change) => {
            if (!change) {
                return true;
            }
            if (change.newResourceType === 'AWS::CDK::Metadata') {
                return false;
            }
            if (change.oldResourceType === 'AWS::CDK::Metadata') {
                return false;
            }
            return true;
        });
    }
    return diff;
};
// reverse engineered from:
// @aws-cdk/cloudformation-diff/lib/format (Formatter class is not exported)
/**
 * Substitute all strings like ${LogId.xxx} with the path instead of the logical ID
 */
const substituteBracedLogicalIds = (logicalToPathMap) => (source) => {
    return source.replace(/\$\{([^.}]+)(.[^}]+)?\}/gi, (_match, logId, suffix) => {
        return ('${' +
            (normalizedLogicalIdPath(logicalToPathMap)(logId) || logId) +
            (suffix || '') +
            '}');
    });
};
// reverse engineered from:
// @aws-cdk/cloudformation-diff/lib/format (Formatter class is not exported)
const deepSubstituteBracedLogicalIds = (logicalToPathMap) => (rows) => {
    return rows.map((row) => row.map(substituteBracedLogicalIds(logicalToPathMap)));
};
exports.deepSubstituteBracedLogicalIds = deepSubstituteBracedLogicalIds;
// reverse engineered from:
// @aws-cdk/cloudformation-diff/lib/format (Formatter class is not exported)
const normalizedLogicalIdPath = (logicalToPathMap) => (logicalId) => {
    // if we have a path in the map, return it
    const path = logicalToPathMap[logicalId];
    return path ? normalizePath(path) : undefined;
    /**
     * Path is supposed to start with "/stack-name". If this is the case (i.e. path has more than
     * two components, we remove the first part. Otherwise, we just use the full path.
     * @param p
     */
    function normalizePath(p) {
        if (p.startsWith('/')) {
            p = p.substr(1);
        }
        let parts = p.split('/');
        if (parts.length > 1) {
            parts = parts.slice(1);
            // remove the last component if it's "Resource" or "Default" (if we have more than a single component)
            if (parts.length > 1) {
                const last = parts[parts.length - 1];
                if (last === 'Resource' || last === 'Default') {
                    parts = parts.slice(0, parts.length - 1);
                }
            }
            p = parts.join('/');
        }
        return p;
    }
};
// copied from
// aws-cdk/lib/diff (function not exported)
const buildLogicalToPathMap = (stack) => {
    const map = {};
    for (const md of stack.findMetadataByType(cxschema.ArtifactMetadataEntryType.LOGICAL_ID)) {
        map[md.data] = md.path;
    }
    return map;
};
const dynamicallyInstantiateDeployments = (sdkProvider) => {
    let Deployments;
    let cdkToolkitDeploymentsProp = 'deployments';
    try {
        Deployments = require('aws-cdk/lib/api/deployments').Deployments;
    }
    catch (err) {
        Deployments = require('aws-cdk/lib/api/cloudformation-deployments').CloudFormationDeployments;
        cdkToolkitDeploymentsProp = 'cloudFormation';
    }
    const deployments = new Deployments({
        sdkProvider,
        ioHelper: {
            defaults: {
                debug: (input) => { console.debug(input); },
            }
        },
    });
    return {
        deployments,
        cdkToolkitDeploymentsProp,
    };
};
async function getDiffObject(app, options) {
    // If we have new context, we need to create a new app with the merged context
    if (options === null || options === void 0 ? void 0 : options.context) {
        // Get existing context
        const existingContext = app.node.tryGetContext('');
        // Create new merged context
        const mergedContext = {
            ...existingContext,
            ...options.context
        };
        // Create a new App with merged context
        const tempApp = new cdk.App({
            context: mergedContext,
        });
        // For each stack in the original app, create a new stack in the temp app
        for (const child of app.node.children) {
            if (child instanceof cdk.Stack) {
                const originalStack = child;
                // Create a new stack of the same type
                const stackProps = {
                    env: {
                        account: originalStack.account,
                        region: originalStack.region
                    },
                    // Copy other stack properties that might be important
                    stackName: originalStack.stackName,
                    description: originalStack.templateOptions.description,
                    terminationProtection: originalStack.terminationProtection,
                    tags: originalStack.tags.tagValues(),
                };
                // Use reflection to create a new instance of the same stack class
                const stackClass = Object.getPrototypeOf(originalStack).constructor;
                new stackClass(tempApp, originalStack.node.id, stackProps);
            }
        }
        // Use the temporary app for synthesis
        const assembly = tempApp.synth();
        return await generateDiffs(assembly, options);
    }
    // If no new context, use the original app
    const assembly = app.synth();
    return await generateDiffs(assembly, options);
}
exports.getDiffObject = getDiffObject;
// Helper function to generate diffs from an assembly
async function generateDiffs(assembly, options) {
    const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
        ioHelper: {
            defaults: {
                debug: (input) => { console.debug(input); },
            }
        },
    }, options === null || options === void 0 ? void 0 : options.profile);
    colors.disable();
    const { deployments } = dynamicallyInstantiateDeployments(sdkProvider);
    const diffs = [];
    for (const stack of assembly.stacks) {
        const currentTemplate = await deployments.readCurrentTemplate(stack);
        diffs.push({
            stackName: stack.displayName,
            rawDiff: filterCDKMetadata(cfnDiff.diffTemplate(currentTemplate, stack.template)),
            logicalToPathMap: buildLogicalToPathMap(stack)
        });
    }
    return diffs;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyx3REFBd0Q7QUFDeEQsMkRBQTJEO0FBQzNELHVEQUF1RDtBQUN2RCxzQ0FBc0M7QUFHdEMsMkJBQTJCO0FBQzNCLG9DQUFvQztBQUNwQyxNQUFNLGlCQUFpQixHQUFHLENBQ3hCLElBQTZCLEVBQ0osRUFBRTtJQUMzQiw4REFBOEQ7SUFDOUQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ25ELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ25ELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVGLDJCQUEyQjtBQUMzQiw0RUFBNEU7QUFDNUU7O0dBRUc7QUFDSCxNQUFNLDBCQUEwQixHQUFHLENBQUMsZ0JBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7SUFDNUUsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUNuQiwyQkFBMkIsRUFDM0IsQ0FBQyxNQUFXLEVBQUUsS0FBVSxFQUFFLE1BQVcsRUFBRSxFQUFFO1FBQ3ZDLE9BQU8sQ0FDTCxJQUFJO1lBQ0osQ0FBQyx1QkFBdUIsQ0FBQyxnQkFB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TUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWpCLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxpQ0FBaUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2RSxNQUFNLEtBQUssR0FBbUIsRUFBRSxDQUFDO0lBRWpDLEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtRQUNuQyxNQUFNLGVBQWUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVyRSxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ1QsU0FBUyxFQUFFLEtBQUssQ0FBQyxXQUFXO1lBQzVCLE9BQU8sRUFBRSxpQkFBaUIsQ0FDeEIsT0FBTyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUN0RDtZQUNELGdCQUFnQixFQUFFLHFCQUFxQixDQUFDLEtBQUssQ0FBQztTQUMvQyxDQUFDLENBQUM7S0FDSjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBjZm5EaWZmIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYnO1xuaW1wb3J0ICogYXMgY3hzY2hlbWEgZnJvbSAnQGF3cy1jZGsvY2xvdWQtYXNzZW1ibHktc2NoZW1hJztcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2F3cy1hdXRoJztcbmltcG9ydCAqIGFzIGNvbG9ycyBmcm9tICdjb2xvcnMvc2FmZSc7XG5pbXBvcnQgeyBDZGtUb29sa2l0RGVwbG95bWVudHNQcm9wLCBEaWZmT3B0aW9ucywgU3RhY2tSYXdEaWZmIH0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gYXdzLWNkay9saWIvZGlmZiAocHJpbnRTdGFja0RpZmYpXG5jb25zdCBmaWx0ZXJDREtNZXRhZGF0YSA9IChcbiAgZGlmZjogU3RhY2tSYXdEaWZmWydyYXdEaWZmJ11cbik6IFN0YWNrUmF3RGlmZlsncmF3RGlmZiddID0+IHtcbiAgLy8gZmlsdGVyIG91dCAnQVdTOjpDREs6Ok1ldGFkYXRhJyByZXNvdXJjZXMgZnJvbSB0aGUgdGVtcGxhdGVcbiAgaWYgKGRpZmYucmVzb3VyY2VzKSB7XG4gICAgZGlmZi5yZXNvdXJjZXMgPSBkaWZmLnJlc291cmNlcy5maWx0ZXIoKGNoYW5nZSkgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlLm5ld1Jlc291cmNlVHlwZSA9PT0gJ0FXUzo6Q0RLOjpNZXRhZGF0YScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZS5vbGRSZXNvdXJjZVR5cGUgPT09ICdBV1M6OkNESzo6TWV0YWRhdGEnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGRpZmY7XG59O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbi8qKlxuICogU3Vic3RpdHV0ZSBhbGwgc3RyaW5ncyBsaWtlICR7TG9nSWQueHh4fSB3aXRoIHRoZSBwYXRoIGluc3RlYWQgb2YgdGhlIGxvZ2ljYWwgSURcbiAqL1xuY29uc3Qgc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMgPSAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAoc291cmNlOiBhbnkpID0+IHtcbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKFxuICAgIC9cXCRcXHsoW14ufV0rKSguW159XSspP1xcfS9naSxcbiAgICAoX21hdGNoOiBhbnksIGxvZ0lkOiBhbnksIHN1ZmZpeDogYW55KSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAnJHsnICtcbiAgICAgICAgKG5vcm1hbGl6ZWRMb2dpY2FsSWRQYXRoKGxvZ2ljYWxUb1BhdGhNYXApKGxvZ0lkKSB8fCBsb2dJZCkgK1xuICAgICAgICAoc3VmZml4IHx8ICcnKSArXG4gICAgICAgICd9J1xuICAgICAgKTtcbiAgICB9XG4gICk7XG59O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbmV4cG9ydCBjb25zdCBkZWVwU3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMgPVxuICAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAocm93czogYW55KSA9PiB7XG4gICAgcmV0dXJuIHJvd3MubWFwKChyb3c6IGFueVtdKSA9PlxuICAgICAgcm93Lm1hcChzdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyhsb2dpY2FsVG9QYXRoTWFwKSlcbiAgICApO1xuICB9O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbmNvbnN0IG5vcm1hbGl6ZWRMb2dpY2FsSWRQYXRoID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKGxvZ2ljYWxJZDogYW55KSA9PiB7XG4gIC8vIGlmIHdlIGhhdmUgYSBwYXRoIGluIHRoZSBtYXAsIHJldHVybiBpdFxuICBjb25zdCBwYXRoID0gbG9naWNhbFRvUGF0aE1hcFtsb2dpY2FsSWRdO1xuICByZXR1cm4gcGF0aCA/IG5vcm1hbGl6ZVBhdGgocGF0aCkgOiB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBQYXRoIGlzIHN1cHBvc2VkIHRvIHN0YXJ0IHdpdGggXCIvc3RhY2stbmFtZVwiLiBJZiB0aGlzIGlzIHRoZSBjYXNlIChpLmUuIHBhdGggaGFzIG1vcmUgdGhhblxuICAgKiB0d28gY29tcG9uZW50cywgd2UgcmVtb3ZlIHRoZSBmaXJzdCBwYXJ0LiBPdGhlcndpc2UsIHdlIGp1c3QgdXNlIHRoZSBmdWxsIHBhdGguXG4gICAqIEBwYXJhbSBwXG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHA6IHN0cmluZykge1xuICAgIGlmIChwLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgcCA9IHAuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBsZXQgcGFydHMgPSBwLnNwbGl0KCcvJyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMSk7XG4gICAgICAvLyByZW1vdmUgdGhlIGxhc3QgY29tcG9uZW50IGlmIGl0J3MgXCJSZXNvdXJjZVwiIG9yIFwiRGVmYXVsdFwiIChpZiB3ZSBoYXZlIG1vcmUgdGhhbiBhIHNpbmdsZSBjb21wb25lbnQpXG4gICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCBsYXN0ID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0ID09PSAnUmVzb3VyY2UnIHx8IGxhc3QgPT09ICdEZWZhdWx0Jykge1xuICAgICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHAgPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG59O1xuXG4vLyBjb3BpZWQgZnJvbVxuLy8gYXdzLWNkay9saWIvZGlmZiAoZnVuY3Rpb24gbm90IGV4cG9ydGVkKVxuY29uc3QgYnVpbGRMb2dpY2FsVG9QYXRoTWFwID0gKFxuICBzdGFjazogY2RrLmN4X2FwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Rcbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPT4ge1xuICBjb25zdCBtYXA6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgZm9yIChjb25zdCBtZCBvZiBzdGFjay5maW5kTWV0YWRhdGFCeVR5cGUoXG4gICAgY3hzY2hlbWEuQXJ0aWZhY3RNZXRhZGF0YUVudHJ5VHlwZS5MT0dJQ0FMX0lEXG4gICkpIHtcbiAgICBtYXBbbWQuZGF0YSBhcyBzdHJpbmddID0gbWQucGF0aDtcbiAgfVxuICByZXR1cm4gbWFwO1xufTtcblxuY29uc3QgZHluYW1pY2FsbHlJbnN0YW50aWF0ZURlcGxveW1lbnRzID0gKHNka1Byb3ZpZGVyOiBTZGtQcm92aWRlcikgPT4ge1xuICBsZXQgRGVwbG95bWVudHM7XG4gIGxldCBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wOiBDZGtUb29sa2l0RGVwbG95bWVudHNQcm9wID0gJ2RlcGxveW1lbnRzJztcblxuICB0cnkge1xuICAgIERlcGxveW1lbnRzID0gcmVxdWlyZSgnYXdzLWNkay9saWIvYXBpL2RlcGxveW1lbnRzJykuRGVwbG95bWVudHM7XG4gIH0gY2F0Y2goZXJyKSB7XG4gICAgRGVwbG95bWVudHMgPSByZXF1aXJlKCdhd3MtY2RrL2xpYi9hcGkvY2xvdWRmb3JtYXRpb24tZGVwbG95bWVudHMnKS5DbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzO1xuICAgIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AgPSAnY2xvdWRGb3JtYXRpb24nO1xuICB9XG5cbiAgY29uc3QgZGVwbG95bWVudHMgPSBuZXcgRGVwbG95bWVudHMoe1xuICAgIHNka1Byb3ZpZGVyLFxuICAgIGlvSGVscGVyOiB7XG4gICAgICBkZWZhdWx0czoge1xuICAgICAgICBkZWJ1ZzogKGlucHV0OiBzdHJpbmcpID0+IHsgY29uc29sZS5kZWJ1ZyhpbnB1dCkgfSxcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGRlcGxveW1lbnRzLFxuICAgIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AsXG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERpZmZPYmplY3QoYXBwOiBjZGsuQXBwLCBvcHRpb25zPzogRGlmZk9wdGlvbnMpIHtcbiAgLy8gSWYgd2UgaGF2ZSBuZXcgY29udGV4dCwgd2UgbmVlZCB0byBjcmVhdGUgYSBuZXcgYXBwIHdpdGggdGhlIG1lcmdlZCBjb250ZXh0XG4gIGlmIChvcHRpb25zPy5jb250ZXh0KSB7XG4gICAgLy8gR2V0IGV4aXN0aW5nIGNvbnRleHRcbiAgICBjb25zdCBleGlzdGluZ0NvbnRleHQgPSBhcHAubm9kZS50cnlHZXRDb250ZXh0KCcnKTtcbiAgICBcbiAgICAvLyBDcmVhdGUgbmV3IG1lcmdlZCBjb250ZXh0XG4gICAgY29uc3QgbWVyZ2VkQ29udGV4dCA9IHtcbiAgICAgIC4uLmV4aXN0aW5nQ29udGV4dCxcbiAgICAgIC4uLm9wdGlvbnMuY29udGV4dFxuICAgIH07XG4gICAgXG4gICAgLy8gQ3JlYXRlIGEgbmV3IEFwcCB3aXRoIG1lcmdlZCBjb250ZXh0XG4gICAgY29uc3QgdGVtcEFwcCA9IG5ldyBjZGsuQXBwKHtcbiAgICAgIGNvbnRleHQ6IG1lcmdlZENvbnRleHQsXG4gICAgfSk7XG5cbiAgICAvLyBGb3IgZWFjaCBzdGFjayBpbiB0aGUgb3JpZ2luYWwgYXBwLCBjcmVhdGUgYSBuZXcgc3RhY2sgaW4gdGhlIHRlbXAgYXBwXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBhcHAubm9kZS5jaGlsZHJlbikge1xuICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgY2RrLlN0YWNrKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsU3RhY2sgPSBjaGlsZCBhcyBjZGsuU3RhY2s7XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgc3RhY2sgb2YgdGhlIHNhbWUgdHlwZVxuICAgICAgICBjb25zdCBzdGFja1Byb3BzID0ge1xuICAgICAgICAgIGVudjoge1xuICAgICAgICAgICAgYWNjb3VudDogb3JpZ2luYWxTdGFjay5hY2NvdW50LFxuICAgICAgICAgICAgcmVnaW9uOiBvcmlnaW5hbFN0YWNrLnJlZ2lvblxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gQ29weSBvdGhlciBzdGFjayBwcm9wZXJ0aWVzIHRoYXQgbWlnaHQgYmUgaW1wb3J0YW50XG4gICAgICAgICAgc3RhY2tOYW1lOiBvcmlnaW5hbFN0YWNrLnN0YWNrTmFtZSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogb3JpZ2luYWxTdGFjay50ZW1wbGF0ZU9wdGlvbnMuZGVzY3JpcHRpb24sXG4gICAgICAgICAgdGVybWluYXRpb25Qcm90ZWN0aW9uOiBvcmlnaW5hbFN0YWNrLnRlcm1pbmF0aW9uUHJvdGVjdGlvbixcbiAgICAgICAgICB0YWdzOiBvcmlnaW5hbFN0YWNrLnRhZ3MudGFnVmFsdWVzKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVXNlIHJlZmxlY3Rpb24gdG8gY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBzYW1lIHN0YWNrIGNsYXNzXG4gICAgICAgIGNvbnN0IHN0YWNrQ2xhc3MgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob3JpZ2luYWxTdGFjaykuY29uc3RydWN0b3I7XG4gICAgICAgIG5ldyBzdGFja0NsYXNzKHRlbXBBcHAsIG9yaWdpbmFsU3RhY2subm9kZS5pZCwgc3RhY2tQcm9wcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXNlIHRoZSB0ZW1wb3JhcnkgYXBwIGZvciBzeW50aGVzaXNcbiAgICBjb25zdCBhc3NlbWJseSA9IHRlbXBBcHAuc3ludGgoKTtcbiAgICByZXR1cm4gYXdhaXQgZ2VuZXJhdGVEaWZmcyhhc3NlbWJseSwgb3B0aW9ucyk7XG4gIH1cblxuICAvLyBJZiBubyBuZXcgY29udGV4dCwgdXNlIHRoZSBvcmlnaW5hbCBhcHBcbiAgY29uc3QgYXNzZW1ibHkgPSBhcHAuc3ludGgoKTtcbiAgcmV0dXJuIGF3YWl0IGdlbmVyYXRlRGlmZnMoYXNzZW1ibHksIG9wdGlvbnMpO1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgZGlmZnMgZnJvbSBhbiBhc3NlbWJseVxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEaWZmcyhhc3NlbWJseTogY2RrLmN4X2FwaS5DbG91ZEFzc2VtYmx5LCBvcHRpb25zPzogRGlmZk9wdGlvbnMpOiBQcm9taXNlPFN0YWNrUmF3RGlmZltdPiB7XG4gIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgaW9IZWxwZXI6IHtcbiAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGRlYnVnOiAoaW5wdXQ6IHN0cmluZykgPT4geyBjb25zb2xlLmRlYnVnKGlucHV0KSB9LFxuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgYW55LCBvcHRpb25zPy5wcm9maWxlKTtcblxuICBjb2xvcnMuZGlzYWJsZSgpO1xuXG4gIGNvbnN0IHsgZGVwbG95bWVudHMgfSA9IGR5bmFtaWNhbGx5SW5zdGFudGlhdGVEZXBsb3ltZW50cyhzZGtQcm92aWRlcik7XG4gIGNvbnN0IGRpZmZzOiBTdGFja1Jhd0RpZmZbXSA9IFtdO1xuICBcbiAgZm9yIChjb25zdCBzdGFjayBvZiBhc3NlbWJseS5zdGFja3MpIHtcbiAgICBjb25zdCBjdXJyZW50VGVtcGxhdGUgPSBhd2FpdCBkZXBsb3ltZW50cy5yZWFkQ3VycmVudFRlbXBsYXRlKHN0YWNrKTtcbiAgICBcbiAgICBkaWZmcy5wdXNoKHtcbiAgICAgIHN0YWNrTmFtZTogc3RhY2suZGlzcGxheU5hbWUsXG4gICAgICByYXdEaWZmOiBmaWx0ZXJDREtNZXRhZGF0YShcbiAgICAgICAgY2ZuRGlmZi5kaWZmVGVtcGxhdGUoY3VycmVudFRlbXBsYXRlLCBzdGFjay50ZW1wbGF0ZSlcbiAgICAgICksXG4gICAgICBsb2dpY2FsVG9QYXRoTWFwOiBidWlsZExvZ2ljYWxUb1BhdGhNYXAoc3RhY2spXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gZGlmZnM7XG59XG4iXX0=