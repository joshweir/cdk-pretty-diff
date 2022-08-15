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
const getPluginHost = async () => {
    try {
        // cdk 1 path
        console.log('Loading PluginHost from cdk1 path: aws-cdk/lib/plugin');
        const { PluginHost } = await Promise.resolve().then(() => require('aws-cdk/lib/plugin'));
        return PluginHost;
    }
    catch (err) {
        // cdk 2 path
        console.log('Unable to find PluginHost in cdk1 path');
        console.log('Loading PluginHost from cdk2 path: aws-cdk/lib/api/plugin');
        // @ts-ignore
        const { PluginHost } = await Promise.resolve().then(() => require('aws-cdk/lib/api/plugin'));
        return PluginHost;
    }
};
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
    const PluginHost = await getPluginHost();
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
                PluginHost.instance.load(plugin);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QseURBSWlDO0FBQ2pDLG1EQUFxRDtBQUNyRCx1REFBdUQ7QUFDdkQsMkZBQXVGO0FBQ3ZGLDZFQUF5RTtBQUN6RSxxREFBeUQ7QUFDekQsc0NBQXNDO0FBSXRDLE1BQU0sYUFBYSxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQy9CLElBQUk7UUFDRixhQUFhO1FBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRywyQ0FBYSxvQkFBb0IsRUFBQyxDQUFDO1FBQzFELE9BQU8sVUFBVSxDQUFDO0tBQ25CO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixhQUFhO1FBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQztRQUN6RSxhQUFhO1FBQ2IsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLDJDQUFhLHdCQUF3QixFQUFDLENBQUM7UUFDOUQsT0FBTyxVQUFVLENBQUM7S0FDbkI7QUFDSCxDQUFDLENBQUM7QUFFRiwyQkFBMkI7QUFDM0Isb0NBQW9DO0FBQ3BDLE1BQU0saUJBQWlCLEdBQUcsQ0FDeEIsSUFBNkIsRUFDSixFQUFFO0lBQzNCLDhEQUE4RDtJQUM5RCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNE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RUFBRSxJQUFJO0tBQ2IsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2ZuRGlmZiBmcm9tICdAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmJztcbmltcG9ydCAqIGFzIGN4YXBpIGZyb20gJ0Bhd3MtY2RrL2N4LWFwaSc7XG5pbXBvcnQgKiBhcyBjeHNjaGVtYSBmcm9tICdAYXdzLWNkay9jbG91ZC1hc3NlbWJseS1zY2hlbWEnO1xuaW1wb3J0IHtcbiAgQ2RrVG9vbGtpdCxcbiAgQ2RrVG9vbGtpdFByb3BzLFxuICBEaWZmT3B0aW9ucyxcbn0gZnJvbSAnYXdzLWNkay9saWIvY2RrLXRvb2xraXQnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJ2F3cy1jZGsvbGliL3NldHRpbmdzJztcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2F3cy1hdXRoJztcbmltcG9ydCB7IENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvY2xvdWRmb3JtYXRpb24tZGVwbG95bWVudHMnO1xuaW1wb3J0IHsgQ2xvdWRFeGVjdXRhYmxlIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2N4YXBwL2Nsb3VkLWV4ZWN1dGFibGUnO1xuaW1wb3J0IHsgZXhlY1Byb2dyYW0gfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvY3hhcHAvZXhlYyc7XG5pbXBvcnQgKiBhcyBjb2xvcnMgZnJvbSAnY29sb3JzL3NhZmUnO1xuXG5pbXBvcnQgeyBTdGFja1Jhd0RpZmYgfSBmcm9tICcuL3R5cGVzJztcblxuY29uc3QgZ2V0UGx1Z2luSG9zdCA9IGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBjZGsgMSBwYXRoXG4gICAgY29uc29sZS5sb2coJ0xvYWRpbmcgUGx1Z2luSG9zdCBmcm9tIGNkazEgcGF0aDogYXdzLWNkay9saWIvcGx1Z2luJyk7XG4gICAgY29uc3QgeyBQbHVnaW5Ib3N0IH0gPSBhd2FpdCBpbXBvcnQoJ2F3cy1jZGsvbGliL3BsdWdpbicpO1xuICAgIHJldHVybiBQbHVnaW5Ib3N0O1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBjZGsgMiBwYXRoXG4gICAgY29uc29sZS5sb2coJ1VuYWJsZSB0byBmaW5kIFBsdWdpbkhvc3QgaW4gY2RrMSBwYXRoJyk7XG4gICAgY29uc29sZS5sb2coJ0xvYWRpbmcgUGx1Z2luSG9zdCBmcm9tIGNkazIgcGF0aDogYXdzLWNkay9saWIvYXBpL3BsdWdpbicpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCB7IFBsdWdpbkhvc3QgfSA9IGF3YWl0IGltcG9ydCgnYXdzLWNkay9saWIvYXBpL3BsdWdpbicpO1xuICAgIHJldHVybiBQbHVnaW5Ib3N0O1xuICB9XG59O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIGF3cy1jZGsvbGliL2RpZmYgKHByaW50U3RhY2tEaWZmKVxuY29uc3QgZmlsdGVyQ0RLTWV0YWRhdGEgPSAoXG4gIGRpZmY6IFN0YWNrUmF3RGlmZlsncmF3RGlmZiddXG4pOiBTdGFja1Jhd0RpZmZbJ3Jhd0RpZmYnXSA9PiB7XG4gIC8vIGZpbHRlciBvdXQgJ0FXUzo6Q0RLOjpNZXRhZGF0YScgcmVzb3VyY2VzIGZyb20gdGhlIHRlbXBsYXRlXG4gIGlmIChkaWZmLnJlc291cmNlcykge1xuICAgIGRpZmYucmVzb3VyY2VzID0gZGlmZi5yZXNvdXJjZXMuZmlsdGVyKChjaGFuZ2UpID0+IHtcbiAgICAgIGlmICghY2hhbmdlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZS5uZXdSZXNvdXJjZVR5cGUgPT09ICdBV1M6OkNESzo6TWV0YWRhdGEnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2Uub2xkUmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBkaWZmO1xufTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG4vKipcbiAqIFN1YnN0aXR1dGUgYWxsIHN0cmluZ3MgbGlrZSAke0xvZ0lkLnh4eH0gd2l0aCB0aGUgcGF0aCBpbnN0ZWFkIG9mIHRoZSBsb2dpY2FsIElEXG4gKi9cbmNvbnN0IHN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHNvdXJjZTogYW55KSA9PiB7XG4gIHJldHVybiBzb3VyY2UucmVwbGFjZShcbiAgICAvXFwkXFx7KFteLn1dKykoLltefV0rKT9cXH0vZ2ksXG4gICAgKF9tYXRjaDogYW55LCBsb2dJZDogYW55LCBzdWZmaXg6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgJyR7JyArXG4gICAgICAgIChub3JtYWxpemVkTG9naWNhbElkUGF0aChsb2dpY2FsVG9QYXRoTWFwKShsb2dJZCkgfHwgbG9nSWQpICtcbiAgICAgICAgKHN1ZmZpeCB8fCAnJykgK1xuICAgICAgICAnfSdcbiAgICAgICk7XG4gICAgfVxuICApO1xufTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5leHBvcnQgY29uc3QgZGVlcFN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID1cbiAgKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHJvd3M6IGFueSkgPT4ge1xuICAgIHJldHVybiByb3dzLm1hcCgocm93OiBhbnlbXSkgPT5cbiAgICAgIHJvdy5tYXAoc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMobG9naWNhbFRvUGF0aE1hcCkpXG4gICAgKTtcbiAgfTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5jb25zdCBub3JtYWxpemVkTG9naWNhbElkUGF0aCA9IChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChsb2dpY2FsSWQ6IGFueSkgPT4ge1xuICAvLyBpZiB3ZSBoYXZlIGEgcGF0aCBpbiB0aGUgbWFwLCByZXR1cm4gaXRcbiAgY29uc3QgcGF0aCA9IGxvZ2ljYWxUb1BhdGhNYXBbbG9naWNhbElkXTtcbiAgcmV0dXJuIHBhdGggPyBub3JtYWxpemVQYXRoKHBhdGgpIDogdW5kZWZpbmVkO1xuICAvKipcbiAgICogUGF0aCBpcyBzdXBwb3NlZCB0byBzdGFydCB3aXRoIFwiL3N0YWNrLW5hbWVcIi4gSWYgdGhpcyBpcyB0aGUgY2FzZSAoaS5lLiBwYXRoIGhhcyBtb3JlIHRoYW5cbiAgICogdHdvIGNvbXBvbmVudHMsIHdlIHJlbW92ZSB0aGUgZmlyc3QgcGFydC4gT3RoZXJ3aXNlLCB3ZSBqdXN0IHVzZSB0aGUgZnVsbCBwYXRoLlxuICAgKiBAcGFyYW0gcFxuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwOiBzdHJpbmcpIHtcbiAgICBpZiAocC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHAgPSBwLnN1YnN0cigxKTtcbiAgICB9XG4gICAgbGV0IHBhcnRzID0gcC5zcGxpdCgnLycpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDEpO1xuICAgICAgLy8gcmVtb3ZlIHRoZSBsYXN0IGNvbXBvbmVudCBpZiBpdCdzIFwiUmVzb3VyY2VcIiBvciBcIkRlZmF1bHRcIiAoaWYgd2UgaGF2ZSBtb3JlIHRoYW4gYSBzaW5nbGUgY29tcG9uZW50KVxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdCA9PT0gJ1Jlc291cmNlJyB8fCBsYXN0ID09PSAnRGVmYXVsdCcpIHtcbiAgICAgICAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDAsIHBhcnRzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwID0gcGFydHMuam9pbignLycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxufTtcblxuLy8gY29waWVkIGZyb21cbi8vIGF3cy1jZGsvbGliL2RpZmYgKGZ1bmN0aW9uIG5vdCBleHBvcnRlZClcbmNvbnN0IGJ1aWxkTG9naWNhbFRvUGF0aE1hcCA9IChcbiAgc3RhY2s6IGN4YXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdFxuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9PiB7XG4gIGNvbnN0IG1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICBmb3IgKGNvbnN0IG1kIG9mIHN0YWNrLmZpbmRNZXRhZGF0YUJ5VHlwZShcbiAgICBjeHNjaGVtYS5BcnRpZmFjdE1ldGFkYXRhRW50cnlUeXBlLkxPR0lDQUxfSURcbiAgKSkge1xuICAgIG1hcFttZC5kYXRhIGFzIHN0cmluZ10gPSBtZC5wYXRoO1xuICB9XG4gIHJldHVybiBtYXA7XG59O1xuXG5jbGFzcyBDdXN0b21DZGtUb29sa2l0IGV4dGVuZHMgQ2RrVG9vbGtpdCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBDZGtUb29sa2l0UHJvcHMpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ3VzdG9tQ2RrVG9vbGtpdCBzdXBlciBjbGFzcycpO1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIC8vIG1ldGhvZCBpcyByZXZlcnNlIGVuZ2luZWVyZWQgYmFzZWQgb24gQ2RrVG9va2l0LmRpZmYgbWV0aG9kIGJ1dCByZXR1cm5zIGEgZGlmZiBzdHJ1Y3R1cmVcbiAgLy8gd2hlcmUgZGlmZiBvdXRwdXRzIGZvcm1hdHRlZCBkaWZmIHRvIGEgc3RyZWFtIChpZS4gc3RkZXJyKVxuICBhc3luYyBnZXREaWZmT2JqZWN0KG9wdGlvbnM6IERpZmZPcHRpb25zKTogUHJvbWlzZTxTdGFja1Jhd0RpZmZbXT4ge1xuICAgIGNvbnNvbGUuZGVidWcoJ3NlbGVjdFN0YWNrc0ZvckRpZmYnKTtcbiAgICBjb25zdCBzdGFja3MgPSBhd2FpdCAodGhpcyBhcyBhbnkpLnNlbGVjdFN0YWNrc0ZvckRpZmYoXG4gICAgICBvcHRpb25zLnN0YWNrTmFtZXMsXG4gICAgICBvcHRpb25zLmV4Y2x1c2l2ZWx5XG4gICAgKTtcbiAgICBsZXQgZGlmZnM6IFN0YWNrUmF3RGlmZltdID0gW107XG4gICAgaWYgKG9wdGlvbnMudGVtcGxhdGVQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndXNpbmcgdGVtcGxhdGUgbm90IHN1cHBvcnRlZCBieSBnZXREaWZmT2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgLy8gQ29tcGFyZSBOIHN0YWNrcyBhZ2FpbnN0IGRlcGxveWVkIHRlbXBsYXRlc1xuICAgIGZvciAoY29uc3Qgc3RhY2sgb2Ygc3RhY2tzLnN0YWNrQXJ0aWZhY3RzKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKGByZWFkQ3VycmVudFRlbXBsYXRlIGZvciBzdGFjazogJHtzdGFjay5kaXNwbGF5TmFtZX1gKTtcbiAgICAgIGNvbnN0IGN1cnJlbnRUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgKHRoaXMgYXMgYW55KS5wcm9wcyBhcyBDZGtUb29sa2l0UHJvcHNcbiAgICAgICkuY2xvdWRGb3JtYXRpb24ucmVhZEN1cnJlbnRUZW1wbGF0ZShzdGFjayk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdjbG91ZGZvcm1hdGlvbiBkaWZmIHRoZSBzdGFjaycpO1xuICAgICAgZGlmZnMucHVzaCh7XG4gICAgICAgIHN0YWNrTmFtZTogc3RhY2suZGlzcGxheU5hbWUsXG4gICAgICAgIHJhd0RpZmY6IGZpbHRlckNES01ldGFkYXRhKFxuICAgICAgICAgIGNmbkRpZmYuZGlmZlRlbXBsYXRlKGN1cnJlbnRUZW1wbGF0ZSwgc3RhY2sudGVtcGxhdGUpXG4gICAgICAgICksXG4gICAgICAgIGxvZ2ljYWxUb1BhdGhNYXA6IGJ1aWxkTG9naWNhbFRvUGF0aE1hcChzdGFjayksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlmZnM7XG4gIH1cbn1cblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb20gbm9kZV9tb2R1bGVzL2F3cy1jZGsvYmluL2Nkay5qc1xuZXhwb3J0IGNvbnN0IGJvb3RzdHJhcENka1Rvb2xraXQgPSBhc3luYyAoKTogUHJvbWlzZTxDdXN0b21DZGtUb29sa2l0PiA9PiB7XG4gIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgY29uZmlndXJhdGlvbicpO1xuICBjb25zdCBjb25maWd1cmF0aW9uID0gbmV3IENvbmZpZ3VyYXRpb24oKTtcbiAgLy8ge1xuICAvLyAgIF86IFsnZGlmZicgYXMgYW55XSxcbiAgLy8gICAnbm8tY29sb3InOiB0cnVlXG4gIC8vIH1cbiAgYXdhaXQgY29uZmlndXJhdGlvbi5sb2FkKCk7XG4gIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgc2RrIHByb3ZpZGVyJyk7XG4gIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgLy8gcHJvZmlsZTogY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXQoWydwcm9maWxlJ10pLFxuICB9KTtcbiAgY29uc29sZS5kZWJ1ZygnaW5pdGlhbGl6aW5nIENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMnKTtcbiAgY29uc3QgY2xvdWRGb3JtYXRpb24gPSBuZXcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyh7IHNka1Byb3ZpZGVyIH0pO1xuICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ2xvdWRFeGVjdXRhYmxlJyk7XG4gIGNvbnN0IGNsb3VkRXhlY3V0YWJsZSA9IG5ldyBDbG91ZEV4ZWN1dGFibGUoe1xuICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgc3ludGhlc2l6ZXI6IGV4ZWNQcm9ncmFtLFxuICB9KTtcbiAgY29sb3JzLmRpc2FibGUoKTtcbiAgY29uc29sZS5kZWJ1ZygnbG9hZGluZyBwbHVnaW5zJyk7XG5cbiAgY29uc3QgUGx1Z2luSG9zdCA9IGF3YWl0IGdldFBsdWdpbkhvc3QoKTtcblxuICBmdW5jdGlvbiBsb2FkUGx1Z2lucyguLi5zZXR0aW5nczogYW55W10pIHtcbiAgICBjb25zdCBsb2FkZWQgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IHBsdWdpbnMgPSBzb3VyY2UuZ2V0KFsncGx1Z2luJ10pIHx8IFtdO1xuICAgICAgZm9yIChjb25zdCBwbHVnaW4gb2YgcGx1Z2lucykge1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHRyeVJlc29sdmUocGx1Z2luKTtcbiAgICAgICAgaWYgKGxvYWRlZC5oYXMocmVzb2x2ZWQpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgTG9hZGluZyBwbHVnLWluOiAke3BsdWdpbn0gZnJvbSAke3Jlc29sdmVkfWApO1xuXG4gICAgICAgIFBsdWdpbkhvc3QuaW5zdGFuY2UubG9hZChwbHVnaW4pO1xuXG4gICAgICAgIGxvYWRlZC5hZGQocmVzb2x2ZWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB0cnlSZXNvbHZlKHBsdWdpbjogc3RyaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcmVxdWlyZS5yZXNvbHZlKHBsdWdpbik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgcGx1Zy1pbjogJHtwbHVnaW59YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGxvYWRQbHVnaW5zKGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MpO1xuXG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDdXN0b21DZGtUb29sa2l0Jyk7XG4gIHJldHVybiBuZXcgQ3VzdG9tQ2RrVG9vbGtpdCh7XG4gICAgY2xvdWRFeGVjdXRhYmxlLFxuICAgIGNsb3VkRm9ybWF0aW9uLFxuICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgdmVyYm9zZTogZmFsc2UsXG4gICAgaWdub3JlRXJyb3JzOiBmYWxzZSxcbiAgICBzdHJpY3Q6IHRydWUsXG4gIH0pO1xufTtcbiJdfQ==