# CDK Pretty Diff

## Install

```
npm i
npm run build
```

## Usage 

```
AWS_PROFILE=[profile] ts-node bin/diff-to-stdout.ts
```

OR

``` typescript
import { getCustomDiff } from './cdk-custom-diff';

const nicerDiffs = await getCustomDiff();
console.log(JSON.stringify(nicerDiffs, null, 2));
```

TODO: 

* render the pretty diff in html (using terraform pretty plan html template)
* simplify lambda code change diff
* modularize the project
