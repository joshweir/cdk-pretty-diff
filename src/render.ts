import { resolve } from "path";
import { readFileSync } from "fs";

import { NicerDiff, NicerDiffChange, NicerStackDiff } from "./types";

const prettify = (valueIn: any): string => {
  const value =
    typeof valueIn === "string" ? valueIn : JSON.stringify(valueIn, null, 2);
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

  change: ({ action, from, to, label }: NicerDiffChange): string => `
    <tr>
      <td class="property">
        ${label}
        ${`<br /><span class="forces-new-resource">(${action})</span>`}
      </td>
      <td class="old-value">${from ? prettify(from) : ""}</td>
      <td class="new-value">${prettify(to)}</td>
    </tr>
  `,

  action: ({ cdkDiffRaw, nicerDiff, label }: NicerDiff): string => `
    <li class="${nicerDiff?.resourceAction.toLocaleLowerCase() || "create"}">
      <div class="summary" onclick="accordion(this)">
        ${components.badge(nicerDiff?.resourceAction || "")}
        ${components.id(
          nicerDiff || { resourceType: "", resourceLabel: label }
        )}
        ${
          nicerDiff?.changes
            ? components.changeCount(nicerDiff.changes.length)
            : ""
        }
      </div>
      <div class="changes collapsed">
        ${
          nicerDiff?.changes.length
            ? `<table>
              ${nicerDiff?.changes.map(components.change).join("")}
          </table>`
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
          <pre>
            ${raw}
          </pre>
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

export const renderCustomDiffToHtmlString = (
  diffs: NicerStackDiff[],
  title: string
): string => {
  let html = readFileSync(
    resolve(__dirname, "./pretty-diff-template.html")
  ).toString();
  html = html
    .replace(`<h1>prettyplan</h1>`, `<h1>${title}</h1>`)
    .replace(`<title>prettyplan</title>`, `<title>${title}</title>`);

  const stacksHtml = diffs.map(components.stackDiff);
  html = html.replace(
    `<div id="stacks"></div>`,
    `<div id="stacks">${stacksHtml}</div>`
  );

  return html;
};
