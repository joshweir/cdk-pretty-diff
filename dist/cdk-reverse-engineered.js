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
const plugin_1 = require("aws-cdk/lib/plugin");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QseURBSWlDO0FBQ2pDLG1EQUFxRDtBQUNyRCx1REFBdUQ7QUFDdkQsMkZBQXVGO0FBQ3ZGLDZFQUF5RTtBQUN6RSxxREFBeUQ7QUFDekQsK0NBQWdEO0FBQ2hELHNDQUFzQztBQUl0QywyQkFBMkI7QUFDM0Isb0NBQW9DO0FBQ3BDLE1BQU0saUJBQWlCLEdBQUcsQ0FDeEIsSUFBNkIsRUFDSixFQUFFO0lBQzNCLDhEQUE4RDtJQUM5RCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxvQkFBb0IsRUFBRTtnQkFDbkQsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxvQkFBb0IsRUFBRTtnQkFDbkQsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUYsMkJBQTJCO0FBQzNCLDRFQUE0RTtBQUM1RTs7R0FFRztBQUNILE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxnQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtJQUM1RSxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQ25CLDJCQUEyQixFQUMzQixDQUFDLE1BQVcsRUFBRSxLQUFVLEVB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Q0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWpDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdEI7U0FDRjtRQUNELFNBQVMsVUFBVSxDQUFDLE1BQWM7WUFDaEMsSUFBSTtnQkFDRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEM7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3pEO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXBDLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUMvQyxPQUFPLElBQUksZ0JBQWdCLENBQUM7UUFDMUIsZUFBZTtRQUNmLGNBQWM7UUFDZCxhQUFhO1FBQ2IsV0FBVztRQUNYLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsTUFBTSxFQUFFLElBQUk7S0FDYixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZm5EaWZmIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYnO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSAnQGF3cy1jZGsvY3gtYXBpJztcbmltcG9ydCAqIGFzIGN4c2NoZW1hIGZyb20gJ0Bhd3MtY2RrL2Nsb3VkLWFzc2VtYmx5LXNjaGVtYSc7XG5pbXBvcnQge1xuICBDZGtUb29sa2l0LFxuICBDZGtUb29sa2l0UHJvcHMsXG4gIERpZmZPcHRpb25zLFxufSBmcm9tICdhd3MtY2RrL2xpYi9jZGstdG9vbGtpdCc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay9saWIvc2V0dGluZ3MnO1xuaW1wb3J0IHsgU2RrUHJvdmlkZXIgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvYXdzLWF1dGgnO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9jbG91ZGZvcm1hdGlvbi1kZXBsb3ltZW50cyc7XG5pbXBvcnQgeyBDbG91ZEV4ZWN1dGFibGUgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvY3hhcHAvY2xvdWQtZXhlY3V0YWJsZSc7XG5pbXBvcnQgeyBleGVjUHJvZ3JhbSB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9jeGFwcC9leGVjJztcbmltcG9ydCB7IFBsdWdpbkhvc3QgfSBmcm9tICdhd3MtY2RrL2xpYi9wbHVnaW4nO1xuaW1wb3J0ICogYXMgY29sb3JzIGZyb20gJ2NvbG9ycy9zYWZlJztcblxuaW1wb3J0IHsgU3RhY2tSYXdEaWZmIH0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gYXdzLWNkay9saWIvZGlmZiAocHJpbnRTdGFja0RpZmYpXG5jb25zdCBmaWx0ZXJDREtNZXRhZGF0YSA9IChcbiAgZGlmZjogU3RhY2tSYXdEaWZmWydyYXdEaWZmJ11cbik6IFN0YWNrUmF3RGlmZlsncmF3RGlmZiddID0+IHtcbiAgLy8gZmlsdGVyIG91dCAnQVdTOjpDREs6Ok1ldGFkYXRhJyByZXNvdXJjZXMgZnJvbSB0aGUgdGVtcGxhdGVcbiAgaWYgKGRpZmYucmVzb3VyY2VzKSB7XG4gICAgZGlmZi5yZXNvdXJjZXMgPSBkaWZmLnJlc291cmNlcy5maWx0ZXIoKGNoYW5nZSkgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlLm5ld1Jlc291cmNlVHlwZSA9PT0gJ0FXUzo6Q0RLOjpNZXRhZGF0YScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZS5vbGRSZXNvdXJjZVR5cGUgPT09ICdBV1M6OkNESzo6TWV0YWRhdGEnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGRpZmY7XG59O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbi8qKlxuICogU3Vic3RpdHV0ZSBhbGwgc3RyaW5ncyBsaWtlICR7TG9nSWQueHh4fSB3aXRoIHRoZSBwYXRoIGluc3RlYWQgb2YgdGhlIGxvZ2ljYWwgSURcbiAqL1xuY29uc3Qgc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMgPSAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAoc291cmNlOiBhbnkpID0+IHtcbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKFxuICAgIC9cXCRcXHsoW14ufV0rKSguW159XSspP1xcfS9naSxcbiAgICAoX21hdGNoOiBhbnksIGxvZ0lkOiBhbnksIHN1ZmZpeDogYW55KSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAnJHsnICtcbiAgICAgICAgKG5vcm1hbGl6ZWRMb2dpY2FsSWRQYXRoKGxvZ2ljYWxUb1BhdGhNYXApKGxvZ0lkKSB8fCBsb2dJZCkgK1xuICAgICAgICAoc3VmZml4IHx8ICcnKSArXG4gICAgICAgICd9J1xuICAgICAgKTtcbiAgICB9XG4gICk7XG59O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbmV4cG9ydCBjb25zdCBkZWVwU3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMgPVxuICAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAocm93czogYW55KSA9PiB7XG4gICAgcmV0dXJuIHJvd3MubWFwKChyb3c6IGFueVtdKSA9PlxuICAgICAgcm93Lm1hcChzdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyhsb2dpY2FsVG9QYXRoTWFwKSlcbiAgICApO1xuICB9O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbmNvbnN0IG5vcm1hbGl6ZWRMb2dpY2FsSWRQYXRoID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKGxvZ2ljYWxJZDogYW55KSA9PiB7XG4gIC8vIGlmIHdlIGhhdmUgYSBwYXRoIGluIHRoZSBtYXAsIHJldHVybiBpdFxuICBjb25zdCBwYXRoID0gbG9naWNhbFRvUGF0aE1hcFtsb2dpY2FsSWRdO1xuICByZXR1cm4gcGF0aCA/IG5vcm1hbGl6ZVBhdGgocGF0aCkgOiB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBQYXRoIGlzIHN1cHBvc2VkIHRvIHN0YXJ0IHdpdGggXCIvc3RhY2stbmFtZVwiLiBJZiB0aGlzIGlzIHRoZSBjYXNlIChpLmUuIHBhdGggaGFzIG1vcmUgdGhhblxuICAgKiB0d28gY29tcG9uZW50cywgd2UgcmVtb3ZlIHRoZSBmaXJzdCBwYXJ0LiBPdGhlcndpc2UsIHdlIGp1c3QgdXNlIHRoZSBmdWxsIHBhdGguXG4gICAqIEBwYXJhbSBwXG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHA6IHN0cmluZykge1xuICAgIGlmIChwLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgcCA9IHAuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBsZXQgcGFydHMgPSBwLnNwbGl0KCcvJyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMSk7XG4gICAgICAvLyByZW1vdmUgdGhlIGxhc3QgY29tcG9uZW50IGlmIGl0J3MgXCJSZXNvdXJjZVwiIG9yIFwiRGVmYXVsdFwiIChpZiB3ZSBoYXZlIG1vcmUgdGhhbiBhIHNpbmdsZSBjb21wb25lbnQpXG4gICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCBsYXN0ID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0ID09PSAnUmVzb3VyY2UnIHx8IGxhc3QgPT09ICdEZWZhdWx0Jykge1xuICAgICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHAgPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG59O1xuXG4vLyBjb3BpZWQgZnJvbVxuLy8gYXdzLWNkay9saWIvZGlmZiAoZnVuY3Rpb24gbm90IGV4cG9ydGVkKVxuY29uc3QgYnVpbGRMb2dpY2FsVG9QYXRoTWFwID0gKFxuICBzdGFjazogY3hhcGkuQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0XG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0+IHtcbiAgY29uc3QgbWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gIGZvciAoY29uc3QgbWQgb2Ygc3RhY2suZmluZE1ldGFkYXRhQnlUeXBlKFxuICAgIGN4c2NoZW1hLkFydGlmYWN0TWV0YWRhdGFFbnRyeVR5cGUuTE9HSUNBTF9JRFxuICApKSB7XG4gICAgbWFwW21kLmRhdGEgYXMgc3RyaW5nXSA9IG1kLnBhdGg7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn07XG5cbmNsYXNzIEN1c3RvbUNka1Rvb2xraXQgZXh0ZW5kcyBDZGtUb29sa2l0IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IENka1Rvb2xraXRQcm9wcykge1xuICAgIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDdXN0b21DZGtUb29sa2l0IHN1cGVyIGNsYXNzJyk7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgLy8gbWV0aG9kIGlzIHJldmVyc2UgZW5naW5lZXJlZCBiYXNlZCBvbiBDZGtUb29raXQuZGlmZiBtZXRob2QgYnV0IHJldHVybnMgYSBkaWZmIHN0cnVjdHVyZVxuICAvLyB3aGVyZSBkaWZmIG91dHB1dHMgZm9ybWF0dGVkIGRpZmYgdG8gYSBzdHJlYW0gKGllLiBzdGRlcnIpXG4gIGFzeW5jIGdldERpZmZPYmplY3Qob3B0aW9uczogRGlmZk9wdGlvbnMpOiBQcm9taXNlPFN0YWNrUmF3RGlmZltdPiB7XG4gICAgY29uc29sZS5kZWJ1Zygnc2VsZWN0U3RhY2tzRm9yRGlmZicpO1xuICAgIGNvbnN0IHN0YWNrcyA9IGF3YWl0ICh0aGlzIGFzIGFueSkuc2VsZWN0U3RhY2tzRm9yRGlmZihcbiAgICAgIG9wdGlvbnMuc3RhY2tOYW1lcyxcbiAgICAgIG9wdGlvbnMuZXhjbHVzaXZlbHlcbiAgICApO1xuICAgIGxldCBkaWZmczogU3RhY2tSYXdEaWZmW10gPSBbXTtcbiAgICBpZiAob3B0aW9ucy50ZW1wbGF0ZVBhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1c2luZyB0ZW1wbGF0ZSBub3Qgc3VwcG9ydGVkIGJ5IGdldERpZmZPYmplY3QnKTtcbiAgICB9XG5cbiAgICAvLyBDb21wYXJlIE4gc3RhY2tzIGFnYWluc3QgZGVwbG95ZWQgdGVtcGxhdGVzXG4gICAgZm9yIChjb25zdCBzdGFjayBvZiBzdGFja3Muc3RhY2tBcnRpZmFjdHMpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoYHJlYWRDdXJyZW50VGVtcGxhdGUgZm9yIHN0YWNrOiAke3N0YWNrLmRpc3BsYXlOYW1lfWApO1xuICAgICAgY29uc3QgY3VycmVudFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAodGhpcyBhcyBhbnkpLnByb3BzIGFzIENka1Rvb2xraXRQcm9wc1xuICAgICAgKS5jbG91ZEZvcm1hdGlvbi5yZWFkQ3VycmVudFRlbXBsYXRlKHN0YWNrKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ2Nsb3VkZm9ybWF0aW9uIGRpZmYgdGhlIHN0YWNrJyk7XG4gICAgICBkaWZmcy5wdXNoKHtcbiAgICAgICAgc3RhY2tOYW1lOiBzdGFjay5kaXNwbGF5TmFtZSxcbiAgICAgICAgcmF3RGlmZjogZmlsdGVyQ0RLTWV0YWRhdGEoXG4gICAgICAgICAgY2ZuRGlmZi5kaWZmVGVtcGxhdGUoY3VycmVudFRlbXBsYXRlLCBzdGFjay50ZW1wbGF0ZSlcbiAgICAgICAgKSxcbiAgICAgICAgbG9naWNhbFRvUGF0aE1hcDogYnVpbGRMb2dpY2FsVG9QYXRoTWFwKHN0YWNrKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBkaWZmcztcbiAgfVxufVxuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbSBub2RlX21vZHVsZXMvYXdzLWNkay9iaW4vY2RrLmpzXG5leHBvcnQgY29uc3QgYm9vdHN0cmFwQ2RrVG9vbGtpdCA9IGFzeW5jICgpOiBQcm9taXNlPEN1c3RvbUNka1Rvb2xraXQ+ID0+IHtcbiAgY29uc29sZS5kZWJ1ZygnbG9hZGluZyBjb25maWd1cmF0aW9uJyk7XG4gIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbigpO1xuICAvLyB7XG4gIC8vICAgXzogWydkaWZmJyBhcyBhbnldLFxuICAvLyAgICduby1jb2xvcic6IHRydWVcbiAgLy8gfVxuICBhd2FpdCBjb25maWd1cmF0aW9uLmxvYWQoKTtcbiAgY29uc29sZS5kZWJ1ZygnbG9hZGluZyBzZGsgcHJvdmlkZXInKTtcbiAgY29uc3Qgc2RrUHJvdmlkZXIgPSBhd2FpdCBTZGtQcm92aWRlci53aXRoQXdzQ2xpQ29tcGF0aWJsZURlZmF1bHRzKHtcbiAgICAvLyBwcm9maWxlOiBjb25maWd1cmF0aW9uLnNldHRpbmdzLmdldChbJ3Byb2ZpbGUnXSksXG4gIH0pO1xuICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cycpO1xuICBjb25zdCBjbG91ZEZvcm1hdGlvbiA9IG5ldyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzKHsgc2RrUHJvdmlkZXIgfSk7XG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDbG91ZEV4ZWN1dGFibGUnKTtcbiAgY29uc3QgY2xvdWRFeGVjdXRhYmxlID0gbmV3IENsb3VkRXhlY3V0YWJsZSh7XG4gICAgY29uZmlndXJhdGlvbixcbiAgICBzZGtQcm92aWRlcixcbiAgICBzeW50aGVzaXplcjogZXhlY1Byb2dyYW0sXG4gIH0pO1xuICBjb2xvcnMuZGlzYWJsZSgpO1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIHBsdWdpbnMnKTtcblxuICBmdW5jdGlvbiBsb2FkUGx1Z2lucyguLi5zZXR0aW5nczogYW55W10pIHtcbiAgICBjb25zdCBsb2FkZWQgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IHBsdWdpbnMgPSBzb3VyY2UuZ2V0KFsncGx1Z2luJ10pIHx8IFtdO1xuICAgICAgZm9yIChjb25zdCBwbHVnaW4gb2YgcGx1Z2lucykge1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHRyeVJlc29sdmUocGx1Z2luKTtcbiAgICAgICAgaWYgKGxvYWRlZC5oYXMocmVzb2x2ZWQpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgTG9hZGluZyBwbHVnLWluOiAke3BsdWdpbn0gZnJvbSAke3Jlc29sdmVkfWApO1xuXG4gICAgICAgIFBsdWdpbkhvc3QuaW5zdGFuY2UubG9hZChwbHVnaW4pO1xuXG4gICAgICAgIGxvYWRlZC5hZGQocmVzb2x2ZWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB0cnlSZXNvbHZlKHBsdWdpbjogc3RyaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcmVxdWlyZS5yZXNvbHZlKHBsdWdpbik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgcGx1Zy1pbjogJHtwbHVnaW59YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGxvYWRQbHVnaW5zKGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MpO1xuXG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDdXN0b21DZGtUb29sa2l0Jyk7XG4gIHJldHVybiBuZXcgQ3VzdG9tQ2RrVG9vbGtpdCh7XG4gICAgY2xvdWRFeGVjdXRhYmxlLFxuICAgIGNsb3VkRm9ybWF0aW9uLFxuICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgdmVyYm9zZTogZmFsc2UsXG4gICAgaWdub3JlRXJyb3JzOiBmYWxzZSxcbiAgICBzdHJpY3Q6IHRydWUsXG4gIH0pO1xufTtcbiJdfQ==