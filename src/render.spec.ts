import { resolve } from 'path';
import { readFileSync } from 'fs';
import { mockCdkTestCustomDiff } from './test-util';
import { renderCustomDiffToHtmlString } from './render';

describe('renderCustomDiffToHtmlString', () => {
  it('renders the cdk custom diff to html (for the cdk in cdk-test/ directory)', async () => {
    const html = await renderCustomDiffToHtmlString(mockCdkTestCustomDiff(), 'CDK Diff');
    const expectedHtml = readFileSync(resolve(__dirname, './test-util/cdk-test-diff.html'), 'utf8');
    expect(html).toEqual(expectedHtml);
  })
});
