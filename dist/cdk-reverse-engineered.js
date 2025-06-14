"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapCdkToolkit = exports.deepSubstituteBracedLogicalIds = void 0;
const cfnDiff = require("@aws-cdk/cloudformation-diff");
const cxschema = require("@aws-cdk/cloud-assembly-schema");
const cdk_toolkit_1 = require("aws-cdk/lib/cli/cdk-toolkit");
const user_configuration_1 = require("aws-cdk/lib/cli/user-configuration");
const aws_auth_1 = require("aws-cdk/lib/api/aws-auth");
const cloud_executable_1 = require("aws-cdk/lib/cxapp/cloud-executable");
const exec_1 = require("aws-cdk/lib/cxapp/exec");
const colors = require("colors/safe");
const api_private_1 = require("aws-cdk/lib/api-private");
const io_host_1 = require("aws-cdk/lib/cli/io-host");
const singleton_plugin_host_1 = require("aws-cdk/lib/cli/singleton-plugin-host");
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
    const configuration = new user_configuration_1.Configuration(configProps);
    // {
    //   _: ['diff' as any],
    //   'no-color': true
    // }
    await configuration.load();
    console.debug('loading sdk provider');
    const ioHost = io_host_1.CliIoHost.instance({
        logLevel: 'info',
        isTTY: process.stdout.isTTY,
        isCI: true,
        currentAction: 'diff',
    }, true);
    const ioHelper = (0, api_private_1.asIoHelper)(ioHost, 'diff');
    const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
        ioHelper,
        // profile: configuration.settings.get(['profile']),
    });
    console.debug('initializing CloudExecutable');
    let outDirLock;
    const cloudExecutable = new cloud_executable_1.CloudExecutable({
        configuration,
        sdkProvider,
        ioHelper: ioHost.asIoHelper(),
        // execProgram return type changed in aws-cdk v2.61.0, 
        // therefore check if execProgram returned
        // object contains `assembly` prop, if so then return it
        synthesizer: async (aws, config) => {
            // Invoke 'execProgram', and copy the lock for the directory in the global
            // variable here. It will be released when the CLI exits. Locks are not re-entrant
            // so release it if we have to synthesize more than once (because of context lookups).
            await (outDirLock === null || outDirLock === void 0 ? void 0 : outDirLock.release());
            const { assembly, lock } = await (0, exec_1.execProgram)(aws, ioHost.asIoHelper(), config);
            outDirLock = lock;
            return assembly;
        },
    });
    colors.disable();
    console.debug('loading plugins');
    async function loadPlugins(...settings) {
        for (const source of settings) {
            const plugins = source.get(['plugin']) || [];
            for (const plugin of plugins) {
                await singleton_plugin_host_1.GLOBAL_PLUGIN_HOST.load(plugin, ioHost);
            }
        }
    }
    await loadPlugins(configuration.settings);
    console.debug('initializing CustomCdkToolkit');
    const { deployments, cdkToolkitDeploymentsProp } = dynamicallyInstantiateDeployments(sdkProvider);
    return new CustomCdkToolkit({
        cloudExecutable,
        configuration,
        sdkProvider,
        cdkToolkitDeploymentsProp,
        deployments,
        verbose: false,
        ignoreErrors: false,
        strict: true,
    });
    // return new CustomCdkToolkit({
    //   cloudExecutable,
    //   configuration,
    //   sdkProvider,
    //   cdkToolkitDeploymentsProp,
    //   [cdkToolkitDeploymentsProp]: deployments,
    //   verbose: false,
    //   ignoreErrors: false,
    //   strict: true,
    // } as any);
};
exports.bootstrapCdkToolkit = bootstrapCdkToolkit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QsNkRBR3FDO0FBQ3JDLDJFQUFzRjtBQUN0Rix1REFBdUQ7QUFDdkQseUVBQXFFO0FBQ3JFLGlEQUFxRDtBQUNyRCxzQ0FBc0M7QUFDdEMseURBQW9EO0FBQ3BELHFEQUFtRDtBQUNuRCxpRkFBMEU7QUFJMUUsMkJBQTJCO0FBQzNCLG9DQUFvQztBQUNwQyxNQUFNLGlCQUFpQixHQUFHLENBQ3hCLElBQTZCLEVBQ0osRUFBRTtJQUMzQiw4REFBOEQ7SUFDOUQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ25ELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ25ELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVGLDJCQUEyQjtBQUMzQiw0RUFBNEU7QUFDNUU7O0dBRUc7QUFDSCxNQUFNLDBCQUEwQixHQUFHLENBQUMsZ0JBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7SUFDNUUsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUNuQiwyQkFBMkIsRUFDM0IsQ0FBQyxNQUFX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TSwwQ0FBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQy9DO1NBQ0Y7SUFDSCxDQUFDO0lBQ0QsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUMvQyxNQUFNLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixFQUFFLEdBQUcsaUNBQWlDLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEcsT0FBTyxJQUFJLGdCQUFnQixDQUFDO1FBQzFCLGVBQWU7UUFDZixhQUFhO1FBQ2IsV0FBVztRQUNYLHlCQUF5QjtRQUN6QixXQUFXO1FBQ1gsT0FBTyxFQUFFLEtBQUs7UUFDZCxZQUFZLEVBQUUsS0FBSztRQUNuQixNQUFNLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQztJQUNILGdDQUFnQztJQUNoQyxxQkFBcUI7SUFDckIsbUJBQW1CO0lBQ25CLGlCQUFpQjtJQUNqQiwrQkFBK0I7SUFDL0IsOENBQThDO0lBQzlDLG9CQUFvQjtJQUNwQix5QkFBeUI7SUFDekIsa0JBQWtCO0lBQ2xCLGFBQWE7QUFDZixDQUFDLENBQUM7QUEzRVcsUUFBQSxtQkFBbUIsdUJBMkU5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNmbkRpZmYgZnJvbSAnQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZic7XG5pbXBvcnQgKiBhcyBjeGFwaSBmcm9tICdAYXdzLWNkay9jeC1hcGknO1xuaW1wb3J0ICogYXMgY3hzY2hlbWEgZnJvbSAnQGF3cy1jZGsvY2xvdWQtYXNzZW1ibHktc2NoZW1hJztcbmltcG9ydCB7XG4gIENka1Rvb2xraXQsXG4gIERpZmZPcHRpb25zLFxufSBmcm9tICdhd3MtY2RrL2xpYi9jbGkvY2RrLXRvb2xraXQnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiwgQ29uZmlndXJhdGlvblByb3BzIH0gZnJvbSAnYXdzLWNkay9saWIvY2xpL3VzZXItY29uZmlndXJhdGlvbidcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpL2F3cy1hdXRoJztcbmltcG9ydCB7IENsb3VkRXhlY3V0YWJsZSB9IGZyb20gJ2F3cy1jZGsvbGliL2N4YXBwL2Nsb3VkLWV4ZWN1dGFibGUnO1xuaW1wb3J0IHsgZXhlY1Byb2dyYW0gfSBmcm9tICdhd3MtY2RrL2xpYi9jeGFwcC9leGVjJztcbmltcG9ydCAqIGFzIGNvbG9ycyBmcm9tICdjb2xvcnMvc2FmZSc7XG5pbXBvcnQgeyBhc0lvSGVscGVyIH0gZnJvbSAnYXdzLWNkay9saWIvYXBpLXByaXZhdGUnXG5pbXBvcnQgeyBDbGlJb0hvc3QgfSBmcm9tICdhd3MtY2RrL2xpYi9jbGkvaW8taG9zdCdcbmltcG9ydCB7IEdMT0JBTF9QTFVHSU5fSE9TVCB9IGZyb20gJ2F3cy1jZGsvbGliL2NsaS9zaW5nbGV0b24tcGx1Z2luLWhvc3QnXG5cbmltcG9ydCB7IENka1Rvb2xraXREZXBsb3ltZW50c1Byb3AsIEN1c3RvbUNka1Rvb2xraXRQcm9wcywgU3RhY2tSYXdEaWZmIH0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gYXdzLWNkay9saWIvZGlmZiAocHJpbnRTdGFja0RpZmYpXG5jb25zdCBmaWx0ZXJDREtNZXRhZGF0YSA9IChcbiAgZGlmZjogU3RhY2tSYXdEaWZmWydyYXdEaWZmJ11cbik6IFN0YWNrUmF3RGlmZlsncmF3RGlmZiddID0+IHtcbiAgLy8gZmlsdGVyIG91dCAnQVdTOjpDREs6Ok1ldGFkYXRhJyByZXNvdXJjZXMgZnJvbSB0aGUgdGVtcGxhdGVcbiAgaWYgKGRpZmYucmVzb3VyY2VzKSB7XG4gICAgZGlmZi5yZXNvdXJjZXMgPSBkaWZmLnJlc291cmNlcy5maWx0ZXIoKGNoYW5nZSkgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlLm5ld1Jlc291cmNlVHlwZSA9PT0gJ0FXUzo6Q0RLOjpNZXRhZGF0YScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZS5vbGRSZXNvdXJjZVR5cGUgPT09ICdBV1M6OkNESzo6TWV0YWRhdGEnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGRpZmY7XG59O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbi8qKlxuICogU3Vic3RpdHV0ZSBhbGwgc3RyaW5ncyBsaWtlICR7TG9nSWQueHh4fSB3aXRoIHRoZSBwYXRoIGluc3RlYWQgb2YgdGhlIGxvZ2ljYWwgSURcbiAqL1xuY29uc3Qgc3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMgPSAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAoc291cmNlOiBhbnkpID0+IHtcbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKFxuICAgIC9cXCRcXHsoW14ufV0rKSguW159XSspP1xcfS9naSxcbiAgICAoX21hdGNoOiBhbnksIGxvZ0lkOiBhbnksIHN1ZmZpeDogYW55KSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAnJHsnICtcbiAgICAgICAgKG5vcm1hbGl6ZWRMb2dpY2FsSWRQYXRoKGxvZ2ljYWxUb1BhdGhNYXApKGxvZ0lkKSB8fCBsb2dJZCkgK1xuICAgICAgICAoc3VmZml4IHx8ICcnKSArXG4gICAgICAgICd9J1xuICAgICAgKTtcbiAgICB9XG4gICk7XG59O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbmV4cG9ydCBjb25zdCBkZWVwU3Vic3RpdHV0ZUJyYWNlZExvZ2ljYWxJZHMgPVxuICAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAocm93czogYW55KSA9PiB7XG4gICAgcmV0dXJuIHJvd3MubWFwKChyb3c6IGFueVtdKSA9PlxuICAgICAgcm93Lm1hcChzdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyhsb2dpY2FsVG9QYXRoTWFwKSlcbiAgICApO1xuICB9O1xuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbTpcbi8vIEBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWRpZmYvbGliL2Zvcm1hdCAoRm9ybWF0dGVyIGNsYXNzIGlzIG5vdCBleHBvcnRlZClcbmNvbnN0IG5vcm1hbGl6ZWRMb2dpY2FsSWRQYXRoID0gKGxvZ2ljYWxUb1BhdGhNYXA6IGFueSkgPT4gKGxvZ2ljYWxJZDogYW55KSA9PiB7XG4gIC8vIGlmIHdlIGhhdmUgYSBwYXRoIGluIHRoZSBtYXAsIHJldHVybiBpdFxuICBjb25zdCBwYXRoID0gbG9naWNhbFRvUGF0aE1hcFtsb2dpY2FsSWRdO1xuICByZXR1cm4gcGF0aCA/IG5vcm1hbGl6ZVBhdGgocGF0aCkgOiB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBQYXRoIGlzIHN1cHBvc2VkIHRvIHN0YXJ0IHdpdGggXCIvc3RhY2stbmFtZVwiLiBJZiB0aGlzIGlzIHRoZSBjYXNlIChpLmUuIHBhdGggaGFzIG1vcmUgdGhhblxuICAgKiB0d28gY29tcG9uZW50cywgd2UgcmVtb3ZlIHRoZSBmaXJzdCBwYXJ0LiBPdGhlcndpc2UsIHdlIGp1c3QgdXNlIHRoZSBmdWxsIHBhdGguXG4gICAqIEBwYXJhbSBwXG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHA6IHN0cmluZykge1xuICAgIGlmIChwLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgcCA9IHAuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBsZXQgcGFydHMgPSBwLnNwbGl0KCcvJyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMSk7XG4gICAgICAvLyByZW1vdmUgdGhlIGxhc3QgY29tcG9uZW50IGlmIGl0J3MgXCJSZXNvdXJjZVwiIG9yIFwiRGVmYXVsdFwiIChpZiB3ZSBoYXZlIG1vcmUgdGhhbiBhIHNpbmdsZSBjb21wb25lbnQpXG4gICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCBsYXN0ID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0ID09PSAnUmVzb3VyY2UnIHx8IGxhc3QgPT09ICdEZWZhdWx0Jykge1xuICAgICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHAgPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG59O1xuXG4vLyBjb3BpZWQgZnJvbVxuLy8gYXdzLWNkay9saWIvZGlmZiAoZnVuY3Rpb24gbm90IGV4cG9ydGVkKVxuY29uc3QgYnVpbGRMb2dpY2FsVG9QYXRoTWFwID0gKFxuICBzdGFjazogY3hhcGkuQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0XG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0+IHtcbiAgY29uc3QgbWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gIGZvciAoY29uc3QgbWQgb2Ygc3RhY2suZmluZE1ldGFkYXRhQnlUeXBlKFxuICAgIGN4c2NoZW1hLkFydGlmYWN0TWV0YWRhdGFFbnRyeVR5cGUuTE9HSUNBTF9JRFxuICApKSB7XG4gICAgbWFwW21kLmRhdGEgYXMgc3RyaW5nXSA9IG1kLnBhdGg7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn07XG5cbmNsYXNzIEN1c3RvbUNka1Rvb2xraXQgZXh0ZW5kcyBDZGtUb29sa2l0IHtcbiAgcHJpdmF0ZSBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wOiBDdXN0b21DZGtUb29sa2l0UHJvcHNbJ2Nka1Rvb2xraXREZXBsb3ltZW50c1Byb3AnXTtcbiAgY29uc3RydWN0b3IoeyBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wLCAuLi5wcm9wcyB9OiBDdXN0b21DZGtUb29sa2l0UHJvcHMpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ3VzdG9tQ2RrVG9vbGtpdCBzdXBlciBjbGFzcycpO1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLmNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AgPSBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wO1xuICB9XG5cbiAgLy8gbWV0aG9kIGlzIHJldmVyc2UgZW5naW5lZXJlZCBiYXNlZCBvbiBDZGtUb29raXQuZGlmZiBtZXRob2QgYnV0IHJldHVybnMgYSBkaWZmIHN0cnVjdHVyZVxuICAvLyB3aGVyZSBkaWZmIG91dHB1dHMgZm9ybWF0dGVkIGRpZmYgdG8gYSBzdHJlYW0gKGllLiBzdGRlcnIpXG4gIGFzeW5jIGdldERpZmZPYmplY3Qob3B0aW9uczogRGlmZk9wdGlvbnMpOiBQcm9taXNlPFN0YWNrUmF3RGlmZltdPiB7XG4gICAgY29uc29sZS5kZWJ1Zygnc2VsZWN0U3RhY2tzRm9yRGlmZicpO1xuICAgIGNvbnN0IHN0YWNrcyA9IGF3YWl0ICh0aGlzIGFzIGFueSkuc2VsZWN0U3RhY2tzRm9yRGlmZihcbiAgICAgIG9wdGlvbnMuc3RhY2tOYW1lcyxcbiAgICAgIG9wdGlvbnMuZXhjbHVzaXZlbHlcbiAgICApO1xuICAgIGxldCBkaWZmczogU3RhY2tSYXdEaWZmW10gPSBbXTtcbiAgICBpZiAob3B0aW9ucy50ZW1wbGF0ZVBhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1c2luZyB0ZW1wbGF0ZSBub3Qgc3VwcG9ydGVkIGJ5IGdldERpZmZPYmplY3QnKTtcbiAgICB9XG5cbiAgICAvLyBDb21wYXJlIE4gc3RhY2tzIGFnYWluc3QgZGVwbG95ZWQgdGVtcGxhdGVzXG4gICAgZm9yIChjb25zdCBzdGFjayBvZiBzdGFja3Muc3RhY2tBcnRpZmFjdHMpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoYHJlYWRDdXJyZW50VGVtcGxhdGUgZm9yIHN0YWNrOiAke3N0YWNrLmRpc3BsYXlOYW1lfWApO1xuICAgICAgLy8gdGhpcyBpcyBwb29wLCBidXQgY2FuJ3Qgc2VlIGFub3RoZXIgd2F5PyBcbiAgICAgIC8vICogUHJvcGVydHkgJ3Byb3BzJyBpcyBwcml2YXRlIGFuZCBvbmx5IGFjY2Vzc2libGUgd2l0aGluIGNsYXNzICdDZGtUb29sa2l0J1xuICAgICAgLy8gKiByZWNlbnQgdmVyc2lvbiBvZiBhd3MtY2RrICh+Mi44Mi4wKSBoYXMgY2hhbmdlZCBDZGtUb29sa2l0UHJvcHNbJ2Nsb3VkRm9ybWF0aW9uJ10gLT4gQ2RrVG9vbGtpdFByb3BzWydkZXBsb3ltZW50cyddXG4gICAgICBjb25zdCBjdXJyZW50VGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICh0aGlzIGFzIGFueSkucHJvcHNcbiAgICAgIClbdGhpcy5jZGtUb29sa2l0RGVwbG95bWVudHNQcm9wXS5yZWFkQ3VycmVudFRlbXBsYXRlKHN0YWNrKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ2Nsb3VkZm9ybWF0aW9uIGRpZmYgdGhlIHN0YWNrJyk7XG4gICAgICBkaWZmcy5wdXNoKHtcbiAgICAgICAgc3RhY2tOYW1lOiBzdGFjay5kaXNwbGF5TmFtZSxcbiAgICAgICAgcmF3RGlmZjogZmlsdGVyQ0RLTWV0YWRhdGEoXG4gICAgICAgICAgY2ZuRGlmZi5kaWZmVGVtcGxhdGUoY3VycmVudFRlbXBsYXRlLCBzdGFjay50ZW1wbGF0ZSlcbiAgICAgICAgKSxcbiAgICAgICAgbG9naWNhbFRvUGF0aE1hcDogYnVpbGRMb2dpY2FsVG9QYXRoTWFwKHN0YWNrKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBkaWZmcztcbiAgfVxufVxuXG5jb25zdCBkeW5hbWljYWxseUluc3RhbnRpYXRlRGVwbG95bWVudHMgPSAoc2RrUHJvdmlkZXI6IFNka1Byb3ZpZGVyKSA9PiB7XG4gIGxldCBEZXBsb3ltZW50cztcbiAgbGV0IGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3A6IENka1Rvb2xraXREZXBsb3ltZW50c1Byb3AgPSAnZGVwbG95bWVudHMnO1xuXG4gIHRyeSB7XG4gICAgRGVwbG95bWVudHMgPSByZXF1aXJlKCdhd3MtY2RrL2xpYi9hcGkvZGVwbG95bWVudHMnKS5EZXBsb3ltZW50cztcbiAgfSBjYXRjaChlcnIpIHtcbiAgICBEZXBsb3ltZW50cyA9IHJlcXVpcmUoJ2F3cy1jZGsvbGliL2FwaS9jbG91ZGZvcm1hdGlvbi1kZXBsb3ltZW50cycpLkNsb3VkRm9ybWF0aW9uRGVwbG95bWVudHM7XG4gICAgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCA9ICdjbG91ZEZvcm1hdGlvbic7XG4gIH1cblxuICBjb25zdCBkZXBsb3ltZW50cyA9IG5ldyBEZXBsb3ltZW50cyh7IHNka1Byb3ZpZGVyIH0pO1xuXG4gIHJldHVybiB7XG4gICAgZGVwbG95bWVudHMsXG4gICAgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCxcbiAgfVxufVxuXG4vLyByZXZlcnNlIGVuZ2luZWVyZWQgZnJvbSBub2RlX21vZHVsZXMvYXdzLWNkay9iaW4vY2RrLmpzXG5leHBvcnQgY29uc3QgYm9vdHN0cmFwQ2RrVG9vbGtpdCA9IGFzeW5jIChjb25maWdQcm9wcz86IENvbmZpZ3VyYXRpb25Qcm9wcyk6IFByb21pc2U8Q3VzdG9tQ2RrVG9vbGtpdD4gPT4ge1xuICBjb25zb2xlLmRlYnVnKCdsb2FkaW5nIGNvbmZpZ3VyYXRpb24nKTtcbiAgY29uc3QgY29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKGNvbmZpZ1Byb3BzKTtcbiAgLy8ge1xuICAvLyAgIF86IFsnZGlmZicgYXMgYW55XSxcbiAgLy8gICAnbm8tY29sb3InOiB0cnVlXG4gIC8vIH1cbiAgYXdhaXQgY29uZmlndXJhdGlvbi5sb2FkKCk7XG4gIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgc2RrIHByb3ZpZGVyJyk7XG4gIGNvbnN0IGlvSG9zdCA9IENsaUlvSG9zdC5pbnN0YW5jZSh7XG4gICAgbG9nTGV2ZWw6ICdpbmZvJyxcbiAgICBpc1RUWTogcHJvY2Vzcy5zdGRvdXQuaXNUVFksXG4gICAgaXNDSTogdHJ1ZSxcbiAgICBjdXJyZW50QWN0aW9uOiAnZGlmZicsXG4gIH0sIHRydWUpO1xuICBjb25zdCBpb0hlbHBlciA9IGFzSW9IZWxwZXIoaW9Ib3N0LCAnZGlmZicpO1xuICBjb25zdCBzZGtQcm92aWRlciA9IGF3YWl0IFNka1Byb3ZpZGVyLndpdGhBd3NDbGlDb21wYXRpYmxlRGVmYXVsdHMoe1xuICAgIGlvSGVscGVyLFxuICAgIC8vIHByb2ZpbGU6IGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZ2V0KFsncHJvZmlsZSddKSxcbiAgfSk7XG4gIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDbG91ZEV4ZWN1dGFibGUnKTtcbiAgbGV0IG91dERpckxvY2s6IGFueTtcbiAgY29uc3QgY2xvdWRFeGVjdXRhYmxlID0gbmV3IENsb3VkRXhlY3V0YWJsZSh7XG4gICAgY29uZmlndXJhdGlvbixcbiAgICBzZGtQcm92aWRlcixcbiAgICBpb0hlbHBlcjogaW9Ib3N0LmFzSW9IZWxwZXIoKSxcbiAgICAvLyBleGVjUHJvZ3JhbSByZXR1cm4gdHlwZSBjaGFuZ2VkIGluIGF3cy1jZGsgdjIuNjEuMCwgXG4gICAgLy8gdGhlcmVmb3JlIGNoZWNrIGlmIGV4ZWNQcm9ncmFtIHJldHVybmVkXG4gICAgLy8gb2JqZWN0IGNvbnRhaW5zIGBhc3NlbWJseWAgcHJvcCwgaWYgc28gdGhlbiByZXR1cm4gaXRcbiAgICBzeW50aGVzaXplcjogYXN5bmMgKGF3cywgY29uZmlnKSA9PiB7XG4gICAgICAvLyBJbnZva2UgJ2V4ZWNQcm9ncmFtJywgYW5kIGNvcHkgdGhlIGxvY2sgZm9yIHRoZSBkaXJlY3RvcnkgaW4gdGhlIGdsb2JhbFxuICAgICAgLy8gdmFyaWFibGUgaGVyZS4gSXQgd2lsbCBiZSByZWxlYXNlZCB3aGVuIHRoZSBDTEkgZXhpdHMuIExvY2tzIGFyZSBub3QgcmUtZW50cmFudFxuICAgICAgLy8gc28gcmVsZWFzZSBpdCBpZiB3ZSBoYXZlIHRvIHN5bnRoZXNpemUgbW9yZSB0aGFuIG9uY2UgKGJlY2F1c2Ugb2YgY29udGV4dCBsb29rdXBzKS5cbiAgICAgIGF3YWl0IG91dERpckxvY2s/LnJlbGVhc2UoKTtcbiAgICAgIGNvbnN0IHsgYXNzZW1ibHksIGxvY2sgfSA9IGF3YWl0IGV4ZWNQcm9ncmFtKGF3cywgaW9Ib3N0LmFzSW9IZWxwZXIoKSwgY29uZmlnKTtcbiAgICAgIFxuICAgICAgb3V0RGlyTG9jayA9IGxvY2s7XG4gICAgICByZXR1cm4gYXNzZW1ibHk7XG4gICAgfSxcbiAgfSk7XG4gIGNvbG9ycy5kaXNhYmxlKCk7XG4gIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgcGx1Z2lucycpO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIGxvYWRQbHVnaW5zKC4uLnNldHRpbmdzOiBhbnlbXSkge1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNldHRpbmdzKSB7XG4gICAgICBjb25zdCBwbHVnaW5zID0gc291cmNlLmdldChbJ3BsdWdpbiddKSB8fCBbXTtcbiAgICAgIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbiAgICAgICAgYXdhaXQgR0xPQkFMX1BMVUdJTl9IT1NULmxvYWQocGx1Z2luLCBpb0hvc3QpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBhd2FpdCBsb2FkUGx1Z2lucyhjb25maWd1cmF0aW9uLnNldHRpbmdzKTtcblxuICBjb25zb2xlLmRlYnVnKCdpbml0aWFsaXppbmcgQ3VzdG9tQ2RrVG9vbGtpdCcpO1xuICBjb25zdCB7IGRlcGxveW1lbnRzLCBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wIH0gPSBkeW5hbWljYWxseUluc3RhbnRpYXRlRGVwbG95bWVudHMoc2RrUHJvdmlkZXIpO1xuICByZXR1cm4gbmV3IEN1c3RvbUNka1Rvb2xraXQoe1xuICAgIGNsb3VkRXhlY3V0YWJsZSxcbiAgICBjb25maWd1cmF0aW9uLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AsXG4gICAgZGVwbG95bWVudHMsXG4gICAgdmVyYm9zZTogZmFsc2UsXG4gICAgaWdub3JlRXJyb3JzOiBmYWxzZSxcbiAgICBzdHJpY3Q6IHRydWUsXG4gIH0pO1xuICAvLyByZXR1cm4gbmV3IEN1c3RvbUNka1Rvb2xraXQoe1xuICAvLyAgIGNsb3VkRXhlY3V0YWJsZSxcbiAgLy8gICBjb25maWd1cmF0aW9uLFxuICAvLyAgIHNka1Byb3ZpZGVyLFxuICAvLyAgIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AsXG4gIC8vICAgW2Nka1Rvb2xraXREZXBsb3ltZW50c1Byb3BdOiBkZXBsb3ltZW50cyxcbiAgLy8gICB2ZXJib3NlOiBmYWxzZSxcbiAgLy8gICBpZ25vcmVFcnJvcnM6IGZhbHNlLFxuICAvLyAgIHN0cmljdDogdHJ1ZSxcbiAgLy8gfSBhcyBhbnkpO1xufTtcbiJdfQ==