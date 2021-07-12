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
    const stacksHtml = diffs.map(components.stackDiff);
    html = html.replace(`<div id="stacks"></div>`, `<div id="stacks">${stacksHtml}</div>`);
    return html;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBK0I7QUFDL0IsMkJBQWtDO0FBSWxDLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBWSxFQUFVLEVBQUU7SUFDeEMsTUFBTSxLQUFLLEdBQ1QsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzRSxJQUFJLEtBQUssS0FBSyxZQUFZLEVBQUU7UUFDMUIsT0FBTywyQkFBMkIsQ0FBQztLQUNwQztJQUVELElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2pELE9BQU8sT0FBTyxLQUFLLE9BQU8sQ0FBQztLQUM1QjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDMUQsTUFBTSxjQUFjLEdBQUcsS0FBSzthQUN6QixPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQzthQUN2QyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTFDLE9BQU8sUUFBUSxZQUFZLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztLQUNyRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxZQUFZLEdBQUcsQ0FBQyxTQUFpQixFQUFVLEVBQUU7SUFDakQsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFD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USxFQUFFLENBQUM7SUFDYixJQUFJLEdBQUcsSUFBSTtTQUNSLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLEtBQUssT0FBTyxDQUFDO1NBQ25ELE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxVQUFVLEtBQUssVUFBVSxDQUFDLENBQUM7SUFFbkUsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkQsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQ2pCLHlCQUF5QixFQUN6QixvQkFBb0IsVUFBVSxRQUFRLENBQ3ZDLENBQUM7SUFFRixPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5cbmltcG9ydCB7IE5pY2VyRGlmZiwgTmljZXJEaWZmQ2hhbmdlLCBOaWNlclN0YWNrRGlmZiB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmNvbnN0IHByZXR0aWZ5ID0gKHZhbHVlSW46IGFueSk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHZhbHVlID1cbiAgICB0eXBlb2YgdmFsdWVJbiA9PT0gXCJzdHJpbmdcIiA/IHZhbHVlSW4gOiBKU09OLnN0cmluZ2lmeSh2YWx1ZUluLCBudWxsLCAyKTtcbiAgaWYgKHZhbHVlID09PSBcIjxjb21wdXRlZD5cIikge1xuICAgIHJldHVybiBgPGVtPiZsdDtjb21wdXRlZCZndDs8L2VtPmA7XG4gIH1cblxuICBpZiAodmFsdWUuc3RhcnRzV2l0aChcIiR7XCIpICYmIHZhbHVlLmVuZHNXaXRoKFwifVwiKSkge1xuICAgIHJldHVybiBgPGVtPiR7dmFsdWV9PC9lbT5gO1xuICB9XG5cbiAgaWYgKHZhbHVlLmluZGV4T2YoXCJcXFxcblwiKSA+PSAwIHx8IHZhbHVlLmluZGV4T2YoJ1xcXFxcIicpID49IDApIHtcbiAgICBjb25zdCBzYW5pdGlzZWRWYWx1ZSA9IHZhbHVlXG4gICAgICAucmVwbGFjZShuZXcgUmVnRXhwKFwiXFxcXFxcXFxuXCIsIFwiZ1wiKSwgXCJcXG5cIilcbiAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxcXFxcXCInLCBcImdcIiksICdcIicpO1xuXG4gICAgcmV0dXJuIGA8cHJlPiR7cHJldHRpZnlKc29uKHNhbml0aXNlZFZhbHVlKX08L3ByZT5gO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuY29uc3QgcHJldHRpZnlKc29uID0gKG1heWJlSnNvbjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoSlNPTi5wYXJzZShtYXliZUpzb24pLCBudWxsLCAyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBtYXliZUpzb247XG4gIH1cbn07XG5cbmNvbnN0IGNvbXBvbmVudHMgPSB7XG4gIGJhZGdlOiAobGFiZWw6IHN0cmluZyk6IHN0cmluZyA9PiBgXG4gICAgICA8c3BhbiBjbGFzcz1cImJhZGdlXCI+JHtsYWJlbH08L3NwYW4+XG4gIGAsXG5cbiAgaWQ6IChpZDogYW55KTogc3RyaW5nID0+IGBcbiAgICAgIDxzcGFuIGNsYXNzPVwiaWRcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImlkLXNlZ21lbnQgdHlwZVwiPiR7aWQucmVzb3VyY2VUeXBlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImlkLXNlZ21lbnQgbmFtZVwiPiR7aWQucmVzb3VyY2VMYWJlbH08L3NwYW4+XG4gICAgICA8L3NwYW4+XG4gIGAsXG5cbiAgd2FybmluZzogKHdhcm5pbmc6IGFueSk6IHN0cmluZyA9PiBgXG4gICAgICA8bGk+XG4gICAgICAgICAgJHtjb21wb25lbnRzLmJhZGdlKFwid2FybmluZ1wiKX1cbiAgICAgICAgICAke2NvbXBvbmVudHMuaWQod2FybmluZy5pZCl9XG4gICAgICAgICAgPHNwYW4+JHt3YXJuaW5nLmRldGFpbH08L3NwYW4+XG4gICAgICA8L2xpPlxuICBgLFxuXG4gIGNoYW5nZUNvdW50OiAoY291bnQ6IG51bWJlcik6IHN0cmluZyA9PiBgXG4gICAgICA8c3BhbiBjbGFzcz1cImNoYW5nZS1jb3VudFwiPlxuICAgICAgICAgICR7YCR7Y291bnR9IGNoYW5nZSR7Y291bnQgPiAxID8gXCJzXCIgOiBcIlwifWB9XG4gICAgICA8L3NwYW4+XG4gIGAsXG5cbiAgY2hhbmdlOiAoeyBhY3Rpb24sIGZyb20sIHRvLCBsYWJlbCB9OiBOaWNlckRpZmZDaGFuZ2UpOiBzdHJpbmcgPT4gYFxuICAgIDx0cj5cbiAgICAgIDx0ZCBjbGFzcz1cInByb3BlcnR5XCI+XG4gICAgICAgICR7bGFiZWx9XG4gICAgICAgICR7YDxiciAvPjxzcGFuIGNsYXNzPVwiZm9yY2VzLW5ldy1yZXNvdXJjZVwiPigke2FjdGlvbn0pPC9zcGFuPmB9XG4gICAgICA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwib2xkLXZhbHVlXCI+JHtmcm9tID8gcHJldHRpZnkoZnJvbSkgOiBcIlwifTwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJuZXctdmFsdWVcIj4ke3ByZXR0aWZ5KHRvKX08L3RkPlxuICAgIDwvdHI+XG4gIGAsXG5cbiAgYWN0aW9uOiAoeyBjZGtEaWZmUmF3LCBuaWNlckRpZmYsIGxhYmVsIH06IE5pY2VyRGlmZik6IHN0cmluZyA9PiBgXG4gICAgPGxpIGNsYXNzPVwiJHtuaWNlckRpZmY/LnJlc291cmNlQWN0aW9uLnRvTG9jYWxlTG93ZXJDYXNlKCkgfHwgXCJjcmVhdGVcIn1cIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdW1tYXJ5XCIgb25jbGljaz1cImFjY29yZGlvbih0aGlzKVwiPlxuICAgICAgICAke2NvbXBvbmVudHMuYmFkZ2UobmljZXJEaWZmPy5yZXNvdXJjZUFjdGlvbiB8fCBcIlwiKX1cbiAgICAgICAgJHtjb21wb25lbnRzLmlkKFxuICAgICAgICAgIG5pY2VyRGlmZiB8fCB7IHJlc291cmNlVHlwZTogXCJcIiwgcmVzb3VyY2VMYWJlbDogbGFiZWwgfVxuICAgICAgICApfVxuICAgICAgICAke1xuICAgICAgICAgIG5pY2VyRGlmZj8uY2hhbmdlc1xuICAgICAgICAgICAgPyBjb21wb25lbnRzLmNoYW5nZUNvdW50KG5pY2VyRGlmZi5jaGFuZ2VzLmxlbmd0aClcbiAgICAgICAgICAgIDogXCJcIlxuICAgICAgICB9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjaGFuZ2VzIGNvbGxhcHNlZFwiPlxuICAgICAgICAke1xuICAgICAgICAgIG5pY2VyRGlmZj8uY2hhbmdlcy5sZW5ndGhcbiAgICAgICAgICAgID8gYDx0YWJsZT5cbiAgICAgICAgICAgICAgJHtuaWNlckRpZmY/LmNoYW5nZXMubWFwKGNvbXBvbmVudHMuY2hhbmdlKS5qb2luKFwiXCIpfVxuICAgICAgICAgIDwvdGFibGU+YFxuICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgIH1cbiAgICAgICAgJHtjb21wb25lbnRzLnJhd0RpZmYoY2RrRGlmZlJhdywgXCJDREsgRGlmZiBPdXRwdXRcIiwge1xuICAgICAgICAgIGNvbGxhcHNlZDogIW5pY2VyRGlmZj8uY2hhbmdlcy5sZW5ndGgsXG4gICAgICAgICAgc2hvd0J1dHRvbjogISFuaWNlckRpZmY/LmNoYW5nZXMubGVuZ3RoLFxuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gIGAsXG5cbiAgbW9kYWw6IChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcgPT4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLXBhbmVcIiBvbmNsaWNrPVwiY2xvc2VNb2RhbCgpXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jbG9zZVwiPjxidXR0b24gY2xhc3M9XCJ0ZXh0LWJ1dHRvblwiIG9uY2xpY2s9XCJjbG9zZU1vZGFsKClcIj5jbG9zZTwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgICR7Y29udGVudH1cbiAgICAgIDwvZGl2PlxuICBgLFxuXG4gIHJhd0RpZmY6IChcbiAgICByYXc6IHN0cmluZyxcbiAgICB0b2dnbGVDYXB0aW9uOiBzdHJpbmcsXG4gICAgb3B0cz86IHsgY29sbGFwc2VkOiBib29sZWFuOyBzaG93QnV0dG9uPzogYm9vbGVhbiB9XG4gICk6IHN0cmluZyA9PiBgXG4gICAgPGRpdiBjbGFzcz1cInJhdy1kaWZmXCI+XG4gICAgICAke1xuICAgICAgICB0eXBlb2Ygb3B0cz8uc2hvd0J1dHRvbiA9PT0gXCJib29sZWFuXCIgJiYgb3B0cz8uc2hvd0J1dHRvbiA9PT0gZmFsc2VcbiAgICAgICAgICA/IFwiXCJcbiAgICAgICAgICA6IGA8YnV0dG9uIG9uY2xpY2s9XCJhY2NvcmRpb24odGhpcylcIj4ke3RvZ2dsZUNhcHRpb259PC9idXR0b24+YFxuICAgICAgfVxuICAgICAgPGRpdiBjbGFzcz1cImNoYW5nZXMgJHtvcHRzPy5jb2xsYXBzZWQgPyBcImNvbGxhcHNlZFwiIDogXCJcIn1cIj5cbiAgICAgICAgICA8cHJlPlxuICAgICAgICAgICAgJHtyYXd9XG4gICAgICAgICAgPC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYCxcblxuICBzdGFja0RpZmY6ICh7IHN0YWNrTmFtZSwgcmF3LCBkaWZmIH06IE5pY2VyU3RhY2tEaWZmKTogc3RyaW5nID0+IGBcbiAgICA8ZGl2IGNsYXNzPVwic3RhY2tcIj5cbiAgICAgIDxoMj4ke3N0YWNrTmFtZX08L2gyPlxuICAgICAgJHtjb21wb25lbnRzLnJhd0RpZmYocmF3LCBcIk9yaWcgQ0RLIERpZmZcIiwgeyBjb2xsYXBzZWQ6IHRydWUgfSl9XG4gICAgICAkeyFkaWZmPy5sZW5ndGggPyBgPGRpdj5ObyBjaGFuZ2VzPC9kaXY+YCA6IFwiXCJ9XG4gICAgICA8dWwgY2xhc3M9XCJhY3Rpb25zXCI+XG4gICAgICAgICR7ZGlmZlxuICAgICAgICAgID8uZmlsdGVyKFxuICAgICAgICAgICAgKHsgbmljZXJEaWZmIH0pID0+XG4gICAgICAgICAgICAgICFuaWNlckRpZmYgfHxcbiAgICAgICAgICAgICAgIVtcInBhcmFtZXRlcnNcIl0uaW5jbHVkZXMobmljZXJEaWZmPy5jZGtEaWZmQ2F0ZWdvcnkpXG4gICAgICAgICAgKVxuICAgICAgICAgIC5tYXAoY29tcG9uZW50cy5hY3Rpb24pXG4gICAgICAgICAgLmpvaW4oXCJcXG5cIil9XG4gICAgICA8L3VsPlxuICAgIDwvZGl2PlxuICBgLFxufTtcblxuZXhwb3J0IGNvbnN0IHJlbmRlckN1c3RvbURpZmZUb0h0bWxTdHJpbmcgPSAoXG4gIGRpZmZzOiBOaWNlclN0YWNrRGlmZltdLFxuICB0aXRsZTogc3RyaW5nXG4pOiBzdHJpbmcgPT4ge1xuICBsZXQgaHRtbCA9IHJlYWRGaWxlU3luYyhcbiAgICByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3ByZXR0eS1kaWZmLXRlbXBsYXRlLmh0bWxcIilcbiAgKS50b1N0cmluZygpO1xuICBodG1sID0gaHRtbFxuICAgIC5yZXBsYWNlKGA8aDE+cHJldHR5cGxhbjwvaDE+YCwgYDxoMT4ke3RpdGxlfTwvaDE+YClcbiAgICAucmVwbGFjZShgPHRpdGxlPnByZXR0eXBsYW48L3RpdGxlPmAsIGA8dGl0bGU+JHt0aXRsZX08L3RpdGxlPmApO1xuXG4gIGNvbnN0IHN0YWNrc0h0bWwgPSBkaWZmcy5tYXAoY29tcG9uZW50cy5zdGFja0RpZmYpO1xuICBodG1sID0gaHRtbC5yZXBsYWNlKFxuICAgIGA8ZGl2IGlkPVwic3RhY2tzXCI+PC9kaXY+YCxcbiAgICBgPGRpdiBpZD1cInN0YWNrc1wiPiR7c3RhY2tzSHRtbH08L2Rpdj5gXG4gICk7XG5cbiAgcmV0dXJuIGh0bWw7XG59O1xuIl19