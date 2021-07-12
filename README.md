# CDK Pretty Diff

Format ugly `cdk diff` output to html making review easier. Inspired by [Terraform prettyplan](https://github.com/chrislewisdev/prettyplan).

## Installation

```
npm install cdk-pretty-diff
```

## Usage 

Instead of running cdk diff command line and receiving ugly diff output: 

```
cdk diff
```

### Get cdk diff as an object

``` typescript
import { getCustomDiff } from 'cdk-pretty-diff';

const nicerDiffs = await getCustomDiff();
console.log(JSON.stringify(nicerDiffs, null, 2));
```

### Render Pretty CDK Diff to html

``` typescript
import { getCustomDiff, renderCustomDiffToHtmlString } from 'cdk-pretty-diff';

const nicerDiffs = await getCustomDiff();
const html = renderCustomDiffToHtmlString(nicerDiffs, 'CDK Diff');
writeFileSync(resolve(__dirname, '../cdk.out/diff.html'), html);
```

html sample screenshot: 

![HTML Sample Screenshot](https://github.com/joshweir/cdk-pretty-diff/pretty-diff-html-sample.png)

## Development

```
npm i
npm run build
```