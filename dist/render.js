"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCustomDiffToHtmlString = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const diff_1 = require("diff");
const diff2html = require("diff2html");
const prettify = (valueIn) => {
    const value = typeof valueIn === "string" ? valueIn : JSON.stringify(valueIn, null, 2);
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
    let html = fs_1.readFileSync(path_1.resolve(__dirname, "./pretty-diff-template.html")).toString();
    html = html
        .replace(`<h1>prettyplan</h1>`, `<h1>${title}</h1>`)
        .replace(`<title>prettyplan</title>`, `<title>${title}</title>`);
    const stacksHtml = diffs.map(components.stackDiff).join(' ');
    html = html.replace(`<div id="stacks"></div>`, `<div id="stacks">${stacksHtml}</div>`);
    return html;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBK0I7QUFDL0IsMkJBQWtDO0FBQ2xDLCtCQUEyQztBQUMzQyx1Q0FBdUM7QUFJdkMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFZLEVBQVUsRUFBRTtJQUN4QyxNQUFNLEtBQUssR0FDVCxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNFLElBQUksS0FBSyxLQUFLLFlBQVksRUFBRTtRQUMxQixPQUFPLDJCQUEyQixDQUFDO0tBQ3BDO0lBRUQsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDakQsT0FBTyxPQUFPLEtBQUssT0FBTyxDQUFDO0tBQzVCO0lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUMxRCxNQUFNLGNBQWMsR0FBRyxLQUFLO2FBQ3pCLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO2FBQ3ZDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFMUMsT0FBTyxRQUFRLFlBQVksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO0tBQ3JEO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDLENBQUM7QUFFRixNQUFNLFlBQVksR0FBRyxDQUFDLFNBQWlCLEVBQVUsRUFBRTtJQUNq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OlsiaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IGNyZWF0ZVR3b0ZpbGVzUGF0Y2ggfSBmcm9tICdkaWZmJztcbmltcG9ydCAqIGFzIGRpZmYyaHRtbCBmcm9tICdkaWZmMmh0bWwnO1xuXG5pbXBvcnQgeyBOaWNlckRpZmYsIE5pY2VyRGlmZkNoYW5nZSwgTmljZXJTdGFja0RpZmYgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5jb25zdCBwcmV0dGlmeSA9ICh2YWx1ZUluOiBhbnkpOiBzdHJpbmcgPT4ge1xuICBjb25zdCB2YWx1ZSA9XG4gICAgdHlwZW9mIHZhbHVlSW4gPT09IFwic3RyaW5nXCIgPyB2YWx1ZUluIDogSlNPTi5zdHJpbmdpZnkodmFsdWVJbiwgbnVsbCwgMik7XG4gIGlmICh2YWx1ZSA9PT0gXCI8Y29tcHV0ZWQ+XCIpIHtcbiAgICByZXR1cm4gYDxlbT4mbHQ7Y29tcHV0ZWQmZ3Q7PC9lbT5gO1xuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoXCIke1wiKSAmJiB2YWx1ZS5lbmRzV2l0aChcIn1cIikpIHtcbiAgICByZXR1cm4gYDxlbT4ke3ZhbHVlfTwvZW0+YDtcbiAgfVxuXG4gIGlmICh2YWx1ZS5pbmRleE9mKFwiXFxcXG5cIikgPj0gMCB8fCB2YWx1ZS5pbmRleE9mKCdcXFxcXCInKSA+PSAwKSB7XG4gICAgY29uc3Qgc2FuaXRpc2VkVmFsdWUgPSB2YWx1ZVxuICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChcIlxcXFxcXFxcblwiLCBcImdcIiksIFwiXFxuXCIpXG4gICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcXFxcXFwiJywgXCJnXCIpLCAnXCInKTtcblxuICAgIHJldHVybiBgPHByZT4ke3ByZXR0aWZ5SnNvbihzYW5pdGlzZWRWYWx1ZSl9PC9wcmU+YDtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbmNvbnN0IHByZXR0aWZ5SnNvbiA9IChtYXliZUpzb246IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KEpTT04ucGFyc2UobWF5YmVKc29uKSwgbnVsbCwgMik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbWF5YmVKc29uO1xuICB9XG59O1xuXG5jb25zdCBjb21wb25lbnRzID0ge1xuICBiYWRnZTogKGxhYmVsOiBzdHJpbmcpOiBzdHJpbmcgPT4gYFxuICAgIDxzcGFuIGNsYXNzPVwiYmFkZ2VcIj4ke2xhYmVsfTwvc3Bhbj5cbiAgYCxcblxuICBpZDogKGlkOiBhbnkpOiBzdHJpbmcgPT4gYFxuICAgIDxzcGFuIGNsYXNzPVwiaWRcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaWQtc2VnbWVudCB0eXBlXCI+JHtpZC5yZXNvdXJjZVR5cGV9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJpZC1zZWdtZW50IG5hbWVcIj4ke2lkLnJlc291cmNlTGFiZWx9PC9zcGFuPlxuICAgIDwvc3Bhbj5cbiAgYCxcblxuICB3YXJuaW5nOiAod2FybmluZzogYW55KTogc3RyaW5nID0+IGBcbiAgICA8bGk+XG4gICAgICAke2NvbXBvbmVudHMuYmFkZ2UoXCJ3YXJuaW5nXCIpfVxuICAgICAgJHtjb21wb25lbnRzLmlkKHdhcm5pbmcuaWQpfVxuICAgICAgPHNwYW4+JHt3YXJuaW5nLmRldGFpbH08L3NwYW4+XG4gICAgPC9saT5cbiAgYCxcblxuICBjaGFuZ2VDb3VudDogKGNvdW50OiBudW1iZXIpOiBzdHJpbmcgPT4gYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hhbmdlLWNvdW50XCI+XG4gICAgICAke2Ake2NvdW50fSBjaGFuZ2Uke2NvdW50ID4gMSA/IFwic1wiIDogXCJcIn1gfVxuICAgIDwvc3Bhbj5cbiAgYCxcblxuICBjaGFuZ2VOb0RpZmY6ICh7IGFjdGlvbiwgdG8sIGxhYmVsIH06IE5pY2VyRGlmZkNoYW5nZSk6IHN0cmluZyA9PiBgXG4gICAgPHRyPlxuICAgICAgPHRkIGNsYXNzPVwicHJvcGVydHlcIj5cbiAgICAgICAgJHtsYWJlbH1cbiAgICAgICAgJHtgPGJyIC8+PHNwYW4gY2xhc3M9XCJmb3JjZXMtbmV3LXJlc291cmNlXCI+KCR7YWN0aW9ufSk8L3NwYW4+YH1cbiAgICAgIDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJuZXctdmFsdWVcIj4ke3ByZXR0aWZ5KHRvKX08L3RkPlxuICAgIDwvdHI+XG4gIGAsXG5cbiAgY2hhbmdlRGlmZjogKHsgZnJvbSwgdG8sIGxhYmVsIH06IE5pY2VyRGlmZkNoYW5nZSk6IHN0cmluZyA9PiBgXG4gICAgPGRpdj5cbiAgICAgICR7ZGlmZjJodG1sLmh0bWwoXG4gICAgICAgIGNyZWF0ZVR3b0ZpbGVzUGF0Y2gobGFiZWwsIGxhYmVsLCBwcmV0dGlmeShmcm9tKSwgcHJldHRpZnkodG8pKSxcbiAgICAgICAge1xuICAgICAgICAgIG91dHB1dEZvcm1hdDogJ2xpbmUtYnktbGluZScsXG4gICAgICAgICAgZHJhd0ZpbGVMaXN0OiBmYWxzZSxcbiAgICAgICAgICBtYXRjaGluZzogJ3dvcmRzJyxcbiAgICAgICAgICBtYXRjaFdvcmRzVGhyZXNob2xkOiAwLjI1LFxuICAgICAgICAgIG1hdGNoaW5nTWF4Q29tcGFyaXNvbnM6IDIwMCxcbiAgICAgICAgfVxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgYCxcblxuICBjaGFuZ2VzOiAoY2hhbmdlczogTmljZXJEaWZmQ2hhbmdlW10pID0+IHtcbiAgICBjb25zdCBkaWZmQ2hhbmdlcyA9IGNoYW5nZXMuZmlsdGVyKCh7IGZyb20gfSkgPT4gISFmcm9tKTtcbiAgICBjb25zdCBub0RpZmZDaGFuZ2VzID0gY2hhbmdlcy5maWx0ZXIoKHsgZnJvbSB9KSA9PiAhZnJvbSk7XG5cbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cImNoYW5nZXMtYnJlYWtkb3duXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuby1kaWZmLWNoYW5nZXMtYnJlYWtkb3duXCI+XG4gICAgICAgICAgJHtub0RpZmZDaGFuZ2VzLmxlbmd0aCA/IChgXG4gICAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAgICR7bm9EaWZmQ2hhbmdlcy5tYXAoY29tcG9uZW50cy5jaGFuZ2VOb0RpZmYpLmpvaW4oXCJcIil9XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgIGApIDogJyd9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAke2RpZmZDaGFuZ2VzLm1hcChjb21wb25lbnRzLmNoYW5nZURpZmYpLmpvaW4oXCJcIil9XG4gICAgICA8L3RhYmxlPlxuICAgIGBcbiAgfSxcblxuICBhY3Rpb246ICh7IGNka0RpZmZSYXcsIG5pY2VyRGlmZiwgbGFiZWwgfTogTmljZXJEaWZmKTogc3RyaW5nID0+IGBcbiAgICA8bGkgY2xhc3M9XCIke25pY2VyRGlmZj8ucmVzb3VyY2VBY3Rpb24udG9Mb2NhbGVMb3dlckNhc2UoKSB8fCBcImNyZWF0ZVwifVwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1bW1hcnlcIiBvbmNsaWNrPVwiYWNjb3JkaW9uKHRoaXMpXCI+XG4gICAgICAgICR7Y29tcG9uZW50cy5iYWRnZShuaWNlckRpZmY/LnJlc291cmNlQWN0aW9uIHx8IFwiXCIpfVxuICAgICAgICAke2NvbXBvbmVudHMuaWQoXG4gICAgICAgICAgbmljZXJEaWZmIHx8IHsgcmVzb3VyY2VUeXBlOiBcIlwiLCByZXNvdXJjZUxhYmVsOiBsYWJlbCB9XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjaGFuZ2VzIGNvbGxhcHNlZFwiPlxuICAgICAgICAke1xuICAgICAgICAgIG5pY2VyRGlmZj8uY2hhbmdlcy5sZW5ndGhcbiAgICAgICAgICAgID8gY29tcG9uZW50cy5jaGFuZ2VzKG5pY2VyRGlmZi5jaGFuZ2VzKVxuICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgIH1cbiAgICAgICAgJHtjb21wb25lbnRzLnJhd0RpZmYoY2RrRGlmZlJhdywgXCJDREsgRGlmZiBPdXRwdXRcIiwge1xuICAgICAgICAgIGNvbGxhcHNlZDogIW5pY2VyRGlmZj8uY2hhbmdlcy5sZW5ndGgsXG4gICAgICAgICAgc2hvd0J1dHRvbjogISFuaWNlckRpZmY/LmNoYW5nZXMubGVuZ3RoLFxuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gIGAsXG5cbiAgbW9kYWw6IChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcgPT4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLXBhbmVcIiBvbmNsaWNrPVwiY2xvc2VNb2RhbCgpXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jbG9zZVwiPjxidXR0b24gY2xhc3M9XCJ0ZXh0LWJ1dHRvblwiIG9uY2xpY2s9XCJjbG9zZU1vZGFsKClcIj5jbG9zZTwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgICR7Y29udGVudH1cbiAgICAgIDwvZGl2PlxuICBgLFxuXG4gIHJhd0RpZmY6IChcbiAgICByYXc6IHN0cmluZyxcbiAgICB0b2dnbGVDYXB0aW9uOiBzdHJpbmcsXG4gICAgb3B0cz86IHsgY29sbGFwc2VkOiBib29sZWFuOyBzaG93QnV0dG9uPzogYm9vbGVhbiB9XG4gICk6IHN0cmluZyA9PiBgXG4gICAgPGRpdiBjbGFzcz1cInJhdy1kaWZmXCI+XG4gICAgICAke1xuICAgICAgICB0eXBlb2Ygb3B0cz8uc2hvd0J1dHRvbiA9PT0gXCJib29sZWFuXCIgJiYgb3B0cz8uc2hvd0J1dHRvbiA9PT0gZmFsc2VcbiAgICAgICAgICA/IFwiXCJcbiAgICAgICAgICA6IGA8YnV0dG9uIG9uY2xpY2s9XCJhY2NvcmRpb24odGhpcylcIj4ke3RvZ2dsZUNhcHRpb259PC9idXR0b24+YFxuICAgICAgfVxuICAgICAgPGRpdiBjbGFzcz1cImNoYW5nZXMgJHtvcHRzPy5jb2xsYXBzZWQgPyBcImNvbGxhcHNlZFwiIDogXCJcIn1cIj5cbiAgICAgICAgICA8cHJlPiR7cmF3fTwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGAsXG5cbiAgc3RhY2tEaWZmOiAoeyBzdGFja05hbWUsIHJhdywgZGlmZiB9OiBOaWNlclN0YWNrRGlmZik6IHN0cmluZyA9PiBgXG4gICAgPGRpdiBjbGFzcz1cInN0YWNrXCI+XG4gICAgICA8aDI+JHtzdGFja05hbWV9PC9oMj5cbiAgICAgICR7Y29tcG9uZW50cy5yYXdEaWZmKHJhdywgXCJPcmlnIENESyBEaWZmXCIsIHsgY29sbGFwc2VkOiB0cnVlIH0pfVxuICAgICAgJHshZGlmZj8ubGVuZ3RoID8gYDxkaXY+Tm8gY2hhbmdlczwvZGl2PmAgOiBcIlwifVxuICAgICAgPHVsIGNsYXNzPVwiYWN0aW9uc1wiPlxuICAgICAgICAke2RpZmZcbiAgICAgICAgICA/LmZpbHRlcihcbiAgICAgICAgICAgICh7IG5pY2VyRGlmZiB9KSA9PlxuICAgICAgICAgICAgICAhbmljZXJEaWZmIHx8XG4gICAgICAgICAgICAgICFbXCJwYXJhbWV0ZXJzXCJdLmluY2x1ZGVzKG5pY2VyRGlmZj8uY2RrRGlmZkNhdGVnb3J5KVxuICAgICAgICAgIClcbiAgICAgICAgICAubWFwKGNvbXBvbmVudHMuYWN0aW9uKVxuICAgICAgICAgIC5qb2luKFwiXFxuXCIpfVxuICAgICAgPC91bD5cbiAgICA8L2Rpdj5cbiAgYCxcbn07XG5cbmV4cG9ydCBjb25zdCByZW5kZXJDdXN0b21EaWZmVG9IdG1sU3RyaW5nID0gKFxuICBkaWZmczogTmljZXJTdGFja0RpZmZbXSxcbiAgdGl0bGU6IHN0cmluZ1xuKTogc3RyaW5nID0+IHtcbiAgbGV0IGh0bWwgPSByZWFkRmlsZVN5bmMoXG4gICAgcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9wcmV0dHktZGlmZi10ZW1wbGF0ZS5odG1sXCIpXG4gICkudG9TdHJpbmcoKTtcbiAgaHRtbCA9IGh0bWxcbiAgICAucmVwbGFjZShgPGgxPnByZXR0eXBsYW48L2gxPmAsIGA8aDE+JHt0aXRsZX08L2gxPmApXG4gICAgLnJlcGxhY2UoYDx0aXRsZT5wcmV0dHlwbGFuPC90aXRsZT5gLCBgPHRpdGxlPiR7dGl0bGV9PC90aXRsZT5gKTtcblxuICBjb25zdCBzdGFja3NIdG1sID0gZGlmZnMubWFwKGNvbXBvbmVudHMuc3RhY2tEaWZmKS5qb2luKCcgJyk7XG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgYDxkaXYgaWQ9XCJzdGFja3NcIj48L2Rpdj5gLFxuICAgIGA8ZGl2IGlkPVwic3RhY2tzXCI+JHtzdGFja3NIdG1sfTwvZGl2PmBcbiAgKTtcblxuICByZXR1cm4gaHRtbDtcbn07XG4iXX0=