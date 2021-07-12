import * as cfnDiff from '@aws-cdk/cloudformation-diff';
import * as cxapi from '@aws-cdk/cx-api';
import * as cxschema from '@aws-cdk/cloud-assembly-schema';
import { CdkToolkit, CdkToolkitProps, DiffOptions } from 'aws-cdk/lib/cdk-toolkit'
import { Configuration } from 'aws-cdk/lib/settings';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
import { CloudExecutable } from 'aws-cdk/lib/api/cxapp/cloud-executable';
import { execProgram } from 'aws-cdk/lib/api/cxapp/exec';
import * as colors from 'colors/safe';

import { StackRawDiff } from './types';

// reverse engineered from: 
// aws-cdk/lib/diff (printStackDiff)
const filterCDKMetadata = (diff: StackRawDiff['rawDiff']): StackRawDiff['rawDiff'] => {
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
}

// reverse engineered from:
// @aws-cdk/cloudformation-diff/lib/format (Formatter class is not exported)
/**
* Substitute all strings like ${LogId.xxx} with the path instead of the logical ID
*/
const substituteBracedLogicalIds = (logicalToPathMap: any) => (source: any) => {
  return source.replace(/\$\{([^.}]+)(.[^}]+)?\}/ig, (_match: any, logId: any, suffix: any) => {
      return '${' + (normalizedLogicalIdPath(logicalToPathMap)(logId) || logId) + (suffix || '') + '}';
  });
}

// reverse engineered from:
// @aws-cdk/cloudformation-diff/lib/format (Formatter class is not exported)
export const deepSubstituteBracedLogicalIds = (logicalToPathMap: any) => (rows: any) => {
  return rows.map((row: any[]) => row.map(substituteBracedLogicalIds(logicalToPathMap)));
}

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
}

// copied from 
// aws-cdk/lib/diff (function not exported)
const buildLogicalToPathMap = (stack: cxapi.CloudFormationStackArtifact): Record<string, string> => {
  const map: Record<string, any> = {};
  for (const md of stack.findMetadataByType(cxschema.ArtifactMetadataEntryType.LOGICAL_ID)) {
      map[md.data as string] = md.path;
  }
  return map;
}

class CustomCdkToolkit extends CdkToolkit {
  constructor(props: CdkToolkitProps) {
    super(props);
  }

  // method is reverse engineered based on CdkTookit.diff method but returns a diff structure 
  // where diff outputs formatted diff to a stream (ie. stderr)
  async getDiffObject(options: DiffOptions): Promise<StackRawDiff[]> {
    const stacks = await (this as any).selectStacksForDiff(options.stackNames, options.exclusively);
    let diffs: StackRawDiff[] = [];
    if (options.templatePath !== undefined) {
        throw new Error('using template not supported by getDiffObject')
    }

    // Compare N stacks against deployed templates
    for (const stack of stacks.stackArtifacts) {
      const currentTemplate = await (((this as any).props as CdkToolkitProps).cloudFormation.readCurrentTemplate(stack));
      diffs.push({
        stackName: stack.displayName,
        rawDiff: filterCDKMetadata(cfnDiff.diffTemplate(currentTemplate, stack.template)),
        logicalToPathMap: buildLogicalToPathMap(stack),
      })
    }

    return diffs;
  }
};

// reverse engineered from node_modules/aws-cdk/bin/cdk.js
export const bootstrapCdkToolkit = async (): Promise<CustomCdkToolkit> => {
  const configuration = new Configuration(
    // { 
    //   _: ['diff' as any],
    //   'no-color': true 
    // }
  );
  await configuration.load();
  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      // profile: configuration.settings.get(['profile']),
  });
  const cloudFormation = new CloudFormationDeployments({ sdkProvider });
  const cloudExecutable = new CloudExecutable({
      configuration,
      sdkProvider,
      synthesizer: execProgram,
  });

  colors.disable();

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
