import { getCustomDiff } from './cdk-custom-diff';

const noop = (...args: any[]) => undefined;

let exiting: boolean = false;

const verboseMode = process.argv.indexOf('--verbose') !== -1;
const quietMode = !verboseMode && process.argv.indexOf('--quiet') !== -1;

const info = quietMode ? noop : console.info;
const debug = verboseMode ? console.debug : noop;

const main = async () => {
  const nicerDiffs = await getCustomDiff();
  console.log('****** START CUSTOM DIFF ******');
  console.log(JSON.stringify(nicerDiffs, null, 2));
  console.log('****** END CUSTOM DIFF ******');
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
