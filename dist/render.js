"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCustomDiffToHtmlString = exports.renderCustomDiffToHtmlNodeString = void 0;
const diff_1 = require("diff");
const diff2html = require("diff2html");
const pretty_diff_template_html_1 = require("./pretty-diff-template.html");
const prettify = (valueIn) => {
    // fallback to empty string (eg. JSON.stringify of undefined is undefined)
    const value = (typeof valueIn === "string" ? valueIn : JSON.stringify(valueIn, null, 2)) || '';
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
const prettifyJson = (maybeJson) => {
    try {
        return JSON.stringify(JSON.parse(maybeJson), null, 2);
    }
    catch (e) {
        return maybeJson;
    }
};
const components = {
    badge: (label) => `
    <span class="badge">${label}</span>
  `,
    id: (id) => `
    <span class="id">
      <span class="id-segment type">${id.resourceType}</span>
      <span class="id-segment name">${id.resourceLabel}</span>
    </span>
  `,
    warning: (warning) => `
    <li>
      ${components.badge("warning")}
      ${components.id(warning.id)}
      <span>${warning.detail}</span>
    </li>
  `,
    changeCount: (count) => `
    <span class="change-count">
      ${`${count} change${count > 1 ? "s" : ""}`}
    </span>
  `,
    changeNoDiff: ({ action, to, label }) => `
    <tr>
      <td class="property">
        ${label}
        ${`<br /><span class="forces-new-resource">(${action})</span>`}
      </td>
      <td class="new-value">${prettify(to)}</td>
    </tr>
  `,
    changeDiff: ({ from, to, label }) => `
    <div>
      ${diff2html.html(diff_1.createTwoFilesPatch(label, label, prettify(from), prettify(to)), {
        outputFormat: 'line-by-line',
        drawFileList: false,
        matching: 'words',
        matchWordsThreshold: 0.25,
        matchingMaxComparisons: 200,
    })}
    </div>
  `,
    changes: (changes) => {
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
    `;
    },
    action: ({ cdkDiffRaw, nicerDiff, label }) => `
    <li class="${(nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.resourceAction.toLocaleLowerCase()) || "create"}">
      <div class="summary" onclick="accordion(this)">
        ${components.badge((nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.resourceAction) || "")}
        ${components.id(nicerDiff || { resourceType: "", resourceLabel: label })}
      </div>
      <div class="changes collapsed">
        ${(nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.changes.length) ? components.changes(nicerDiff.changes)
        : ""}
        ${components.rawDiff(cdkDiffRaw, "CDK Diff Output", {
        collapsed: !(nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.changes.length),
        showButton: !!(nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.changes.length),
    })}
      </div>
    </li>
  `,
    modal: (content) => `
      <div class="modal-pane" onclick="closeModal()"></div>
      <div class="modal-content">
          <div class="modal-close"><button class="text-button" onclick="closeModal()">close</button></div>
          ${content}
      </div>
  `,
    rawDiff: (raw, toggleCaption, opts) => `
    <div class="raw-diff">
      ${typeof (opts === null || opts === void 0 ? void 0 : opts.showButton) === "boolean" && (opts === null || opts === void 0 ? void 0 : opts.showButton) === false
        ? ""
        : `<button onclick="accordion(this)">${toggleCaption}</button>`}
      <div class="changes ${(opts === null || opts === void 0 ? void 0 : opts.collapsed) ? "collapsed" : ""}">
          <pre>${raw}</pre>
      </div>
    </div>
  `,
    stackDiff: ({ stackName, raw, diff }) => `
    <div class="stack">
      <h2>${stackName}</h2>
      ${components.rawDiff(raw, "Orig CDK Diff", { collapsed: true })}
      ${!(diff === null || diff === void 0 ? void 0 : diff.length) ? `<div>No changes</div>` : ""}
      <ul class="actions">
        ${diff === null || diff === void 0 ? void 0 : diff.filter(({ nicerDiff }) => !nicerDiff ||
        !["parameters"].includes(nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.cdkDiffCategory)).map(components.action).join("\n")}
      </ul>
    </div>
  `,
};
exports.renderCustomDiffToHtmlNodeString = (diffs) => diffs.map(components.stackDiff).join(' ');
exports.renderCustomDiffToHtmlString = (diffs, title) => {
    let html = pretty_diff_template_html_1.default;
    html = html
        .replace(`<h1>prettyplan</h1>`, `<h1>${title}</h1>`)
        .replace(`<title>prettyplan</title>`, `<title>${title}</title>`);
    html = html.replace(`<div id="stacks"></div>`, `<div id="stacks">${exports.renderCustomDiffToHtmlNodeString(diffs)}</div>`);
    return html;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBMkM7QUFDM0MsdUNBQXVDO0FBR3ZDLDJFQUF1RDtBQUV2RCxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQVksRUFBVSxFQUFFO0lBQ3hDLDBFQUEwRTtJQUMxRSxNQUFNLEtBQUssR0FDVCxDQUFDLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFbkYsSUFBSSxLQUFLLEtBQUssWUFBWSxFQUFFO1FBQzFCLE9BQU8sMkJBQTJCLENBQUM7S0FDcEM7SUFFRCxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNqRCxPQUFPLE9BQU8sS0FBSyxPQUFPLENBQUM7S0FDNUI7SUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzFELE1BQU0sY0FBYyxHQUFHLEtBQUs7YUFDekIsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7YUFDdkMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUxQyxPQUFPLFFBQVEsWUFBWSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7S0FDckQ7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLE1BQU0sWUFBWSxHQUFHLENBQUMs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Q29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVUd29GaWxlc1BhdGNoIH0gZnJvbSAnZGlmZic7XG5pbXBvcnQgKiBhcyBkaWZmMmh0bWwgZnJvbSAnZGlmZjJodG1sJztcblxuaW1wb3J0IHsgTmljZXJEaWZmLCBOaWNlckRpZmZDaGFuZ2UsIE5pY2VyU3RhY2tEaWZmIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCBodG1sVGVtcGxhdGUgZnJvbSAnLi9wcmV0dHktZGlmZi10ZW1wbGF0ZS5odG1sJztcblxuY29uc3QgcHJldHRpZnkgPSAodmFsdWVJbjogYW55KTogc3RyaW5nID0+IHtcbiAgLy8gZmFsbGJhY2sgdG8gZW1wdHkgc3RyaW5nIChlZy4gSlNPTi5zdHJpbmdpZnkgb2YgdW5kZWZpbmVkIGlzIHVuZGVmaW5lZClcbiAgY29uc3QgdmFsdWUgPVxuICAgICh0eXBlb2YgdmFsdWVJbiA9PT0gXCJzdHJpbmdcIiA/IHZhbHVlSW4gOiBKU09OLnN0cmluZ2lmeSh2YWx1ZUluLCBudWxsLCAyKSkgfHwgJyc7XG5cbiAgaWYgKHZhbHVlID09PSBcIjxjb21wdXRlZD5cIikge1xuICAgIHJldHVybiBgPGVtPiZsdDtjb21wdXRlZCZndDs8L2VtPmA7XG4gIH1cblxuICBpZiAodmFsdWUuc3RhcnRzV2l0aChcIiR7XCIpICYmIHZhbHVlLmVuZHNXaXRoKFwifVwiKSkge1xuICAgIHJldHVybiBgPGVtPiR7dmFsdWV9PC9lbT5gO1xuICB9XG5cbiAgaWYgKHZhbHVlLmluZGV4T2YoXCJcXFxcblwiKSA+PSAwIHx8IHZhbHVlLmluZGV4T2YoJ1xcXFxcIicpID49IDApIHtcbiAgICBjb25zdCBzYW5pdGlzZWRWYWx1ZSA9IHZhbHVlXG4gICAgICAucmVwbGFjZShuZXcgUmVnRXhwKFwiXFxcXFxcXFxuXCIsIFwiZ1wiKSwgXCJcXG5cIilcbiAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxcXFxcXCInLCBcImdcIiksICdcIicpO1xuXG4gICAgcmV0dXJuIGA8cHJlPiR7cHJldHRpZnlKc29uKHNhbml0aXNlZFZhbHVlKX08L3ByZT5gO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuY29uc3QgcHJldHRpZnlKc29uID0gKG1heWJlSnNvbjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoSlNPTi5wYXJzZShtYXliZUpzb24pLCBudWxsLCAyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBtYXliZUpzb247XG4gIH1cbn07XG5cbmNvbnN0IGNvbXBvbmVudHMgPSB7XG4gIGJhZGdlOiAobGFiZWw6IHN0cmluZyk6IHN0cmluZyA9PiBgXG4gICAgPHNwYW4gY2xhc3M9XCJiYWRnZVwiPiR7bGFiZWx9PC9zcGFuPlxuICBgLFxuXG4gIGlkOiAoaWQ6IGFueSk6IHN0cmluZyA9PiBgXG4gICAgPHNwYW4gY2xhc3M9XCJpZFwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJpZC1zZWdtZW50IHR5cGVcIj4ke2lkLnJlc291cmNlVHlwZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cImlkLXNlZ21lbnQgbmFtZVwiPiR7aWQucmVzb3VyY2VMYWJlbH08L3NwYW4+XG4gICAgPC9zcGFuPlxuICBgLFxuXG4gIHdhcm5pbmc6ICh3YXJuaW5nOiBhbnkpOiBzdHJpbmcgPT4gYFxuICAgIDxsaT5cbiAgICAgICR7Y29tcG9uZW50cy5iYWRnZShcIndhcm5pbmdcIil9XG4gICAgICAke2NvbXBvbmVudHMuaWQod2FybmluZy5pZCl9XG4gICAgICA8c3Bhbj4ke3dhcm5pbmcuZGV0YWlsfTwvc3Bhbj5cbiAgICA8L2xpPlxuICBgLFxuXG4gIGNoYW5nZUNvdW50OiAoY291bnQ6IG51bWJlcik6IHN0cmluZyA9PiBgXG4gICAgPHNwYW4gY2xhc3M9XCJjaGFuZ2UtY291bnRcIj5cbiAgICAgICR7YCR7Y291bnR9IGNoYW5nZSR7Y291bnQgPiAxID8gXCJzXCIgOiBcIlwifWB9XG4gICAgPC9zcGFuPlxuICBgLFxuXG4gIGNoYW5nZU5vRGlmZjogKHsgYWN0aW9uLCB0bywgbGFiZWwgfTogTmljZXJEaWZmQ2hhbmdlKTogc3RyaW5nID0+IGBcbiAgICA8dHI+XG4gICAgICA8dGQgY2xhc3M9XCJwcm9wZXJ0eVwiPlxuICAgICAgICAke2xhYmVsfVxuICAgICAgICAke2A8YnIgLz48c3BhbiBjbGFzcz1cImZvcmNlcy1uZXctcmVzb3VyY2VcIj4oJHthY3Rpb259KTwvc3Bhbj5gfVxuICAgICAgPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cIm5ldy12YWx1ZVwiPiR7cHJldHRpZnkodG8pfTwvdGQ+XG4gICAgPC90cj5cbiAgYCxcblxuICBjaGFuZ2VEaWZmOiAoeyBmcm9tLCB0bywgbGFiZWwgfTogTmljZXJEaWZmQ2hhbmdlKTogc3RyaW5nID0+IGBcbiAgICA8ZGl2PlxuICAgICAgJHtkaWZmMmh0bWwuaHRtbChcbiAgICAgICAgY3JlYXRlVHdvRmlsZXNQYXRjaChsYWJlbCwgbGFiZWwsIHByZXR0aWZ5KGZyb20pLCBwcmV0dGlmeSh0bykpLFxuICAgICAgICB7XG4gICAgICAgICAgb3V0cHV0Rm9ybWF0OiAnbGluZS1ieS1saW5lJyxcbiAgICAgICAgICBkcmF3RmlsZUxpc3Q6IGZhbHNlLFxuICAgICAgICAgIG1hdGNoaW5nOiAnd29yZHMnLFxuICAgICAgICAgIG1hdGNoV29yZHNUaHJlc2hvbGQ6IDAuMjUsXG4gICAgICAgICAgbWF0Y2hpbmdNYXhDb21wYXJpc29uczogMjAwLFxuICAgICAgICB9XG4gICAgICApfVxuICAgIDwvZGl2PlxuICBgLFxuXG4gIGNoYW5nZXM6IChjaGFuZ2VzOiBOaWNlckRpZmZDaGFuZ2VbXSkgPT4ge1xuICAgIGNvbnN0IGRpZmZDaGFuZ2VzID0gY2hhbmdlcy5maWx0ZXIoKHsgZnJvbSB9KSA9PiAhIWZyb20pO1xuICAgIGNvbnN0IG5vRGlmZkNoYW5nZXMgPSBjaGFuZ2VzLmZpbHRlcigoeyBmcm9tIH0pID0+ICFmcm9tKTtcblxuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiY2hhbmdlcy1icmVha2Rvd25cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5vLWRpZmYtY2hhbmdlcy1icmVha2Rvd25cIj5cbiAgICAgICAgICAke25vRGlmZkNoYW5nZXMubGVuZ3RoID8gKGBcbiAgICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgICAgJHtub0RpZmZDaGFuZ2VzLm1hcChjb21wb25lbnRzLmNoYW5nZU5vRGlmZikuam9pbihcIlwiKX1cbiAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgYCkgOiAnJ31cbiAgICAgICAgPC9kaXY+XG4gICAgICAgICR7ZGlmZkNoYW5nZXMubWFwKGNvbXBvbmVudHMuY2hhbmdlRGlmZikuam9pbihcIlwiKX1cbiAgICAgIDwvdGFibGU+XG4gICAgYFxuICB9LFxuXG4gIGFjdGlvbjogKHsgY2RrRGlmZlJhdywgbmljZXJEaWZmLCBsYWJlbCB9OiBOaWNlckRpZmYpOiBzdHJpbmcgPT4gYFxuICAgIDxsaSBjbGFzcz1cIiR7bmljZXJEaWZmPy5yZXNvdXJjZUFjdGlvbi50b0xvY2FsZUxvd2VyQ2FzZSgpIHx8IFwiY3JlYXRlXCJ9XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VtbWFyeVwiIG9uY2xpY2s9XCJhY2NvcmRpb24odGhpcylcIj5cbiAgICAgICAgJHtjb21wb25lbnRzLmJhZGdlKG5pY2VyRGlmZj8ucmVzb3VyY2VBY3Rpb24gfHwgXCJcIil9XG4gICAgICAgICR7Y29tcG9uZW50cy5pZChcbiAgICAgICAgICBuaWNlckRpZmYgfHwgeyByZXNvdXJjZVR5cGU6IFwiXCIsIHJlc291cmNlTGFiZWw6IGxhYmVsIH1cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImNoYW5nZXMgY29sbGFwc2VkXCI+XG4gICAgICAgICR7XG4gICAgICAgICAgbmljZXJEaWZmPy5jaGFuZ2VzLmxlbmd0aFxuICAgICAgICAgICAgPyBjb21wb25lbnRzLmNoYW5nZXMobmljZXJEaWZmLmNoYW5nZXMpXG4gICAgICAgICAgICA6IFwiXCJcbiAgICAgICAgfVxuICAgICAgICAke2NvbXBvbmVudHMucmF3RGlmZihjZGtEaWZmUmF3LCBcIkNESyBEaWZmIE91dHB1dFwiLCB7XG4gICAgICAgICAgY29sbGFwc2VkOiAhbmljZXJEaWZmPy5jaGFuZ2VzLmxlbmd0aCxcbiAgICAgICAgICBzaG93QnV0dG9uOiAhIW5pY2VyRGlmZj8uY2hhbmdlcy5sZW5ndGgsXG4gICAgICAgIH0pfVxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgYCxcblxuICBtb2RhbDogKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyA9PiBgXG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtcGFuZVwiIG9uY2xpY2s9XCJjbG9zZU1vZGFsKClcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNsb3NlXCI+PGJ1dHRvbiBjbGFzcz1cInRleHQtYnV0dG9uXCIgb25jbGljaz1cImNsb3NlTW9kYWwoKVwiPmNsb3NlPC9idXR0b24+PC9kaXY+XG4gICAgICAgICAgJHtjb250ZW50fVxuICAgICAgPC9kaXY+XG4gIGAsXG5cbiAgcmF3RGlmZjogKFxuICAgIHJhdzogc3RyaW5nLFxuICAgIHRvZ2dsZUNhcHRpb246IHN0cmluZyxcbiAgICBvcHRzPzogeyBjb2xsYXBzZWQ6IGJvb2xlYW47IHNob3dCdXR0b24/OiBib29sZWFuIH1cbiAgKTogc3RyaW5nID0+IGBcbiAgICA8ZGl2IGNsYXNzPVwicmF3LWRpZmZcIj5cbiAgICAgICR7XG4gICAgICAgIHR5cGVvZiBvcHRzPy5zaG93QnV0dG9uID09PSBcImJvb2xlYW5cIiAmJiBvcHRzPy5zaG93QnV0dG9uID09PSBmYWxzZVxuICAgICAgICAgID8gXCJcIlxuICAgICAgICAgIDogYDxidXR0b24gb25jbGljaz1cImFjY29yZGlvbih0aGlzKVwiPiR7dG9nZ2xlQ2FwdGlvbn08L2J1dHRvbj5gXG4gICAgICB9XG4gICAgICA8ZGl2IGNsYXNzPVwiY2hhbmdlcyAke29wdHM/LmNvbGxhcHNlZCA/IFwiY29sbGFwc2VkXCIgOiBcIlwifVwiPlxuICAgICAgICAgIDxwcmU+JHtyYXd9PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYCxcblxuICBzdGFja0RpZmY6ICh7IHN0YWNrTmFtZSwgcmF3LCBkaWZmIH06IE5pY2VyU3RhY2tEaWZmKTogc3RyaW5nID0+IGBcbiAgICA8ZGl2IGNsYXNzPVwic3RhY2tcIj5cbiAgICAgIDxoMj4ke3N0YWNrTmFtZX08L2gyPlxuICAgICAgJHtjb21wb25lbnRzLnJhd0RpZmYocmF3LCBcIk9yaWcgQ0RLIERpZmZcIiwgeyBjb2xsYXBzZWQ6IHRydWUgfSl9XG4gICAgICAkeyFkaWZmPy5sZW5ndGggPyBgPGRpdj5ObyBjaGFuZ2VzPC9kaXY+YCA6IFwiXCJ9XG4gICAgICA8dWwgY2xhc3M9XCJhY3Rpb25zXCI+XG4gICAgICAgICR7ZGlmZlxuICAgICAgICAgID8uZmlsdGVyKFxuICAgICAgICAgICAgKHsgbmljZXJEaWZmIH0pID0+XG4gICAgICAgICAgICAgICFuaWNlckRpZmYgfHxcbiAgICAgICAgICAgICAgIVtcInBhcmFtZXRlcnNcIl0uaW5jbHVkZXMobmljZXJEaWZmPy5jZGtEaWZmQ2F0ZWdvcnkpXG4gICAgICAgICAgKVxuICAgICAgICAgIC5tYXAoY29tcG9uZW50cy5hY3Rpb24pXG4gICAgICAgICAgLmpvaW4oXCJcXG5cIil9XG4gICAgICA8L3VsPlxuICAgIDwvZGl2PlxuICBgLFxufTtcblxuZXhwb3J0IGNvbnN0IHJlbmRlckN1c3RvbURpZmZUb0h0bWxOb2RlU3RyaW5nID0gKGRpZmZzOiBOaWNlclN0YWNrRGlmZltdKTogc3RyaW5nID0+XG4gIGRpZmZzLm1hcChjb21wb25lbnRzLnN0YWNrRGlmZikuam9pbignICcpO1xuXG5leHBvcnQgY29uc3QgcmVuZGVyQ3VzdG9tRGlmZlRvSHRtbFN0cmluZyA9IChcbiAgZGlmZnM6IE5pY2VyU3RhY2tEaWZmW10sXG4gIHRpdGxlOiBzdHJpbmdcbik6IHN0cmluZyA9PiB7XG4gIGxldCBodG1sID0gaHRtbFRlbXBsYXRlO1xuICBodG1sID0gaHRtbFxuICAgIC5yZXBsYWNlKGA8aDE+cHJldHR5cGxhbjwvaDE+YCwgYDxoMT4ke3RpdGxlfTwvaDE+YClcbiAgICAucmVwbGFjZShgPHRpdGxlPnByZXR0eXBsYW48L3RpdGxlPmAsIGA8dGl0bGU+JHt0aXRsZX08L3RpdGxlPmApO1xuXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgYDxkaXYgaWQ9XCJzdGFja3NcIj48L2Rpdj5gLFxuICAgIGA8ZGl2IGlkPVwic3RhY2tzXCI+JHtyZW5kZXJDdXN0b21EaWZmVG9IdG1sTm9kZVN0cmluZyhkaWZmcyl9PC9kaXY+YFxuICApO1xuXG4gIHJldHVybiBodG1sO1xufTtcbiJdfQ==