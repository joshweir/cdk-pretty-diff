"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiffObject = exports.deepSubstituteBracedLogicalIds = void 0;
const cfnDiff = require("@aws-cdk/cloudformation-diff");
const cxschema = require("@aws-cdk/cloud-assembly-schema");
// import {
//   DiffOptions,
// } from 'aws-cdk/lib/cli/cdk-toolkit';
// import { Configuration, ConfigurationProps } from 'aws-cdk/lib/cli/user-configuration'
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
// class CustomCdkToolkit extends CdkToolkit {
//   private cdkToolkitDeploymentsProp: CustomCdkToolkitProps['cdkToolkitDeploymentsProp'];
//   constructor({ cdkToolkitDeploymentsProp, ...props }: CustomCdkToolkitProps) {
//     console.debug('initializing CustomCdkToolkit super class');
//     super(props);
//     this.cdkToolkitDeploymentsProp = cdkToolkitDeploymentsProp;
//   }
//   // method is reverse engineered based on CdkTookit.diff method but returns a diff structure
//   // where diff outputs formatted diff to a stream (ie. stderr)
//   async getDiffObject(options: DiffOptions): Promise<StackRawDiff[]> {
//     console.debug('selectStacksForDiff');
//     const stacks = await (this as any).selectStacksForDiff(
//       options.stackNames,
//       options.exclusively
//     );
//     let diffs: StackRawDiff[] = [];
//     if (options.templatePath !== undefined) {
//       throw new Error('using template not supported by getDiffObject');
//     }
//     // Compare N stacks against deployed templates
//     for (const stack of stacks.stackArtifacts) {
//       console.debug(`readCurrentTemplate for stack: ${stack.displayName}`);
//       // this is poop, but can't see another way? 
//       // * Property 'props' is private and only accessible within class 'CdkToolkit'
//       // * recent version of aws-cdk (~2.82.0) has changed CdkToolkitProps['cloudFormation'] -> CdkToolkitProps['deployments']
//       const currentTemplate = await (
//         (this as any).props
//       )[this.cdkToolkitDeploymentsProp].readCurrentTemplate(stack);
//       console.debug('cloudformation diff the stack');
//       diffs.push({
//         stackName: stack.displayName,
//         rawDiff: filterCDKMetadata(
//           cfnDiff.diffTemplate(currentTemplate, stack.template)
//         ),
//         logicalToPathMap: buildLogicalToPathMap(stack),
//       });
//     }
//     return diffs;
//   }
// }
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
    if (options === null || options === void 0 ? void 0 : options.context) {
        Object.entries(options.context).forEach(([key, value]) => {
            app.node.setContext(key, value);
        });
    }
    const assembly = app.synth();
    console.debug('loading sdk provider');
    // const ioHost = CliIoHost.instance({
    //   logLevel: 'info',
    //   isTTY: process.stdout.isTTY,
    //   isCI: true,
    //   currentAction: 'diff',
    // }, true);
    // const ioHelper = asIoHelper(ioHost, 'diff');
    const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
        ioHelper: {
            defaults: {
                debug: (input) => { console.debug(input); },
            }
        },
    });
    colors.disable();
    // Create the CloudFormation deployments service
    // const cfn = new CloudFormationDeployments({sdkProvider});
    const { deployments } = dynamicallyInstantiateDeployments(sdkProvider);
    const stacks = assembly.stacks;
    // Reload the synthesized artifact using cxapi
    // const stackArtifact = cxapi.CloudFormationStackArtifact.fromManifest(
    //   assembly,
    //   stack.artifactId,
    //   synthesized.getStackArtifact(stack.artifactId).manifest
    // ) as cxapi.CloudFormationStackArtifact;
    // // Get the current template
    // const currentTemplate = await deployments.readCurrentTemplate(stackArtifact);
    let diffs = [];
    // Compare each stack against deployed templates
    for (const stack of stacks) {
        const currentTemplate = await deployments.readCurrentTemplate(stack);
        diffs.push({
            stackName: stack.displayName,
            rawDiff: filterCDKMetadata(cfnDiff.diffTemplate(currentTemplate, stack.template)),
            logicalToPathMap: buildLogicalToPathMap(stack)
        });
    }
    return diffs;
}
exports.getDiffObject = getDiffObject;
async function readCurrentTemplate(sdkProvider, stack) {
    const cfn = await sdkProvider.forEnvironment(stack.environment.region, stack.environment.account);
    try {
        const response = await cfn.cloudFormation().getTemplate({
            StackName: stack.stackName,
            TemplateStage: 'Original'
        }).promise();
        return JSON.parse(response.TemplateBody || '{}');
    }
    catch (error) {
        if (error.code === 'ValidationError') {
            return {};
        }
        throw error;
    }
}
// reverse engineered from node_modules/aws-cdk/bin/cdk.js
// export const bootstrapCdkToolkit = async (configProps?: ConfigurationProps): Promise<CustomCdkToolkit> => {
//   console.debug('loading configuration');
//   const configuration = new Configuration(configProps);
//   // {
//   //   _: ['diff' as any],
//   //   'no-color': true
//   // }
//   await configuration.load();
//   console.debug('loading sdk provider');
//   const ioHost = CliIoHost.instance({
//     logLevel: 'info',
//     isTTY: process.stdout.isTTY,
//     isCI: true,
//     currentAction: 'diff',
//   }, true);
//   const ioHelper = asIoHelper(ioHost, 'diff');
//   const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
//     ioHelper,
//     // profile: configuration.settings.get(['profile']),
//   });
//   console.debug('initializing CloudExecutable');
//   let outDirLock: any;
//   const cloudExecutable = new CloudExecutable({
//     configuration,
//     sdkProvider,
//     ioHelper: ioHost.asIoHelper(),
//     // execProgram return type changed in aws-cdk v2.61.0, 
//     // therefore check if execProgram returned
//     // object contains `assembly` prop, if so then return it
//     synthesizer: async (aws, config) => {
//       // Invoke 'execProgram', and copy the lock for the directory in the global
//       // variable here. It will be released when the CLI exits. Locks are not re-entrant
//       // so release it if we have to synthesize more than once (because of context lookups).
//       await outDirLock?.release();
//       const { assembly, lock } = await execProgram(aws, ioHost.asIoHelper(), config);
//       outDirLock = lock;
//       return assembly;
//     },
//   });
//   colors.disable();
//   console.debug('loading plugins');
//   async function loadPlugins(...settings: any[]) {
//     for (const source of settings) {
//       const plugins = source.get(['plugin']) || [];
//       for (const plugin of plugins) {
//         await GLOBAL_PLUGIN_HOST.load(plugin, ioHost);
//       }
//     }
//   }
//   await loadPlugins(configuration.settings);
//   console.debug('initializing CustomCdkToolkit');
//   const { deployments, cdkToolkitDeploymentsProp } = dynamicallyInstantiateDeployments(sdkProvider);
//   return new CustomCdkToolkit({
//     cloudExecutable,
//     configuration,
//     sdkProvider,
//     cdkToolkitDeploymentsProp,
//     deployments,
//     verbose: false,
//     ignoreErrors: false,
//     strict: true,
//   });
//   // return new CustomCdkToolkit({
//   //   cloudExecutable,
//   //   configuration,
//   //   sdkProvider,
//   //   cdkToolkitDeploymentsProp,
//   //   [cdkToolkitDeploymentsProp]: deployments,
//   //   verbose: false,
//   //   ignoreErrors: false,
//   //   strict: true,
//   // } as any);
// };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJldmVyc2UtZW5naW5lZXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jZGstcmV2ZXJzZS1lbmdpbmVlcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHdEQUF3RDtBQUV4RCwyREFBMkQ7QUFDM0QsV0FBVztBQUNYLGlCQUFpQjtBQUNqQix3Q0FBd0M7QUFDeEMseUZBQXlGO0FBQ3pGLHVEQUF1RDtBQUd2RCxzQ0FBc0M7QUFPdEMsMkJBQTJCO0FBQzNCLG9DQUFvQztBQUNwQyxNQUFNLGlCQUFpQixHQUFHLENBQ3hCLElBQTZCLEVBQ0osRUFBRTtJQUMzQiw4REFBOEQ7SUFDOUQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ25ELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ25ELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVGLDJCQUEyQjtBQUMzQiw0RUFBNEU7QUFDNUU7O0dBRUc7QUFDSCxNQUFNLDBCQUEwQixHQUFHLENBQUMsZ0JBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7SUFDNUUsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUNuQiwyQkFBMkIsRUFDM0IsQ0FBQyxNQUFXLEVBQUUsS0FBVSxFQUFFLE1BQVcsRUFBRSxFQUFFO1FBQ3ZDLE9BQU8s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ICogYXMgY2ZuRGlmZiBmcm9tICdAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1kaWZmJztcbmltcG9ydCAqIGFzIGN4YXBpIGZyb20gJ0Bhd3MtY2RrL2N4LWFwaSc7XG5pbXBvcnQgKiBhcyBjeHNjaGVtYSBmcm9tICdAYXdzLWNkay9jbG91ZC1hc3NlbWJseS1zY2hlbWEnO1xuLy8gaW1wb3J0IHtcbi8vICAgRGlmZk9wdGlvbnMsXG4vLyB9IGZyb20gJ2F3cy1jZGsvbGliL2NsaS9jZGstdG9vbGtpdCc7XG4vLyBpbXBvcnQgeyBDb25maWd1cmF0aW9uLCBDb25maWd1cmF0aW9uUHJvcHMgfSBmcm9tICdhd3MtY2RrL2xpYi9jbGkvdXNlci1jb25maWd1cmF0aW9uJ1xuaW1wb3J0IHsgU2RrUHJvdmlkZXIgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGkvYXdzLWF1dGgnO1xuaW1wb3J0IHsgQ2xvdWRFeGVjdXRhYmxlIH0gZnJvbSAnYXdzLWNkay9saWIvY3hhcHAvY2xvdWQtZXhlY3V0YWJsZSc7XG5pbXBvcnQgeyBleGVjUHJvZ3JhbSB9IGZyb20gJ2F3cy1jZGsvbGliL2N4YXBwL2V4ZWMnO1xuaW1wb3J0ICogYXMgY29sb3JzIGZyb20gJ2NvbG9ycy9zYWZlJztcbi8vIGltcG9ydCB7IGFzSW9IZWxwZXIgfSBmcm9tICdhd3MtY2RrL2xpYi9hcGktcHJpdmF0ZSdcbi8vIGltcG9ydCB7IENsaUlvSG9zdCB9IGZyb20gJ2F3cy1jZGsvbGliL2NsaS9pby1ob3N0J1xuaW1wb3J0IHsgR0xPQkFMX1BMVUdJTl9IT1NUIH0gZnJvbSAnYXdzLWNkay9saWIvY2xpL3NpbmdsZXRvbi1wbHVnaW4taG9zdCdcblxuaW1wb3J0IHsgQ2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCwgQ3VzdG9tQ2RrVG9vbGtpdFByb3BzLCBTdGFja1Jhd0RpZmYgfSBmcm9tICcuL3R5cGVzJztcblxuLy8gcmV2ZXJzZSBlbmdpbmVlcmVkIGZyb206XG4vLyBhd3MtY2RrL2xpYi9kaWZmIChwcmludFN0YWNrRGlmZilcbmNvbnN0IGZpbHRlckNES01ldGFkYXRhID0gKFxuICBkaWZmOiBTdGFja1Jhd0RpZmZbJ3Jhd0RpZmYnXVxuKTogU3RhY2tSYXdEaWZmWydyYXdEaWZmJ10gPT4ge1xuICAvLyBmaWx0ZXIgb3V0ICdBV1M6OkNESzo6TWV0YWRhdGEnIHJlc291cmNlcyBmcm9tIHRoZSB0ZW1wbGF0ZVxuICBpZiAoZGlmZi5yZXNvdXJjZXMpIHtcbiAgICBkaWZmLnJlc291cmNlcyA9IGRpZmYucmVzb3VyY2VzLmZpbHRlcigoY2hhbmdlKSA9PiB7XG4gICAgICBpZiAoIWNoYW5nZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2UubmV3UmVzb3VyY2VUeXBlID09PSAnQVdTOjpDREs6Ok1ldGFkYXRhJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlLm9sZFJlc291cmNlVHlwZSA9PT0gJ0FXUzo6Q0RLOjpNZXRhZGF0YScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gZGlmZjtcbn07XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuLyoqXG4gKiBTdWJzdGl0dXRlIGFsbCBzdHJpbmdzIGxpa2UgJHtMb2dJZC54eHh9IHdpdGggdGhlIHBhdGggaW5zdGVhZCBvZiB0aGUgbG9naWNhbCBJRFxuICovXG5jb25zdCBzdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyA9IChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChzb3VyY2U6IGFueSkgPT4ge1xuICByZXR1cm4gc291cmNlLnJlcGxhY2UoXG4gICAgL1xcJFxceyhbXi59XSspKC5bXn1dKyk/XFx9L2dpLFxuICAgIChfbWF0Y2g6IGFueSwgbG9nSWQ6IGFueSwgc3VmZml4OiBhbnkpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICckeycgK1xuICAgICAgICAobm9ybWFsaXplZExvZ2ljYWxJZFBhdGgobG9naWNhbFRvUGF0aE1hcCkobG9nSWQpIHx8IGxvZ0lkKSArXG4gICAgICAgIChzdWZmaXggfHwgJycpICtcbiAgICAgICAgJ30nXG4gICAgICApO1xuICAgIH1cbiAgKTtcbn07XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuZXhwb3J0IGNvbnN0IGRlZXBTdWJzdGl0dXRlQnJhY2VkTG9naWNhbElkcyA9XG4gIChsb2dpY2FsVG9QYXRoTWFwOiBhbnkpID0+IChyb3dzOiBhbnkpID0+IHtcbiAgICByZXR1cm4gcm93cy5tYXAoKHJvdzogYW55W10pID0+XG4gICAgICByb3cubWFwKHN1YnN0aXR1dGVCcmFjZWRMb2dpY2FsSWRzKGxvZ2ljYWxUb1BhdGhNYXApKVxuICAgICk7XG4gIH07XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tOlxuLy8gQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24tZGlmZi9saWIvZm9ybWF0IChGb3JtYXR0ZXIgY2xhc3MgaXMgbm90IGV4cG9ydGVkKVxuY29uc3Qgbm9ybWFsaXplZExvZ2ljYWxJZFBhdGggPSAobG9naWNhbFRvUGF0aE1hcDogYW55KSA9PiAobG9naWNhbElkOiBhbnkpID0+IHtcbiAgLy8gaWYgd2UgaGF2ZSBhIHBhdGggaW4gdGhlIG1hcCwgcmV0dXJuIGl0XG4gIGNvbnN0IHBhdGggPSBsb2dpY2FsVG9QYXRoTWFwW2xvZ2ljYWxJZF07XG4gIHJldHVybiBwYXRoID8gbm9ybWFsaXplUGF0aChwYXRoKSA6IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIFBhdGggaXMgc3VwcG9zZWQgdG8gc3RhcnQgd2l0aCBcIi9zdGFjay1uYW1lXCIuIElmIHRoaXMgaXMgdGhlIGNhc2UgKGkuZS4gcGF0aCBoYXMgbW9yZSB0aGFuXG4gICAqIHR3byBjb21wb25lbnRzLCB3ZSByZW1vdmUgdGhlIGZpcnN0IHBhcnQuIE90aGVyd2lzZSwgd2UganVzdCB1c2UgdGhlIGZ1bGwgcGF0aC5cbiAgICogQHBhcmFtIHBcbiAgICovXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVBhdGgocDogc3RyaW5nKSB7XG4gICAgaWYgKHAuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBwID0gcC5zdWJzdHIoMSk7XG4gICAgfVxuICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoJy8nKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgxKTtcbiAgICAgIC8vIHJlbW92ZSB0aGUgbGFzdCBjb21wb25lbnQgaWYgaXQncyBcIlJlc291cmNlXCIgb3IgXCJEZWZhdWx0XCIgKGlmIHdlIGhhdmUgbW9yZSB0aGFuIGEgc2luZ2xlIGNvbXBvbmVudClcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3QgPT09ICdSZXNvdXJjZScgfHwgbGFzdCA9PT0gJ0RlZmF1bHQnKSB7XG4gICAgICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgwLCBwYXJ0cy5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcCA9IHBhcnRzLmpvaW4oJy8nKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cbn07XG5cbi8vIGNvcGllZCBmcm9tXG4vLyBhd3MtY2RrL2xpYi9kaWZmIChmdW5jdGlvbiBub3QgZXhwb3J0ZWQpXG5jb25zdCBidWlsZExvZ2ljYWxUb1BhdGhNYXAgPSAoXG4gIHN0YWNrOiBjZGsuY3hfYXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdFxuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9PiB7XG4gIGNvbnN0IG1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICBmb3IgKGNvbnN0IG1kIG9mIHN0YWNrLmZpbmRNZXRhZGF0YUJ5VHlwZShcbiAgICBjeHNjaGVtYS5BcnRpZmFjdE1ldGFkYXRhRW50cnlUeXBlLkxPR0lDQUxfSURcbiAgKSkge1xuICAgIG1hcFttZC5kYXRhIGFzIHN0cmluZ10gPSBtZC5wYXRoO1xuICB9XG4gIHJldHVybiBtYXA7XG59O1xuXG4vLyBjbGFzcyBDdXN0b21DZGtUb29sa2l0IGV4dGVuZHMgQ2RrVG9vbGtpdCB7XG4vLyAgIHByaXZhdGUgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcDogQ3VzdG9tQ2RrVG9vbGtpdFByb3BzWydjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wJ107XG4vLyAgIGNvbnN0cnVjdG9yKHsgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCwgLi4ucHJvcHMgfTogQ3VzdG9tQ2RrVG9vbGtpdFByb3BzKSB7XG4vLyAgICAgY29uc29sZS5kZWJ1ZygnaW5pdGlhbGl6aW5nIEN1c3RvbUNka1Rvb2xraXQgc3VwZXIgY2xhc3MnKTtcbi8vICAgICBzdXBlcihwcm9wcyk7XG4vLyAgICAgdGhpcy5jZGtUb29sa2l0RGVwbG95bWVudHNQcm9wID0gY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcDtcbi8vICAgfVxuXG4vLyAgIC8vIG1ldGhvZCBpcyByZXZlcnNlIGVuZ2luZWVyZWQgYmFzZWQgb24gQ2RrVG9va2l0LmRpZmYgbWV0aG9kIGJ1dCByZXR1cm5zIGEgZGlmZiBzdHJ1Y3R1cmVcbi8vICAgLy8gd2hlcmUgZGlmZiBvdXRwdXRzIGZvcm1hdHRlZCBkaWZmIHRvIGEgc3RyZWFtIChpZS4gc3RkZXJyKVxuLy8gICBhc3luYyBnZXREaWZmT2JqZWN0KG9wdGlvbnM6IERpZmZPcHRpb25zKTogUHJvbWlzZTxTdGFja1Jhd0RpZmZbXT4ge1xuLy8gICAgIGNvbnNvbGUuZGVidWcoJ3NlbGVjdFN0YWNrc0ZvckRpZmYnKTtcbi8vICAgICBjb25zdCBzdGFja3MgPSBhd2FpdCAodGhpcyBhcyBhbnkpLnNlbGVjdFN0YWNrc0ZvckRpZmYoXG4vLyAgICAgICBvcHRpb25zLnN0YWNrTmFtZXMsXG4vLyAgICAgICBvcHRpb25zLmV4Y2x1c2l2ZWx5XG4vLyAgICAgKTtcbi8vICAgICBsZXQgZGlmZnM6IFN0YWNrUmF3RGlmZltdID0gW107XG4vLyAgICAgaWYgKG9wdGlvbnMudGVtcGxhdGVQYXRoICE9PSB1bmRlZmluZWQpIHtcbi8vICAgICAgIHRocm93IG5ldyBFcnJvcigndXNpbmcgdGVtcGxhdGUgbm90IHN1cHBvcnRlZCBieSBnZXREaWZmT2JqZWN0Jyk7XG4vLyAgICAgfVxuXG4vLyAgICAgLy8gQ29tcGFyZSBOIHN0YWNrcyBhZ2FpbnN0IGRlcGxveWVkIHRlbXBsYXRlc1xuLy8gICAgIGZvciAoY29uc3Qgc3RhY2sgb2Ygc3RhY2tzLnN0YWNrQXJ0aWZhY3RzKSB7XG4vLyAgICAgICBjb25zb2xlLmRlYnVnKGByZWFkQ3VycmVudFRlbXBsYXRlIGZvciBzdGFjazogJHtzdGFjay5kaXNwbGF5TmFtZX1gKTtcbi8vICAgICAgIC8vIHRoaXMgaXMgcG9vcCwgYnV0IGNhbid0IHNlZSBhbm90aGVyIHdheT8gXG4vLyAgICAgICAvLyAqIFByb3BlcnR5ICdwcm9wcycgaXMgcHJpdmF0ZSBhbmQgb25seSBhY2Nlc3NpYmxlIHdpdGhpbiBjbGFzcyAnQ2RrVG9vbGtpdCdcbi8vICAgICAgIC8vICogcmVjZW50IHZlcnNpb24gb2YgYXdzLWNkayAofjIuODIuMCkgaGFzIGNoYW5nZWQgQ2RrVG9vbGtpdFByb3BzWydjbG91ZEZvcm1hdGlvbiddIC0+IENka1Rvb2xraXRQcm9wc1snZGVwbG95bWVudHMnXVxuLy8gICAgICAgY29uc3QgY3VycmVudFRlbXBsYXRlID0gYXdhaXQgKFxuLy8gICAgICAgICAodGhpcyBhcyBhbnkpLnByb3BzXG4vLyAgICAgICApW3RoaXMuY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcF0ucmVhZEN1cnJlbnRUZW1wbGF0ZShzdGFjayk7XG4vLyAgICAgICBjb25zb2xlLmRlYnVnKCdjbG91ZGZvcm1hdGlvbiBkaWZmIHRoZSBzdGFjaycpO1xuLy8gICAgICAgZGlmZnMucHVzaCh7XG4vLyAgICAgICAgIHN0YWNrTmFtZTogc3RhY2suZGlzcGxheU5hbWUsXG4vLyAgICAgICAgIHJhd0RpZmY6IGZpbHRlckNES01ldGFkYXRhKFxuLy8gICAgICAgICAgIGNmbkRpZmYuZGlmZlRlbXBsYXRlKGN1cnJlbnRUZW1wbGF0ZSwgc3RhY2sudGVtcGxhdGUpXG4vLyAgICAgICAgICksXG4vLyAgICAgICAgIGxvZ2ljYWxUb1BhdGhNYXA6IGJ1aWxkTG9naWNhbFRvUGF0aE1hcChzdGFjayksXG4vLyAgICAgICB9KTtcbi8vICAgICB9XG5cbi8vICAgICByZXR1cm4gZGlmZnM7XG4vLyAgIH1cbi8vIH1cblxuY29uc3QgZHluYW1pY2FsbHlJbnN0YW50aWF0ZURlcGxveW1lbnRzID0gKHNka1Byb3ZpZGVyOiBTZGtQcm92aWRlcikgPT4ge1xuICBsZXQgRGVwbG95bWVudHM7XG4gIGxldCBjZGtUb29sa2l0RGVwbG95bWVudHNQcm9wOiBDZGtUb29sa2l0RGVwbG95bWVudHNQcm9wID0gJ2RlcGxveW1lbnRzJztcblxuICB0cnkge1xuICAgIERlcGxveW1lbnRzID0gcmVxdWlyZSgnYXdzLWNkay9saWIvYXBpL2RlcGxveW1lbnRzJykuRGVwbG95bWVudHM7XG4gIH0gY2F0Y2goZXJyKSB7XG4gICAgRGVwbG95bWVudHMgPSByZXF1aXJlKCdhd3MtY2RrL2xpYi9hcGkvY2xvdWRmb3JtYXRpb24tZGVwbG95bWVudHMnKS5DbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzO1xuICAgIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AgPSAnY2xvdWRGb3JtYXRpb24nO1xuICB9XG5cbiAgY29uc3QgZGVwbG95bWVudHMgPSBuZXcgRGVwbG95bWVudHMoe1xuICAgIHNka1Byb3ZpZGVyLFxuICAgIGlvSGVscGVyOiB7XG4gICAgICBkZWZhdWx0czoge1xuICAgICAgICBkZWJ1ZzogKGlucHV0OiBzdHJpbmcpID0+IHsgY29uc29sZS5kZWJ1ZyhpbnB1dCkgfSxcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGRlcGxveW1lbnRzLFxuICAgIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AsXG4gIH1cbn1cblxuLy8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERpZmZPYmplY3Qob3B0aW9uczogRGlmZk9wdGlvbnMsIGNvbmZpZz86IHsgXG4vLyAgIGNvbmZpZ1Byb3BzPzogQ29uZmlndXJhdGlvblByb3BzXG4vLyB9KSB7XG4vLyAgIC8vIExvYWQgY29uZmlndXJhdGlvbiB3aXRoIHByb3ZpZGVkIHByb3BzXG4vLyAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbihjb25maWc/LmNvbmZpZ1Byb3BzKTtcbi8vICAgYXdhaXQgY29uZmlndXJhdGlvbi5sb2FkKCk7XG5cbi8vICAgY29uc29sZS5kZWJ1ZygnbG9hZGluZyBzZGsgcHJvdmlkZXInKTtcbi8vICAgY29uc3QgaW9Ib3N0ID0gQ2xpSW9Ib3N0Lmluc3RhbmNlKHtcbi8vICAgICBsb2dMZXZlbDogJ2luZm8nLFxuLy8gICAgIGlzVFRZOiBwcm9jZXNzLnN0ZG91dC5pc1RUWSxcbi8vICAgICBpc0NJOiB0cnVlLFxuLy8gICAgIGN1cnJlbnRBY3Rpb246ICdkaWZmJyxcbi8vICAgfSwgdHJ1ZSk7XG4vLyAgIGNvbnN0IGlvSGVscGVyID0gYXNJb0hlbHBlcihpb0hvc3QsICdkaWZmJyk7XG5cbi8vICAgY29uc3Qgc2RrUHJvdmlkZXIgPSBhd2FpdCBTZGtQcm92aWRlci53aXRoQXdzQ2xpQ29tcGF0aWJsZURlZmF1bHRzKHtcbi8vICAgICBpb0hlbHBlcixcbi8vICAgICAvLyBwcm9maWxlOiBjb25maWd1cmF0aW9uLnNldHRpbmdzLmdldChbJ3Byb2ZpbGUnXSksXG4vLyAgIH0pO1xuXG4vLyAgIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDbG91ZEV4ZWN1dGFibGUnKTtcbi8vICAgbGV0IG91dERpckxvY2s6IGFueTtcbi8vICAgY29uc3QgY2xvdWRFeGVjdXRhYmxlID0gbmV3IENsb3VkRXhlY3V0YWJsZSh7XG4vLyAgICAgY29uZmlndXJhdGlvbixcbi8vICAgICBzZGtQcm92aWRlcixcbi8vICAgICBpb0hlbHBlcjogaW9Ib3N0LmFzSW9IZWxwZXIoKSxcbi8vICAgICAvLyBleGVjUHJvZ3JhbSByZXR1cm4gdHlwZSBjaGFuZ2VkIGluIGF3cy1jZGsgdjIuNjEuMCwgXG4vLyAgICAgLy8gdGhlcmVmb3JlIGNoZWNrIGlmIGV4ZWNQcm9ncmFtIHJldHVybmVkXG4vLyAgICAgLy8gb2JqZWN0IGNvbnRhaW5zIGBhc3NlbWJseWAgcHJvcCwgaWYgc28gdGhlbiByZXR1cm4gaXRcbi8vICAgICBzeW50aGVzaXplcjogYXN5bmMgKGF3cywgY29uZmlnKSA9PiB7XG4vLyAgICAgICAvLyBJbnZva2UgJ2V4ZWNQcm9ncmFtJywgYW5kIGNvcHkgdGhlIGxvY2sgZm9yIHRoZSBkaXJlY3RvcnkgaW4gdGhlIGdsb2JhbFxuLy8gICAgICAgLy8gdmFyaWFibGUgaGVyZS4gSXQgd2lsbCBiZSByZWxlYXNlZCB3aGVuIHRoZSBDTEkgZXhpdHMuIExvY2tzIGFyZSBub3QgcmUtZW50cmFudFxuLy8gICAgICAgLy8gc28gcmVsZWFzZSBpdCBpZiB3ZSBoYXZlIHRvIHN5bnRoZXNpemUgbW9yZSB0aGFuIG9uY2UgKGJlY2F1c2Ugb2YgY29udGV4dCBsb29rdXBzKS5cbi8vICAgICAgIGF3YWl0IG91dERpckxvY2s/LnJlbGVhc2UoKTtcbi8vICAgICAgIGNvbnN0IHsgYXNzZW1ibHksIGxvY2sgfSA9IGF3YWl0IGV4ZWNQcm9ncmFtKGF3cywgaW9Ib3N0LmFzSW9IZWxwZXIoKSwgY29uZmlnKTtcbiAgICAgIFxuLy8gICAgICAgb3V0RGlyTG9jayA9IGxvY2s7XG4vLyAgICAgICByZXR1cm4gYXNzZW1ibHk7XG4vLyAgICAgfSxcbi8vICAgfSk7XG4vLyAgIGNvbG9ycy5kaXNhYmxlKCk7XG4vLyAgIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgcGx1Z2lucycpO1xuXG4vLyAgIGFzeW5jIGZ1bmN0aW9uIGxvYWRQbHVnaW5zKC4uLnNldHRpbmdzOiBhbnlbXSkge1xuLy8gICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNldHRpbmdzKSB7XG4vLyAgICAgICBjb25zdCBwbHVnaW5zID0gc291cmNlLmdldChbJ3BsdWdpbiddKSB8fCBbXTtcbi8vICAgICAgIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbi8vICAgICAgICAgYXdhaXQgR0xPQkFMX1BMVUdJTl9IT1NULmxvYWQocGx1Z2luLCBpb0hvc3QpO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgfVxuLy8gICBhd2FpdCBsb2FkUGx1Z2lucyhjb25maWd1cmF0aW9uLnNldHRpbmdzKTtcblxuLy8gICAvLyBDcmVhdGUgdGhlIENsb3VkRm9ybWF0aW9uIGRlcGxveW1lbnRzIHNlcnZpY2Vcbi8vICAgLy8gY29uc3QgY2ZuID0gbmV3IENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMoe3Nka1Byb3ZpZGVyfSk7XG4vLyAgIGNvbnN0IHsgZGVwbG95bWVudHMgfSA9IGR5bmFtaWNhbGx5SW5zdGFudGlhdGVEZXBsb3ltZW50cyhzZGtQcm92aWRlcik7XG5cbi8vICAgY29uc3QgYXNzZW1ibHkgPSBhd2FpdCBjbG91ZEV4ZWN1dGFibGUuc3ludGhlc2l6ZSgpO1xuLy8gICBjb25zdCBzdGFja3MgPSBhc3NlbWJseS5hc3NlbWJseS5zdGFja3M7XG5cbi8vICAgLy8gUmVsb2FkIHRoZSBzeW50aGVzaXplZCBhcnRpZmFjdCB1c2luZyBjeGFwaVxuLy8gICAvLyBjb25zdCBzdGFja0FydGlmYWN0ID0gY3hhcGkuQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0LmZyb21NYW5pZmVzdChcbi8vICAgLy8gICBhc3NlbWJseSxcbi8vICAgLy8gICBzdGFjay5hcnRpZmFjdElkLFxuLy8gICAvLyAgIHN5bnRoZXNpemVkLmdldFN0YWNrQXJ0aWZhY3Qoc3RhY2suYXJ0aWZhY3RJZCkubWFuaWZlc3Rcbi8vICAgLy8gKSBhcyBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Q7XG5cbi8vICAgLy8gLy8gR2V0IHRoZSBjdXJyZW50IHRlbXBsYXRlXG4vLyAgIC8vIGNvbnN0IGN1cnJlbnRUZW1wbGF0ZSA9IGF3YWl0IGRlcGxveW1lbnRzLnJlYWRDdXJyZW50VGVtcGxhdGUoc3RhY2tBcnRpZmFjdCk7XG5cbi8vICAgbGV0IGRpZmZzOiBTdGFja1Jhd0RpZmZbXSA9IFtdO1xuICBcbi8vICAgLy8gQ29tcGFyZSBlYWNoIHN0YWNrIGFnYWluc3QgZGVwbG95ZWQgdGVtcGxhdGVzXG4vLyAgIGZvciAoY29uc3Qgc3RhY2sgb2Ygc3RhY2tzKSB7XG4vLyAgICAgY29uc3QgY3VycmVudFRlbXBsYXRlID0gYXdhaXQgZGVwbG95bWVudHMucmVhZEN1cnJlbnRUZW1wbGF0ZShzdGFjayk7XG4gICAgXG4vLyAgICAgZGlmZnMucHVzaCh7XG4vLyAgICAgICBzdGFja05hbWU6IHN0YWNrLmRpc3BsYXlOYW1lLFxuLy8gICAgICAgcmF3RGlmZjogZmlsdGVyQ0RLTWV0YWRhdGEoXG4vLyAgICAgICAgIGNmbkRpZmYuZGlmZlRlbXBsYXRlKGN1cnJlbnRUZW1wbGF0ZSwgc3RhY2sudGVtcGxhdGUpXG4vLyAgICAgICApLFxuLy8gICAgICAgbG9naWNhbFRvUGF0aE1hcDogYnVpbGRMb2dpY2FsVG9QYXRoTWFwKHN0YWNrKVxuLy8gICAgIH0pO1xuLy8gICB9XG5cbi8vICAgcmV0dXJuIGRpZmZzO1xuLy8gfVxuXG5leHBvcnQgaW50ZXJmYWNlIERpZmZPcHRpb25zIHtcbiAgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREaWZmT2JqZWN0KGFwcDogY2RrLkFwcCwgb3B0aW9ucz86IERpZmZPcHRpb25zKSB7XG4gIGlmIChvcHRpb25zPy5jb250ZXh0KSB7XG4gICAgT2JqZWN0LmVudHJpZXMob3B0aW9ucy5jb250ZXh0KS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgIGFwcC5ub2RlLnNldENvbnRleHQoa2V5LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBhc3NlbWJseSA9IGFwcC5zeW50aCgpO1xuXG4gIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgc2RrIHByb3ZpZGVyJyk7XG4gIC8vIGNvbnN0IGlvSG9zdCA9IENsaUlvSG9zdC5pbnN0YW5jZSh7XG4gIC8vICAgbG9nTGV2ZWw6ICdpbmZvJyxcbiAgLy8gICBpc1RUWTogcHJvY2Vzcy5zdGRvdXQuaXNUVFksXG4gIC8vICAgaXNDSTogdHJ1ZSxcbiAgLy8gICBjdXJyZW50QWN0aW9uOiAnZGlmZicsXG4gIC8vIH0sIHRydWUpO1xuICAvLyBjb25zdCBpb0hlbHBlciA9IGFzSW9IZWxwZXIoaW9Ib3N0LCAnZGlmZicpO1xuXG4gIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgaW9IZWxwZXI6IHtcbiAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGRlYnVnOiAoaW5wdXQ6IHN0cmluZykgPT4geyBjb25zb2xlLmRlYnVnKGlucHV0KSB9LFxuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgYW55KTtcblxuICBjb2xvcnMuZGlzYWJsZSgpO1xuXG4gIC8vIENyZWF0ZSB0aGUgQ2xvdWRGb3JtYXRpb24gZGVwbG95bWVudHMgc2VydmljZVxuICAvLyBjb25zdCBjZm4gPSBuZXcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyh7c2RrUHJvdmlkZXJ9KTtcbiAgY29uc3QgeyBkZXBsb3ltZW50cyB9ID0gZHluYW1pY2FsbHlJbnN0YW50aWF0ZURlcGxveW1lbnRzKHNka1Byb3ZpZGVyKTtcblxuICBjb25zdCBzdGFja3MgPSBhc3NlbWJseS5zdGFja3M7XG5cbiAgLy8gUmVsb2FkIHRoZSBzeW50aGVzaXplZCBhcnRpZmFjdCB1c2luZyBjeGFwaVxuICAvLyBjb25zdCBzdGFja0FydGlmYWN0ID0gY3hhcGkuQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0LmZyb21NYW5pZmVzdChcbiAgLy8gICBhc3NlbWJseSxcbiAgLy8gICBzdGFjay5hcnRpZmFjdElkLFxuICAvLyAgIHN5bnRoZXNpemVkLmdldFN0YWNrQXJ0aWZhY3Qoc3RhY2suYXJ0aWZhY3RJZCkubWFuaWZlc3RcbiAgLy8gKSBhcyBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Q7XG5cbiAgLy8gLy8gR2V0IHRoZSBjdXJyZW50IHRlbXBsYXRlXG4gIC8vIGNvbnN0IGN1cnJlbnRUZW1wbGF0ZSA9IGF3YWl0IGRlcGxveW1lbnRzLnJlYWRDdXJyZW50VGVtcGxhdGUoc3RhY2tBcnRpZmFjdCk7XG5cbiAgbGV0IGRpZmZzOiBTdGFja1Jhd0RpZmZbXSA9IFtdO1xuICBcbiAgLy8gQ29tcGFyZSBlYWNoIHN0YWNrIGFnYWluc3QgZGVwbG95ZWQgdGVtcGxhdGVzXG4gIGZvciAoY29uc3Qgc3RhY2sgb2Ygc3RhY2tzKSB7XG4gICAgY29uc3QgY3VycmVudFRlbXBsYXRlID0gYXdhaXQgZGVwbG95bWVudHMucmVhZEN1cnJlbnRUZW1wbGF0ZShzdGFjayk7XG4gICAgXG4gICAgZGlmZnMucHVzaCh7XG4gICAgICBzdGFja05hbWU6IHN0YWNrLmRpc3BsYXlOYW1lLFxuICAgICAgcmF3RGlmZjogZmlsdGVyQ0RLTWV0YWRhdGEoXG4gICAgICAgIGNmbkRpZmYuZGlmZlRlbXBsYXRlKGN1cnJlbnRUZW1wbGF0ZSwgc3RhY2sudGVtcGxhdGUpXG4gICAgICApLFxuICAgICAgbG9naWNhbFRvUGF0aE1hcDogYnVpbGRMb2dpY2FsVG9QYXRoTWFwKHN0YWNrKVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGRpZmZzO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkQ3VycmVudFRlbXBsYXRlKHNka1Byb3ZpZGVyOiBhbnksIHN0YWNrOiBjZGsuY3hfYXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdCkge1xuICBjb25zdCBjZm4gPSBhd2FpdCBzZGtQcm92aWRlci5mb3JFbnZpcm9ubWVudChcbiAgICBzdGFjay5lbnZpcm9ubWVudC5yZWdpb24sIFxuICAgIHN0YWNrLmVudmlyb25tZW50LmFjY291bnRcbiAgKTtcbiAgXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjZm4uY2xvdWRGb3JtYXRpb24oKS5nZXRUZW1wbGF0ZSh7XG4gICAgICBTdGFja05hbWU6IHN0YWNrLnN0YWNrTmFtZSxcbiAgICAgIFRlbXBsYXRlU3RhZ2U6ICdPcmlnaW5hbCdcbiAgICB9KS5wcm9taXNlKCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UuVGVtcGxhdGVCb2R5IHx8ICd7fScpO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdWYWxpZGF0aW9uRXJyb3InKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8vIHJldmVyc2UgZW5naW5lZXJlZCBmcm9tIG5vZGVfbW9kdWxlcy9hd3MtY2RrL2Jpbi9jZGsuanNcbi8vIGV4cG9ydCBjb25zdCBib290c3RyYXBDZGtUb29sa2l0ID0gYXN5bmMgKGNvbmZpZ1Byb3BzPzogQ29uZmlndXJhdGlvblByb3BzKTogUHJvbWlzZTxDdXN0b21DZGtUb29sa2l0PiA9PiB7XG4vLyAgIGNvbnNvbGUuZGVidWcoJ2xvYWRpbmcgY29uZmlndXJhdGlvbicpO1xuLy8gICBjb25zdCBjb25maWd1cmF0aW9uID0gbmV3IENvbmZpZ3VyYXRpb24oY29uZmlnUHJvcHMpO1xuLy8gICAvLyB7XG4vLyAgIC8vICAgXzogWydkaWZmJyBhcyBhbnldLFxuLy8gICAvLyAgICduby1jb2xvcic6IHRydWVcbi8vICAgLy8gfVxuLy8gICBhd2FpdCBjb25maWd1cmF0aW9uLmxvYWQoKTtcbi8vICAgY29uc29sZS5kZWJ1ZygnbG9hZGluZyBzZGsgcHJvdmlkZXInKTtcbi8vICAgY29uc3QgaW9Ib3N0ID0gQ2xpSW9Ib3N0Lmluc3RhbmNlKHtcbi8vICAgICBsb2dMZXZlbDogJ2luZm8nLFxuLy8gICAgIGlzVFRZOiBwcm9jZXNzLnN0ZG91dC5pc1RUWSxcbi8vICAgICBpc0NJOiB0cnVlLFxuLy8gICAgIGN1cnJlbnRBY3Rpb246ICdkaWZmJyxcbi8vICAgfSwgdHJ1ZSk7XG4vLyAgIGNvbnN0IGlvSGVscGVyID0gYXNJb0hlbHBlcihpb0hvc3QsICdkaWZmJyk7XG4vLyAgIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4vLyAgICAgaW9IZWxwZXIsXG4vLyAgICAgLy8gcHJvZmlsZTogY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXQoWydwcm9maWxlJ10pLFxuLy8gICB9KTtcbi8vICAgY29uc29sZS5kZWJ1ZygnaW5pdGlhbGl6aW5nIENsb3VkRXhlY3V0YWJsZScpO1xuLy8gICBsZXQgb3V0RGlyTG9jazogYW55O1xuLy8gICBjb25zdCBjbG91ZEV4ZWN1dGFibGUgPSBuZXcgQ2xvdWRFeGVjdXRhYmxlKHtcbi8vICAgICBjb25maWd1cmF0aW9uLFxuLy8gICAgIHNka1Byb3ZpZGVyLFxuLy8gICAgIGlvSGVscGVyOiBpb0hvc3QuYXNJb0hlbHBlcigpLFxuLy8gICAgIC8vIGV4ZWNQcm9ncmFtIHJldHVybiB0eXBlIGNoYW5nZWQgaW4gYXdzLWNkayB2Mi42MS4wLCBcbi8vICAgICAvLyB0aGVyZWZvcmUgY2hlY2sgaWYgZXhlY1Byb2dyYW0gcmV0dXJuZWRcbi8vICAgICAvLyBvYmplY3QgY29udGFpbnMgYGFzc2VtYmx5YCBwcm9wLCBpZiBzbyB0aGVuIHJldHVybiBpdFxuLy8gICAgIHN5bnRoZXNpemVyOiBhc3luYyAoYXdzLCBjb25maWcpID0+IHtcbi8vICAgICAgIC8vIEludm9rZSAnZXhlY1Byb2dyYW0nLCBhbmQgY29weSB0aGUgbG9jayBmb3IgdGhlIGRpcmVjdG9yeSBpbiB0aGUgZ2xvYmFsXG4vLyAgICAgICAvLyB2YXJpYWJsZSBoZXJlLiBJdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdGhlIENMSSBleGl0cy4gTG9ja3MgYXJlIG5vdCByZS1lbnRyYW50XG4vLyAgICAgICAvLyBzbyByZWxlYXNlIGl0IGlmIHdlIGhhdmUgdG8gc3ludGhlc2l6ZSBtb3JlIHRoYW4gb25jZSAoYmVjYXVzZSBvZiBjb250ZXh0IGxvb2t1cHMpLlxuLy8gICAgICAgYXdhaXQgb3V0RGlyTG9jaz8ucmVsZWFzZSgpO1xuLy8gICAgICAgY29uc3QgeyBhc3NlbWJseSwgbG9jayB9ID0gYXdhaXQgZXhlY1Byb2dyYW0oYXdzLCBpb0hvc3QuYXNJb0hlbHBlcigpLCBjb25maWcpO1xuICAgICAgXG4vLyAgICAgICBvdXREaXJMb2NrID0gbG9jaztcbi8vICAgICAgIHJldHVybiBhc3NlbWJseTtcbi8vICAgICB9LFxuLy8gICB9KTtcbi8vICAgY29sb3JzLmRpc2FibGUoKTtcbi8vICAgY29uc29sZS5kZWJ1ZygnbG9hZGluZyBwbHVnaW5zJyk7XG5cbi8vICAgYXN5bmMgZnVuY3Rpb24gbG9hZFBsdWdpbnMoLi4uc2V0dGluZ3M6IGFueVtdKSB7XG4vLyAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc2V0dGluZ3MpIHtcbi8vICAgICAgIGNvbnN0IHBsdWdpbnMgPSBzb3VyY2UuZ2V0KFsncGx1Z2luJ10pIHx8IFtdO1xuLy8gICAgICAgZm9yIChjb25zdCBwbHVnaW4gb2YgcGx1Z2lucykge1xuLy8gICAgICAgICBhd2FpdCBHTE9CQUxfUExVR0lOX0hPU1QubG9hZChwbHVnaW4sIGlvSG9zdCk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9XG4vLyAgIGF3YWl0IGxvYWRQbHVnaW5zKGNvbmZpZ3VyYXRpb24uc2V0dGluZ3MpO1xuXG4vLyAgIGNvbnNvbGUuZGVidWcoJ2luaXRpYWxpemluZyBDdXN0b21DZGtUb29sa2l0Jyk7XG4vLyAgIGNvbnN0IHsgZGVwbG95bWVudHMsIGNka1Rvb2xraXREZXBsb3ltZW50c1Byb3AgfSA9IGR5bmFtaWNhbGx5SW5zdGFudGlhdGVEZXBsb3ltZW50cyhzZGtQcm92aWRlcik7XG4vLyAgIHJldHVybiBuZXcgQ3VzdG9tQ2RrVG9vbGtpdCh7XG4vLyAgICAgY2xvdWRFeGVjdXRhYmxlLFxuLy8gICAgIGNvbmZpZ3VyYXRpb24sXG4vLyAgICAgc2RrUHJvdmlkZXIsXG4vLyAgICAgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCxcbi8vICAgICBkZXBsb3ltZW50cyxcbi8vICAgICB2ZXJib3NlOiBmYWxzZSxcbi8vICAgICBpZ25vcmVFcnJvcnM6IGZhbHNlLFxuLy8gICAgIHN0cmljdDogdHJ1ZSxcbi8vICAgfSk7XG4vLyAgIC8vIHJldHVybiBuZXcgQ3VzdG9tQ2RrVG9vbGtpdCh7XG4vLyAgIC8vICAgY2xvdWRFeGVjdXRhYmxlLFxuLy8gICAvLyAgIGNvbmZpZ3VyYXRpb24sXG4vLyAgIC8vICAgc2RrUHJvdmlkZXIsXG4vLyAgIC8vICAgY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcCxcbi8vICAgLy8gICBbY2RrVG9vbGtpdERlcGxveW1lbnRzUHJvcF06IGRlcGxveW1lbnRzLFxuLy8gICAvLyAgIHZlcmJvc2U6IGZhbHNlLFxuLy8gICAvLyAgIGlnbm9yZUVycm9yczogZmFsc2UsXG4vLyAgIC8vICAgc3RyaWN0OiB0cnVlLFxuLy8gICAvLyB9IGFzIGFueSk7XG4vLyB9O1xuIl19