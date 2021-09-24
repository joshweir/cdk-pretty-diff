"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCustomDiffToHtmlString = void 0;
const diff_1 = require("diff");
const diff2html = require("diff2html");
const pretty_diff_template_html_1 = require("./pretty-diff-template.html");
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
    let html = pretty_diff_template_html_1.default;
    html = html
        .replace(`<h1>prettyplan</h1>`, `<h1>${title}</h1>`)
        .replace(`<title>prettyplan</title>`, `<title>${title}</title>`);
    const stacksHtml = diffs.map(components.stackDiff).join(' ');
    html = html.replace(`<div id="stacks"></div>`, `<div id="stacks">${stacksHtml}</div>`);
    return html;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBMkM7QUFDM0MsdUNBQXVDO0FBR3ZDLDJFQUF1RDtBQUV2RCxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQVksRUFBVSxFQUFFO0lBQ3hDLE1BQU0sS0FBSyxHQUNULE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0UsSUFBSSxLQUFLLEtBQUssWUFBWSxFQUFFO1FBQzFCLE9BQU8sMkJBQTJCLENBQUM7S0FDcEM7SUFFRCxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNqRCxPQUFPLE9BQU8sS0FBSyxPQUFPLENBQUM7S0FDNUI7SUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzFELE1BQU0sY0FBYyxHQUFHLEtBQUs7YUFDekIsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7YUFDdkMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUxQyxPQUFPLFFBQVEsWUFBWSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7S0FDckQ7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLE1BQU0sWUFBWSxHQUFHLENBQUMsU0FBaUIsRUFBVSxFQUFFO0lBQ2pELElBQUk7UUFDRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdkQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUc7SUFDakIsS0FBSyxFQUFFLENBQUMsS0FBYSxFQUFVLEVBQUUsQ0FBQzswQkFDVixLQUFLO0dBQzVCO0lBRUQsRUFBRSxFQUFFLENBQUMsRUFBTyxFQUFVLEVBQUUsQ0FBQzs7c0NBRVcsRUFBRSxDQUFDLFlBQVk7c0NBQ2YsRUFBRSxDQUFDLGFBQWE7O0dBRW5EO0lBRUQsT0FBTyxFQUFFLENBQUMsT0FBWSxFQUFVLEVBQUUsQ0FBQzs7UUFFN0IsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDM0IsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2NBQ25CLE9BQU8sQ0FBQyxNQUFNOztHQUV6QjtJQUVELFdBQVcsRUFBRSxDQUFDLEtBQWEsRUFBVSxFQUFFLENBQUM7O1FBRWxDLEdBQUcsS0FBSyxVQUFVLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFOztHQUU3QztJQUVELFlBQVksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQW1CLEVBQVUsRUFBRSxDQUFDOzs7VUFHMUQsS0FBSztVQUNMLDRDQUE0QyxNQUFNLFVBQVU7OzhCQUV4QyxRQUFRLENBQUMsRUFBRSxDQUFDOztHQUV2QztJQUVELFVBQVUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQW1CLEVBQVUsRUFBRSxDQUFDOztRQUV4RCxTQUFTLENBQUMsSUFBSSxDQUNkLDBCQUFtQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUMvRDtRQUNFLFlBQVksRUFBRSxjQUFjO1FBQzVCLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLG1CQUFtQixFQUFFLElBQUk7UUFDekIsc0JBQXNCLEVBQUUsR0FBRztLQUM1QixDQUNGOztHQUVKO0lBRUQsT0FBTyxFQUFFLENBQUMsT0FBMEIsRUFBRSxFQUFFO1FBQ3RDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUQsT0FBTzs7O1lBR0MsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Z0JBRXBCLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7O1dBRXhELENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7VUFFUCxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOztLQUVwRCxDQUFBO0lBQ0gsQ0FBQztJQUVELE1BQU0sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQWEsRUFBVSxFQUFFLENBQUM7aUJBQ2xELENBQUEsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLGNBQWMsQ0FBQyxpQkFBaUIsT0FBTSxRQUFROztVQUVoRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUEsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLGNBQWMsS0FBSSxFQUFFLENBQUM7VUFDakQsVUFBVSxDQUFDLEVBQUUsQ0FDYixTQUFTLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsQ0FDeEQ7OztVQUlDLENBQUEsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQ3ZCLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDdkMsQ0FBQyxDQUFDLEVBQ047VUFDRSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRTtRQUNsRCxTQUFTLEVBQUUsRUFBQyxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQTtRQUNyQyxVQUFVLEVBQUUsQ0FBQyxFQUFDLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFBO0tBQ3hDLENBQUM7OztHQUdQO0lBRUQsS0FBSyxFQUFFLENBQUMsT0FBZSxFQUFVLEVBQUUsQ0FBQzs7OztZQUkxQixPQUFPOztHQUVoQjtJQUVELE9BQU8sRUFBRSxDQUNQLEdBQVcsRUFDWCxhQUFxQixFQUNyQixJQUFtRCxFQUMzQyxFQUFFLENBQUM7O1FBR1AsUUFBTyxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsVUFBVSxDQUFBLEtBQUssU0FBUyxJQUFJLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFVBQVUsTUFBSyxLQUFLO1FBQ2pFLENBQUMsQ0FBQyxFQUFFO1FBQ0osQ0FBQyxDQUFDLHFDQUFxQyxhQUFhLFdBQ3hEOzRCQUNzQixDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtpQkFDN0MsR0FBRzs7O0dBR2pCO0lBRUQsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBa0IsRUFBVSxFQUFFLENBQUM7O1lBRXZELFNBQVM7UUFDYixVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDN0QsRUFBQyxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsTUFBTSxDQUFBLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxFQUFFOztVQUUxQyxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQ0YsTUFBTSxDQUNOLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQ2hCLENBQUMsU0FBUztRQUNWLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLGVBQWUsQ0FBQyxFQUV2RCxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQzs7O0dBR2xCO0NBQ0YsQ0FBQztBQUVXLFFBQUEsNEJBQTRCLEdBQUcsQ0FDMUMsS0FBdUIsRUFDdkIsS0FBYSxFQUNMLEVBQUU7SUFDVixJQUFJLElBQUksR0FBRyxtQ0FBWSxDQUFDO0lBQ3hCLElBQUksR0FBRyxJQUFJO1NBQ1IsT0FBTyxDQUFDLHFCQUFxQixFQUFFLE9BQU8sS0FBSyxPQUFPLENBQUM7U0FDbkQsT0FBTyxDQUFDLDJCQUEyQixFQUFFLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQztJQUVuRSxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0QsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQ2pCLHlCQUF5QixFQUN6QixvQkFBb0IsVUFBVSxRQUFRLENBQ3ZDLENBQUM7SUFFRixPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZVR3b0ZpbGVzUGF0Y2ggfSBmcm9tICdkaWZmJztcbmltcG9ydCAqIGFzIGRpZmYyaHRtbCBmcm9tICdkaWZmMmh0bWwnO1xuXG5pbXBvcnQgeyBOaWNlckRpZmYsIE5pY2VyRGlmZkNoYW5nZSwgTmljZXJTdGFja0RpZmYgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IGh0bWxUZW1wbGF0ZSBmcm9tICcuL3ByZXR0eS1kaWZmLXRlbXBsYXRlLmh0bWwnO1xuXG5jb25zdCBwcmV0dGlmeSA9ICh2YWx1ZUluOiBhbnkpOiBzdHJpbmcgPT4ge1xuICBjb25zdCB2YWx1ZSA9XG4gICAgdHlwZW9mIHZhbHVlSW4gPT09IFwic3RyaW5nXCIgPyB2YWx1ZUluIDogSlNPTi5zdHJpbmdpZnkodmFsdWVJbiwgbnVsbCwgMik7XG4gIGlmICh2YWx1ZSA9PT0gXCI8Y29tcHV0ZWQ+XCIpIHtcbiAgICByZXR1cm4gYDxlbT4mbHQ7Y29tcHV0ZWQmZ3Q7PC9lbT5gO1xuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoXCIke1wiKSAmJiB2YWx1ZS5lbmRzV2l0aChcIn1cIikpIHtcbiAgICByZXR1cm4gYDxlbT4ke3ZhbHVlfTwvZW0+YDtcbiAgfVxuXG4gIGlmICh2YWx1ZS5pbmRleE9mKFwiXFxcXG5cIikgPj0gMCB8fCB2YWx1ZS5pbmRleE9mKCdcXFxcXCInKSA+PSAwKSB7XG4gICAgY29uc3Qgc2FuaXRpc2VkVmFsdWUgPSB2YWx1ZVxuICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChcIlxcXFxcXFxcblwiLCBcImdcIiksIFwiXFxuXCIpXG4gICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcXFxcXFwiJywgXCJnXCIpLCAnXCInKTtcblxuICAgIHJldHVybiBgPHByZT4ke3ByZXR0aWZ5SnNvbihzYW5pdGlzZWRWYWx1ZSl9PC9wcmU+YDtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbmNvbnN0IHByZXR0aWZ5SnNvbiA9IChtYXliZUpzb246IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KEpTT04ucGFyc2UobWF5YmVKc29uKSwgbnVsbCwgMik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbWF5YmVKc29uO1xuICB9XG59O1xuXG5jb25zdCBjb21wb25lbnRzID0ge1xuICBiYWRnZTogKGxhYmVsOiBzdHJpbmcpOiBzdHJpbmcgPT4gYFxuICAgIDxzcGFuIGNsYXNzPVwiYmFkZ2VcIj4ke2xhYmVsfTwvc3Bhbj5cbiAgYCxcblxuICBpZDogKGlkOiBhbnkpOiBzdHJpbmcgPT4gYFxuICAgIDxzcGFuIGNsYXNzPVwiaWRcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaWQtc2VnbWVudCB0eXBlXCI+JHtpZC5yZXNvdXJjZVR5cGV9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJpZC1zZWdtZW50IG5hbWVcIj4ke2lkLnJlc291cmNlTGFiZWx9PC9zcGFuPlxuICAgIDwvc3Bhbj5cbiAgYCxcblxuICB3YXJuaW5nOiAod2FybmluZzogYW55KTogc3RyaW5nID0+IGBcbiAgICA8bGk+XG4gICAgICAke2NvbXBvbmVudHMuYmFkZ2UoXCJ3YXJuaW5nXCIpfVxuICAgICAgJHtjb21wb25lbnRzLmlkKHdhcm5pbmcuaWQpfVxuICAgICAgPHNwYW4+JHt3YXJuaW5nLmRldGFpbH08L3NwYW4+XG4gICAgPC9saT5cbiAgYCxcblxuICBjaGFuZ2VDb3VudDogKGNvdW50OiBudW1iZXIpOiBzdHJpbmcgPT4gYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hhbmdlLWNvdW50XCI+XG4gICAgICAke2Ake2NvdW50fSBjaGFuZ2Uke2NvdW50ID4gMSA/IFwic1wiIDogXCJcIn1gfVxuICAgIDwvc3Bhbj5cbiAgYCxcblxuICBjaGFuZ2VOb0RpZmY6ICh7IGFjdGlvbiwgdG8sIGxhYmVsIH06IE5pY2VyRGlmZkNoYW5nZSk6IHN0cmluZyA9PiBgXG4gICAgPHRyPlxuICAgICAgPHRkIGNsYXNzPVwicHJvcGVydHlcIj5cbiAgICAgICAgJHtsYWJlbH1cbiAgICAgICAgJHtgPGJyIC8+PHNwYW4gY2xhc3M9XCJmb3JjZXMtbmV3LXJlc291cmNlXCI+KCR7YWN0aW9ufSk8L3NwYW4+YH1cbiAgICAgIDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJuZXctdmFsdWVcIj4ke3ByZXR0aWZ5KHRvKX08L3RkPlxuICAgIDwvdHI+XG4gIGAsXG5cbiAgY2hhbmdlRGlmZjogKHsgZnJvbSwgdG8sIGxhYmVsIH06IE5pY2VyRGlmZkNoYW5nZSk6IHN0cmluZyA9PiBgXG4gICAgPGRpdj5cbiAgICAgICR7ZGlmZjJodG1sLmh0bWwoXG4gICAgICAgIGNyZWF0ZVR3b0ZpbGVzUGF0Y2gobGFiZWwsIGxhYmVsLCBwcmV0dGlmeShmcm9tKSwgcHJldHRpZnkodG8pKSxcbiAgICAgICAge1xuICAgICAgICAgIG91dHB1dEZvcm1hdDogJ2xpbmUtYnktbGluZScsXG4gICAgICAgICAgZHJhd0ZpbGVMaXN0OiBmYWxzZSxcbiAgICAgICAgICBtYXRjaGluZzogJ3dvcmRzJyxcbiAgICAgICAgICBtYXRjaFdvcmRzVGhyZXNob2xkOiAwLjI1LFxuICAgICAgICAgIG1hdGNoaW5nTWF4Q29tcGFyaXNvbnM6IDIwMCxcbiAgICAgICAgfVxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgYCxcblxuICBjaGFuZ2VzOiAoY2hhbmdlczogTmljZXJEaWZmQ2hhbmdlW10pID0+IHtcbiAgICBjb25zdCBkaWZmQ2hhbmdlcyA9IGNoYW5nZXMuZmlsdGVyKCh7IGZyb20gfSkgPT4gISFmcm9tKTtcbiAgICBjb25zdCBub0RpZmZDaGFuZ2VzID0gY2hhbmdlcy5maWx0ZXIoKHsgZnJvbSB9KSA9PiAhZnJvbSk7XG5cbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cImNoYW5nZXMtYnJlYWtkb3duXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuby1kaWZmLWNoYW5nZXMtYnJlYWtkb3duXCI+XG4gICAgICAgICAgJHtub0RpZmZDaGFuZ2VzLmxlbmd0aCA/IChgXG4gICAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAgICR7bm9EaWZmQ2hhbmdlcy5tYXAoY29tcG9uZW50cy5jaGFuZ2VOb0RpZmYpLmpvaW4oXCJcIil9XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgIGApIDogJyd9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAke2RpZmZDaGFuZ2VzLm1hcChjb21wb25lbnRzLmNoYW5nZURpZmYpLmpvaW4oXCJcIil9XG4gICAgICA8L3RhYmxlPlxuICAgIGBcbiAgfSxcblxuICBhY3Rpb246ICh7IGNka0RpZmZSYXcsIG5pY2VyRGlmZiwgbGFiZWwgfTogTmljZXJEaWZmKTogc3RyaW5nID0+IGBcbiAgICA8bGkgY2xhc3M9XCIke25pY2VyRGlmZj8ucmVzb3VyY2VBY3Rpb24udG9Mb2NhbGVMb3dlckNhc2UoKSB8fCBcImNyZWF0ZVwifVwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1bW1hcnlcIiBvbmNsaWNrPVwiYWNjb3JkaW9uKHRoaXMpXCI+XG4gICAgICAgICR7Y29tcG9uZW50cy5iYWRnZShuaWNlckRpZmY/LnJlc291cmNlQWN0aW9uIHx8IFwiXCIpfVxuICAgICAgICAke2NvbXBvbmVudHMuaWQoXG4gICAgICAgICAgbmljZXJEaWZmIHx8IHsgcmVzb3VyY2VUeXBlOiBcIlwiLCByZXNvdXJjZUxhYmVsOiBsYWJlbCB9XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjaGFuZ2VzIGNvbGxhcHNlZFwiPlxuICAgICAgICAke1xuICAgICAgICAgIG5pY2VyRGlmZj8uY2hhbmdlcy5sZW5ndGhcbiAgICAgICAgICAgID8gY29tcG9uZW50cy5jaGFuZ2VzKG5pY2VyRGlmZi5jaGFuZ2VzKVxuICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgIH1cbiAgICAgICAgJHtjb21wb25lbnRzLnJhd0RpZmYoY2RrRGlmZlJhdywgXCJDREsgRGlmZiBPdXRwdXRcIiwge1xuICAgICAgICAgIGNvbGxhcHNlZDogIW5pY2VyRGlmZj8uY2hhbmdlcy5sZW5ndGgsXG4gICAgICAgICAgc2hvd0J1dHRvbjogISFuaWNlckRpZmY/LmNoYW5nZXMubGVuZ3RoLFxuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gIGAsXG5cbiAgbW9kYWw6IChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcgPT4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLXBhbmVcIiBvbmNsaWNrPVwiY2xvc2VNb2RhbCgpXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jbG9zZVwiPjxidXR0b24gY2xhc3M9XCJ0ZXh0LWJ1dHRvblwiIG9uY2xpY2s9XCJjbG9zZU1vZGFsKClcIj5jbG9zZTwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgICR7Y29udGVudH1cbiAgICAgIDwvZGl2PlxuICBgLFxuXG4gIHJhd0RpZmY6IChcbiAgICByYXc6IHN0cmluZyxcbiAgICB0b2dnbGVDYXB0aW9uOiBzdHJpbmcsXG4gICAgb3B0cz86IHsgY29sbGFwc2VkOiBib29sZWFuOyBzaG93QnV0dG9uPzogYm9vbGVhbiB9XG4gICk6IHN0cmluZyA9PiBgXG4gICAgPGRpdiBjbGFzcz1cInJhdy1kaWZmXCI+XG4gICAgICAke1xuICAgICAgICB0eXBlb2Ygb3B0cz8uc2hvd0J1dHRvbiA9PT0gXCJib29sZWFuXCIgJiYgb3B0cz8uc2hvd0J1dHRvbiA9PT0gZmFsc2VcbiAgICAgICAgICA/IFwiXCJcbiAgICAgICAgICA6IGA8YnV0dG9uIG9uY2xpY2s9XCJhY2NvcmRpb24odGhpcylcIj4ke3RvZ2dsZUNhcHRpb259PC9idXR0b24+YFxuICAgICAgfVxuICAgICAgPGRpdiBjbGFzcz1cImNoYW5nZXMgJHtvcHRzPy5jb2xsYXBzZWQgPyBcImNvbGxhcHNlZFwiIDogXCJcIn1cIj5cbiAgICAgICAgICA8cHJlPiR7cmF3fTwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGAsXG5cbiAgc3RhY2tEaWZmOiAoeyBzdGFja05hbWUsIHJhdywgZGlmZiB9OiBOaWNlclN0YWNrRGlmZik6IHN0cmluZyA9PiBgXG4gICAgPGRpdiBjbGFzcz1cInN0YWNrXCI+XG4gICAgICA8aDI+JHtzdGFja05hbWV9PC9oMj5cbiAgICAgICR7Y29tcG9uZW50cy5yYXdEaWZmKHJhdywgXCJPcmlnIENESyBEaWZmXCIsIHsgY29sbGFwc2VkOiB0cnVlIH0pfVxuICAgICAgJHshZGlmZj8ubGVuZ3RoID8gYDxkaXY+Tm8gY2hhbmdlczwvZGl2PmAgOiBcIlwifVxuICAgICAgPHVsIGNsYXNzPVwiYWN0aW9uc1wiPlxuICAgICAgICAke2RpZmZcbiAgICAgICAgICA/LmZpbHRlcihcbiAgICAgICAgICAgICh7IG5pY2VyRGlmZiB9KSA9PlxuICAgICAgICAgICAgICAhbmljZXJEaWZmIHx8XG4gICAgICAgICAgICAgICFbXCJwYXJhbWV0ZXJzXCJdLmluY2x1ZGVzKG5pY2VyRGlmZj8uY2RrRGlmZkNhdGVnb3J5KVxuICAgICAgICAgIClcbiAgICAgICAgICAubWFwKGNvbXBvbmVudHMuYWN0aW9uKVxuICAgICAgICAgIC5qb2luKFwiXFxuXCIpfVxuICAgICAgPC91bD5cbiAgICA8L2Rpdj5cbiAgYCxcbn07XG5cbmV4cG9ydCBjb25zdCByZW5kZXJDdXN0b21EaWZmVG9IdG1sU3RyaW5nID0gKFxuICBkaWZmczogTmljZXJTdGFja0RpZmZbXSxcbiAgdGl0bGU6IHN0cmluZ1xuKTogc3RyaW5nID0+IHtcbiAgbGV0IGh0bWwgPSBodG1sVGVtcGxhdGU7XG4gIGh0bWwgPSBodG1sXG4gICAgLnJlcGxhY2UoYDxoMT5wcmV0dHlwbGFuPC9oMT5gLCBgPGgxPiR7dGl0bGV9PC9oMT5gKVxuICAgIC5yZXBsYWNlKGA8dGl0bGU+cHJldHR5cGxhbjwvdGl0bGU+YCwgYDx0aXRsZT4ke3RpdGxlfTwvdGl0bGU+YCk7XG5cbiAgY29uc3Qgc3RhY2tzSHRtbCA9IGRpZmZzLm1hcChjb21wb25lbnRzLnN0YWNrRGlmZikuam9pbignICcpO1xuICBodG1sID0gaHRtbC5yZXBsYWNlKFxuICAgIGA8ZGl2IGlkPVwic3RhY2tzXCI+PC9kaXY+YCxcbiAgICBgPGRpdiBpZD1cInN0YWNrc1wiPiR7c3RhY2tzSHRtbH08L2Rpdj5gXG4gICk7XG5cbiAgcmV0dXJuIGh0bWw7XG59O1xuIl19