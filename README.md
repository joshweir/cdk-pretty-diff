# CDK Pretty Diff

Format `cdk diff` output to html making review easier. Inspired by [Terraform prettyplan](https://github.com/chrislewisdev/prettyplan).

## Installation

If you are using `aws-cdk` <= v1:

```
npm install cdk-pretty-diff@1.x
```

or `aws-cdk` >= v2:

```
npm install cdk-pretty-diff
```

If using `aws-cdk` v2 < v2.1017.0 then install `cdk-pretty-diff` v2.2.6
If using `aws-cdk` >= v2.1017.0 then install `cdk-pretty-diff` v3

## Usage 

Instead of running `cdk diff` command line and receiving diff output, use `cdk-pretty-diff` (in javascript). Examples below.

### Get cdk diff as an object (cdk-pretty-diff >= v3.0.0, aws-cdk >= v2.1017.0)

``` typescript
import { getCustomDiff } from 'cdk-pretty-diff';
import * as cdk from "aws-cdk-lib";

// Your existing cdk app and stack(s)
const app = new cdk.App();
const stack = new cdk.Stack(app, "YourStack");

const nicerDiffs = await getCustomDiff(app);
console.log(JSON.stringify(nicerDiffs, null, 2));
```

### Get cdk diff as an object (cdk-pretty-diff < v3, aws-cdk < v2.1017.0)

``` typescript
import { getCustomDiff } from 'cdk-pretty-diff';

const nicerDiffs = await getCustomDiff();
console.log(JSON.stringify(nicerDiffs, null, 2));
```

### Render Pretty CDK Diff to html

html sample screenshot: 

![HTML Sample Screenshot](https://github.com/joshweir/cdk-pretty-diff/blob/master/pretty-diff-html-sample.png?raw=true)

* Original CDK Diff output is available (click the `Orig CDK Diff` button)

#### For (cdk-pretty-diff >= v3, aws-cdk >= v2.1017.0):

``` typescript
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { getCustomDiff, renderCustomDiffToHtmlString } from 'cdk-pretty-diff';
// import your cdk.App
import { app } from './your-cdk-app'

const nicerDiffs = await getCustomDiff(app);
const html = renderCustomDiffToHtmlString(nicerDiffs, 'CDK Diff');
writeFileSync(resolve(__dirname, '../cdk.out/diff.html'), html);
```

optionally, provide command line input args (as you could with `cdk diff` command):

``` typescript
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { Command, ConfigurationProps } from 'aws-cdk/lib/settings';
import { getCustomDiff, renderCustomDiffToHtmlString } from 'cdk-pretty-diff';
// import your cdk.App
import { app } from './your-cdk-app'

const configProps = { options: { context: { hello: 'world' } } }
const nicerDiffs = await getCustomDiff(app, configProps);
const html = renderCustomDiffToHtmlString(nicerDiffs, 'CDK Diff');
writeFileSync(resolve(__dirname, '../cdk.out/diff.html'), html);
```
example: [bin/diff-to-html-with-cli-args.ts](https://github.com/joshweir/cdk-pretty-diff/blob/master/bin/diff-to-html-with-cli-args.ts)


#### For (cdk-pretty-diff < v3, aws-cdk < v2.1017.0):

``` typescript
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { getCustomDiff, renderCustomDiffToHtmlString } from 'cdk-pretty-diff';

const nicerDiffs = await getCustomDiff();
const html = renderCustomDiffToHtmlString(nicerDiffs, 'CDK Diff');
writeFileSync(resolve(__dirname, '../cdk.out/diff.html'), html);
```

optionally, provide command line input args (as you could with `cdk diff` command):

``` typescript
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { Command, ConfigurationProps } from 'aws-cdk/lib/settings';
import { getCustomDiff, renderCustomDiffToHtmlString } from 'cdk-pretty-diff';

const configProps: ConfigurationProps = {
  commandLineArguments: {
    _: [Command.DIFF],
    context: [
      'foo=bar',
      'hello=world',
    ],
  }
}
const nicerDiffs = await getCustomDiff({ configProps });
const html = renderCustomDiffToHtmlString(nicerDiffs, 'CDK Diff');
writeFileSync(resolve(__dirname, '../cdk.out/diff.html'), html);
```
example: [bin/diff-to-html-with-cli-args.ts](https://github.com/joshweir/cdk-pretty-diff/blob/master/bin/diff-to-html-with-cli-args.ts)

## Development

```
npm i
npm run build

# run cdk pretty diff for the example stack:
AWS_PROFILE=<yourawscredentials> npx ts-node bin/diff-to-html.ts
# pretty diff location: cdk.out/diff.html
```
