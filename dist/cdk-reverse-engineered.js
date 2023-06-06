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
const bootstrapCdkToolkit = async () => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QseURBR2lDO0FBQ2pDLG1EQUFxRDtBQUNyRCx1REFBdUQ7QUFDdkQsNkVBQXlFO0FBQ3pFLHFEQUF5RDtBQUN6RCxtREFBb0Q7QUFDcEQsc0NBQXNDO0FBSXRDLDJCQUEyQjtBQUMzQixvQ0FBb0M7QUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxDQUN4QixJQUE2QixFQUNKLEVBQUU7SUFDM0IsOERBQThEO0lBQzlELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBSSxNQUFNLENBQUMsZUFBZSxLQUFLLG9CQUFvQixFQUFFO2dCQUNuRCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsSUFBSSxNQUFNLENBQUMsZUFBZSxLQUFLLG9CQUFvQixFQUFFO2dCQUNuRCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDLENBQUM7QUFFRiwyQkFBMkI7QUFDM0IsNEVBQTRFO0FBQzVFOztHQUVHO0FBQ0gsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLGdCQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFO0lBQzVFLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FDbkIsMkJBQTJCLEVBQzNCLENBQUMsTUFBVyxFQUFFLEtBQVUsRUFBRSxNQUFXLEVBQUUs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QUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXBDLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUMvQyxNQUFNLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixFQUFFLEdBQUcsaUNBQWlDLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEcsT0FBTyxJQUFJLGdCQUFnQixDQUFDO1FBQzFCLGVBQWU7UUFDZixhQUFhO1FBQ2IsV0FBVztRQUNYLHlCQUF5QjtRQUN6QixDQUFDLHlCQUF5QixDQUFDLEVBQUUsV0FBVztRQUN4QyxPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLE1BQU0sRUFBRSxJQUFJO0tBQ04sQ0FBQyxDQUFDO0FBQ1osQ0FBQyxDQUFDO0FBbEVXLFFBQUEsbUJBQW1CLHVCQWtFOUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZm5EaWZmIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYnO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSAnQGF3cy1jZGsvY3gtYXBpJztcbmltcG9ydCAqIGFzIGN4c2NoZW1hIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkLWFzc2VtYmx5LXNjaGVtYSc7XG5pbXBvcnQge1xuICBDZGtUb29sa2l0LFxuICBEaWZmT3B0aW9ucyxcbn0gZnJvbSAnYXdzLWNkay9saWIvY2RrLXRvb2xraXQnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJ2F3cy1jZGsvbGliL3NldHRpbmdzJztcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2F3cy1hdXRoJztcbmltcG9ydCB7IENsb3VkRXhlY3V0YWJsZSB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9jeGFwcC9jbG91ZC1leGVjdXRhYmxlJztcbmltcG9ydCB7IGV4ZWNQcm9ncmFtIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2N4YXBwL2V4ZWMnO1xuaW1wb3J0IHsgUGx1Z2luSG9zdCB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9wbHVnaW4nO1xuaW1wb3J0ICogYXMgY29sb3JzIGZyb20gJ2NvbG9ycy9zYWZlJztcblxuaW1wb3J0IHsgQ2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCwgQ3VzdG9tQ2RrVG9vbGtpdFByb3BzLCBTdGFja1Jhd0RpZmYgfSBmcm9tICcuL3R5cGVzJztcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBhd3MtY2RrL2xpYi9kaWZmIChwcmludFN0YWNrRGlmZilcbmNvbnN0IGZpbHRlckNES01ldGFkYXRhID0gKFxuICBkaWZmOiBTdGFja1Jhd0RpZmZbJ3Jhd0RpZmYnXVxuKTogU3RhY2tSYXdEaWZmWydyYXdEaWZmJ10gPT4ge1xuICAvLyBmaWx0ZXIgb3V0ICdBV1M6OkNESzo6TWV0YWRhdGEnIHJlc291cmNlcyBmcm9tIHRoZSB0ZW1wbGF0ZVxuICBpZiAoZGlmZi5yZXNvdXJjZXMpIHtcbiAgICBkaWZmLnJlc291cmNlcyA9IGRpZmYucmVzb3VyY2VzLmZpbHRlcigoY2hhbmdlKSA9PiB7XG4gICAgICBpZiAoIWNoYW5nZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2UubmV3UmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlLm9sZFJlc291cmNlVHlwZSA9PT0gJ0FXUzo6Q0RLOjpNZXRhZGF0YScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gZGlmZjtcbn07XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuLyoqXG4gKiBTdWJzdGl0dXRlIGFsbCBzdHJpbmdzIGxpa2UgJHtMb2dJZC54eHh9IHdpdGggdGhlIHBhdGggaW5zdGVhZCBvZiB0aGUgbG9naWNhbCBJRFxuICovXG5jb25zdCBzdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyA9IChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChzb3VyY2U6IGFueSkgPT4ge1xuICByZXR1cm4gc291cmNlLnJlcGxhY2UoXG4gICAgL1xcJFxceyhbXi59XSspKC5bXn1dKyk/XFx9L2dpLFxuICAgIChfbWF0Y2g6IGFueSwgbG9nSWQ6IGFueSwgc3VmZml4OiBhbnkpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICckeycgK1xuICAgICAgICAobm9ybWFsaXplZExvZ2ljYWxJZFBhdGgobG9naWNhbFRvUGF0aE1hcCkobG9nSWQpIHx8IGxvZ0lkKSArXG4gICAgICAgIChzdWZmaXggfHwgJycpICtcbiAgICAgICAgJ30nXG4gICAgICApO1xuICAgIH1cbiAgKTtcbn07XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuZXhwb3J0IGNvbnN0IGRlZXBTdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyA9XG4gIChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChyb3dzOiBhbnkpID0+IHtcbiAgICByZXR1cm4gcm93cy5tYXAoKHJvdzogYW55W10pID0+XG4gICAgICByb3cubWFwKHN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzKGxvZ2ljYWxUb1BhdGhNYXApKVxuICAgICk7XG4gIH07XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuY29uc3Qgbm9ybWFsaXplZExvZ2ljYWxJZFBhdGggPSAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAobG9naWNhbElkOiBhbnkpID0+IHtcbiAgLy8gaWYgd2UgaGF2ZSBhIHBhdGggaW4gdGhlIG1hcCwgcmV0dXJuIGl0XG4gIGNvbnN0IHBhdGggPSBsb2dpY2FsVG9QYXRoTWFwW2xvZ2ljYWxJZF07XG4gIHJldHVybiBwYXRoID8gbm9ybWFsaXplUGF0aChwYXRoKSA6IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIFBhdGggaXMgc3VwcG9zZWQgdG8gc3RhcnQgd2l0aCBcIi9zdGFjay1uYW1lXCIuIElmIHRoaXMgaXMgdGhlIGNhc2UgKGkuZS4gcGF0aCBoYXMgbW9yZSB0aGFuXG4gICAqIHR3byBjb21wb25lbnRzLCB3ZSByZW1vdmUgdGhlIGZpcnN0IHBhcnQuIE90aGVyd2lzZSwgd2UganVzdCB1c2UgdGhlIGZ1bGwgcGF0aC5cbiAgICogQHBhcmFtIHBcbiAgICovXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVBhdGgocDogc3RyaW5nKSB7XG4gICAgaWYgKHAuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBwID0gcC5zdWJzdHIoMSk7XG4gICAgfVxuICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoJy8nKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgxKTtcbiAgICAgIC8vIHJlbW92ZSB0aGUgbGFzdCBjb21wb25lbnQgaWYgaXQncyBcIlJlc291cmNlXCIgb3IgXCJEZWZhdWx0XCIgKGlmIHdlIGhhdmUgbW9yZSB0aGFuIGEgc2luZ2xlIGNvbXBvbmVudClcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3QgPT09ICdSZXNvdXJjZScgfHwgbGFzdCA9PT0gJ0RlZmF1bHQnKSB7XG4gICAgICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgwLCBwYXJ0cy5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcCA9IHBhcnRzLmpvaW4oJy8nKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cbn07XG5cbi8vIGNvcGllZCBmcm9tXG4vLyBhd3MtY2RrL2xpYi9kaWZmIChmdW5jdGlvbiBub3QgZXhwb3J0ZWQpXG5jb25zdCBidWlsZExvZ2ljYWxUb1BhdGhNYXAgPSAoXG4gIHN0YWNrOiBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Rcbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPT4ge1xuICBjb25zdCBtYXA6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgZm9yIChjb25zdCBtZCBvZiBzdGFjay5maW5kTWV0YWRhdGFCeVR5cGUoXG4gICAgY3hzY2hlbWEuQXJ0aWZhY3RNZXRhZGF0YUVudHJ5VHlwZS5MT0dJQ0FMX0lEXG4gICkpIHtcbiAgICBtYXBbbWQuZGF0YSBhcyBzdHJpbmddID0gbWQucGF0aDtcbiAgfVxuICByZXR1cm4gbWFwO1xufTtcblxuY2xhc3MgQ3VzdG9tQ2RrVG9vbGtpdCBleHRlbmRzIENka1Rvb2xraXQge1xuICBwcml2YXRlIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3A6IEN1c3RvbUNka1Rvb2xraXRQcm9wc1snY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCddO1xuICBjb25zdHJ1Y3Rvcih7IGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AsIC4uLnByb3BzIH06IEN1c3RvbUNka1Rvb2xraXRQcm9wcykge1xuICAgIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDdXN0b21DZGtUb29sa2l0IHN1cGVyIGNsYXNzJyk7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCA9IGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3A7XG4gIH1cblxuICAvLyBtZXRob2QgaXMgcmV2ZXJzZSBlbmdpbmVlcmVkIGJhc2VkIG9uIENka1Rvb2tpdC5kaWZmIG1ldGhvZCBidXQgcmV0dXJucyBhIGRpZmYgc3RydWN0dXJlXG4gIC8vIHdoZXJlIGRpZmYgb3V0cHV0cyBmb3JtYXR0ZWQgZGlmZiB0byBhIHN0cmVhbSAoaWUuIHN0ZGVycilcbiAgYXN5bmMgZ2V0RGlmZk9iamVjdChvcHRpb25zOiBEaWZmT3B0aW9ucyk6IFByb21pc2U8U3RhY2tSYXdEaWZmW10+IHtcbiAgICBjb25zb2xlLmRlYnVnKCdzZWxlY3RTdGFja3NGb3JEaWZmJyk7XG4gICAgY29uc3Qgc3RhY2tzID0gYXdhaXQgKHRoaXMgYXMgYW55KS5zZWxlY3RTdGFja3NGb3JEaWZmKFxuICAgICAgb3B0aW9ucy5zdGFja05hbWVzLFxuICAgICAgb3B0aW9ucy5leGNsdXNpdmVseVxuICAgICk7XG4gICAgbGV0IGRpZmZzOiBTdGFja1Jhd0RpZmZbXSA9IFtdO1xuICAgIGlmIChvcHRpb25zLnRlbXBsYXRlUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzaW5nIHRlbXBsYXRlIG5vdCBzdXBwb3J0ZWQgYnkgZ2V0RGlmZk9iamVjdCcpO1xuICAgIH1cblxuICAgIC8vIENvbXBhcmUgTiBzdGFja3MgYWdhaW5zdCBkZXBsb3llZCB0ZW1wbGF0ZXNcbiAgICBmb3IgKGNvbnN0IHN0YWNrIG9mIHN0YWNrcy5zdGFja0FydGlmYWN0cykge1xuICAgICAgY29uc29sZS5kZWJ1ZyhgcmVhZEN1cnJlbnRUZW1wbGF0ZSBmb3Igc3RhY2s6ICR7c3RhY2suZGlzcGxheU5hbWV9YCk7XG4gICAgICAvLyB0aGlzIGlzIHBvb3AsIGJ1dCBjYW4ndCBzZWUgYW5vdGhlciB3YXk/IFxuICAgICAgLy8gKiBQcm9wZXJ0eSAncHJvcHMnIGlzIHByaXZhdGUgYW5kIG9ubHkgYWNjZXNzaWJsZSB3aXRoaW4gY2xhc3MgJ0Nka1Rvb2xraXQnXG4gICAgICAvLyAqIHJlY2VudCB2ZXJzaW9uIG9mIGF3cy1jZGsgKH4yLjgyLjApIGhhcyBjaGFuZ2VkIENka1Rvb2xraXRQcm9wc1snY2xvdWRGb3JtYXRpb24nXSAtPiBDZGtUb29sa2l0UHJvcHNbJ2RlcGxveW1lbnRzJ11cbiAgICAgIGNvbnN0IGN1cnJlbnRUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgKHRoaXMgYXMgYW55KS5wcm9wc1xuICAgICAgKVt0aGlzLmNka1Rvb2xraXREZXBsb3ltZW50c1Byb3BdLnJlYWRDdXJyZW50VGVtcGxhdGUoc3RhY2spO1xuICAgICAgY29uc29sZS5kZWJ1ZygnY2xvdWRmb3JtYXRpb24gZGlmZiB0aGUgc3RhY2snKTtcbiAgICAgIGRpZmZzLnB1c2goe1xuICAgICAgICBzdGFja05hbWU6IHN0YWNrLmRpc3BsYXlOYW1lLFxuICAgICAgICByYXdEaWZmOiBmaWx0ZXJDREtNZXRhZGF0YShcbiAgICAgICAgICBjZm5EaWZmLmRpZmZUZW1wbGF0ZShjdXJyZW50VGVtcGxhdGUsIHN0YWNrLnRlbXBsYXRlKVxuICAgICAgICApLFxuICAgICAgICBsb2dpY2FsVG9QYXRoTWFwOiBidWlsZExvZ2ljYWxUb1BhdGhNYXAoc3RhY2spLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpZmZzO1xuICB9XG59XG5cbmNvbnN0IGR5bmFtaWNhbGx5SW5zdGFudGlhdGVEZXBsb3ltZW50cyA9IChzZGtQcm92aWRlcjogU2RrUHJvdmlkZXIpID0+IHtcbiAgbGV0IERlcGxveW1lbnRzO1xuICBsZXQgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcDogQ2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCA9ICdkZXBsb3ltZW50cyc7XG5cbiAgdHJ5IHtcbiAgICBEZXBsb3ltZW50cyA9IHJlcXVpcmUoJ2F3cy1jZGsvbGliL2FwaS9kZXBsb3ltZW50cycpLkRlcGxveW1lbnRzO1xuICB9IGNhdGNoKGVycikge1xuICAgIERlcGxveW1lbnRzID0gcmVxdWlyZSgnYXdzLWNkay9saWIvYXBpL2Nsb3VkZm9ybWF0aW9uLWRlcGxveW1lbnRzJykuQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cztcbiAgICBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wID0gJ2Nsb3VkRm9ybWF0aW9uJztcbiAgfVxuXG4gIGNvbnN0IGRlcGxveW1lbnRzID0gbmV3IERlcGxveW1lbnRzKHsgc2RrUHJvdmlkZXIgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBkZXBsb3ltZW50cyxcbiAgICBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wLFxuICB9XG59XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tIG5vZGVfbW9kdWxlcy9hd3MtY2RrL2Jpbi9jZGsuanNcbmV4cG9ydCBjb25zdCBib290c3RyYXBDZGtUb29sa2l0ID0gYXN5bmMgKCk6IFByb21pc2U8Q3VzdG9tQ2RrVG9vbGtpdD4gPT4ge1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIGNvbmZpZ3VyYXRpb24nKTtcbiAgY29uc3QgY29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKCk7XG4gIC8vIHtcbiAgLy8gICBfOiBbJ2RpZmYnIGFzIGFueV0sXG4gIC8vICAgJ25vLWNvbG9yJzogdHJ1ZVxuICAvLyB9XG4gIGF3YWl0IGNvbmZpZ3VyYXRpb24ubG9hZCgpO1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIHNkayBwcm92aWRlcicpO1xuICBjb25zdCBzZGtQcm92aWRlciA9IGF3YWl0IFNka1Byb3ZpZGVyLndpdGhBd3NDbGlDb21wYXRpYmxlRGVmYXVsdHMoe1xuICAgIC8vIHByb2ZpbGU6IGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZ2V0KFsncHJvZmlsZSddKSxcbiAgfSk7XG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDbG91ZEV4ZWN1dGFibGUnKTtcbiAgY29uc3QgY2xvdWRFeGVjdXRhYmxlID0gbmV3IENsb3VkRXhlY3V0YWJsZSh7XG4gICAgY29uZmlndXJhdGlvbixcbiAgICBzZGtQcm92aWRlcixcbiAgICAvLyBleGVjUHJvZ3JhbSByZXR1cm4gdHlwZSBjaGFuZ2VkIGluIGF3cy1jZGsgdjIuNjEuMCwgXG4gICAgLy8gdGhlcmVmb3JlIGNoZWNrIGlmIGV4ZWNQcm9ncmFtIHJldHVybmVkXG4gICAgLy8gb2JqZWN0IGNvbnRhaW5zIGBhc3NlbWJseWAgcHJvcCwgaWYgc28gdGhlbiByZXR1cm4gaXRcbiAgICBzeW50aGVzaXplcjogYXN5bmMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGV4ZWNQcm9ncmFtPikgPT4ge1xuICAgICAgY29uc3QgZXhlY1Byb2dyYW1SZXN1bHQgPSBhd2FpdCBleGVjUHJvZ3JhbSguLi5hcmdzKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIChleGVjUHJvZ3JhbVJlc3VsdCBhcyBhbnkpLmFzc2VtYmx5IHx8IGV4ZWNQcm9ncmFtUmVzdWx0O1xuICAgIH0sXG4gIH0pO1xuICBjb2xvcnMuZGlzYWJsZSgpO1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIHBsdWdpbnMnKTtcblxuICBmdW5jdGlvbiBsb2FkUGx1Z2lucyguLi5zZXR0aW5nczogYW55W10pIHtcbiAgICBjb25zdCBsb2FkZWQgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IHBsdWdpbnMgPSBzb3VyY2UuZ2V0KFsncGx1Z2luJ10pIHx8IFtdO1xuICAgICAgZm9yIChjb25zdCBwbHVnaW4gb2YgcGx1Z2lucykge1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHRyeVJlc29sdmUocGx1Z2luKTtcbiAgICAgICAgaWYgKGxvYWRlZC5oYXMocmVzb2x2ZWQpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgTG9hZGluZyBwbHVnLWluOiAke3BsdWdpbn0gZnJvbSAke3Jlc29sdmVkfWApO1xuXG4gICAgICAgIFBsdWdpbkhvc3QuaW5zdGFuY2UubG9hZChwbHVnaW4pO1xuXG4gICAgICAgIGxvYWRlZC5hZGQocmVzb2x2ZWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB0cnlSZXNvbHZlKHBsdWdpbjogc3RyaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcmVxdWlyZS5yZXNvbHZlKHBsdWdpbik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgcGx1Zy1pbjogJHtwbHVnaW59YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGxvYWRQbHVnaW5zKGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MpO1xuXG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDdXN0b21DZGtUb29sa2l0Jyk7XG4gIGNvbnN0IHsgZGVwbG95bWVudHMsIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AgfSA9IGR5bmFtaWNhbGx5SW5zdGFudGlhdGVEZXBsb3ltZW50cyhzZGtQcm92aWRlcik7XG4gIHJldHVybiBuZXcgQ3VzdG9tQ2RrVG9vbGtpdCh7XG4gICAgY2xvdWRFeGVjdXRhYmxlLFxuICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCxcbiAgICBbY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcF06IGRlcGxveW1lbnRzLFxuICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgIGlnbm9yZUVycm9yczogZmFsc2UsXG4gICAgc3RyaWN0OiB0cnVlLFxuICB9IGFzIGFueSk7XG59O1xuIl19