"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCustomDiffToHtmlString = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
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
    change: ({ action, from, to, label }) => `
    <tr>
      <td class="property">
        ${label}
        ${`<br /><span class="forces-new-resource">(${action})</span>`}
      </td>
      <td class="old-value">${from ? prettify(from) : ""}</td>
      <td class="new-value">${prettify(to)}</td>
    </tr>
  `,
    action: ({ cdkDiffRaw, nicerDiff, label }) => `
    <li class="${(nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.resourceAction.toLocaleLowerCase()) || "create"}">
      <div class="summary" onclick="accordion(this)">
        ${components.badge((nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.resourceAction) || "")}
        ${components.id(nicerDiff || { resourceType: "", resourceLabel: label })}
        ${(nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.changes) ? components.changeCount(nicerDiff.changes.length)
        : ""}
      </div>
      <div class="changes collapsed">
        ${(nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.changes.length) ? `<table>
              ${nicerDiff === null || nicerDiff === void 0 ? void 0 : nicerDiff.changes.map(components.change).join("")}
          </table>`
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
          <pre>
            ${raw}
          </pre>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBK0I7QUFDL0IsMkJBQWtDO0FBSWxDLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBWSxFQUFVLEVBQUU7SUFDeEMsTUFBTSxLQUFLLEdBQ1QsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzRSxJQUFJLEtBQUssS0FBSyxZQUFZLEVBQUU7UUFDMUIsT0FBTywyQkFBMkIsQ0FBQztLQUNwQztJQUVELElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2pELE9BQU8sT0FBTyxLQUFLLE9BQU8sQ0FBQztLQUM1QjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDMUQsTUFBTSxjQUFjLEdBQUcsS0FBSzthQUN6QixPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQzthQUN2QyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTFDLE9BQU8sUUFBUSxZQUFZLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztLQUNyRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxZQUFZLEdBQUcsQ0FBQyxTQUFpQixFQUFVLEVBQUU7SUFDakQsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFD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USxFQUFFLENBQUM7SUFDYixJQUFJLEdBQUcsSUFBSTtTQUNSLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLEtBQUssT0FBTyxDQUFDO1NBQ25ELE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxVQUFVLEtBQUssVUFBVSxDQUFDLENBQUM7SUFFbkUsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdELElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUNqQix5QkFBeUIsRUFDekIsb0JBQW9CLFVBQVUsUUFBUSxDQUN2QyxDQUFDO0lBRUYsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xuXG5pbXBvcnQgeyBOaWNlckRpZmYsIE5pY2VyRGlmZkNoYW5nZSwgTmljZXJTdGFja0RpZmYgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5jb25zdCBwcmV0dGlmeSA9ICh2YWx1ZUluOiBhbnkpOiBzdHJpbmcgPT4ge1xuICBjb25zdCB2YWx1ZSA9XG4gICAgdHlwZW9mIHZhbHVlSW4gPT09IFwic3RyaW5nXCIgPyB2YWx1ZUluIDogSlNPTi5zdHJpbmdpZnkodmFsdWVJbiwgbnVsbCwgMik7XG4gIGlmICh2YWx1ZSA9PT0gXCI8Y29tcHV0ZWQ+XCIpIHtcbiAgICByZXR1cm4gYDxlbT4mbHQ7Y29tcHV0ZWQmZ3Q7PC9lbT5gO1xuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoXCIke1wiKSAmJiB2YWx1ZS5lbmRzV2l0aChcIn1cIikpIHtcbiAgICByZXR1cm4gYDxlbT4ke3ZhbHVlfTwvZW0+YDtcbiAgfVxuXG4gIGlmICh2YWx1ZS5pbmRleE9mKFwiXFxcXG5cIikgPj0gMCB8fCB2YWx1ZS5pbmRleE9mKCdcXFxcXCInKSA+PSAwKSB7XG4gICAgY29uc3Qgc2FuaXRpc2VkVmFsdWUgPSB2YWx1ZVxuICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChcIlxcXFxcXFxcblwiLCBcImdcIiksIFwiXFxuXCIpXG4gICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcXFxcXFwiJywgXCJnXCIpLCAnXCInKTtcblxuICAgIHJldHVybiBgPHByZT4ke3ByZXR0aWZ5SnNvbihzYW5pdGlzZWRWYWx1ZSl9PC9wcmU+YDtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbmNvbnN0IHByZXR0aWZ5SnNvbiA9IChtYXliZUpzb246IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KEpTT04ucGFyc2UobWF5YmVKc29uKSwgbnVsbCwgMik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbWF5YmVKc29uO1xuICB9XG59O1xuXG5jb25zdCBjb21wb25lbnRzID0ge1xuICBiYWRnZTogKGxhYmVsOiBzdHJpbmcpOiBzdHJpbmcgPT4gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJiYWRnZVwiPiR7bGFiZWx9PC9zcGFuPlxuICBgLFxuXG4gIGlkOiAoaWQ6IGFueSk6IHN0cmluZyA9PiBgXG4gICAgICA8c3BhbiBjbGFzcz1cImlkXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpZC1zZWdtZW50IHR5cGVcIj4ke2lkLnJlc291cmNlVHlwZX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpZC1zZWdtZW50IG5hbWVcIj4ke2lkLnJlc291cmNlTGFiZWx9PC9zcGFuPlxuICAgICAgPC9zcGFuPlxuICBgLFxuXG4gIHdhcm5pbmc6ICh3YXJuaW5nOiBhbnkpOiBzdHJpbmcgPT4gYFxuICAgICAgPGxpPlxuICAgICAgICAgICR7Y29tcG9uZW50cy5iYWRnZShcIndhcm5pbmdcIil9XG4gICAgICAgICAgJHtjb21wb25lbnRzLmlkKHdhcm5pbmcuaWQpfVxuICAgICAgICAgIDxzcGFuPiR7d2FybmluZy5kZXRhaWx9PC9zcGFuPlxuICAgICAgPC9saT5cbiAgYCxcblxuICBjaGFuZ2VDb3VudDogKGNvdW50OiBudW1iZXIpOiBzdHJpbmcgPT4gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJjaGFuZ2UtY291bnRcIj5cbiAgICAgICAgICAke2Ake2NvdW50fSBjaGFuZ2Uke2NvdW50ID4gMSA/IFwic1wiIDogXCJcIn1gfVxuICAgICAgPC9zcGFuPlxuICBgLFxuXG4gIGNoYW5nZTogKHsgYWN0aW9uLCBmcm9tLCB0bywgbGFiZWwgfTogTmljZXJEaWZmQ2hhbmdlKTogc3RyaW5nID0+IGBcbiAgICA8dHI+XG4gICAgICA8dGQgY2xhc3M9XCJwcm9wZXJ0eVwiPlxuICAgICAgICAke2xhYmVsfVxuICAgICAgICAke2A8YnIgLz48c3BhbiBjbGFzcz1cImZvcmNlcy1uZXctcmVzb3VyY2VcIj4oJHthY3Rpb259KTwvc3Bhbj5gfVxuICAgICAgPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cIm9sZC12YWx1ZVwiPiR7ZnJvbSA/IHByZXR0aWZ5KGZyb20pIDogXCJcIn08L3RkPlxuICAgICAgPHRkIGNsYXNzPVwibmV3LXZhbHVlXCI+JHtwcmV0dGlmeSh0byl9PC90ZD5cbiAgICA8L3RyPlxuICBgLFxuXG4gIGFjdGlvbjogKHsgY2RrRGlmZlJhdywgbmljZXJEaWZmLCBsYWJlbCB9OiBOaWNlckRpZmYpOiBzdHJpbmcgPT4gYFxuICAgIDxsaSBjbGFzcz1cIiR7bmljZXJEaWZmPy5yZXNvdXJjZUFjdGlvbi50b0xvY2FsZUxvd2VyQ2FzZSgpIHx8IFwiY3JlYXRlXCJ9XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VtbWFyeVwiIG9uY2xpY2s9XCJhY2NvcmRpb24odGhpcylcIj5cbiAgICAgICAgJHtjb21wb25lbnRzLmJhZGdlKG5pY2VyRGlmZj8ucmVzb3VyY2VBY3Rpb24gfHwgXCJcIil9XG4gICAgICAgICR7Y29tcG9uZW50cy5pZChcbiAgICAgICAgICBuaWNlckRpZmYgfHwgeyByZXNvdXJjZVR5cGU6IFwiXCIsIHJlc291cmNlTGFiZWw6IGxhYmVsIH1cbiAgICAgICAgKX1cbiAgICAgICAgJHtcbiAgICAgICAgICBuaWNlckRpZmY/LmNoYW5nZXNcbiAgICAgICAgICAgID8gY29tcG9uZW50cy5jaGFuZ2VDb3VudChuaWNlckRpZmYuY2hhbmdlcy5sZW5ndGgpXG4gICAgICAgICAgICA6IFwiXCJcbiAgICAgICAgfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2hhbmdlcyBjb2xsYXBzZWRcIj5cbiAgICAgICAgJHtcbiAgICAgICAgICBuaWNlckRpZmY/LmNoYW5nZXMubGVuZ3RoXG4gICAgICAgICAgICA/IGA8dGFibGU+XG4gICAgICAgICAgICAgICR7bmljZXJEaWZmPy5jaGFuZ2VzLm1hcChjb21wb25lbnRzLmNoYW5nZSkuam9pbihcIlwiKX1cbiAgICAgICAgICA8L3RhYmxlPmBcbiAgICAgICAgICAgIDogXCJcIlxuICAgICAgICB9XG4gICAgICAgICR7Y29tcG9uZW50cy5yYXdEaWZmKGNka0RpZmZSYXcsIFwiQ0RLIERpZmYgT3V0cHV0XCIsIHtcbiAgICAgICAgICBjb2xsYXBzZWQ6ICFuaWNlckRpZmY/LmNoYW5nZXMubGVuZ3RoLFxuICAgICAgICAgIHNob3dCdXR0b246ICEhbmljZXJEaWZmPy5jaGFuZ2VzLmxlbmd0aCxcbiAgICAgICAgfSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICBgLFxuXG4gIG1vZGFsOiAoY29udGVudDogc3RyaW5nKTogc3RyaW5nID0+IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1wYW5lXCIgb25jbGljaz1cImNsb3NlTW9kYWwoKVwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY2xvc2VcIj48YnV0dG9uIGNsYXNzPVwidGV4dC1idXR0b25cIiBvbmNsaWNrPVwiY2xvc2VNb2RhbCgpXCI+Y2xvc2U8L2J1dHRvbj48L2Rpdj5cbiAgICAgICAgICAke2NvbnRlbnR9XG4gICAgICA8L2Rpdj5cbiAgYCxcblxuICByYXdEaWZmOiAoXG4gICAgcmF3OiBzdHJpbmcsXG4gICAgdG9nZ2xlQ2FwdGlvbjogc3RyaW5nLFxuICAgIG9wdHM/OiB7IGNvbGxhcHNlZDogYm9vbGVhbjsgc2hvd0J1dHRvbj86IGJvb2xlYW4gfVxuICApOiBzdHJpbmcgPT4gYFxuICAgIDxkaXYgY2xhc3M9XCJyYXctZGlmZlwiPlxuICAgICAgJHtcbiAgICAgICAgdHlwZW9mIG9wdHM/LnNob3dCdXR0b24gPT09IFwiYm9vbGVhblwiICYmIG9wdHM/LnNob3dCdXR0b24gPT09IGZhbHNlXG4gICAgICAgICAgPyBcIlwiXG4gICAgICAgICAgOiBgPGJ1dHRvbiBvbmNsaWNrPVwiYWNjb3JkaW9uKHRoaXMpXCI+JHt0b2dnbGVDYXB0aW9ufTwvYnV0dG9uPmBcbiAgICAgIH1cbiAgICAgIDxkaXYgY2xhc3M9XCJjaGFuZ2VzICR7b3B0cz8uY29sbGFwc2VkID8gXCJjb2xsYXBzZWRcIiA6IFwiXCJ9XCI+XG4gICAgICAgICAgPHByZT5cbiAgICAgICAgICAgICR7cmF3fVxuICAgICAgICAgIDwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGAsXG5cbiAgc3RhY2tEaWZmOiAoeyBzdGFja05hbWUsIHJhdywgZGlmZiB9OiBOaWNlclN0YWNrRGlmZik6IHN0cmluZyA9PiBgXG4gICAgPGRpdiBjbGFzcz1cInN0YWNrXCI+XG4gICAgICA8aDI+JHtzdGFja05hbWV9PC9oMj5cbiAgICAgICR7Y29tcG9uZW50cy5yYXdEaWZmKHJhdywgXCJPcmlnIENESyBEaWZmXCIsIHsgY29sbGFwc2VkOiB0cnVlIH0pfVxuICAgICAgJHshZGlmZj8ubGVuZ3RoID8gYDxkaXY+Tm8gY2hhbmdlczwvZGl2PmAgOiBcIlwifVxuICAgICAgPHVsIGNsYXNzPVwiYWN0aW9uc1wiPlxuICAgICAgICAke2RpZmZcbiAgICAgICAgICA/LmZpbHRlcihcbiAgICAgICAgICAgICh7IG5pY2VyRGlmZiB9KSA9PlxuICAgICAgICAgICAgICAhbmljZXJEaWZmIHx8XG4gICAgICAgICAgICAgICFbXCJwYXJhbWV0ZXJzXCJdLmluY2x1ZGVzKG5pY2VyRGlmZj8uY2RrRGlmZkNhdGVnb3J5KVxuICAgICAgICAgIClcbiAgICAgICAgICAubWFwKGNvbXBvbmVudHMuYWN0aW9uKVxuICAgICAgICAgIC5qb2luKFwiXFxuXCIpfVxuICAgICAgPC91bD5cbiAgICA8L2Rpdj5cbiAgYCxcbn07XG5cbmV4cG9ydCBjb25zdCByZW5kZXJDdXN0b21EaWZmVG9IdG1sU3RyaW5nID0gKFxuICBkaWZmczogTmljZXJTdGFja0RpZmZbXSxcbiAgdGl0bGU6IHN0cmluZ1xuKTogc3RyaW5nID0+IHtcbiAgbGV0IGh0bWwgPSByZWFkRmlsZVN5bmMoXG4gICAgcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9wcmV0dHktZGlmZi10ZW1wbGF0ZS5odG1sXCIpXG4gICkudG9TdHJpbmcoKTtcbiAgaHRtbCA9IGh0bWxcbiAgICAucmVwbGFjZShgPGgxPnByZXR0eXBsYW48L2gxPmAsIGA8aDE+JHt0aXRsZX08L2gxPmApXG4gICAgLnJlcGxhY2UoYDx0aXRsZT5wcmV0dHlwbGFuPC90aXRsZT5gLCBgPHRpdGxlPiR7dGl0bGV9PC90aXRsZT5gKTtcblxuICBjb25zdCBzdGFja3NIdG1sID0gZGlmZnMubWFwKGNvbXBvbmVudHMuc3RhY2tEaWZmKS5qb2luKCcgJyk7XG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgYDxkaXYgaWQ9XCJzdGFja3NcIj48L2Rpdj5gLFxuICAgIGA8ZGl2IGlkPVwic3RhY2tzXCI+JHtzdGFja3NIdG1sfTwvZGl2PmBcbiAgKTtcblxuICByZXR1cm4gaHRtbDtcbn07XG4iXX0=