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
const plugin_1 = require("aws-cdk/lib/api/plugin");
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
        console.debug('initializing CustomCdkToolkit super class');
        super(props);
    }
    // method is reverse engineered based on CdkTookit.diff method but returns a diff structure
    // where diff outputs formatted diff to a stream (ie. stderr)
    async getDiffObject(options) {
        console.debug('selectStacksForDiff');
        const stacks = await this.selectStacksForDiff(options.stackNames, options.exclusively);
        let diffs = [];
        if (options.templatePath !== undefined) {
            throw new Error('using template not supported by getDiffObject');
        }
        // Compare N stacks against deployed templates
        for (const stack of stacks.stackArtifacts) {
            console.debug(`readCurrentTemplate for stack: ${stack.displayName}`);
            const currentTemplate = await this.props.cloudFormation.readCurrentTemplate(stack);
            console.debug('cloudformation diff the stack');
            diffs.push({
                stackName: stack.displayName,
                rawDiff: filterCDKMetadata(cfnDiff.diffTemplate(currentTemplate, stack.template)),
                logicalToPathMap: buildLogicalToPathMap(stack),
            });
        }
        return diffs;
    }
}
// reverse engineered from node_modules/aws-cdk/bin/cdk.js
exports.bootstrapCdkToolkit = async () => {
    console.debug('loading configuration');
    const configuration = new settings_1.Configuration();
    // {
    //   _: ['diff' as any],
    //   'no-color': true
    // }
    await configuration.load();
    console.debug('loading sdk provider');
    const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
    // profile: configuration.settings.get(['profile']),
    });
    console.debug('initializing CloudFormationDeployments');
    const cloudFormation = new cloudformation_deployments_1.CloudFormationDeployments({ sdkProvider });
    console.debug('initializing CloudExecutable');
    const cloudExecutable = new cloud_executable_1.CloudExecutable({
        configuration,
        sdkProvider,
        synthesizer: exec_1.execProgram,
    });
    colors.disable();
    console.debug('loading plugins');
    function loadPlugins(...settings) {
        const loaded = new Set();
        for (const source of settings) {
            const plugins = source.get(['plugin']) || [];
            for (const plugin of plugins) {
                const resolved = tryResolve(plugin);
                if (loaded.has(resolved)) {
                    continue;
                }
                console.debug(`Loading plug-in: ${plugin} from ${resolved}`);
                plugin_1.PluginHost.instance.load(plugin);
                loaded.add(resolved);
            }
        }
        function tryResolve(plugin) {
            try {
                return require.resolve(plugin);
            }
            catch (e) {
                throw new Error(`Unable to resolve plug-in: ${plugin}`);
            }
        }
    }
    loadPlugins(configuration.settings);
    console.debug('initializing CustomCdkToolkit');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QseURBSWlDO0FBQ2pDLG1EQUFxRDtBQUNyRCx1REFBdUQ7QUFDdkQsMkZBQXVGO0FBQ3ZGLDZFQUF5RTtBQUN6RSxxREFBeUQ7QUFDekQsbURBQW9EO0FBQ3BELHNDQUFzQztBQUl0QywyQkFBMkI7QUFDM0Isb0NBQW9DO0FBQ3BDLE1BQU0saUJBQWlCLEdBQUcsQ0FDeEIsSUFBNkIsRUFDSixFQUFFO0lBQzNCLDhEQUE4RDtJQUM5RCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxvQkFBb0IsRUFBRTtnQkFDbkQsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxvQkFBb0IsRUFBRTtnQkFDbkQsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUYsMkJBQTJCO0FBQzNCLDRFQUE0RTtBQUM1RTs7R0FFRztBQUNILE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxnQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtJQUM1RSxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQ25CLDJCQUEyQixFQUMzQixDQUFDLE1BQVcsRUFBRSxLQUFVLEVB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Q0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWpDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdEI7U0FDRjtRQUNELFNBQVMsVUFBVSxDQUFDLE1BQWM7WUFDaEMsSUFBSTtnQkFDRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEM7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3pEO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXBDLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUMvQyxPQUFPLElBQUksZ0JBQWdCLENBQUM7UUFDMUIsZUFBZTtRQUNmLGNBQWM7UUFDZCxhQUFhO1FBQ2IsV0FBVztRQUNYLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsTUFBTSxFQUFFLElBQUk7S0FDYixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZm5EaWZmIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYnO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSAnQGF3cy1jZGsvY3gtYXBpJztcbmltcG9ydCAqIGFzIGN4c2NoZW1hIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkLWFzc2VtYmx5LXNjaGVtYSc7XG5pbXBvcnQge1xuICBDZGtUb29sa2l0LFxuICBDZGtUb29sa2l0UHJvcHMsXG4gIERpZmZPcHRpb25zLFxufSBmcm9tICdhd3MtY2RrL2xpYi9jZGstdG9vbGtpdCc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay9saWIvc2V0dGluZ3MnO1xuaW1wb3J0IHsgU2RrUHJvdmlkZXIgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvYXdzLWF1dGgnO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9jbG91ZGZvcm1hdGlvbi1kZXBsb3ltZW50cyc7XG5pbXBvcnQgeyBDbG91ZEV4ZWN1dGFibGUgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvY3hhcHAvY2xvdWQtZXhlY3V0YWJsZSc7XG5pbXBvcnQgeyBleGVjUHJvZ3JhbSB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9jeGFwcC9leGVjJztcbmltcG9ydCB7IFBsdWdpbkhvc3QgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvcGx1Z2luJztcbmltcG9ydCAqIGFzIGNvbG9ycyBmcm9tICdjb2xvcnMvc2FmZSc7XG5cbmltcG9ydCB7IFN0YWNrUmF3RGlmZiB9IGZyb20gJy4vdHlwZXMnO1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIGF3cy1jZGsvbGliL2RpZmYgKHByaW50U3RhY2tEaWZmKVxuY29uc3QgZmlsdGVyQ0RLTWV0YWRhdGEgPSAoXG4gIGRpZmY6IFN0YWNrUmF3RGlmZlsncmF3RGlmZiddXG4pOiBTdGFja1Jhd0RpZmZbJ3Jhd0RpZmYnXSA9PiB7XG4gIC8vIGZpbHRlciBvdXQgJ0FXUzo6Q0RLOjpNZXRhZGF0YScgcmVzb3VyY2VzIGZyb20gdGhlIHRlbXBsYXRlXG4gIGlmIChkaWZmLnJlc291cmNlcykge1xuICAgIGRpZmYucmVzb3VyY2VzID0gZGlmZi5yZXNvdXJjZXMuZmlsdGVyKChjaGFuZ2UpID0+IHtcbiAgICAgIGlmICghY2hhbmdlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZS5uZXdSZXNvdXJjZVR5cGUgPT09ICdBV1M6OkNESzo6TWV0YWRhdGEnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2Uub2xkUmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBkaWZmO1xufTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG4vKipcbiAqIFN1YnN0aXR1dGUgYWxsIHN0cmluZ3MgbGlrZSAke0xvZ0lkLnh4eH0gd2l0aCB0aGUgcGF0aCBpbnN0ZWFkIG9mIHRoZSBsb2dpY2FsIElEXG4gKi9cbmNvbnN0IHN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHNvdXJjZTogYW55KSA9PiB7XG4gIHJldHVybiBzb3VyY2UucmVwbGFjZShcbiAgICAvXFwkXFx7KFteLn1dKykoLltefV0rKT9cXH0vZ2ksXG4gICAgKF9tYXRjaDogYW55LCBsb2dJZDogYW55LCBzdWZmaXg6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgJyR7JyArXG4gICAgICAgIChub3JtYWxpemVkTG9naWNhbElkUGF0aChsb2dpY2FsVG9QYXRoTWFwKShsb2dJZCkgfHwgbG9nSWQpICtcbiAgICAgICAgKHN1ZmZpeCB8fCAnJykgK1xuICAgICAgICAnfSdcbiAgICAgICk7XG4gICAgfVxuICApO1xufTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5leHBvcnQgY29uc3QgZGVlcFN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID1cbiAgKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHJvd3M6IGFueSkgPT4ge1xuICAgIHJldHVybiByb3dzLm1hcCgocm93OiBhbnlbXSkgPT5cbiAgICAgIHJvdy5tYXAoc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMobG9naWNhbFRvUGF0aE1hcCkpXG4gICAgKTtcbiAgfTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5jb25zdCBub3JtYWxpemVkTG9naWNhbElkUGF0aCA9IChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChsb2dpY2FsSWQ6IGFueSkgPT4ge1xuICAvLyBpZiB3ZSBoYXZlIGEgcGF0aCBpbiB0aGUgbWFwLCByZXR1cm4gaXRcbiAgY29uc3QgcGF0aCA9IGxvZ2ljYWxUb1BhdGhNYXBbbG9naWNhbElkXTtcbiAgcmV0dXJuIHBhdGggPyBub3JtYWxpemVQYXRoKHBhdGgpIDogdW5kZWZpbmVkO1xuICAvKipcbiAgICogUGF0aCBpcyBzdXBwb3NlZCB0byBzdGFydCB3aXRoIFwiL3N0YWNrLW5hbWVcIi4gSWYgdGhpcyBpcyB0aGUgY2FzZSAoaS5lLiBwYXRoIGhhcyBtb3JlIHRoYW5cbiAgICogdHdvIGNvbXBvbmVudHMsIHdlIHJlbW92ZSB0aGUgZmlyc3QgcGFydC4gT3RoZXJ3aXNlLCB3ZSBqdXN0IHVzZSB0aGUgZnVsbCBwYXRoLlxuICAgKiBAcGFyYW0gcFxuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwOiBzdHJpbmcpIHtcbiAgICBpZiAocC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHAgPSBwLnN1YnN0cigxKTtcbiAgICB9XG4gICAgbGV0IHBhcnRzID0gcC5zcGxpdCgnLycpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDEpO1xuICAgICAgLy8gcmVtb3ZlIHRoZSBsYXN0IGNvbXBvbmVudCBpZiBpdCdzIFwiUmVzb3VyY2VcIiBvciBcIkRlZmF1bHRcIiAoaWYgd2UgaGF2ZSBtb3JlIHRoYW4gYSBzaW5nbGUgY29tcG9uZW50KVxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdCA9PT0gJ1Jlc291cmNlJyB8fCBsYXN0ID09PSAnRGVmYXVsdCcpIHtcbiAgICAgICAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDAsIHBhcnRzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwID0gcGFydHMuam9pbignLycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxufTtcblxuLy8gY29waWVkIGZyb21cbi8vIGF3cy1jZGsvbGliL2RpZmYgKGZ1bmN0aW9uIG5vdCBleHBvcnRlZClcbmNvbnN0IGJ1aWxkTG9naWNhbFRvUGF0aE1hcCA9IChcbiAgc3RhY2s6IGN4YXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdFxuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9PiB7XG4gIGNvbnN0IG1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICBmb3IgKGNvbnN0IG1kIG9mIHN0YWNrLmZpbmRNZXRhZGF0YUJ5VHlwZShcbiAgICBjeHNjaGVtYS5BcnRpZmFjdE1ldGFkYXRhRW50cnlUeXBlLkxPR0lDQUxfSURcbiAgKSkge1xuICAgIG1hcFttZC5kYXRhIGFzIHN0cmluZ10gPSBtZC5wYXRoO1xuICB9XG4gIHJldHVybiBtYXA7XG59O1xuXG5jbGFzcyBDdXN0b21DZGtUb29sa2l0IGV4dGVuZHMgQ2RrVG9vbGtpdCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBDZGtUb29sa2l0UHJvcHMpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ3VzdG9tQ2RrVG9vbGtpdCBzdXBlciBjbGFzcycpO1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIC8vIG1ldGhvZCBpcyByZXZlcnNlIGVuZ2luZWVyZWQgYmFzZWQgb24gQ2RrVG9va2l0LmRpZmYgbWV0aG9kIGJ1dCByZXR1cm5zIGEgZGlmZiBzdHJ1Y3R1cmVcbiAgLy8gd2hlcmUgZGlmZiBvdXRwdXRzIGZvcm1hdHRlZCBkaWZmIHRvIGEgc3RyZWFtIChpZS4gc3RkZXJyKVxuICBhc3luYyBnZXREaWZmT2JqZWN0KG9wdGlvbnM6IERpZmZPcHRpb25zKTogUHJvbWlzZTxTdGFja1Jhd0RpZmZbXT4ge1xuICAgIGNvbnNvbGUuZGVidWcoJ3NlbGVjdFN0YWNrc0ZvckRpZmYnKTtcbiAgICBjb25zdCBzdGFja3MgPSBhd2FpdCAodGhpcyBhcyBhbnkpLnNlbGVjdFN0YWNrc0ZvckRpZmYoXG4gICAgICBvcHRpb25zLnN0YWNrTmFtZXMsXG4gICAgICBvcHRpb25zLmV4Y2x1c2l2ZWx5XG4gICAgKTtcbiAgICBsZXQgZGlmZnM6IFN0YWNrUmF3RGlmZltdID0gW107XG4gICAgaWYgKG9wdGlvbnMudGVtcGxhdGVQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndXNpbmcgdGVtcGxhdGUgbm90IHN1cHBvcnRlZCBieSBnZXREaWZmT2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgLy8gQ29tcGFyZSBOIHN0YWNrcyBhZ2FpbnN0IGRlcGxveWVkIHRlbXBsYXRlc1xuICAgIGZvciAoY29uc3Qgc3RhY2sgb2Ygc3RhY2tzLnN0YWNrQXJ0aWZhY3RzKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKGByZWFkQ3VycmVudFRlbXBsYXRlIGZvciBzdGFjazogJHtzdGFjay5kaXNwbGF5TmFtZX1gKTtcbiAgICAgIGNvbnN0IGN1cnJlbnRUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgKHRoaXMgYXMgYW55KS5wcm9wcyBhcyBDZGtUb29sa2l0UHJvcHNcbiAgICAgICkuY2xvdWRGb3JtYXRpb24ucmVhZEN1cnJlbnRUZW1wbGF0ZShzdGFjayk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdjbG91ZGZvcm1hdGlvbiBkaWZmIHRoZSBzdGFjaycpO1xuICAgICAgZGlmZnMucHVzaCh7XG4gICAgICAgIHN0YWNrTmFtZTogc3RhY2suZGlzcGxheU5hbWUsXG4gICAgICAgIHJhd0RpZmY6IGZpbHRlckNES01ldGFkYXRhKFxuICAgICAgICAgIGNmbkRpZmYuZGlmZlRlbXBsYXRlKGN1cnJlbnRUZW1wbGF0ZSwgc3RhY2sudGVtcGxhdGUpXG4gICAgICAgICksXG4gICAgICAgIGxvZ2ljYWxUb1BhdGhNYXA6IGJ1aWxkTG9naWNhbFRvUGF0aE1hcChzdGFjayksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlmZnM7XG4gIH1cbn1cblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb20gbm9kZV9tb2R1bGVzL2F3cy1jZGsvYmluL2Nkay5qc1xuZXhwb3J0IGNvbnN0IGJvb3RzdHJhcENka1Rvb2xraXQgPSBhc3luYyAoKTogUHJvbWlzZTxDdXN0b21DZGtUb29sa2l0PiA9PiB7XG4gIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgY29uZmlndXJhdGlvbicpO1xuICBjb25zdCBjb25maWd1cmF0aW9uID0gbmV3IENvbmZpZ3VyYXRpb24oKTtcbiAgLy8ge1xuICAvLyAgIF86IFsnZGlmZicgYXMgYW55XSxcbiAgLy8gICAnbm8tY29sb3InOiB0cnVlXG4gIC8vIH1cbiAgYXdhaXQgY29uZmlndXJhdGlvbi5sb2FkKCk7XG4gIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgc2RrIHByb3ZpZGVyJyk7XG4gIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgLy8gcHJvZmlsZTogY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXQoWydwcm9maWxlJ10pLFxuICB9KTtcbiAgY29uc29sZS5kZWJ1ZygnaW5pdGlhbGl6aW5nIENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMnKTtcbiAgY29uc3QgY2xvdWRGb3JtYXRpb24gPSBuZXcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyh7IHNka1Byb3ZpZGVyIH0pO1xuICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ2xvdWRFeGVjdXRhYmxlJyk7XG4gIGNvbnN0IGNsb3VkRXhlY3V0YWJsZSA9IG5ldyBDbG91ZEV4ZWN1dGFibGUoe1xuICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgc3ludGhlc2l6ZXI6IGV4ZWNQcm9ncmFtLFxuICB9KTtcbiAgY29sb3JzLmRpc2FibGUoKTtcbiAgY29uc29sZS5kZWJ1ZygnbG9hZGluZyBwbHVnaW5zJyk7XG5cbiAgZnVuY3Rpb24gbG9hZFBsdWdpbnMoLi4uc2V0dGluZ3M6IGFueVtdKSB7XG4gICAgY29uc3QgbG9hZGVkID0gbmV3IFNldCgpO1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNldHRpbmdzKSB7XG4gICAgICBjb25zdCBwbHVnaW5zID0gc291cmNlLmdldChbJ3BsdWdpbiddKSB8fCBbXTtcbiAgICAgIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSB0cnlSZXNvbHZlKHBsdWdpbik7XG4gICAgICAgIGlmIChsb2FkZWQuaGFzKHJlc29sdmVkKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYExvYWRpbmcgcGx1Zy1pbjogJHtwbHVnaW59IGZyb20gJHtyZXNvbHZlZH1gKTtcblxuICAgICAgICBQbHVnaW5Ib3N0Lmluc3RhbmNlLmxvYWQocGx1Z2luKTtcblxuICAgICAgICBsb2FkZWQuYWRkKHJlc29sdmVkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdHJ5UmVzb2x2ZShwbHVnaW46IHN0cmluZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUucmVzb2x2ZShwbHVnaW4pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byByZXNvbHZlIHBsdWctaW46ICR7cGx1Z2lufWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBsb2FkUGx1Z2lucyhjb25maWd1cmF0aW9uLnNldHRpbmdzKTtcblxuICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ3VzdG9tQ2RrVG9vbGtpdCcpO1xuICByZXR1cm4gbmV3IEN1c3RvbUNka1Rvb2xraXQoe1xuICAgIGNsb3VkRXhlY3V0YWJsZSxcbiAgICBjbG91ZEZvcm1hdGlvbixcbiAgICBjb25maWd1cmF0aW9uLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgIGlnbm9yZUVycm9yczogZmFsc2UsXG4gICAgc3RyaWN0OiB0cnVlLFxuICB9KTtcbn07XG4iXX0=