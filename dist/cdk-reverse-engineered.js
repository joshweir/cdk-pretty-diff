"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapCdkToolkit = exports.deepSubstituteBracedLogicalIds = void 0;
const cfnDiff = require("@aws-cdk/cloudformation-diff");
const cxschema = require("@aws-cdk/cloud-assembly-schema");
const cdk_toolkit_1 = require("aws-cdk/lib/cdk-toolkit");
const settings_1 = require("aws-cdk/lib/settings");
const aws_auth_1 = require("aws-cdk/lib/api/aws-auth");
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
class CustomCdkToolkit extends cdk_toolkit_1.CdkToolkit {
    constructor({ cdkToolkitDeploymentsProp, ...props }) {
        console.debug('initializing CustomCdkToolkit super class');
        super(props);
        this.cdkToolkitDeploymentsProp = cdkToolkitDeploymentsProp;
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
            // this is poop, but can't see another way? 
            // * Property 'props' is private and only accessible within class 'CdkToolkit'
            // * recent version of aws-cdk (~2.82.0) has changed CdkToolkitProps['cloudFormation'] -> CdkToolkitProps['deployments']
            const currentTemplate = await (this.props)[this.cdkToolkitDeploymentsProp].readCurrentTemplate(stack);
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
    const deployments = new Deployments({ sdkProvider });
    return {
        deployments,
        cdkToolkitDeploymentsProp,
    };
};
// reverse engineered from node_modules/aws-cdk/bin/cdk.js
const bootstrapCdkToolkit = async (configProps) => {
    console.debug('loading configuration');
    const configuration = new settings_1.Configuration(configProps);
    // {
    //   _: ['diff' as any],
    //   'no-color': true
    // }
    await configuration.load();
    console.debug('loading sdk provider');
    const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
    // profile: configuration.settings.get(['profile']),
    });
    console.debug('initializing CloudExecutable');
    const cloudExecutable = new cloud_executable_1.CloudExecutable({
        configuration,
        sdkProvider,
        // execProgram return type changed in aws-cdk v2.61.0, 
        // therefore check if execProgram returned
        // object contains `assembly` prop, if so then return it
        synthesizer: async (...args) => {
            const execProgramResult = await (0, exec_1.execProgram)(...args);
            return execProgramResult.assembly || execProgramResult;
        },
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
    const { deployments, cdkToolkitDeploymentsProp } = dynamicallyInstantiateDeployments(sdkProvider);
    return new CustomCdkToolkit({
        cloudExecutable,
        configuration,
        sdkProvider,
        cdkToolkitDeploymentsProp,
        [cdkToolkitDeploymentsProp]: deployments,
        verbose: false,
        ignoreErrors: false,
        strict: true,
    });
};
exports.bootstrapCdkToolkit = bootstrapCdkToolkit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QseURBR2lDO0FBQ2pDLG1EQUF5RTtBQUN6RSx1REFBdUQ7QUFDdkQsNkVBQXlFO0FBQ3pFLHFEQUF5RDtBQUN6RCxtREFBb0Q7QUFDcEQsc0NBQXNDO0FBSXRDLDJCQUEyQjtBQUMzQixvQ0FBb0M7QUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxDQUN4QixJQUE2QixFQUNKLEVBQUU7SUFDM0IsOERBQThEO0lBQzlELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBSSxNQUFNLENBQUMsZUFBZSxLQUFLLG9CQUFvQixFQUFFO2dCQUNuRCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsSUFBSSxNQUFNLENBQUMsZUFBZSxLQUFLLG9CQUFvQixFQUFFO2dCQUNuRCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDLENBQUM7QUFFRiwyQkFBMkI7QUFDM0IsNEVBQTRFO0FBQzVFOztHQUVHO0FBQ0gsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLGdCQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFO0lBQzVFLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FDbkIsMkJBQTJCLEVBQzNCLENBQUMsTUFBVyxFQUFFLEtBQVUsRUFBRSxNQUFXLEVBQUUs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QUNILENBQUM7SUFDRCxXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXBDLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUMvQyxNQUFNLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixFQUFFLEdBQUcsaUNBQWlDLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEcsT0FBTyxJQUFJLGdCQUFnQixDQUFDO1FBQzFCLGVBQWU7UUFDZixhQUFhO1FBQ2IsV0FBVztRQUNYLHlCQUF5QjtRQUN6QixDQUFDLHlCQUF5QixDQUFDLEVBQUUsV0FBVztRQUN4QyxPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLE1BQU0sRUFBRSxJQUFJO0tBQ04sQ0FBQyxDQUFDO0FBQ1osQ0FBQyxDQUFDO0FBbEVXLFFBQUEsbUJBQW1CLHVCQWtFOUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZm5EaWZmIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYnO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSAnQGF3cy1jZGsvY3gtYXBpJztcbmltcG9ydCAqIGFzIGN4c2NoZW1hIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkLWFzc2VtYmx5LXNjaGVtYSc7XG5pbXBvcnQge1xuICBDZGtUb29sa2l0LFxuICBEaWZmT3B0aW9ucyxcbn0gZnJvbSAnYXdzLWNkay9saWIvY2RrLXRvb2xraXQnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiwgQ29uZmlndXJhdGlvblByb3BzIH0gZnJvbSAnYXdzLWNkay9saWIvc2V0dGluZ3MnO1xuaW1wb3J0IHsgU2RrUHJvdmlkZXIgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvYXdzLWF1dGgnO1xuaW1wb3J0IHsgQ2xvdWRFeGVjdXRhYmxlIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2N4YXBwL2Nsb3VkLWV4ZWN1dGFibGUnO1xuaW1wb3J0IHsgZXhlY1Byb2dyYW0gfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvY3hhcHAvZXhlYyc7XG5pbXBvcnQgeyBQbHVnaW5Ib3N0IH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL3BsdWdpbic7XG5pbXBvcnQgKiBhcyBjb2xvcnMgZnJvbSAnY29sb3JzL3NhZmUnO1xuXG5pbXBvcnQgeyBDZGtUb29sa2l0RGVwbG95bWVudHNQcm9wLCBDdXN0b21DZGtUb29sa2l0UHJvcHMsIFN0YWNrUmF3RGlmZiB9IGZyb20gJy4vdHlwZXMnO1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIGF3cy1jZGsvbGliL2RpZmYgKHByaW50U3RhY2tEaWZmKVxuY29uc3QgZmlsdGVyQ0RLTWV0YWRhdGEgPSAoXG4gIGRpZmY6IFN0YWNrUmF3RGlmZlsncmF3RGlmZiddXG4pOiBTdGFja1Jhd0RpZmZbJ3Jhd0RpZmYnXSA9PiB7XG4gIC8vIGZpbHRlciBvdXQgJ0FXUzo6Q0RLOjpNZXRhZGF0YScgcmVzb3VyY2VzIGZyb20gdGhlIHRlbXBsYXRlXG4gIGlmIChkaWZmLnJlc291cmNlcykge1xuICAgIGRpZmYucmVzb3VyY2VzID0gZGlmZi5yZXNvdXJjZXMuZmlsdGVyKChjaGFuZ2UpID0+IHtcbiAgICAgIGlmICghY2hhbmdlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZS5uZXdSZXNvdXJjZVR5cGUgPT09ICdBV1M6OkNESzo6TWV0YWRhdGEnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2Uub2xkUmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBkaWZmO1xufTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG4vKipcbiAqIFN1YnN0aXR1dGUgYWxsIHN0cmluZ3MgbGlrZSAke0xvZ0lkLnh4eH0gd2l0aCB0aGUgcGF0aCBpbnN0ZWFkIG9mIHRoZSBsb2dpY2FsIElEXG4gKi9cbmNvbnN0IHN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHNvdXJjZTogYW55KSA9PiB7XG4gIHJldHVybiBzb3VyY2UucmVwbGFjZShcbiAgICAvXFwkXFx7KFteLn1dKykoLltefV0rKT9cXH0vZ2ksXG4gICAgKF9tYXRjaDogYW55LCBsb2dJZDogYW55LCBzdWZmaXg6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgJyR7JyArXG4gICAgICAgIChub3JtYWxpemVkTG9naWNhbElkUGF0aChsb2dpY2FsVG9QYXRoTWFwKShsb2dJZCkgfHwgbG9nSWQpICtcbiAgICAgICAgKHN1ZmZpeCB8fCAnJykgK1xuICAgICAgICAnfSdcbiAgICAgICk7XG4gICAgfVxuICApO1xufTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5leHBvcnQgY29uc3QgZGVlcFN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID1cbiAgKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHJvd3M6IGFueSkgPT4ge1xuICAgIHJldHVybiByb3dzLm1hcCgocm93OiBhbnlbXSkgPT5cbiAgICAgIHJvdy5tYXAoc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMobG9naWNhbFRvUGF0aE1hcCkpXG4gICAgKTtcbiAgfTtcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5jb25zdCBub3JtYWxpemVkTG9naWNhbElkUGF0aCA9IChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChsb2dpY2FsSWQ6IGFueSkgPT4ge1xuICAvLyBpZiB3ZSBoYXZlIGEgcGF0aCBpbiB0aGUgbWFwLCByZXR1cm4gaXRcbiAgY29uc3QgcGF0aCA9IGxvZ2ljYWxUb1BhdGhNYXBbbG9naWNhbElkXTtcbiAgcmV0dXJuIHBhdGggPyBub3JtYWxpemVQYXRoKHBhdGgpIDogdW5kZWZpbmVkO1xuICAvKipcbiAgICogUGF0aCBpcyBzdXBwb3NlZCB0byBzdGFydCB3aXRoIFwiL3N0YWNrLW5hbWVcIi4gSWYgdGhpcyBpcyB0aGUgY2FzZSAoaS5lLiBwYXRoIGhhcyBtb3JlIHRoYW5cbiAgICogdHdvIGNvbXBvbmVudHMsIHdlIHJlbW92ZSB0aGUgZmlyc3QgcGFydC4gT3RoZXJ3aXNlLCB3ZSBqdXN0IHVzZSB0aGUgZnVsbCBwYXRoLlxuICAgKiBAcGFyYW0gcFxuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwOiBzdHJpbmcpIHtcbiAgICBpZiAocC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHAgPSBwLnN1YnN0cigxKTtcbiAgICB9XG4gICAgbGV0IHBhcnRzID0gcC5zcGxpdCgnLycpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDEpO1xuICAgICAgLy8gcmVtb3ZlIHRoZSBsYXN0IGNvbXBvbmVudCBpZiBpdCdzIFwiUmVzb3VyY2VcIiBvciBcIkRlZmF1bHRcIiAoaWYgd2UgaGF2ZSBtb3JlIHRoYW4gYSBzaW5nbGUgY29tcG9uZW50KVxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdCA9PT0gJ1Jlc291cmNlJyB8fCBsYXN0ID09PSAnRGVmYXVsdCcpIHtcbiAgICAgICAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDAsIHBhcnRzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwID0gcGFydHMuam9pbignLycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxufTtcblxuLy8gY29waWVkIGZyb21cbi8vIGF3cy1jZGsvbGliL2RpZmYgKGZ1bmN0aW9uIG5vdCBleHBvcnRlZClcbmNvbnN0IGJ1aWxkTG9naWNhbFRvUGF0aE1hcCA9IChcbiAgc3RhY2s6IGN4YXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdFxuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9PiB7XG4gIGNvbnN0IG1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICBmb3IgKGNvbnN0IG1kIG9mIHN0YWNrLmZpbmRNZXRhZGF0YUJ5VHlwZShcbiAgICBjeHNjaGVtYS5BcnRpZmFjdE1ldGFkYXRhRW50cnlUeXBlLkxPR0lDQUxfSURcbiAgKSkge1xuICAgIG1hcFttZC5kYXRhIGFzIHN0cmluZ10gPSBtZC5wYXRoO1xuICB9XG4gIHJldHVybiBtYXA7XG59O1xuXG5jbGFzcyBDdXN0b21DZGtUb29sa2l0IGV4dGVuZHMgQ2RrVG9vbGtpdCB7XG4gIHByaXZhdGUgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcDogQ3VzdG9tQ2RrVG9vbGtpdFByb3BzWydjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wJ107XG4gIGNvbnN0cnVjdG9yKHsgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCwgLi4ucHJvcHMgfTogQ3VzdG9tQ2RrVG9vbGtpdFByb3BzKSB7XG4gICAgY29uc29sZS5kZWJ1ZygnaW5pdGlhbGl6aW5nIEN1c3RvbUNka1Rvb2xraXQgc3VwZXIgY2xhc3MnKTtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5jZGtUb29sa2l0RGVwbG95bWVudHNQcm9wID0gY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcDtcbiAgfVxuXG4gIC8vIG1ldGhvZCBpcyByZXZlcnNlIGVuZ2luZWVyZWQgYmFzZWQgb24gQ2RrVG9va2l0LmRpZmYgbWV0aG9kIGJ1dCByZXR1cm5zIGEgZGlmZiBzdHJ1Y3R1cmVcbiAgLy8gd2hlcmUgZGlmZiBvdXRwdXRzIGZvcm1hdHRlZCBkaWZmIHRvIGEgc3RyZWFtIChpZS4gc3RkZXJyKVxuICBhc3luYyBnZXREaWZmT2JqZWN0KG9wdGlvbnM6IERpZmZPcHRpb25zKTogUHJvbWlzZTxTdGFja1Jhd0RpZmZbXT4ge1xuICAgIGNvbnNvbGUuZGVidWcoJ3NlbGVjdFN0YWNrc0ZvckRpZmYnKTtcbiAgICBjb25zdCBzdGFja3MgPSBhd2FpdCAodGhpcyBhcyBhbnkpLnNlbGVjdFN0YWNrc0ZvckRpZmYoXG4gICAgICBvcHRpb25zLnN0YWNrTmFtZXMsXG4gICAgICBvcHRpb25zLmV4Y2x1c2l2ZWx5XG4gICAgKTtcbiAgICBsZXQgZGlmZnM6IFN0YWNrUmF3RGlmZltdID0gW107XG4gICAgaWYgKG9wdGlvbnMudGVtcGxhdGVQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndXNpbmcgdGVtcGxhdGUgbm90IHN1cHBvcnRlZCBieSBnZXREaWZmT2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgLy8gQ29tcGFyZSBOIHN0YWNrcyBhZ2FpbnN0IGRlcGxveWVkIHRlbXBsYXRlc1xuICAgIGZvciAoY29uc3Qgc3RhY2sgb2Ygc3RhY2tzLnN0YWNrQXJ0aWZhY3RzKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKGByZWFkQ3VycmVudFRlbXBsYXRlIGZvciBzdGFjazogJHtzdGFjay5kaXNwbGF5TmFtZX1gKTtcbiAgICAgIC8vIHRoaXMgaXMgcG9vcCwgYnV0IGNhbid0IHNlZSBhbm90aGVyIHdheT8gXG4gICAgICAvLyAqIFByb3BlcnR5ICdwcm9wcycgaXMgcHJpdmF0ZSBhbmQgb25seSBhY2Nlc3NpYmxlIHdpdGhpbiBjbGFzcyAnQ2RrVG9vbGtpdCdcbiAgICAgIC8vICogcmVjZW50IHZlcnNpb24gb2YgYXdzLWNkayAofjIuODIuMCkgaGFzIGNoYW5nZWQgQ2RrVG9vbGtpdFByb3BzWydjbG91ZEZvcm1hdGlvbiddIC0+IENka1Rvb2xraXRQcm9wc1snZGVwbG95bWVudHMnXVxuICAgICAgY29uc3QgY3VycmVudFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAodGhpcyBhcyBhbnkpLnByb3BzXG4gICAgICApW3RoaXMuY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcF0ucmVhZEN1cnJlbnRUZW1wbGF0ZShzdGFjayk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdjbG91ZGZvcm1hdGlvbiBkaWZmIHRoZSBzdGFjaycpO1xuICAgICAgZGlmZnMucHVzaCh7XG4gICAgICAgIHN0YWNrTmFtZTogc3RhY2suZGlzcGxheU5hbWUsXG4gICAgICAgIHJhd0RpZmY6IGZpbHRlckNES01ldGFkYXRhKFxuICAgICAgICAgIGNmbkRpZmYuZGlmZlRlbXBsYXRlKGN1cnJlbnRUZW1wbGF0ZSwgc3RhY2sudGVtcGxhdGUpXG4gICAgICAgICksXG4gICAgICAgIGxvZ2ljYWxUb1BhdGhNYXA6IGJ1aWxkTG9naWNhbFRvUGF0aE1hcChzdGFjayksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlmZnM7XG4gIH1cbn1cblxuY29uc3QgZHluYW1pY2FsbHlJbnN0YW50aWF0ZURlcGxveW1lbnRzID0gKHNka1Byb3ZpZGVyOiBTZGtQcm92aWRlcikgPT4ge1xuICBsZXQgRGVwbG95bWVudHM7XG4gIGxldCBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wOiBDZGtUb29sa2l0RGVwbG95bWVudHNQcm9wID0gJ2RlcGxveW1lbnRzJztcblxuICB0cnkge1xuICAgIERlcGxveW1lbnRzID0gcmVxdWlyZSgnYXdzLWNkay9saWIvYXBpL2RlcGxveW1lbnRzJykuRGVwbG95bWVudHM7XG4gIH0gY2F0Y2goZXJyKSB7XG4gICAgRGVwbG95bWVudHMgPSByZXF1aXJlKCdhd3MtY2RrL2xpYi9hcGkvY2xvdWRmb3JtYXRpb24tZGVwbG95bWVudHMnKS5DbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzO1xuICAgIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AgPSAnY2xvdWRGb3JtYXRpb24nO1xuICB9XG5cbiAgY29uc3QgZGVwbG95bWVudHMgPSBuZXcgRGVwbG95bWVudHMoeyBzZGtQcm92aWRlciB9KTtcblxuICByZXR1cm4ge1xuICAgIGRlcGxveW1lbnRzLFxuICAgIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AsXG4gIH1cbn1cblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb20gbm9kZV9tb2R1bGVzL2F3cy1jZGsvYmluL2Nkay5qc1xuZXhwb3J0IGNvbnN0IGJvb3RzdHJhcENka1Rvb2xraXQgPSBhc3luYyAoY29uZmlnUHJvcHM/OiBDb25maWd1cmF0aW9uUHJvcHMpOiBQcm9taXNlPEN1c3RvbUNka1Rvb2xraXQ+ID0+IHtcbiAgY29uc29sZS5kZWJ1ZygnbG9hZGluZyBjb25maWd1cmF0aW9uJyk7XG4gIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbihjb25maWdQcm9wcyk7XG4gIC8vIHtcbiAgLy8gICBfOiBbJ2RpZmYnIGFzIGFueV0sXG4gIC8vICAgJ25vLWNvbG9yJzogdHJ1ZVxuICAvLyB9XG4gIGF3YWl0IGNvbmZpZ3VyYXRpb24ubG9hZCgpO1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIHNkayBwcm92aWRlcicpO1xuICBjb25zdCBzZGtQcm92aWRlciA9IGF3YWl0IFNka1Byb3ZpZGVyLndpdGhBd3NDbGlDb21wYXRpYmxlRGVmYXVsdHMoe1xuICAgIC8vIHByb2ZpbGU6IGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZ2V0KFsncHJvZmlsZSddKSxcbiAgfSk7XG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDbG91ZEV4ZWN1dGFibGUnKTtcbiAgY29uc3QgY2xvdWRFeGVjdXRhYmxlID0gbmV3IENsb3VkRXhlY3V0YWJsZSh7XG4gICAgY29uZmlndXJhdGlvbixcbiAgICBzZGtQcm92aWRlcixcbiAgICAvLyBleGVjUHJvZ3JhbSByZXR1cm4gdHlwZSBjaGFuZ2VkIGluIGF3cy1jZGsgdjIuNjEuMCwgXG4gICAgLy8gdGhlcmVmb3JlIGNoZWNrIGlmIGV4ZWNQcm9ncmFtIHJldHVybmVkXG4gICAgLy8gb2JqZWN0IGNvbnRhaW5zIGBhc3NlbWJseWAgcHJvcCwgaWYgc28gdGhlbiByZXR1cm4gaXRcbiAgICBzeW50aGVzaXplcjogYXN5bmMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGV4ZWNQcm9ncmFtPikgPT4ge1xuICAgICAgY29uc3QgZXhlY1Byb2dyYW1SZXN1bHQgPSBhd2FpdCBleGVjUHJvZ3JhbSguLi5hcmdzKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIChleGVjUHJvZ3JhbVJlc3VsdCBhcyBhbnkpLmFzc2VtYmx5IHx8IGV4ZWNQcm9ncmFtUmVzdWx0O1xuICAgIH0sXG4gIH0pO1xuICBjb2xvcnMuZGlzYWJsZSgpO1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIHBsdWdpbnMnKTtcblxuICBmdW5jdGlvbiBsb2FkUGx1Z2lucyguLi5zZXR0aW5nczogYW55W10pIHtcbiAgICBjb25zdCBsb2FkZWQgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IHBsdWdpbnMgPSBzb3VyY2UuZ2V0KFsncGx1Z2luJ10pIHx8IFtdO1xuICAgICAgZm9yIChjb25zdCBwbHVnaW4gb2YgcGx1Z2lucykge1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHRyeVJlc29sdmUocGx1Z2luKTtcbiAgICAgICAgaWYgKGxvYWRlZC5oYXMocmVzb2x2ZWQpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgTG9hZGluZyBwbHVnLWluOiAke3BsdWdpbn0gZnJvbSAke3Jlc29sdmVkfWApO1xuXG4gICAgICAgIFBsdWdpbkhvc3QuaW5zdGFuY2UubG9hZChwbHVnaW4pO1xuXG4gICAgICAgIGxvYWRlZC5hZGQocmVzb2x2ZWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB0cnlSZXNvbHZlKHBsdWdpbjogc3RyaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcmVxdWlyZS5yZXNvbHZlKHBsdWdpbik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgcGx1Zy1pbjogJHtwbHVnaW59YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGxvYWRQbHVnaW5zKGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MpO1xuXG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDdXN0b21DZGtUb29sa2l0Jyk7XG4gIGNvbnN0IHsgZGVwbG95bWVudHMsIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AgfSA9IGR5bmFtaWNhbGx5SW5zdGFudGlhdGVEZXBsb3ltZW50cyhzZGtQcm92aWRlcik7XG4gIHJldHVybiBuZXcgQ3VzdG9tQ2RrVG9vbGtpdCh7XG4gICAgY2xvdWRFeGVjdXRhYmxlLFxuICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCxcbiAgICBbY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcF06IGRlcGxveW1lbnRzLFxuICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgIGlnbm9yZUVycm9yczogZmFsc2UsXG4gICAgc3RyaWN0OiB0cnVlLFxuICB9IGFzIGFueSk7XG59O1xuIl19