import * as cdk from 'aws-cdk-lib';
import * as cfnDiff from '@aws-cdk/cloudformation-diff';
import * as cxschema from '@aws-cdk/cloud-assembly-schema';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import * as colors from 'colors/safe';
import { CdkToolkitDeploymentsProp, DiffOptions, StackRawDiff } from './types';

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
  stack: cdk.cx_api.CloudFormationStackArtifact
): Record<string, string> => {
  const map: Record<string, any> = {};
  for (const md of stack.findMetadataByType(
    cxschema.ArtifactMetadataEntryType.LOGICAL_ID
  )) {
    map[md.data as string] = md.path;
  }
  return map;
};

const dynamicallyInstantiateDeployments = (sdkProvider: SdkProvider) => {
  let Deployments;
  let cdkToolkitDeploymentsProp: CdkToolkitDeploymentsProp = 'deployments';

  try {
    Deployments = require('aws-cdk/lib/api/deployments').Deployments;
  } catch(err) {
    Deployments = require('aws-cdk/lib/api/cloudformation-deployments').CloudFormationDeployments;
    cdkToolkitDeploymentsProp = 'cloudFormation';
  }

  const deployments = new Deployments({
    sdkProvider,
    ioHelper: {
      defaults: {
        debug: (input: string) => { console.debug(input) },
      }
    },
  });

  return {
    deployments,
    cdkToolkitDeploymentsProp,
  }
}

export async function getDiffObject(app: cdk.App, options?: DiffOptions) {
  // If we have new context, we need to create a new app with the merged context
  if (options?.context) {
    // Get existing context
    const existingContext = app.node.tryGetContext('');
    
    // Create new merged context
    const mergedContext = {
      ...existingContext,
      ...options.context
    };
    
    // Create a new App with merged context
    const tempApp = new cdk.App({
      context: mergedContext,
    });

    // For each stack in the original app, create a new stack in the temp app
    for (const child of app.node.children) {
      if (child instanceof cdk.Stack) {
        const originalStack = child as cdk.Stack;
        
        // Create a new stack of the same type
        const stackProps = {
          env: {
            account: originalStack.account,
            region: originalStack.region
          },
          // Copy other stack properties that might be important
          stackName: originalStack.stackName,
          description: originalStack.templateOptions.description,
          terminationProtection: originalStack.terminationProtection,
          tags: originalStack.tags.tagValues(),
        };

        // Use reflection to create a new instance of the same stack class
        const stackClass = Object.getPrototypeOf(originalStack).constructor;
        new stackClass(tempApp, originalStack.node.id, stackProps);
      }
    }

    // Use the temporary app for synthesis
    const assembly = tempApp.synth();
    return await generateDiffs(assembly, options);
  }

  // If no new context, use the original app
  const assembly = app.synth();
  return await generateDiffs(assembly, options);
}

// Helper function to generate diffs from an assembly
async function generateDiffs(assembly: cdk.cx_api.CloudAssembly, options?: DiffOptions): Promise<StackRawDiff[]> {
  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    ioHelper: {
      defaults: {
        debug: (input: string) => { console.debug(input) },
      }
    },
  } as any, options?.profile);

  colors.disable();

  const { deployments } = dynamicallyInstantiateDeployments(sdkProvider);
  const diffs: StackRawDiff[] = [];
  
  for (const stack of assembly.stacks) {
    const currentTemplate = await deployments.readCurrentTemplate(stack);
    
    diffs.push({
      stackName: stack.displayName,
      rawDiff: filterCDKMetadata(
        cfnDiff.diffTemplate(currentTemplate, stack.template)
      ),
      logicalToPathMap: buildLogicalToPathMap(stack)
    });
  }

  return diffs;
}
