"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCustomDiffToHtmlString = void 0;
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
exports.renderCustomDiffToHtmlString = (diffs, title) => {
    let html = pretty_diff_template_html_1.default;
    html = html
        .replace(`<h1>prettyplan</h1>`, `<h1>${title}</h1>`)
        .replace(`<title>prettyplan</title>`, `<title>${title}</title>`);
    const stacksHtml = diffs.map(components.stackDiff).join(' ');
    html = html.replace(`<div id="stacks"></div>`, `<div id="stacks">${stacksHtml}</div>`);
    return html;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBMkM7QUFDM0MsdUNBQXVDO0FBR3ZDLDJFQUF1RDtBQUV2RCxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQVksRUFBVSxFQUFFO0lBQ3hDLDBFQUEwRTtJQUMxRSxNQUFNLEtBQUssR0FDVCxDQUFDLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFbkYsSUFBSSxLQUFLLEtBQUssWUFBWSxFQUFFO1FBQzFCLE9BQU8sMkJBQTJCLENBQUM7S0FDcEM7SUFFRCxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNqRCxPQUFPLE9BQU8sS0FBSyxPQUFPLENBQUM7S0FDNUI7SUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzFELE1BQU0sY0FBYyxHQUFHLEtBQUs7YUFDekIsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7YUFDdkMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUxQyxPQUFPLFFBQVEsWUFBWSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7S0FDckQ7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLE1BQU0sWUFBWSxHQUFHLENBQUMs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ICdkaWZmJztcbmltcG9ydCAqIGFzIGRpZmYyaHRtbCBmcm9tICdkaWZmMmh0bWwnO1xuXG5pbXBvcnQgeyBOaWNlckRpZmYsIE5pY2VyRGlmZkNoYW5nZSwgTmljZXJTdGFja0RpZmYgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IGh0bWxUZW1wbGF0ZSBmcm9tICcuL3ByZXR0eS1kaWZmLXRlbXBsYXRlLmh0bWwnO1xuXG5jb25zdCBwcmV0dGlmeSA9ICh2YWx1ZUluOiBhbnkpOiBzdHJpbmcgPT4ge1xuICAvLyBmYWxsYmFjayB0byBlbXB0eSBzdHJpbmcgKGVnLiBKU09OLnN0cmluZ2lmeSBvZiB1bmRlZmluZWQgaXMgdW5kZWZpbmVkKVxuICBjb25zdCB2YWx1ZSA9XG4gICAgKHR5cGVvZiB2YWx1ZUluID09PSBcInN0cmluZ1wiID8gdmFsdWVJbiA6IEpTT04uc3RyaW5naWZ5KHZhbHVlSW4sIG51bGwsIDIpKSB8fCAnJztcblxuICBpZiAodmFsdWUgPT09IFwiPGNvbXB1dGVkPlwiKSB7XG4gICAgcmV0dXJuIGA8ZW0+Jmx0O2NvbXB1dGVkJmd0OzwvZW0+YDtcbiAgfVxuXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKFwiJHtcIikgJiYgdmFsdWUuZW5kc1dpdGgoXCJ9XCIpKSB7XG4gICAgcmV0dXJuIGA8ZW0+JHt2YWx1ZX08L2VtPmA7XG4gIH1cblxuICBpZiAodmFsdWUuaW5kZXhPZihcIlxcXFxuXCIpID49IDAgfHwgdmFsdWUuaW5kZXhPZignXFxcXFwiJykgPj0gMCkge1xuICAgIGNvbnN0IHNhbml0aXNlZFZhbHVlID0gdmFsdWVcbiAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoXCJcXFxcXFxcXG5cIiwgXCJnXCIpLCBcIlxcblwiKVxuICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXFxcXFxcIicsIFwiZ1wiKSwgJ1wiJyk7XG5cbiAgICByZXR1cm4gYDxwcmU+JHtwcmV0dGlmeUpzb24oc2FuaXRpc2VkVmFsdWUpfTwvcHJlPmA7XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG5jb25zdCBwcmV0dGlmeUpzb24gPSAobWF5YmVKc29uOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShKU09OLnBhcnNlKG1heWJlSnNvbiksIG51bGwsIDIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG1heWJlSnNvbjtcbiAgfVxufTtcblxuY29uc3QgY29tcG9uZW50cyA9IHtcbiAgYmFkZ2U6IChsYWJlbDogc3RyaW5nKTogc3RyaW5nID0+IGBcbiAgICA8c3BhbiBjbGFzcz1cImJhZGdlXCI+JHtsYWJlbH08L3NwYW4+XG4gIGAsXG5cbiAgaWQ6IChpZDogYW55KTogc3RyaW5nID0+IGBcbiAgICA8c3BhbiBjbGFzcz1cImlkXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cImlkLXNlZ21lbnQgdHlwZVwiPiR7aWQucmVzb3VyY2VUeXBlfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaWQtc2VnbWVudCBuYW1lXCI+JHtpZC5yZXNvdXJjZUxhYmVsfTwvc3Bhbj5cbiAgICA8L3NwYW4+XG4gIGAsXG5cbiAgd2FybmluZzogKHdhcm5pbmc6IGFueSk6IHN0cmluZyA9PiBgXG4gICAgPGxpPlxuICAgICAgJHtjb21wb25lbnRzLmJhZGdlKFwid2FybmluZ1wiKX1cbiAgICAgICR7Y29tcG9uZW50cy5pZCh3YXJuaW5nLmlkKX1cbiAgICAgIDxzcGFuPiR7d2FybmluZy5kZXRhaWx9PC9zcGFuPlxuICAgIDwvbGk+XG4gIGAsXG5cbiAgY2hhbmdlQ291bnQ6IChjb3VudDogbnVtYmVyKTogc3RyaW5nID0+IGBcbiAgICA8c3BhbiBjbGFzcz1cImNoYW5nZS1jb3VudFwiPlxuICAgICAgJHtgJHtjb3VudH0gY2hhbmdlJHtjb3VudCA+IDEgPyBcInNcIiA6IFwiXCJ9YH1cbiAgICA8L3NwYW4+XG4gIGAsXG5cbiAgY2hhbmdlTm9EaWZmOiAoeyBhY3Rpb24sIHRvLCBsYWJlbCB9OiBOaWNlckRpZmZDaGFuZ2UpOiBzdHJpbmcgPT4gYFxuICAgIDx0cj5cbiAgICAgIDx0ZCBjbGFzcz1cInByb3BlcnR5XCI+XG4gICAgICAgICR7bGFiZWx9XG4gICAgICAgICR7YDxiciAvPjxzcGFuIGNsYXNzPVwiZm9yY2VzLW5ldy1yZXNvdXJjZVwiPigke2FjdGlvbn0pPC9zcGFuPmB9XG4gICAgICA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwibmV3LXZhbHVlXCI+JHtwcmV0dGlmeSh0byl9PC90ZD5cbiAgICA8L3RyPlxuICBgLFxuXG4gIGNoYW5nZURpZmY6ICh7IGZyb20sIHRvLCBsYWJlbCB9OiBOaWNlckRpZmZDaGFuZ2UpOiBzdHJpbmcgPT4gYFxuICAgIDxkaXY+XG4gICAgICAke2RpZmYyaHRtbC5odG1sKFxuICAgICAgICBjcmVhdGVUd29GaWxlc1BhdGNoKGxhYmVsLCBsYWJlbCwgcHJldHRpZnkoZnJvbSksIHByZXR0aWZ5KHRvKSksXG4gICAgICAgIHtcbiAgICAgICAgICBvdXRwdXRGb3JtYXQ6ICdsaW5lLWJ5LWxpbmUnLFxuICAgICAgICAgIGRyYXdGaWxlTGlzdDogZmFsc2UsXG4gICAgICAgICAgbWF0Y2hpbmc6ICd3b3JkcycsXG4gICAgICAgICAgbWF0Y2hXb3Jkc1RocmVzaG9sZDogMC4yNSxcbiAgICAgICAgICBtYXRjaGluZ01heENvbXBhcmlzb25zOiAyMDAsXG4gICAgICAgIH1cbiAgICAgICl9XG4gICAgPC9kaXY+XG4gIGAsXG5cbiAgY2hhbmdlczogKGNoYW5nZXM6IE5pY2VyRGlmZkNoYW5nZVtdKSA9PiB7XG4gICAgY29uc3QgZGlmZkNoYW5nZXMgPSBjaGFuZ2VzLmZpbHRlcigoeyBmcm9tIH0pID0+ICEhZnJvbSk7XG4gICAgY29uc3Qgbm9EaWZmQ2hhbmdlcyA9IGNoYW5nZXMuZmlsdGVyKCh7IGZyb20gfSkgPT4gIWZyb20pO1xuXG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJjaGFuZ2VzLWJyZWFrZG93blwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibm8tZGlmZi1jaGFuZ2VzLWJyZWFrZG93blwiPlxuICAgICAgICAgICR7bm9EaWZmQ2hhbmdlcy5sZW5ndGggPyAoYFxuICAgICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgICAke25vRGlmZkNoYW5nZXMubWFwKGNvbXBvbmVudHMuY2hhbmdlTm9EaWZmKS5qb2luKFwiXCIpfVxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICBgKSA6ICcnfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgJHtkaWZmQ2hhbmdlcy5tYXAoY29tcG9uZW50cy5jaGFuZ2VEaWZmKS5qb2luKFwiXCIpfVxuICAgICAgPC90YWJsZT5cbiAgICBgXG4gIH0sXG5cbiAgYWN0aW9uOiAoeyBjZGtEaWZmUmF3LCBuaWNlckRpZmYsIGxhYmVsIH06IE5pY2VyRGlmZik6IHN0cmluZyA9PiBgXG4gICAgPGxpIGNsYXNzPVwiJHtuaWNlckRpZmY/LnJlc291cmNlQWN0aW9uLnRvTG9jYWxlTG93ZXJDYXNlKCkgfHwgXCJjcmVhdGVcIn1cIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdW1tYXJ5XCIgb25jbGljaz1cImFjY29yZGlvbih0aGlzKVwiPlxuICAgICAgICAke2NvbXBvbmVudHMuYmFkZ2UobmljZXJEaWZmPy5yZXNvdXJjZUFjdGlvbiB8fCBcIlwiKX1cbiAgICAgICAgJHtjb21wb25lbnRzLmlkKFxuICAgICAgICAgIG5pY2VyRGlmZiB8fCB7IHJlc291cmNlVHlwZTogXCJcIiwgcmVzb3VyY2VMYWJlbDogbGFiZWwgfVxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2hhbmdlcyBjb2xsYXBzZWRcIj5cbiAgICAgICAgJHtcbiAgICAgICAgICBuaWNlckRpZmY/LmNoYW5nZXMubGVuZ3RoXG4gICAgICAgICAgICA/IGNvbXBvbmVudHMuY2hhbmdlcyhuaWNlckRpZmYuY2hhbmdlcylcbiAgICAgICAgICAgIDogXCJcIlxuICAgICAgICB9XG4gICAgICAgICR7Y29tcG9uZW50cy5yYXdEaWZmKGNka0RpZmZSYXcsIFwiQ0RLIERpZmYgT3V0cHV0XCIsIHtcbiAgICAgICAgICBjb2xsYXBzZWQ6ICFuaWNlckRpZmY/LmNoYW5nZXMubGVuZ3RoLFxuICAgICAgICAgIHNob3dCdXR0b246ICEhbmljZXJEaWZmPy5jaGFuZ2VzLmxlbmd0aCxcbiAgICAgICAgfSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICBgLFxuXG4gIG1vZGFsOiAoY29udGVudDogc3RyaW5nKTogc3RyaW5nID0+IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1wYW5lXCIgb25jbGljaz1cImNsb3NlTW9kYWwoKVwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY2xvc2VcIj48YnV0dG9uIGNsYXNzPVwidGV4dC1idXR0b25cIiBvbmNsaWNrPVwiY2xvc2VNb2RhbCgpXCI+Y2xvc2U8L2J1dHRvbj48L2Rpdj5cbiAgICAgICAgICAke2NvbnRlbnR9XG4gICAgICA8L2Rpdj5cbiAgYCxcblxuICByYXdEaWZmOiAoXG4gICAgcmF3OiBzdHJpbmcsXG4gICAgdG9nZ2xlQ2FwdGlvbjogc3RyaW5nLFxuICAgIG9wdHM/OiB7IGNvbGxhcHNlZDogYm9vbGVhbjsgc2hvd0J1dHRvbj86IGJvb2xlYW4gfVxuICApOiBzdHJpbmcgPT4gYFxuICAgIDxkaXYgY2xhc3M9XCJyYXctZGlmZlwiPlxuICAgICAgJHtcbiAgICAgICAgdHlwZW9mIG9wdHM/LnNob3dCdXR0b24gPT09IFwiYm9vbGVhblwiICYmIG9wdHM/LnNob3dCdXR0b24gPT09IGZhbHNlXG4gICAgICAgICAgPyBcIlwiXG4gICAgICAgICAgOiBgPGJ1dHRvbiBvbmNsaWNrPVwiYWNjb3JkaW9uKHRoaXMpXCI+JHt0b2dnbGVDYXB0aW9ufTwvYnV0dG9uPmBcbiAgICAgIH1cbiAgICAgIDxkaXYgY2xhc3M9XCJjaGFuZ2VzICR7b3B0cz8uY29sbGFwc2VkID8gXCJjb2xsYXBzZWRcIiA6IFwiXCJ9XCI+XG4gICAgICAgICAgPHByZT4ke3Jhd308L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgLFxuXG4gIHN0YWNrRGlmZjogKHsgc3RhY2tOYW1lLCByYXcsIGRpZmYgfTogTmljZXJTdGFja0RpZmYpOiBzdHJpbmcgPT4gYFxuICAgIDxkaXYgY2xhc3M9XCJzdGFja1wiPlxuICAgICAgPGgyPiR7c3RhY2tOYW1lfTwvaDI+XG4gICAgICAke2NvbXBvbmVudHMucmF3RGlmZihyYXcsIFwiT3JpZyBDREsgRGlmZlwiLCB7IGNvbGxhcHNlZDogdHJ1ZSB9KX1cbiAgICAgICR7IWRpZmY/Lmxlbmd0aCA/IGA8ZGl2Pk5vIGNoYW5nZXM8L2Rpdj5gIDogXCJcIn1cbiAgICAgIDx1bCBjbGFzcz1cImFjdGlvbnNcIj5cbiAgICAgICAgJHtkaWZmXG4gICAgICAgICAgPy5maWx0ZXIoXG4gICAgICAgICAgICAoeyBuaWNlckRpZmYgfSkgPT5cbiAgICAgICAgICAgICAgIW5pY2VyRGlmZiB8fFxuICAgICAgICAgICAgICAhW1wicGFyYW1ldGVyc1wiXS5pbmNsdWRlcyhuaWNlckRpZmY/LmNka0RpZmZDYXRlZ29yeSlcbiAgICAgICAgICApXG4gICAgICAgICAgLm1hcChjb21wb25lbnRzLmFjdGlvbilcbiAgICAgICAgICAuam9pbihcIlxcblwiKX1cbiAgICAgIDwvdWw+XG4gICAgPC9kaXY+XG4gIGAsXG59O1xuXG5leHBvcnQgY29uc3QgcmVuZGVyQ3VzdG9tRGlmZlRvSHRtbFN0cmluZyA9IChcbiAgZGlmZnM6IE5pY2VyU3RhY2tEaWZmW10sXG4gIHRpdGxlOiBzdHJpbmdcbik6IHN0cmluZyA9PiB7XG4gIGxldCBodG1sID0gaHRtbFRlbXBsYXRlO1xuICBodG1sID0gaHRtbFxuICAgIC5yZXBsYWNlKGA8aDE+cHJldHR5cGxhbjwvaDE+YCwgYDxoMT4ke3RpdGxlfTwvaDE+YClcbiAgICAucmVwbGFjZShgPHRpdGxlPnByZXR0eXBsYW48L3RpdGxlPmAsIGA8dGl0bGU+JHt0aXRsZX08L3RpdGxlPmApO1xuXG4gIGNvbnN0IHN0YWNrc0h0bWwgPSBkaWZmcy5tYXAoY29tcG9uZW50cy5zdGFja0RpZmYpLmpvaW4oJyAnKTtcbiAgaHRtbCA9IGh0bWwucmVwbGFjZShcbiAgICBgPGRpdiBpZD1cInN0YWNrc1wiPjwvZGl2PmAsXG4gICAgYDxkaXYgaWQ9XCJzdGFja3NcIj4ke3N0YWNrc0h0bWx9PC9kaXY+YFxuICApO1xuXG4gIHJldHVybiBodG1sO1xufTtcbiJdfQ==