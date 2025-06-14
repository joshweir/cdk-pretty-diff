import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { Command, ConfigurationProps } from 'aws-cdk/lib/settings';
import { getCustomDiff, renderCustomDiffToHtmlString } from '../src/index';

const noop = (...args: any[]) => undefined;

let exiting: boolean = false;

const verboseMode = process.argv.indexOf('--verbose') !== -1;
const quietMode = !verboseMode && process.argv.indexOf('--quiet') !== -1;

const info = quietMode ? noop : console.info;
const debug = verboseMode ? console.debug : noop;

const main = async () => {
  const configProps: ConfigurationProps = {
    commandLineArguments: {
      _: [Command.DIFF],
      context: [
        'hello=world',
      ],
    }
  }
  const nicerDiffs = await getCustomDiff({ configProps });
  const html = renderCustomDiffToHtmlString(nicerDiffs, 'CDK Diff');
  writeFileSync(resolve(__dirname, '../cdk.out/diff.html'), html);
};

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  exiting = true;
});

process.on('SIGINT', () => {
  console.info('SIGTERM signal received.');
  exiting = true;
});

main()
  .then(() => {
    info('done');
  })
  .catch((err) => {
    console.error('oh dear!', err);
  });
