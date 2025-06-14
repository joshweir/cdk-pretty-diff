import * as cfnDiff from '@aws-cdk/cloudformation-diff';
import * as cxapi from '@aws-cdk/cx-api';
import * as cxschema from '@aws-cdk/cloud-assembly-schema';
import {
  CdkToolkit,
  DiffOptions,
} from 'aws-cdk/lib/cli/cdk-toolkit';
import { Configuration, ConfigurationProps } from 'aws-cdk/lib/cli/user-configuration'
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudExecutable } from 'aws-cdk/lib/cxapp/cloud-executable';
import { execProgram } from 'aws-cdk/lib/cxapp/exec';
import * as colors from 'colors/safe';
import { asIoHelper } from 'aws-cdk/lib/api-private'
import { CliIoHost } from 'aws-cdk/lib/cli/io-host'
import { GLOBAL_PLUGIN_HOST } from 'aws-cdk/lib/cli/singleton-plugin-host'

import { CdkToolkitDeploymentsProp, CustomCdkToolkitProps, StackRawDiff } from './types';

// reverse engineered from:
// aws-cdk/lib/diff (printStackDiff)
const filterCDKMetadata = (
  diff: StackRawDiff['rawDiff']
): StackRawDiff['rawDiff'] => {
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
const substituteBracedLogicalIds = (logicalToPathMap: any) => (source: any) => {
  return source.replace(
    /\$\{([^.}]+)(.[^}]+)?\}/gi,
    (_match: any, logId: any, suffix: any) => {
      return (
        '${' +
        (normalizedLogicalIdPath(logicalToPathMap)(logId) || logId) +
        (suffix || '') +
        '}'
      );
    }
  );
};

// reverse engineered from:
// @aws-cdk/cloudformation-diff/lib/format (Formatter class is not exported)
export const deepSubstituteBracedLogicalIds =
  (logicalToPathMap: any) => (rows: any) => {
    return rows.map((row: any[]) =>
      row.map(substituteBracedLogicalIds(logicalToPathMap))
    );
  };

// reverse engineered from:
// @aws-cdk/cloudformation-diff/lib/format (Formatter class is not exported)
const normalizedLogicalIdPath = (logicalToPathMap: any) => (logicalId: any) => {
  // if we have a path in the map, return it
  const path = logicalToPathMap[logicalId];
  return path ? normalizePath(path) : undefined;
  /**
   * Path is supposed to start with "/stack-name". If this is the case (i.e. path has more than
   * two components, we remove the first part. Otherwise, we just use the full path.
   * @param p
   */
  function normalizePath(p: string) {
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
const buildLogicalToPathMap = (
  stack: cxapi.CloudFormationStackArtifact
): Record<string, string> => {
  const map: Record<string, any> = {};
  for (const md of stack.findMetadataByType(
    cxschema.ArtifactMetadataEntryType.LOGICAL_ID
  )) {
    map[md.data as string] = md.path;
  }
  return map;
};

class CustomCdkToolkit extends CdkToolkit {
  private cdkToolkitDeploymentsProp: CustomCdkToolkitProps['cdkToolkitDeploymentsProp'];
  constructor({ cdkToolkitDeploymentsProp, ...props }: CustomCdkToolkitProps) {
    console.debug('initializing CustomCdkToolkit super class');
    super(props);
    this.cdkToolkitDeploymentsProp = cdkToolkitDeploymentsProp;
  }

  // method is reverse engineered based on CdkTookit.diff method but returns a diff structure
  // where diff outputs formatted diff to a stream (ie. stderr)
  async getDiffObject(options: DiffOptions): Promise<StackRawDiff[]> {
    console.debug('selectStacksForDiff');
    const stacks = await (this as any).selectStacksForDiff(
      options.stackNames,
      options.exclusively
    );
    let diffs: StackRawDiff[] = [];
    if (options.templatePath !== undefined) {
      throw new Error('using template not supported by getDiffObject');
    }

    // Compare N stacks against deployed templates
    for (const stack of stacks.stackArtifacts) {
      console.debug(`readCurrentTemplate for stack: ${stack.displayName}`);
      // this is poop, but can't see another way? 
      // * Property 'props' is private and only accessible within class 'CdkToolkit'
      // * recent version of aws-cdk (~2.82.0) has changed CdkToolkitProps['cloudFormation'] -> CdkToolkitProps['deployments']
      const currentTemplate = await (
        (this as any).props
      )[this.cdkToolkitDeploymentsProp].readCurrentTemplate(stack);
      console.debug('cloudformation diff the stack');
      diffs.push({
        stackName: stack.displayName,
        rawDiff: filterCDKMetadata(
          cfnDiff.diffTemplate(currentTemplate, stack.template)
        ),
        logicalToPathMap: buildLogicalToPathMap(stack),
      });
    }

    return diffs;
  }
}

const dynamicallyInstantiateDeployments = (sdkProvider: SdkProvider) => {
  let Deployments;
  let cdkToolkitDeploymentsProp: CdkToolkitDeploymentsProp = 'deployments';

  try {
    Deployments = require('aws-cdk/lib/api/deployments').Deployments;
  } catch(err) {
    Deployments = require('aws-cdk/lib/api/cloudformation-deployments').CloudFormationDeployments;
    cdkToolkitDeploymentsProp = 'cloudFormation';
  }

  const deployments = new Deployments({ sdkProvider });

  return {
    deployments,
    cdkToolkitDeploymentsProp,
  }
}

// reverse engineered from node_modules/aws-cdk/bin/cdk.js
export const bootstrapCdkToolkit = async (configProps?: ConfigurationProps): Promise<CustomCdkToolkit> => {
  console.debug('loading configuration');
  const configuration = new Configuration(configProps);
  // {
  //   _: ['diff' as any],
  //   'no-color': true
  // }
  await configuration.load();
  console.debug('loading sdk provider');
  const ioHost = CliIoHost.instance({
    logLevel: 'info',
    isTTY: process.stdout.isTTY,
    isCI: true,
    currentAction: 'diff',
  }, true);
  const ioHelper = asIoHelper(ioHost, 'diff');
  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    ioHelper,
    // profile: configuration.settings.get(['profile']),
  });
  console.debug('initializing CloudExecutable');
  let outDirLock: any;
  const cloudExecutable = new CloudExecutable({
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
      await outDirLock?.release();
      const { assembly, lock } = await execProgram(aws, ioHost.asIoHelper(), config);
      
      outDirLock = lock;
      return assembly;
    },
  });
  colors.disable();
  console.debug('loading plugins');

  async function loadPlugins(...settings: any[]) {
    for (const source of settings) {
      const plugins = source.get(['plugin']) || [];
      for (const plugin of plugins) {
        await GLOBAL_PLUGIN_HOST.load(plugin, ioHost);
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
