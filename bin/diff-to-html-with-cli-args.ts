import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { getCustomDiff, renderCustomDiffToHtmlString } from '../src/index';
import { app } from '../src/cdk-test'

const noop = (...args: any[]) => undefined;

let exiting: boolean = false;

const verboseMode = process.argv.indexOf('--verbose') !== -1;
const quietMode = !verboseMode && process.argv.indexOf('--quiet') !== -1;

const info = quietMode ? noop : console.info;
const debug = verboseMode ? console.debug : noop;

const main = async () => {
  const nicerDiffs = await getCustomDiff(app, { options: { context: { foo: 'bar', hello: 'world' } } });
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
