"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapCdkToolkit = exports.deepSubstituteBracedLogicalIds = void 0;
const cfnDiff = require("@aws-cdk/cloudformation-diff");
const cxschema = require("@aws-cdk/cloud-assembly-schema");
const cdk_toolkit_1 = require("aws-cdk/lib/cdk-toolkit");
const settings_1 = require("aws-cdk/lib/settings");
const aws_auth_1 = require("aws-cdk/lib/api/aws-auth");
const cloudformation_deployments_1 = require("aws-cdk/lib/api/cloudformation-deployments");
const cloud_executable_1 = require("aws-cdk/lib/api/cxapp/cloud-executable");
const exec_1 = require("aws-cdk/lib/api/cxapp/exec");
const colors = require("colors/safe");
// reverse engineered from: 
// aws-cdk/lib/diff (printStackDiff)
const filterCDKMetadata = (diff) => {
    // filter out 'AWS::CDK::Metadata' resources from the template
    if (diff.resources) {
        diff.resources = diff.resources.filter(change => {
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
    return source.replace(/\$\{([^.}]+)(.[^}]+)?\}/ig, (_match, logId, suffix) => {
        return '${' + (normalizedLogicalIdPath(logicalToPathMap)(logId) || logId) + (suffix || '') + '}';
    });
};
// reverse engineered from:
// @aws-cdk/cloudformation-diff/lib/format (Formatter class is not exported)
exports.deepSubstituteBracedLogicalIds = (logicalToPathMap) => (rows) => {
    return rows.map((row) => row.map(substituteBracedLogicalIds(logicalToPathMap)));
};
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
class CustomCdkToolkit extends cdk_toolkit_1.CdkToolkit {
    constructor(props) {
        super(props);
    }
    // method is reverse engineered based on CdkTookit.diff method but returns a diff structure 
    // where diff outputs formatted diff to a stream (ie. stderr)
    async getDiffObject(options) {
        const stacks = await this.selectStacksForDiff(options.stackNames, options.exclusively);
        let diffs = [];
        if (options.templatePath !== undefined) {
            throw new Error('using template not supported by getDiffObject');
        }
        // Compare N stacks against deployed templates
        for (const stack of stacks.stackArtifacts) {
            const currentTemplate = await (this.props.cloudFormation.readCurrentTemplate(stack));
            diffs.push({
                stackName: stack.displayName,
                rawDiff: filterCDKMetadata(cfnDiff.diffTemplate(currentTemplate, stack.template)),
                logicalToPathMap: buildLogicalToPathMap(stack),
            });
        }
        return diffs;
    }
}
;
// reverse engineered from node_modules/aws-cdk/bin/cdk.js
exports.bootstrapCdkToolkit = async () => {
    const configuration = new settings_1.Configuration(
    // { 
    //   _: ['diff' as any],
    //   'no-color': true 
    // }
    );
    await configuration.load();
    const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
    // profile: configuration.settings.get(['profile']),
    });
    const cloudFormation = new cloudformation_deployments_1.CloudFormationDeployments({ sdkProvider });
    const cloudExecutable = new cloud_executable_1.CloudExecutable({
        configuration,
        sdkProvider,
        synthesizer: exec_1.execProgram,
    });
    colors.disable();
    return new CustomCdkToolkit({
        cloudExecutable,
        cloudFormation,
        configuration,
        sdkProvider,
        verbose: false,
        ignoreErrors: false,
        strict: true,
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QseURBQWtGO0FBQ2xGLG1EQUFxRDtBQUNyRCx1REFBdUQ7QUFDdkQsMkZBQXVGO0FBQ3ZGLDZFQUF5RTtBQUN6RSxxREFBeUQ7QUFDekQsc0NBQXNDO0FBSXRDLDRCQUE0QjtBQUM1QixvQ0FBb0M7QUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLElBQTZCLEVBQTJCLEVBQUU7SUFDbkYsOERBQThEO0lBQzlELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUNELElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxvQkFBb0IsRUFBRTtnQkFDakQsT0FBTyxLQUFLLENBQUM7YUFDaEI7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ2pELE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyxDQUFBO0FBRUQsMkJBQTJCO0FBQzNCLDRFQUE0RTtBQUM1RTs7RUFFRTtBQUNGLE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxnQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtJQUM1RSxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxNQUFXLEVBQUUsS0FBVSxFQUFFLE1BQVcsRUFBRSxFQUFF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QUFXLEVBQUUsa0JBQVc7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWpCLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQztRQUMxQixlQUFlO1FBQ2YsY0FBYztRQUNkLGFBQWE7UUFDYixXQUFXO1FBQ1gsT0FBTyxFQUFFLEtBQUs7UUFDZCxZQUFZLEVBQUUsS0FBSztRQUNuQixNQUFNLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNmbkRpZmYgZnJvbSAnQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZic7XG5pbXBvcnQgKiBhcyBjeGFwaSBmcm9tICdAYXdzLWNkay9jeC1hcGknO1xuaW1wb3J0ICogYXMgY3hzY2hlbWEgZnJvbSAnQGF3cy1jZGsvY2xvdWQtYXNzZW1ibHktc2NoZW1hJztcbmltcG9ydCB7IENka1Rvb2xraXQsIENka1Rvb2xraXRQcm9wcywgRGlmZk9wdGlvbnMgfSBmcm9tICdhd3MtY2RrL2xpYi9jZGstdG9vbGtpdCdcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICdhd3MtY2RrL2xpYi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBTZGtQcm92aWRlciB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9hd3MtYXV0aCc7XG5pbXBvcnQgeyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2Nsb3VkZm9ybWF0aW9uLWRlcGxveW1lbnRzJztcbmltcG9ydCB7IENsb3VkRXhlY3V0YWJsZSB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9jeGFwcC9jbG91ZC1leGVjdXRhYmxlJztcbmltcG9ydCB7IGV4ZWNQcm9ncmFtIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2N4YXBwL2V4ZWMnO1xuaW1wb3J0ICogYXMgY29sb3JzIGZyb20gJ2NvbG9ycy9zYWZlJztcblxuaW1wb3J0IHsgU3RhY2tSYXdEaWZmIH0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOiBcbi8vIGF3cy1jZGsvbGliL2RpZmYgKHByaW50U3RhY2tEaWZmKVxuY29uc3QgZmlsdGVyQ0RLTWV0YWRhdGEgPSAoZGlmZjogU3RhY2tSYXdEaWZmWydyYXdEaWZmJ10pOiBTdGFja1Jhd0RpZmZbJ3Jhd0RpZmYnXSA9PiB7XG4gIC8vIGZpbHRlciBvdXQgJ0FXUzo6Q0RLOjpNZXRhZGF0YScgcmVzb3VyY2VzIGZyb20gdGhlIHRlbXBsYXRlXG4gIGlmIChkaWZmLnJlc291cmNlcykge1xuICAgIGRpZmYucmVzb3VyY2VzID0gZGlmZi5yZXNvdXJjZXMuZmlsdGVyKGNoYW5nZSA9PiB7XG4gICAgICAgIGlmICghY2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlLm5ld1Jlc291cmNlVHlwZSA9PT0gJ0FXUzo6Q0RLOjpNZXRhZGF0YScpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlLm9sZFJlc291cmNlVHlwZSA9PT0gJ0FXUzo6Q0RLOjpNZXRhZGF0YScpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBkaWZmO1xufVxuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbi8qKlxuKiBTdWJzdGl0dXRlIGFsbCBzdHJpbmdzIGxpa2UgJHtMb2dJZC54eHh9IHdpdGggdGhlIHBhdGggaW5zdGVhZCBvZiB0aGUgbG9naWNhbCBJRFxuKi9cbmNvbnN0IHN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHNvdXJjZTogYW55KSA9PiB7XG4gIHJldHVybiBzb3VyY2UucmVwbGFjZSgvXFwkXFx7KFteLn1dKykoLltefV0rKT9cXH0vaWcsIChfbWF0Y2g6IGFueSwgbG9nSWQ6IGFueSwgc3VmZml4OiBhbnkpID0+IHtcbiAgICAgIHJldHVybiAnJHsnICsgKG5vcm1hbGl6ZWRMb2dpY2FsSWRQYXRoKGxvZ2ljYWxUb1BhdGhNYXApKGxvZ0lkKSB8fCBsb2dJZCkgKyAoc3VmZml4IHx8ICcnKSArICd9JztcbiAgfSk7XG59XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuZXhwb3J0IGNvbnN0IGRlZXBTdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyA9IChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChyb3dzOiBhbnkpID0+IHtcbiAgcmV0dXJuIHJvd3MubWFwKChyb3c6IGFueVtdKSA9PiByb3cubWFwKHN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzKGxvZ2ljYWxUb1BhdGhNYXApKSk7XG59XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuY29uc3Qgbm9ybWFsaXplZExvZ2ljYWxJZFBhdGggPSAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAobG9naWNhbElkOiBhbnkpID0+IHtcbiAgLy8gaWYgd2UgaGF2ZSBhIHBhdGggaW4gdGhlIG1hcCwgcmV0dXJuIGl0XG4gIGNvbnN0IHBhdGggPSBsb2dpY2FsVG9QYXRoTWFwW2xvZ2ljYWxJZF07XG4gIHJldHVybiBwYXRoID8gbm9ybWFsaXplUGF0aChwYXRoKSA6IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIFBhdGggaXMgc3VwcG9zZWQgdG8gc3RhcnQgd2l0aCBcIi9zdGFjay1uYW1lXCIuIElmIHRoaXMgaXMgdGhlIGNhc2UgKGkuZS4gcGF0aCBoYXMgbW9yZSB0aGFuXG4gICAqIHR3byBjb21wb25lbnRzLCB3ZSByZW1vdmUgdGhlIGZpcnN0IHBhcnQuIE90aGVyd2lzZSwgd2UganVzdCB1c2UgdGhlIGZ1bGwgcGF0aC5cbiAgICogQHBhcmFtIHBcbiAgICovXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVBhdGgocDogc3RyaW5nKSB7XG4gICAgICBpZiAocC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgICBwID0gcC5zdWJzdHIoMSk7XG4gICAgICB9XG4gICAgICBsZXQgcGFydHMgPSBwLnNwbGl0KCcvJyk7XG4gICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMSk7XG4gICAgICAgICAgLy8gcmVtb3ZlIHRoZSBsYXN0IGNvbXBvbmVudCBpZiBpdCdzIFwiUmVzb3VyY2VcIiBvciBcIkRlZmF1bHRcIiAoaWYgd2UgaGF2ZSBtb3JlIHRoYW4gYSBzaW5nbGUgY29tcG9uZW50KVxuICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgaWYgKGxhc3QgPT09ICdSZXNvdXJjZScgfHwgbGFzdCA9PT0gJ0RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgICAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDAsIHBhcnRzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHAgPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcDtcbiAgfVxufVxuXG4vLyBjb3BpZWQgZnJvbSBcbi8vIGF3cy1jZGsvbGliL2RpZmYgKGZ1bmN0aW9uIG5vdCBleHBvcnRlZClcbmNvbnN0IGJ1aWxkTG9naWNhbFRvUGF0aE1hcCA9IChzdGFjazogY3hhcGkuQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0KTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9PiB7XG4gIGNvbnN0IG1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICBmb3IgKGNvbnN0IG1kIG9mIHN0YWNrLmZpbmRNZXRhZGF0YUJ5VHlwZShjeHNjaGVtYS5BcnRpZmFjdE1ldGFkYXRhRW50cnlUeXBlLkxPR0lDQUxfSUQpKSB7XG4gICAgICBtYXBbbWQuZGF0YSBhcyBzdHJpbmddID0gbWQucGF0aDtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG5jbGFzcyBDdXN0b21DZGtUb29sa2l0IGV4dGVuZHMgQ2RrVG9vbGtpdCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBDZGtUb29sa2l0UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICAvLyBtZXRob2QgaXMgcmV2ZXJzZSBlbmdpbmVlcmVkIGJhc2VkIG9uIENka1Rvb2tpdC5kaWZmIG1ldGhvZCBidXQgcmV0dXJucyBhIGRpZmYgc3RydWN0dXJlIFxuICAvLyB3aGVyZSBkaWZmIG91dHB1dHMgZm9ybWF0dGVkIGRpZmYgdG8gYSBzdHJlYW0gKGllLiBzdGRlcnIpXG4gIGFzeW5jIGdldERpZmZPYmplY3Qob3B0aW9uczogRGlmZk9wdGlvbnMpOiBQcm9taXNlPFN0YWNrUmF3RGlmZltdPiB7XG4gICAgY29uc3Qgc3RhY2tzID0gYXdhaXQgKHRoaXMgYXMgYW55KS5zZWxlY3RTdGFja3NGb3JEaWZmKG9wdGlvbnMuc3RhY2tOYW1lcywgb3B0aW9ucy5leGNsdXNpdmVseSk7XG4gICAgbGV0IGRpZmZzOiBTdGFja1Jhd0RpZmZbXSA9IFtdO1xuICAgIGlmIChvcHRpb25zLnRlbXBsYXRlUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndXNpbmcgdGVtcGxhdGUgbm90IHN1cHBvcnRlZCBieSBnZXREaWZmT2JqZWN0JylcbiAgICB9XG5cbiAgICAvLyBDb21wYXJlIE4gc3RhY2tzIGFnYWluc3QgZGVwbG95ZWQgdGVtcGxhdGVzXG4gICAgZm9yIChjb25zdCBzdGFjayBvZiBzdGFja3Muc3RhY2tBcnRpZmFjdHMpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRUZW1wbGF0ZSA9IGF3YWl0ICgoKHRoaXMgYXMgYW55KS5wcm9wcyBhcyBDZGtUb29sa2l0UHJvcHMpLmNsb3VkRm9ybWF0aW9uLnJlYWRDdXJyZW50VGVtcGxhdGUoc3RhY2spKTtcbiAgICAgIGRpZmZzLnB1c2goe1xuICAgICAgICBzdGFja05hbWU6IHN0YWNrLmRpc3BsYXlOYW1lLFxuICAgICAgICByYXdEaWZmOiBmaWx0ZXJDREtNZXRhZGF0YShjZm5EaWZmLmRpZmZUZW1wbGF0ZShjdXJyZW50VGVtcGxhdGUsIHN0YWNrLnRlbXBsYXRlKSksXG4gICAgICAgIGxvZ2ljYWxUb1BhdGhNYXA6IGJ1aWxkTG9naWNhbFRvUGF0aE1hcChzdGFjayksXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiBkaWZmcztcbiAgfVxufTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb20gbm9kZV9tb2R1bGVzL2F3cy1jZGsvYmluL2Nkay5qc1xuZXhwb3J0IGNvbnN0IGJvb3RzdHJhcENka1Rvb2xraXQgPSBhc3luYyAoKTogUHJvbWlzZTxDdXN0b21DZGtUb29sa2l0PiA9PiB7XG4gIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbihcbiAgICAvLyB7IFxuICAgIC8vICAgXzogWydkaWZmJyBhcyBhbnldLFxuICAgIC8vICAgJ25vLWNvbG9yJzogdHJ1ZSBcbiAgICAvLyB9XG4gICk7XG4gIGF3YWl0IGNvbmZpZ3VyYXRpb24ubG9hZCgpO1xuICBjb25zdCBzZGtQcm92aWRlciA9IGF3YWl0IFNka1Byb3ZpZGVyLndpdGhBd3NDbGlDb21wYXRpYmxlRGVmYXVsdHMoe1xuICAgICAgLy8gcHJvZmlsZTogY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXQoWydwcm9maWxlJ10pLFxuICB9KTtcbiAgY29uc3QgY2xvdWRGb3JtYXRpb24gPSBuZXcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyh7IHNka1Byb3ZpZGVyIH0pO1xuICBjb25zdCBjbG91ZEV4ZWN1dGFibGUgPSBuZXcgQ2xvdWRFeGVjdXRhYmxlKHtcbiAgICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgICBzZGtQcm92aWRlcixcbiAgICAgIHN5bnRoZXNpemVyOiBleGVjUHJvZ3JhbSxcbiAgfSk7XG5cbiAgY29sb3JzLmRpc2FibGUoKTtcblxuICByZXR1cm4gbmV3IEN1c3RvbUNka1Rvb2xraXQoe1xuICAgIGNsb3VkRXhlY3V0YWJsZSxcbiAgICBjbG91ZEZvcm1hdGlvbixcbiAgICBjb25maWd1cmF0aW9uLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgIGlnbm9yZUVycm9yczogZmFsc2UsXG4gICAgc3RyaWN0OiB0cnVlLFxuICB9KTtcbn07XG4iXX0=