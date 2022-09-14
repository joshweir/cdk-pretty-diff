import { createTwoFilesPatch } from 'diff';
import * as diff2html from 'diff2html';

import { NicerDiff, NicerDiffChange, NicerStackDiff } from "./types";
import htmlTemplate from './pretty-diff-template.html';

const prettify = (valueIn: any): string => {
  // fallback to empty string (eg. JSON.stringify of undefined is undefined)
  const value =
    (typeof valueIn === "string" ? valueIn : JSON.stringify(valueIn, null, 2)) || '';

  if (value === "<computed>") {
    return `<em>&lt;computed&gt;</em>`;
  }

  if (value.startsWith("${") && value.endsWith("}")) {
    return `<em>${value}</em>`;
  }

  if (value.indexOf("\\n") >= 0 || value.indexOf('\\"') >= 0) {
    const sanitisedValue = value
      .replace(new RegExp("\\\\n", "g"), "\n")
      .replace(new RegExp('\\\\"', "g"), '"');

    return `<pre>${prettifyJson(sanitisedValue)}</pre>`;
  }

  return value;
};

const prettifyJson = (maybeJson: string): string => {
  try {
    return JSON.stringify(JSON.parse(maybeJson), null, 2);
  } catch (e) {
    return maybeJson;
  }
};

const components = {
  badge: (label: string): string => `
    <span class="badge">${label}</span>
  `,

  id: (id: any): string => `
    <span class="id">
      <span class="id-segment type">${id.resourceType}</span>
      <span class="id-segment name">${id.resourceLabel}</span>
    </span>
  `,

  warning: (warning: any): string => `
    <li>
      ${components.badge("warning")}
      ${components.id(warning.id)}
      <span>${warning.detail}</span>
    </li>
  `,

  changeCount: (count: number): string => `
    <span class="change-count">
      ${`${count} change${count > 1 ? "s" : ""}`}
    </span>
  `,

  changeNoDiff: ({ action, to, label }: NicerDiffChange): string => `
    <tr>
      <td class="property">
        ${label}
        ${`<br /><span class="forces-new-resource">(${action})</span>`}
      </td>
      <td class="new-value">${prettify(to)}</td>
    </tr>
  `,

  changeDiff: ({ from, to, label }: NicerDiffChange): string => `
    <div>
      ${diff2html.html(
        createTwoFilesPatch(label, label, prettify(from), prettify(to)),
        {
          outputFormat: 'line-by-line',
          drawFileList: false,
          matching: 'words',
          matchWordsThreshold: 0.25,
          matchingMaxComparisons: 200,
        }
      )}
    </div>
  `,

  changes: (changes: NicerDiffChange[]) => {
    const diffChanges = changes.filter(({ from }) => !!from);
    const noDiffChanges = changes.filter(({ from }) => !from);

    return `
      <div class="changes-breakdown">
        <div class="no-diff-changes-breakdown">
          ${noDiffChanges.length ? (`
            <table>
              ${noDiffChanges.map(components.changeNoDiff).join("")}
            </table>
          `) : ''}
        </div>
        ${diffChanges.map(components.changeDiff).join("")}
      </table>
    `
  },

  action: ({ cdkDiffRaw, nicerDiff, label }: NicerDiff): string => `
    <li class="${nicerDiff?.resourceAction.toLocaleLowerCase() || "create"}">
      <div class="summary" onclick="accordion(this)">
        ${components.badge(nicerDiff?.resourceAction || "")}
        ${components.id(
          nicerDiff || { resourceType: "", resourceLabel: label }
        )}
      </div>
      <div class="changes collapsed">
        ${
          nicerDiff?.changes.length
            ? components.changes(nicerDiff.changes)
            : ""
        }
        ${components.rawDiff(cdkDiffRaw, "CDK Diff Output", {
          collapsed: !nicerDiff?.changes.length,
          showButton: !!nicerDiff?.changes.length,
        })}
      </div>
    </li>
  `,

  modal: (content: string): string => `
      <div class="modal-pane" onclick="closeModal()"></div>
      <div class="modal-content">
          <div class="modal-close"><button class="text-button" onclick="closeModal()">close</button></div>
          ${content}
      </div>
  `,

  rawDiff: (
    raw: string,
    toggleCaption: string,
    opts?: { collapsed: boolean; showButton?: boolean }
  ): string => `
    <div class="raw-diff">
      ${
        typeof opts?.showButton === "boolean" && opts?.showButton === false
          ? ""
          : `<button onclick="accordion(this)">${toggleCaption}</button>`
      }
      <div class="changes ${opts?.collapsed ? "collapsed" : ""}">
          <pre>${raw}</pre>
      </div>
    </div>
  `,

  stackDiff: ({ stackName, raw, diff }: NicerStackDiff): string => `
    <div class="stack">
      <h2>${stackName}</h2>
      ${components.rawDiff(raw, "Orig CDK Diff", { collapsed: true })}
      ${!diff?.length ? `<div>No changes</div>` : ""}
      <ul class="actions">
        ${diff
          ?.filter(
            ({ nicerDiff }) =>
              !nicerDiff ||
              !["parameters"].includes(nicerDiff?.cdkDiffCategory)
          )
          .map(components.action)
          .join("\n")}
      </ul>
    </div>
  `,
};

export const renderCustomDiffToHtmlNodeString = (diffs: NicerStackDiff[]): string =>
  diffs.map(components.stackDiff).join(' ');

export const renderCustomDiffToHtmlString = (
  diffs: NicerStackDiff[],
  title: string
): string => {
  let html = htmlTemplate;
  html = html
    .replace(`<h1>prettyplan</h1>`, `<h1>${title}</h1>`)
    .replace(`<title>prettyplan</title>`, `<title>${title}</title>`);

  html = html.replace(
    `<div id="stacks"></div>`,
    `<div id="stacks">${renderCustomDiffToHtmlNodeString(diffs)}</div>`
  );

  return html;
};
