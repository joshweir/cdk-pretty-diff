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
            const currentTemplate = await (this.props.cloudFormation.readCurrentTemplate(stack));
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
;
// reverse engineered from node_modules/aws-cdk/bin/cdk.js
exports.bootstrapCdkToolkit = async () => {
    console.debug('loading configuration');
    const configuration = new settings_1.Configuration(
    // { 
    //   _: ['diff' as any],
    //   'no-color': true 
    // }
    );
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QseURBQWtGO0FBQ2xGLG1EQUFxRDtBQUNyRCx1REFBdUQ7QUFDdkQsMkZBQXVGO0FBQ3ZGLDZFQUF5RTtBQUN6RSxxREFBeUQ7QUFDekQsK0NBQWdEO0FBQ2hELHNDQUFzQztBQUl0Qyw0QkFBNEI7QUFDNUIsb0NBQW9DO0FBQ3BDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUE2QixFQUEyQixFQUFFO0lBQ25GLDhEQUE4RDtJQUM5RCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ2pELE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBQ0QsSUFBSSxNQUFNLENBQUMsZUFBZSxLQUFLLG9CQUFvQixFQUFFO2dCQUNqRCxPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQTtBQUVELDJCQUEyQjtBQUMzQiw0RUFBNEU7QUFDNUU7O0VBRUU7QUFDRixNQUFNLDBCQUEwQixHQUFHLENBQUMsZ0JBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7SUFDNUUsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLENBQUMsTUFBVyxFQUFFLEtBQVUsRUFBRSxN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QUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN0QjtTQUNGO1FBQ0QsU0FBUyxVQUFVLENBQUMsTUFBYztZQUNoQyxJQUFJO2dCQUNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNoQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDekQ7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNELFdBQVcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFcEMsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQztRQUMxQixlQUFlO1FBQ2YsY0FBYztRQUNkLGFBQWE7UUFDYixXQUFXO1FBQ1gsT0FBTyxFQUFFLEtBQUs7UUFDZCxZQUFZLEVBQUUsS0FBSztRQUNuQixNQUFNLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNmbkRpZmYgZnJvbSAnQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZic7XG5pbXBvcnQgKiBhcyBjeGFwaSBmcm9tICdAYXdzLWNkay9jeC1hcGknO1xuaW1wb3J0ICogYXMgY3hzY2hlbWEgZnJvbSAnQGF3cy1jZGsvY2xvdWQtYXNzZW1ibHktc2NoZW1hJztcbmltcG9ydCB7IENka1Rvb2xraXQsIENka1Rvb2xraXRQcm9wcywgRGlmZk9wdGlvbnMgfSBmcm9tICdhd3MtY2RrL2xpYi9jZGstdG9vbGtpdCdcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICdhd3MtY2RrL2xpYi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBTZGtQcm92aWRlciB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9hd3MtYXV0aCc7XG5pbXBvcnQgeyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2Nsb3VkZm9ybWF0aW9uLWRlcGxveW1lbnRzJztcbmltcG9ydCB7IENsb3VkRXhlY3V0YWJsZSB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9jeGFwcC9jbG91ZC1leGVjdXRhYmxlJztcbmltcG9ydCB7IGV4ZWNQcm9ncmFtIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2N4YXBwL2V4ZWMnO1xuaW1wb3J0IHsgUGx1Z2luSG9zdCB9IGZyb20gJ2F3cy1jZGsvbGliL3BsdWdpbic7XG5pbXBvcnQgKiBhcyBjb2xvcnMgZnJvbSAnY29sb3JzL3NhZmUnO1xuXG5pbXBvcnQgeyBTdGFja1Jhd0RpZmYgfSBmcm9tICcuL3R5cGVzJztcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206IFxuLy8gYXdzLWNkay9saWIvZGlmZiAocHJpbnRTdGFja0RpZmYpXG5jb25zdCBmaWx0ZXJDREtNZXRhZGF0YSA9IChkaWZmOiBTdGFja1Jhd0RpZmZbJ3Jhd0RpZmYnXSk6IFN0YWNrUmF3RGlmZlsncmF3RGlmZiddID0+IHtcbiAgLy8gZmlsdGVyIG91dCAnQVdTOjpDREs6Ok1ldGFkYXRhJyByZXNvdXJjZXMgZnJvbSB0aGUgdGVtcGxhdGVcbiAgaWYgKGRpZmYucmVzb3VyY2VzKSB7XG4gICAgZGlmZi5yZXNvdXJjZXMgPSBkaWZmLnJlc291cmNlcy5maWx0ZXIoY2hhbmdlID0+IHtcbiAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2UubmV3UmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2Uub2xkUmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGRpZmY7XG59XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuLyoqXG4qIFN1YnN0aXR1dGUgYWxsIHN0cmluZ3MgbGlrZSAke0xvZ0lkLnh4eH0gd2l0aCB0aGUgcGF0aCBpbnN0ZWFkIG9mIHRoZSBsb2dpY2FsIElEXG4qL1xuY29uc3Qgc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMgPSAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAoc291cmNlOiBhbnkpID0+IHtcbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKC9cXCRcXHsoW14ufV0rKSguW159XSspP1xcfS9pZywgKF9tYXRjaDogYW55LCBsb2dJZDogYW55LCBzdWZmaXg6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuICckeycgKyAobm9ybWFsaXplZExvZ2ljYWxJZFBhdGgobG9naWNhbFRvUGF0aE1hcCkobG9nSWQpIHx8IGxvZ0lkKSArIChzdWZmaXggfHwgJycpICsgJ30nO1xuICB9KTtcbn1cblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5leHBvcnQgY29uc3QgZGVlcFN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHJvd3M6IGFueSkgPT4ge1xuICByZXR1cm4gcm93cy5tYXAoKHJvdzogYW55W10pID0+IHJvdy5tYXAoc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMobG9naWNhbFRvUGF0aE1hcCkpKTtcbn1cblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5jb25zdCBub3JtYWxpemVkTG9naWNhbElkUGF0aCA9IChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChsb2dpY2FsSWQ6IGFueSkgPT4ge1xuICAvLyBpZiB3ZSBoYXZlIGEgcGF0aCBpbiB0aGUgbWFwLCByZXR1cm4gaXRcbiAgY29uc3QgcGF0aCA9IGxvZ2ljYWxUb1BhdGhNYXBbbG9naWNhbElkXTtcbiAgcmV0dXJuIHBhdGggPyBub3JtYWxpemVQYXRoKHBhdGgpIDogdW5kZWZpbmVkO1xuICAvKipcbiAgICogUGF0aCBpcyBzdXBwb3NlZCB0byBzdGFydCB3aXRoIFwiL3N0YWNrLW5hbWVcIi4gSWYgdGhpcyBpcyB0aGUgY2FzZSAoaS5lLiBwYXRoIGhhcyBtb3JlIHRoYW5cbiAgICogdHdvIGNvbXBvbmVudHMsIHdlIHJlbW92ZSB0aGUgZmlyc3QgcGFydC4gT3RoZXJ3aXNlLCB3ZSBqdXN0IHVzZSB0aGUgZnVsbCBwYXRoLlxuICAgKiBAcGFyYW0gcFxuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwOiBzdHJpbmcpIHtcbiAgICAgIGlmIChwLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICAgIHAgPSBwLnN1YnN0cigxKTtcbiAgICAgIH1cbiAgICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoJy8nKTtcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgxKTtcbiAgICAgICAgICAvLyByZW1vdmUgdGhlIGxhc3QgY29tcG9uZW50IGlmIGl0J3MgXCJSZXNvdXJjZVwiIG9yIFwiRGVmYXVsdFwiIChpZiB3ZSBoYXZlIG1vcmUgdGhhbiBhIHNpbmdsZSBjb21wb25lbnQpXG4gICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICBpZiAobGFzdCA9PT0gJ1Jlc291cmNlJyB8fCBsYXN0ID09PSAnRGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcCA9IHBhcnRzLmpvaW4oJy8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwO1xuICB9XG59XG5cbi8vIGNvcGllZCBmcm9tIFxuLy8gYXdzLWNkay9saWIvZGlmZiAoZnVuY3Rpb24gbm90IGV4cG9ydGVkKVxuY29uc3QgYnVpbGRMb2dpY2FsVG9QYXRoTWFwID0gKHN0YWNrOiBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3QpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0+IHtcbiAgY29uc3QgbWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gIGZvciAoY29uc3QgbWQgb2Ygc3RhY2suZmluZE1ldGFkYXRhQnlUeXBlKGN4c2NoZW1hLkFydGlmYWN0TWV0YWRhdGFFbnRyeVR5cGUuTE9HSUNBTF9JRCkpIHtcbiAgICAgIG1hcFttZC5kYXRhIGFzIHN0cmluZ10gPSBtZC5wYXRoO1xuICB9XG4gIHJldHVybiBtYXA7XG59XG5cbmNsYXNzIEN1c3RvbUNka1Rvb2xraXQgZXh0ZW5kcyBDZGtUb29sa2l0IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IENka1Rvb2xraXRQcm9wcykge1xuICAgIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDdXN0b21DZGtUb29sa2l0IHN1cGVyIGNsYXNzJyk7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgLy8gbWV0aG9kIGlzIHJldmVyc2UgZW5naW5lZXJlZCBiYXNlZCBvbiBDZGtUb29raXQuZGlmZiBtZXRob2QgYnV0IHJldHVybnMgYSBkaWZmIHN0cnVjdHVyZSBcbiAgLy8gd2hlcmUgZGlmZiBvdXRwdXRzIGZvcm1hdHRlZCBkaWZmIHRvIGEgc3RyZWFtIChpZS4gc3RkZXJyKVxuICBhc3luYyBnZXREaWZmT2JqZWN0KG9wdGlvbnM6IERpZmZPcHRpb25zKTogUHJvbWlzZTxTdGFja1Jhd0RpZmZbXT4ge1xuICAgIGNvbnNvbGUuZGVidWcoJ3NlbGVjdFN0YWNrc0ZvckRpZmYnKTtcbiAgICBjb25zdCBzdGFja3MgPSBhd2FpdCAodGhpcyBhcyBhbnkpLnNlbGVjdFN0YWNrc0ZvckRpZmYob3B0aW9ucy5zdGFja05hbWVzLCBvcHRpb25zLmV4Y2x1c2l2ZWx5KTtcbiAgICBsZXQgZGlmZnM6IFN0YWNrUmF3RGlmZltdID0gW107XG4gICAgaWYgKG9wdGlvbnMudGVtcGxhdGVQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1c2luZyB0ZW1wbGF0ZSBub3Qgc3VwcG9ydGVkIGJ5IGdldERpZmZPYmplY3QnKVxuICAgIH1cblxuICAgIC8vIENvbXBhcmUgTiBzdGFja3MgYWdhaW5zdCBkZXBsb3llZCB0ZW1wbGF0ZXNcbiAgICBmb3IgKGNvbnN0IHN0YWNrIG9mIHN0YWNrcy5zdGFja0FydGlmYWN0cykge1xuICAgICAgY29uc29sZS5kZWJ1ZyhgcmVhZEN1cnJlbnRUZW1wbGF0ZSBmb3Igc3RhY2s6ICR7c3RhY2suZGlzcGxheU5hbWV9YCk7XG4gICAgICBjb25zdCBjdXJyZW50VGVtcGxhdGUgPSBhd2FpdCAoKCh0aGlzIGFzIGFueSkucHJvcHMgYXMgQ2RrVG9vbGtpdFByb3BzKS5jbG91ZEZvcm1hdGlvbi5yZWFkQ3VycmVudFRlbXBsYXRlKHN0YWNrKSk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdjbG91ZGZvcm1hdGlvbiBkaWZmIHRoZSBzdGFjaycpXG4gICAgICBkaWZmcy5wdXNoKHtcbiAgICAgICAgc3RhY2tOYW1lOiBzdGFjay5kaXNwbGF5TmFtZSxcbiAgICAgICAgcmF3RGlmZjogZmlsdGVyQ0RLTWV0YWRhdGEoY2ZuRGlmZi5kaWZmVGVtcGxhdGUoY3VycmVudFRlbXBsYXRlLCBzdGFjay50ZW1wbGF0ZSkpLFxuICAgICAgICBsb2dpY2FsVG9QYXRoTWFwOiBidWlsZExvZ2ljYWxUb1BhdGhNYXAoc3RhY2spLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gZGlmZnM7XG4gIH1cbn07XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tIG5vZGVfbW9kdWxlcy9hd3MtY2RrL2Jpbi9jZGsuanNcbmV4cG9ydCBjb25zdCBib290c3RyYXBDZGtUb29sa2l0ID0gYXN5bmMgKCk6IFByb21pc2U8Q3VzdG9tQ2RrVG9vbGtpdD4gPT4ge1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIGNvbmZpZ3VyYXRpb24nKTtcbiAgY29uc3QgY29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKFxuICAgIC8vIHsgXG4gICAgLy8gICBfOiBbJ2RpZmYnIGFzIGFueV0sXG4gICAgLy8gICAnbm8tY29sb3InOiB0cnVlIFxuICAgIC8vIH1cbiAgKTtcbiAgYXdhaXQgY29uZmlndXJhdGlvbi5sb2FkKCk7XG4gIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgc2RrIHByb3ZpZGVyJyk7XG4gIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgICAvLyBwcm9maWxlOiBjb25maWd1cmF0aW9uLnNldHRpbmdzLmdldChbJ3Byb2ZpbGUnXSksXG4gIH0pO1xuICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cycpO1xuICBjb25zdCBjbG91ZEZvcm1hdGlvbiA9IG5ldyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzKHsgc2RrUHJvdmlkZXIgfSk7XG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDbG91ZEV4ZWN1dGFibGUnKTtcbiAgY29uc3QgY2xvdWRFeGVjdXRhYmxlID0gbmV3IENsb3VkRXhlY3V0YWJsZSh7XG4gICAgICBjb25maWd1cmF0aW9uLFxuICAgICAgc2RrUHJvdmlkZXIsXG4gICAgICBzeW50aGVzaXplcjogZXhlY1Byb2dyYW0sXG4gIH0pO1xuICBjb2xvcnMuZGlzYWJsZSgpO1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIHBsdWdpbnMnKTtcbiAgZnVuY3Rpb24gbG9hZFBsdWdpbnMoLi4uc2V0dGluZ3M6IGFueVtdKSB7XG4gICAgY29uc3QgbG9hZGVkID0gbmV3IFNldCgpO1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNldHRpbmdzKSB7XG4gICAgICBjb25zdCBwbHVnaW5zID0gc291cmNlLmdldChbJ3BsdWdpbiddKSB8fCBbXTtcbiAgICAgIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSB0cnlSZXNvbHZlKHBsdWdpbik7XG4gICAgICAgIGlmIChsb2FkZWQuaGFzKHJlc29sdmVkKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYExvYWRpbmcgcGx1Zy1pbjogJHtwbHVnaW59IGZyb20gJHtyZXNvbHZlZH1gKTtcbiAgICAgICAgUGx1Z2luSG9zdC5pbnN0YW5jZS5sb2FkKHBsdWdpbik7XG4gICAgICAgIGxvYWRlZC5hZGQocmVzb2x2ZWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB0cnlSZXNvbHZlKHBsdWdpbjogc3RyaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcmVxdWlyZS5yZXNvbHZlKHBsdWdpbik7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byByZXNvbHZlIHBsdWctaW46ICR7cGx1Z2lufWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBsb2FkUGx1Z2lucyhjb25maWd1cmF0aW9uLnNldHRpbmdzKTtcblxuICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ3VzdG9tQ2RrVG9vbGtpdCcpO1xuICByZXR1cm4gbmV3IEN1c3RvbUNka1Rvb2xraXQoe1xuICAgIGNsb3VkRXhlY3V0YWJsZSxcbiAgICBjbG91ZEZvcm1hdGlvbixcbiAgICBjb25maWd1cmF0aW9uLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgIGlnbm9yZUVycm9yczogZmFsc2UsXG4gICAgc3RyaWN0OiB0cnVlLFxuICB9KTtcbn07XG4iXX0=