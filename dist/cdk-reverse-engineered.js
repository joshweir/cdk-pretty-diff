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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QseURBQWtGO0FBQ2xGLG1EQUFxRDtBQUNyRCx1REFBdUQ7QUFDdkQsMkZBQXVGO0FBQ3ZGLDZFQUF5RTtBQUN6RSxxREFBeUQ7QUFDekQsK0NBQWdEO0FBQ2hELHNDQUFzQztBQUl0Qyw0QkFBNEI7QUFDNUIsb0NBQW9DO0FBQ3BDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUE2QixFQUEyQixFQUFFO0lBQ25GLDhEQUE4RDtJQUM5RCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ2pELE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBQ0QsSUFBSSxNQUFNLENBQUMsZUFBZSxLQUFLLG9CQUFvQixFQUFFO2dCQUNqRCxPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQTtBQUVELDJCQUEyQjtBQUMzQiw0RUFBNEU7QUFDNUU7O0VBRUU7QUFDRixNQUFNLDBCQUEwQixHQUFHLENBQUMsZ0JBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7SUFDNUUsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLENBQUMsTUFBVyxFQUFFLEtBQVUsRUFBRSxN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LEVBQUUsS0FBSztRQUNuQixNQUFNLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNmbkRpZmYgZnJvbSAnQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZic7XG5pbXBvcnQgKiBhcyBjeGFwaSBmcm9tICdAYXdzLWNkay9jeC1hcGknO1xuaW1wb3J0ICogYXMgY3hzY2hlbWEgZnJvbSAnQGF3cy1jZGsvY2xvdWQtYXNzZW1ibHktc2NoZW1hJztcbmltcG9ydCB7IENka1Rvb2xraXQsIENka1Rvb2xraXRQcm9wcywgRGlmZk9wdGlvbnMgfSBmcm9tICdhd3MtY2RrL2xpYi9jZGstdG9vbGtpdCdcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICdhd3MtY2RrL2xpYi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBTZGtQcm92aWRlciB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9hd3MtYXV0aCc7XG5pbXBvcnQgeyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2Nsb3VkZm9ybWF0aW9uLWRlcGxveW1lbnRzJztcbmltcG9ydCB7IENsb3VkRXhlY3V0YWJsZSB9IGZyb20gJ2F3cy1jZGsvbGliL2FwaS9jeGFwcC9jbG91ZC1leGVjdXRhYmxlJztcbmltcG9ydCB7IGV4ZWNQcm9ncmFtIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2N4YXBwL2V4ZWMnO1xuaW1wb3J0IHsgUGx1Z2luSG9zdCB9IGZyb20gJ2F3cy1jZGsvbGliL3BsdWdpbic7XG5pbXBvcnQgKiBhcyBjb2xvcnMgZnJvbSAnY29sb3JzL3NhZmUnO1xuXG5pbXBvcnQgeyBTdGFja1Jhd0RpZmYgfSBmcm9tICcuL3R5cGVzJztcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206IFxuLy8gYXdzLWNkay9saWIvZGlmZiAocHJpbnRTdGFja0RpZmYpXG5jb25zdCBmaWx0ZXJDREtNZXRhZGF0YSA9IChkaWZmOiBTdGFja1Jhd0RpZmZbJ3Jhd0RpZmYnXSk6IFN0YWNrUmF3RGlmZlsncmF3RGlmZiddID0+IHtcbiAgLy8gZmlsdGVyIG91dCAnQVdTOjpDREs6Ok1ldGFkYXRhJyByZXNvdXJjZXMgZnJvbSB0aGUgdGVtcGxhdGVcbiAgaWYgKGRpZmYucmVzb3VyY2VzKSB7XG4gICAgZGlmZi5yZXNvdXJjZXMgPSBkaWZmLnJlc291cmNlcy5maWx0ZXIoY2hhbmdlID0+IHtcbiAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2UubmV3UmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2Uub2xkUmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGRpZmY7XG59XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuLyoqXG4qIFN1YnN0aXR1dGUgYWxsIHN0cmluZ3MgbGlrZSAke0xvZ0lkLnh4eH0gd2l0aCB0aGUgcGF0aCBpbnN0ZWFkIG9mIHRoZSBsb2dpY2FsIElEXG4qL1xuY29uc3Qgc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMgPSAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAoc291cmNlOiBhbnkpID0+IHtcbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKC9cXCRcXHsoW14ufV0rKSguW159XSspP1xcfS9pZywgKF9tYXRjaDogYW55LCBsb2dJZDogYW55LCBzdWZmaXg6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuICckeycgKyAobm9ybWFsaXplZExvZ2ljYWxJZFBhdGgobG9naWNhbFRvUGF0aE1hcCkobG9nSWQpIHx8IGxvZ0lkKSArIChzdWZmaXggfHwgJycpICsgJ30nO1xuICB9KTtcbn1cblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5leHBvcnQgY29uc3QgZGVlcFN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKHJvd3M6IGFueSkgPT4ge1xuICByZXR1cm4gcm93cy5tYXAoKHJvdzogYW55W10pID0+IHJvdy5tYXAoc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMobG9naWNhbFRvUGF0aE1hcCkpKTtcbn1cblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmL2xpYi9mb3JtYXQgKEZvcm1hdHRlciBjbGFzcyBpcyBub3QgZXhwb3J0ZWQpXG5jb25zdCBub3JtYWxpemVkTG9naWNhbElkUGF0aCA9IChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChsb2dpY2FsSWQ6IGFueSkgPT4ge1xuICAvLyBpZiB3ZSBoYXZlIGEgcGF0aCBpbiB0aGUgbWFwLCByZXR1cm4gaXRcbiAgY29uc3QgcGF0aCA9IGxvZ2ljYWxUb1BhdGhNYXBbbG9naWNhbElkXTtcbiAgcmV0dXJuIHBhdGggPyBub3JtYWxpemVQYXRoKHBhdGgpIDogdW5kZWZpbmVkO1xuICAvKipcbiAgICogUGF0aCBpcyBzdXBwb3NlZCB0byBzdGFydCB3aXRoIFwiL3N0YWNrLW5hbWVcIi4gSWYgdGhpcyBpcyB0aGUgY2FzZSAoaS5lLiBwYXRoIGhhcyBtb3JlIHRoYW5cbiAgICogdHdvIGNvbXBvbmVudHMsIHdlIHJlbW92ZSB0aGUgZmlyc3QgcGFydC4gT3RoZXJ3aXNlLCB3ZSBqdXN0IHVzZSB0aGUgZnVsbCBwYXRoLlxuICAgKiBAcGFyYW0gcFxuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwOiBzdHJpbmcpIHtcbiAgICAgIGlmIChwLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICAgIHAgPSBwLnN1YnN0cigxKTtcbiAgICAgIH1cbiAgICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoJy8nKTtcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgxKTtcbiAgICAgICAgICAvLyByZW1vdmUgdGhlIGxhc3QgY29tcG9uZW50IGlmIGl0J3MgXCJSZXNvdXJjZVwiIG9yIFwiRGVmYXVsdFwiIChpZiB3ZSBoYXZlIG1vcmUgdGhhbiBhIHNpbmdsZSBjb21wb25lbnQpXG4gICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICBpZiAobGFzdCA9PT0gJ1Jlc291cmNlJyB8fCBsYXN0ID09PSAnRGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcCA9IHBhcnRzLmpvaW4oJy8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwO1xuICB9XG59XG5cbi8vIGNvcGllZCBmcm9tIFxuLy8gYXdzLWNkay9saWIvZGlmZiAoZnVuY3Rpb24gbm90IGV4cG9ydGVkKVxuY29uc3QgYnVpbGRMb2dpY2FsVG9QYXRoTWFwID0gKHN0YWNrOiBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3QpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0+IHtcbiAgY29uc3QgbWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gIGZvciAoY29uc3QgbWQgb2Ygc3RhY2suZmluZE1ldGFkYXRhQnlUeXBlKGN4c2NoZW1hLkFydGlmYWN0TWV0YWRhdGFFbnRyeVR5cGUuTE9HSUNBTF9JRCkpIHtcbiAgICAgIG1hcFttZC5kYXRhIGFzIHN0cmluZ10gPSBtZC5wYXRoO1xuICB9XG4gIHJldHVybiBtYXA7XG59XG5cbmNsYXNzIEN1c3RvbUNka1Rvb2xraXQgZXh0ZW5kcyBDZGtUb29sa2l0IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IENka1Rvb2xraXRQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIC8vIG1ldGhvZCBpcyByZXZlcnNlIGVuZ2luZWVyZWQgYmFzZWQgb24gQ2RrVG9va2l0LmRpZmYgbWV0aG9kIGJ1dCByZXR1cm5zIGEgZGlmZiBzdHJ1Y3R1cmUgXG4gIC8vIHdoZXJlIGRpZmYgb3V0cHV0cyBmb3JtYXR0ZWQgZGlmZiB0byBhIHN0cmVhbSAoaWUuIHN0ZGVycilcbiAgYXN5bmMgZ2V0RGlmZk9iamVjdChvcHRpb25zOiBEaWZmT3B0aW9ucyk6IFByb21pc2U8U3RhY2tSYXdEaWZmW10+IHtcbiAgICBjb25zdCBzdGFja3MgPSBhd2FpdCAodGhpcyBhcyBhbnkpLnNlbGVjdFN0YWNrc0ZvckRpZmYob3B0aW9ucy5zdGFja05hbWVzLCBvcHRpb25zLmV4Y2x1c2l2ZWx5KTtcbiAgICBsZXQgZGlmZnM6IFN0YWNrUmF3RGlmZltdID0gW107XG4gICAgaWYgKG9wdGlvbnMudGVtcGxhdGVQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1c2luZyB0ZW1wbGF0ZSBub3Qgc3VwcG9ydGVkIGJ5IGdldERpZmZPYmplY3QnKVxuICAgIH1cblxuICAgIC8vIENvbXBhcmUgTiBzdGFja3MgYWdhaW5zdCBkZXBsb3llZCB0ZW1wbGF0ZXNcbiAgICBmb3IgKGNvbnN0IHN0YWNrIG9mIHN0YWNrcy5zdGFja0FydGlmYWN0cykge1xuICAgICAgY29uc3QgY3VycmVudFRlbXBsYXRlID0gYXdhaXQgKCgodGhpcyBhcyBhbnkpLnByb3BzIGFzIENka1Rvb2xraXRQcm9wcykuY2xvdWRGb3JtYXRpb24ucmVhZEN1cnJlbnRUZW1wbGF0ZShzdGFjaykpO1xuICAgICAgZGlmZnMucHVzaCh7XG4gICAgICAgIHN0YWNrTmFtZTogc3RhY2suZGlzcGxheU5hbWUsXG4gICAgICAgIHJhd0RpZmY6IGZpbHRlckNES01ldGFkYXRhKGNmbkRpZmYuZGlmZlRlbXBsYXRlKGN1cnJlbnRUZW1wbGF0ZSwgc3RhY2sudGVtcGxhdGUpKSxcbiAgICAgICAgbG9naWNhbFRvUGF0aE1hcDogYnVpbGRMb2dpY2FsVG9QYXRoTWFwKHN0YWNrKSxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGRpZmZzO1xuICB9XG59O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbSBub2RlX21vZHVsZXMvYXdzLWNkay9iaW4vY2RrLmpzXG5leHBvcnQgY29uc3QgYm9vdHN0cmFwQ2RrVG9vbGtpdCA9IGFzeW5jICgpOiBQcm9taXNlPEN1c3RvbUNka1Rvb2xraXQ+ID0+IHtcbiAgY29uc3QgY29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKFxuICAgIC8vIHsgXG4gICAgLy8gICBfOiBbJ2RpZmYnIGFzIGFueV0sXG4gICAgLy8gICAnbm8tY29sb3InOiB0cnVlIFxuICAgIC8vIH1cbiAgKTtcbiAgYXdhaXQgY29uZmlndXJhdGlvbi5sb2FkKCk7XG4gIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgICAvLyBwcm9maWxlOiBjb25maWd1cmF0aW9uLnNldHRpbmdzLmdldChbJ3Byb2ZpbGUnXSksXG4gIH0pO1xuICBjb25zdCBjbG91ZEZvcm1hdGlvbiA9IG5ldyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzKHsgc2RrUHJvdmlkZXIgfSk7XG4gIGNvbnN0IGNsb3VkRXhlY3V0YWJsZSA9IG5ldyBDbG91ZEV4ZWN1dGFibGUoe1xuICAgICAgY29uZmlndXJhdGlvbixcbiAgICAgIHNka1Byb3ZpZGVyLFxuICAgICAgc3ludGhlc2l6ZXI6IGV4ZWNQcm9ncmFtLFxuICB9KTtcbiAgY29sb3JzLmRpc2FibGUoKTtcblxuICBmdW5jdGlvbiBsb2FkUGx1Z2lucyguLi5zZXR0aW5nczogYW55W10pIHtcbiAgICBjb25zdCBsb2FkZWQgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IHBsdWdpbnMgPSBzb3VyY2UuZ2V0KFsncGx1Z2luJ10pIHx8IFtdO1xuICAgICAgZm9yIChjb25zdCBwbHVnaW4gb2YgcGx1Z2lucykge1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHRyeVJlc29sdmUocGx1Z2luKTtcbiAgICAgICAgaWYgKGxvYWRlZC5oYXMocmVzb2x2ZWQpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgTG9hZGluZyBwbHVnLWluOiAke3BsdWdpbn0gZnJvbSAke3Jlc29sdmVkfWApO1xuICAgICAgICBQbHVnaW5Ib3N0Lmluc3RhbmNlLmxvYWQocGx1Z2luKTtcbiAgICAgICAgbG9hZGVkLmFkZChyZXNvbHZlZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRyeVJlc29sdmUocGx1Z2luOiBzdHJpbmcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiByZXF1aXJlLnJlc29sdmUocGx1Z2luKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgcGx1Zy1pbjogJHtwbHVnaW59YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGxvYWRQbHVnaW5zKGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MpO1xuXG4gIHJldHVybiBuZXcgQ3VzdG9tQ2RrVG9vbGtpdCh7XG4gICAgY2xvdWRFeGVjdXRhYmxlLFxuICAgIGNsb3VkRm9ybWF0aW9uLFxuICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgdmVyYm9zZTogZmFsc2UsXG4gICAgaWdub3JlRXJyb3JzOiBmYWxzZSxcbiAgICBzdHJpY3Q6IHRydWUsXG4gIH0pO1xufTtcbiJdfQ==