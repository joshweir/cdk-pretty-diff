"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>prettyplan</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css" />
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        text-rendering: optimizeLegibility;
        background: #ecf7fe;
        color: #000000c0;
        font-size: 15px;
        margin: 0;
      }
      @keyframes fade-in {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      .stripe {
        width: 100%;
        height: 5px;
        background: #5c4ce4;
        animation-name: wipe-in;
        animation-duration: 1s;
      }
      @keyframes wipe-in {
        0% {
          width: 0%;
        }
        100% {
          width: 100%;
        }
      }

      #release-notification {
        background: #5c4ce4;
        color: white;
        font-weight: bold;
        text-align: center;
        overflow: hidden;
        padding: 10px 0 15px 0;
        height: 20px;
        animation-name: notification-pop-in;
        animation-duration: 2s;
      }
      #release-notification a {
        color: white;
      }
      #release-notification.dismissed {
        animation-name: notification-pop-out;
        animation-duration: 0.5s;
        height: 0;
        padding: 0;
      }
      @keyframes notification-pop-in {
        0% {
          height: 0;
          padding: 0;
        }
        50% {
          height: 0;
          padding: 0;
        }
      }
      @keyframes notification-pop-out {
        0% {
          height: 20px;
          padding: 10px 0 15px 0;
        }
        100% {
          height: 0;
          padding: 0;
        }
      }

      #modal-container {
        animation-name: fade-in;
        animation-duration: 0.2s;
      }
      .modal-pane {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #ffffffe6;
        z-index: 10;
      }
      .modal-content {
        position: fixed;
        width: 60%;
        height: 60%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ffffff;
        box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
        z-index: 20;
      }
      .modal-close {
        position: absolute;
        right: 0;
        padding: 10px;
      }
      .modal-close button.text-button {
        color: #4526ac;
        text-decoration: none;
        font-weight: normal;
      }
      .release-notes {
        max-width: 80%;
        margin: 0 auto 0 auto;
        overflow-y: auto;
        max-height: 100%;
      }

      #branding {
        float: right;
        padding-top: 10px;
        padding-right: 10px;
        font-size: 10px;
        color: #4526ac;
        text-align: right;
      }
      #branding a {
        color: #4526ac;
      }

      .container {
        margin: 10px 10px 0 10px;
        animation-name: fade-in;
        animation-duration: 1s;
      }
      @media only screen and (min-width: 600px) {
        .container {
          max-width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
      }

      h1,
      h2 {
        text-align: center;
        color: #4526ac;
      }

      #terraform-plan {
        width: 100%;
        min-height: 300px;
        border: none;
        box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
        padding: 10px;
        margin-bottom: 10px;
        resize: none;
        background: #ffffffe6;
      }

      button {
        font-size: 18px;
        background: #5c4ce4;
        color: #fff;
        box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
        border: none;
        border-radius: 2px;
        min-width: 170px;
        height: 40px;
      }
      button:hover {
        background: #6567ea;
        cursor: pointer;
      }
      button:active {
        background: #5037ca;
      }
      button.text-button {
        background: none;
        box-shadow: none;
        border-radius: 0;
        width: auto;
        height: auto;
        text-decoration: underline;
        font-size: inherit;
        font-weight: inherit;
        font-family: Arial, Helvetica, sans-serif;
        color: inherit;
        text-align: inherit;
        padding: 0;
      }

      #parsing-error-message {
        background-color: #ffffff;
        padding: 10px;
        color: #000000c0;
        margin: 4px;
        box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
        font-weight: bold;
        border-left: 2px solid red;
        animation-name: error;
        animation-duration: 1s;
      }

      @keyframes error {
        0% {
          background-color: red;
        }
        100% {
          background-color: white;
        }
      }

      .prettyplan ul {
        padding-left: 0;
        font-size: 13px;
      }

      .prettyplan li {
        list-style: none;
        background: #ffffffe6;
        padding: 10px;
        color: #000000c0;
        margin: 4px;
        box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
      }

      .prettyplan ul.warnings li {
        border-left: 3px solid #757575;
      }

      .prettyplan ul.actions li.update {
        border-left: 3px solid #ff8f00;
      }
      .prettyplan ul.actions li.create {
        border-left: 3px solid #2e7d32;
      }
      .prettyplan ul.actions li.addition {
        border-left: 3px solid #2e7d32;
      }
      .prettyplan ul.actions li.destroy {
        border-left: 3px solid #b71c1c;
      }
      .prettyplan ul.actions li.removal {
        border-left: 3px solid #b71c1c;
      }
      .prettyplan ul.actions li.recreate {
        border-left: 3px solid #1565c0;
      }
      .prettyplan ul.actions li.read {
        border-left: 3px solid #519bf0;
      }

      .badge {
        display: inline-block;
        text-transform: uppercase;
        margin-right: 10px;
        padding: 3px;
        font-size: 12px;
        font-weight: bold;
      }
      .warnings .badge {
        color: #757575;
      }
      li.update .badge {
        color: #ff8f00;
      }
      li.create .badge {
        color: #2e7d32;
      }
      li.addition .badge {
        color: #2e7d32;
      }
      li.destroy .badge {
        color: #b71c1c;
      }
      li.removal .badge {
        color: #b71c1c;
      }
      li.recreate .badge {
        color: #1565c0;
      }
      li.read .badge {
        color: #519bf0;
      }

      .id-segment:not(:last-child)::after {
        content: ' > ';
      }
      .id-segment.name,
      .id-segment.type {
        font-weight: bold;
      }

      .change-count {
        float: right;
      }

      .summary {
        cursor: pointer;
      }

      .no-diff-changes-breakdown {
        margin: 5px auto 0 auto;
        padding: 5px;
      }
      .no-diff-changes-breakdown table {
        width: 100%;
        word-break: break-all;
        font-size: 13px;
      }
      .no-diff-changes-breakdown table td {
        padding: 10px;
        width: 40%;
      }
      pre {
        white-space: pre-wrap;
        background: #f3f3f3;
      }
      .no-diff-changes-breakdown table td.property {
        width: 20%;
        text-align: right;
        font-weight: bold;
      }
      .no-diff-changes-breakdown table tr:nth-child(even) {
        background-color: #f5f5f5;
      }

      .forces-new-resource {
        color: #b71c1c;
      }

      .collapsed,
      .hidden {
        display: none;
      }

      .actions button {
        background: none;
        border: none;
        text-decoration: underline;
        color: black;
        box-shadow: none;
        font-weight: bold;
        font-size: 14px;
      }

      .d2h-icon {
        display: none;
      }
    </style>
  </head>
  <body>
    <div class="stripe"></div>
    <div class="container">
      <h1>prettyplan</h1>
      <div id="parsing-error-message" class="hidden">
        That doesn't look like a Terraform plan. Did you copy the entire output (without colouring) from the plan
        command?
      </div>
      <div id="prettyplan" class="prettyplan">
        <ul id="errors" class="errors"></ul>
        <ul id="warnings" class="warnings"></ul>
        <button class="expand-all" onclick="expandAll()">Expand all</button>
        <button class="collapse-all hidden" onclick="collapseAll()">Collapse all</button>
        <div id="stacks"></div>
        <ul id="actions" class="actions"></ul>
        <pre id="diff"></pre>
      </div>
    </div>
    <script>
      function accordion(element) {
        const changes = element.parentElement.getElementsByClassName('changes');
        for (var i = 0; i < changes.length; i++) {
          toggleClass(changes[i], 'collapsed');
        }
      }

      function toggleClass(element, className) {
        if (!element.className.match(className)) {
          element.className += ' ' + className;
        } else {
          element.className = element.className.replace(className, '');
        }
      }

      function addClass(element, className) {
        if (!element.className.match(className)) element.className += ' ' + className;
      }

      function removeClass(element, className) {
        element.className = element.className.replace(className, '');
      }

      function expandAll() {
        const sections = document.querySelectorAll('.changes.collapsed');

        for (var i = 0; i < sections.length; i++) {
          toggleClass(sections[i], 'collapsed');
        }

        toggleClass(document.querySelector('.expand-all'), 'hidden');
        toggleClass(document.querySelector('.collapse-all'), 'hidden');
      }

      function collapseAll() {
        const sections = document.querySelectorAll('.changes:not(.collapsed)');

        for (var i = 0; i < sections.length; i++) {
          toggleClass(sections[i], 'collapsed');
        }

        toggleClass(document.querySelector('.expand-all'), 'hidden');
        toggleClass(document.querySelector('.collapse-all'), 'hidden');
      }

      function removeChildren(element) {
        while (element.lastChild) {
          element.removeChild(element.lastChild);
        }
      }

      function createModalContainer() {
        const modalElement = document.createElement('div');
        modalElement.id = 'modal-container';

        document.body.appendChild(modalElement);

        return modalElement;
      }

      function closeModal() {
        const modalElement = document.getElementById('modal-container');
        document.body.removeChild(modalElement);
      }
    </script>
  </body>
</html>
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHR5LWRpZmYtdGVtcGxhdGUuaHRtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmV0dHktZGlmZi10ZW1wbGF0ZS5odG1sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTRiZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgYFxuPCFET0NUWVBFIGh0bWw+XG48aHRtbD5cbiAgPGhlYWQ+XG4gICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCIgLz5cbiAgICA8dGl0bGU+cHJldHR5cGxhbjwvdGl0bGU+XG4gICAgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xXCIgLz5cbiAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgdHlwZT1cInRleHQvY3NzXCIgaHJlZj1cImh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vZGlmZjJodG1sL2J1bmRsZXMvY3NzL2RpZmYyaHRtbC5taW4uY3NzXCIgLz5cbiAgICA8c3R5bGU+XG4gICAgICBib2R5IHtcbiAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XG4gICAgICAgIHRleHQtcmVuZGVyaW5nOiBvcHRpbWl6ZUxlZ2liaWxpdHk7XG4gICAgICAgIGJhY2tncm91bmQ6ICNlY2Y3ZmU7XG4gICAgICAgIGNvbG9yOiAjMDAwMDAwYzA7XG4gICAgICAgIGZvbnQtc2l6ZTogMTVweDtcbiAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgfVxuICAgICAgQGtleWZyYW1lcyBmYWRlLWluIHtcbiAgICAgICAgMCUge1xuICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgIH1cbiAgICAgICAgMTAwJSB7XG4gICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAuc3RyaXBlIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogNXB4O1xuICAgICAgICBiYWNrZ3JvdW5kOiAjNWM0Y2U0O1xuICAgICAgICBhbmltYXRpb24tbmFtZTogd2lwZS1pbjtcbiAgICAgICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAxcztcbiAgICAgIH1cbiAgICAgIEBrZXlmcmFtZXMgd2lwZS1pbiB7XG4gICAgICAgIDAlIHtcbiAgICAgICAgICB3aWR0aDogMCU7XG4gICAgICAgIH1cbiAgICAgICAgMTAwJSB7XG4gICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgI3JlbGVhc2Utbm90aWZpY2F0aW9uIHtcbiAgICAgICAgYmFja2dyb3VuZDogIzVjNGNlNDtcbiAgICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICBwYWRkaW5nOiAxMHB4IDAgMTVweCAwO1xuICAgICAgICBoZWlnaHQ6IDIwcHg7XG4gICAgICAgIGFuaW1hdGlvbi1uYW1lOiBub3RpZmljYXRpb24tcG9wLWluO1xuICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDJzO1xuICAgICAgfVxuICAgICAgI3JlbGVhc2Utbm90aWZpY2F0aW9uIGEge1xuICAgICAgICBjb2xvcjogd2hpdGU7XG4gICAgICB9XG4gICAgICAjcmVsZWFzZS1ub3RpZmljYXRpb24uZGlzbWlzc2VkIHtcbiAgICAgICAgYW5pbWF0aW9uLW5hbWU6IG5vdGlmaWNhdGlvbi1wb3Atb3V0O1xuICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDAuNXM7XG4gICAgICAgIGhlaWdodDogMDtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICAgIH1cbiAgICAgIEBrZXlmcmFtZXMgbm90aWZpY2F0aW9uLXBvcC1pbiB7XG4gICAgICAgIDAlIHtcbiAgICAgICAgICBoZWlnaHQ6IDA7XG4gICAgICAgICAgcGFkZGluZzogMDtcbiAgICAgICAgfVxuICAgICAgICA1MCUge1xuICAgICAgICAgIGhlaWdodDogMDtcbiAgICAgICAgICBwYWRkaW5nOiAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBAa2V5ZnJhbWVzIG5vdGlmaWNhdGlvbi1wb3Atb3V0IHtcbiAgICAgICAgMCUge1xuICAgICAgICAgIGhlaWdodDogMjBweDtcbiAgICAgICAgICBwYWRkaW5nOiAxMHB4IDAgMTVweCAwO1xuICAgICAgICB9XG4gICAgICAgIDEwMCUge1xuICAgICAgICAgIGhlaWdodDogMDtcbiAgICAgICAgICBwYWRkaW5nOiAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgICNtb2RhbC1jb250YWluZXIge1xuICAgICAgICBhbmltYXRpb24tbmFtZTogZmFkZS1pbjtcbiAgICAgICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAwLjJzO1xuICAgICAgfVxuICAgICAgLm1vZGFsLXBhbmUge1xuICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZmZmZmU2O1xuICAgICAgICB6LWluZGV4OiAxMDtcbiAgICAgIH1cbiAgICAgIC5tb2RhbC1jb250ZW50IHtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB3aWR0aDogNjAlO1xuICAgICAgICBoZWlnaHQ6IDYwJTtcbiAgICAgICAgdG9wOiA1MCU7XG4gICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gICAgICAgIGJhY2tncm91bmQ6ICNmZmZmZmY7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgMnB4IDZweCAwIGhzbGEoMCwgMCUsIDAlLCAwLjIpO1xuICAgICAgICB6LWluZGV4OiAyMDtcbiAgICAgIH1cbiAgICAgIC5tb2RhbC1jbG9zZSB7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgICB9XG4gICAgICAubW9kYWwtY2xvc2UgYnV0dG9uLnRleHQtYnV0dG9uIHtcbiAgICAgICAgY29sb3I6ICM0NTI2YWM7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgIH1cbiAgICAgIC5yZWxlYXNlLW5vdGVzIHtcbiAgICAgICAgbWF4LXdpZHRoOiA4MCU7XG4gICAgICAgIG1hcmdpbjogMCBhdXRvIDAgYXV0bztcbiAgICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICAgICAgbWF4LWhlaWdodDogMTAwJTtcbiAgICAgIH1cblxuICAgICAgI2JyYW5kaW5nIHtcbiAgICAgICAgZmxvYXQ6IHJpZ2h0O1xuICAgICAgICBwYWRkaW5nLXRvcDogMTBweDtcbiAgICAgICAgcGFkZGluZy1yaWdodDogMTBweDtcbiAgICAgICAgZm9udC1zaXplOiAxMHB4O1xuICAgICAgICBjb2xvcjogIzQ1MjZhYztcbiAgICAgICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAgICB9XG4gICAgICAjYnJhbmRpbmcgYSB7XG4gICAgICAgIGNvbG9yOiAjNDUyNmFjO1xuICAgICAgfVxuXG4gICAgICAuY29udGFpbmVyIHtcbiAgICAgICAgbWFyZ2luOiAxMHB4IDEwcHggMCAxMHB4O1xuICAgICAgICBhbmltYXRpb24tbmFtZTogZmFkZS1pbjtcbiAgICAgICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAxcztcbiAgICAgIH1cbiAgICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogNjAwcHgpIHtcbiAgICAgICAgLmNvbnRhaW5lciB7XG4gICAgICAgICAgbWF4LXdpZHRoOiA4MCU7XG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IGF1dG87XG4gICAgICAgICAgbWFyZ2luLXJpZ2h0OiBhdXRvO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGgxLFxuICAgICAgaDIge1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIGNvbG9yOiAjNDUyNmFjO1xuICAgICAgfVxuXG4gICAgICAjdGVycmFmb3JtLXBsYW4ge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgbWluLWhlaWdodDogMzAwcHg7XG4gICAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgICAgYm94LXNoYWRvdzogMCAycHggNnB4IDAgaHNsYSgwLCAwJSwgMCUsIDAuMik7XG4gICAgICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XG4gICAgICAgIHJlc2l6ZTogbm9uZTtcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZmZmZmU2O1xuICAgICAgfVxuXG4gICAgICBidXR0b24ge1xuICAgICAgICBmb250LXNpemU6IDE4cHg7XG4gICAgICAgIGJhY2tncm91bmQ6ICM1YzRjZTQ7XG4gICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICBib3gtc2hhZG93OiAwIDJweCA2cHggMCBoc2xhKDAsIDAlLCAwJSwgMC4yKTtcbiAgICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgICBib3JkZXItcmFkaXVzOiAycHg7XG4gICAgICAgIG1pbi13aWR0aDogMTcwcHg7XG4gICAgICAgIGhlaWdodDogNDBweDtcbiAgICAgIH1cbiAgICAgIGJ1dHRvbjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6ICM2NTY3ZWE7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIH1cbiAgICAgIGJ1dHRvbjphY3RpdmUge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjNTAzN2NhO1xuICAgICAgfVxuICAgICAgYnV0dG9uLnRleHQtYnV0dG9uIHtcbiAgICAgICAgYmFja2dyb3VuZDogbm9uZTtcbiAgICAgICAgYm94LXNoYWRvdzogbm9uZTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMDtcbiAgICAgICAgd2lkdGg6IGF1dG87XG4gICAgICAgIGhlaWdodDogYXV0bztcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gICAgICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmO1xuICAgICAgICBjb2xvcjogaW5oZXJpdDtcbiAgICAgICAgdGV4dC1hbGlnbjogaW5oZXJpdDtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICAgIH1cblxuICAgICAgI3BhcnNpbmctZXJyb3ItbWVzc2FnZSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmZmZmY7XG4gICAgICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgICAgIGNvbG9yOiAjMDAwMDAwYzA7XG4gICAgICAgIG1hcmdpbjogNHB4O1xuICAgICAgICBib3gtc2hhZG93OiAwIDJweCA2cHggMCBoc2xhKDAsIDAlLCAwJSwgMC4yKTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAycHggc29saWQgcmVkO1xuICAgICAgICBhbmltYXRpb24tbmFtZTogZXJyb3I7XG4gICAgICAgIGFuaW1hdGlvbi1kdXJhdGlvbjogMXM7XG4gICAgICB9XG5cbiAgICAgIEBrZXlmcmFtZXMgZXJyb3Ige1xuICAgICAgICAwJSB7XG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xuICAgICAgICB9XG4gICAgICAgIDEwMCUge1xuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC5wcmV0dHlwbGFuIHVsIHtcbiAgICAgICAgcGFkZGluZy1sZWZ0OiAwO1xuICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICB9XG5cbiAgICAgIC5wcmV0dHlwbGFuIGxpIHtcbiAgICAgICAgbGlzdC1zdHlsZTogbm9uZTtcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZmZmZmU2O1xuICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgICAgICBjb2xvcjogIzAwMDAwMGMwO1xuICAgICAgICBtYXJnaW46IDRweDtcbiAgICAgICAgYm94LXNoYWRvdzogMCAycHggNnB4IDAgaHNsYSgwLCAwJSwgMCUsIDAuMik7XG4gICAgICB9XG5cbiAgICAgIC5wcmV0dHlwbGFuIHVsLndhcm5pbmdzIGxpIHtcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCAjNzU3NTc1O1xuICAgICAgfVxuXG4gICAgICAucHJldHR5cGxhbiB1bC5hY3Rpb25zIGxpLnVwZGF0ZSB7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgI2ZmOGYwMDtcbiAgICAgIH1cbiAgICAgIC5wcmV0dHlwbGFuIHVsLmFjdGlvbnMgbGkuY3JlYXRlIHtcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCAjMmU3ZDMyO1xuICAgICAgfVxuICAgICAgLnByZXR0eXBsYW4gdWwuYWN0aW9ucyBsaS5hZGRpdGlvbiB7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgIzJlN2QzMjtcbiAgICAgIH1cbiAgICAgIC5wcmV0dHlwbGFuIHVsLmFjdGlvbnMgbGkuZGVzdHJveSB7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgI2I3MWMxYztcbiAgICAgIH1cbiAgICAgIC5wcmV0dHlwbGFuIHVsLmFjdGlvbnMgbGkucmVtb3ZhbCB7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgI2I3MWMxYztcbiAgICAgIH1cbiAgICAgIC5wcmV0dHlwbGFuIHVsLmFjdGlvbnMgbGkucmVjcmVhdGUge1xuICAgICAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkICMxNTY1YzA7XG4gICAgICB9XG4gICAgICAucHJldHR5cGxhbiB1bC5hY3Rpb25zIGxpLnJlYWQge1xuICAgICAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkICM1MTliZjA7XG4gICAgICB9XG5cbiAgICAgIC5iYWRnZSB7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxMHB4O1xuICAgICAgICBwYWRkaW5nOiAzcHg7XG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICB9XG4gICAgICAud2FybmluZ3MgLmJhZGdlIHtcbiAgICAgICAgY29sb3I6ICM3NTc1NzU7XG4gICAgICB9XG4gICAgICBsaS51cGRhdGUgLmJhZGdlIHtcbiAgICAgICAgY29sb3I6ICNmZjhmMDA7XG4gICAgICB9XG4gICAgICBsaS5jcmVhdGUgLmJhZGdlIHtcbiAgICAgICAgY29sb3I6ICMyZTdkMzI7XG4gICAgICB9XG4gICAgICBsaS5hZGRpdGlvbiAuYmFkZ2Uge1xuICAgICAgICBjb2xvcjogIzJlN2QzMjtcbiAgICAgIH1cbiAgICAgIGxpLmRlc3Ryb3kgLmJhZGdlIHtcbiAgICAgICAgY29sb3I6ICNiNzFjMWM7XG4gICAgICB9XG4gICAgICBsaS5yZW1vdmFsIC5iYWRnZSB7XG4gICAgICAgIGNvbG9yOiAjYjcxYzFjO1xuICAgICAgfVxuICAgICAgbGkucmVjcmVhdGUgLmJhZGdlIHtcbiAgICAgICAgY29sb3I6ICMxNTY1YzA7XG4gICAgICB9XG4gICAgICBsaS5yZWFkIC5iYWRnZSB7XG4gICAgICAgIGNvbG9yOiAjNTE5YmYwO1xuICAgICAgfVxuXG4gICAgICAuaWQtc2VnbWVudDpub3QoOmxhc3QtY2hpbGQpOjphZnRlciB7XG4gICAgICAgIGNvbnRlbnQ6ICcgPiAnO1xuICAgICAgfVxuICAgICAgLmlkLXNlZ21lbnQubmFtZSxcbiAgICAgIC5pZC1zZWdtZW50LnR5cGUge1xuICAgICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICAgIH1cblxuICAgICAgLmNoYW5nZS1jb3VudCB7XG4gICAgICAgIGZsb2F0OiByaWdodDtcbiAgICAgIH1cblxuICAgICAgLnN1bW1hcnkge1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICB9XG5cbiAgICAgIC5uby1kaWZmLWNoYW5nZXMtYnJlYWtkb3duIHtcbiAgICAgICAgbWFyZ2luOiA1cHggYXV0byAwIGF1dG87XG4gICAgICAgIHBhZGRpbmc6IDVweDtcbiAgICAgIH1cbiAgICAgIC5uby1kaWZmLWNoYW5nZXMtYnJlYWtkb3duIHRhYmxlIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcbiAgICAgICAgZm9udC1zaXplOiAxM3B4O1xuICAgICAgfVxuICAgICAgLm5vLWRpZmYtY2hhbmdlcy1icmVha2Rvd24gdGFibGUgdGQge1xuICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgICAgICB3aWR0aDogNDAlO1xuICAgICAgfVxuICAgICAgcHJlIHtcbiAgICAgICAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xuICAgICAgICBiYWNrZ3JvdW5kOiAjZjNmM2YzO1xuICAgICAgfVxuICAgICAgLm5vLWRpZmYtY2hhbmdlcy1icmVha2Rvd24gdGFibGUgdGQucHJvcGVydHkge1xuICAgICAgICB3aWR0aDogMjAlO1xuICAgICAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICB9XG4gICAgICAubm8tZGlmZi1jaGFuZ2VzLWJyZWFrZG93biB0YWJsZSB0cjpudGgtY2hpbGQoZXZlbikge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjVmNWY1O1xuICAgICAgfVxuXG4gICAgICAuZm9yY2VzLW5ldy1yZXNvdXJjZSB7XG4gICAgICAgIGNvbG9yOiAjYjcxYzFjO1xuICAgICAgfVxuXG4gICAgICAuY29sbGFwc2VkLFxuICAgICAgLmhpZGRlbiB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgICB9XG5cbiAgICAgIC5hY3Rpb25zIGJ1dHRvbiB7XG4gICAgICAgIGJhY2tncm91bmQ6IG5vbmU7XG4gICAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gICAgICAgIGNvbG9yOiBibGFjaztcbiAgICAgICAgYm94LXNoYWRvdzogbm9uZTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIH1cblxuICAgICAgLmQyaC1pY29uIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgIH1cbiAgICA8L3N0eWxlPlxuICA8L2hlYWQ+XG4gIDxib2R5PlxuICAgIDxkaXYgY2xhc3M9XCJzdHJpcGVcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgICA8aDE+cHJldHR5cGxhbjwvaDE+XG4gICAgICA8ZGl2IGlkPVwicGFyc2luZy1lcnJvci1tZXNzYWdlXCIgY2xhc3M9XCJoaWRkZW5cIj5cbiAgICAgICAgVGhhdCBkb2Vzbid0IGxvb2sgbGlrZSBhIFRlcnJhZm9ybSBwbGFuLiBEaWQgeW91IGNvcHkgdGhlIGVudGlyZSBvdXRwdXQgKHdpdGhvdXQgY29sb3VyaW5nKSBmcm9tIHRoZSBwbGFuXG4gICAgICAgIGNvbW1hbmQ/XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgaWQ9XCJwcmV0dHlwbGFuXCIgY2xhc3M9XCJwcmV0dHlwbGFuXCI+XG4gICAgICAgIDx1bCBpZD1cImVycm9yc1wiIGNsYXNzPVwiZXJyb3JzXCI+PC91bD5cbiAgICAgICAgPHVsIGlkPVwid2FybmluZ3NcIiBjbGFzcz1cIndhcm5pbmdzXCI+PC91bD5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImV4cGFuZC1hbGxcIiBvbmNsaWNrPVwiZXhwYW5kQWxsKClcIj5FeHBhbmQgYWxsPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJjb2xsYXBzZS1hbGwgaGlkZGVuXCIgb25jbGljaz1cImNvbGxhcHNlQWxsKClcIj5Db2xsYXBzZSBhbGw8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBpZD1cInN0YWNrc1wiPjwvZGl2PlxuICAgICAgICA8dWwgaWQ9XCJhY3Rpb25zXCIgY2xhc3M9XCJhY3Rpb25zXCI+PC91bD5cbiAgICAgICAgPHByZSBpZD1cImRpZmZcIj48L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxzY3JpcHQ+XG4gICAgICBmdW5jdGlvbiBhY2NvcmRpb24oZWxlbWVudCkge1xuICAgICAgICBjb25zdCBjaGFuZ2VzID0gZWxlbWVudC5wYXJlbnRFbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NoYW5nZXMnKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdG9nZ2xlQ2xhc3MoY2hhbmdlc1tpXSwgJ2NvbGxhcHNlZCcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRvZ2dsZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICBpZiAoIWVsZW1lbnQuY2xhc3NOYW1lLm1hdGNoKGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKGNsYXNzTmFtZSwgJycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICBpZiAoIWVsZW1lbnQuY2xhc3NOYW1lLm1hdGNoKGNsYXNzTmFtZSkpIGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZShjbGFzc05hbWUsICcnKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZXhwYW5kQWxsKCkge1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaGFuZ2VzLmNvbGxhcHNlZCcpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0b2dnbGVDbGFzcyhzZWN0aW9uc1tpXSwgJ2NvbGxhcHNlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdG9nZ2xlQ2xhc3MoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmV4cGFuZC1hbGwnKSwgJ2hpZGRlbicpO1xuICAgICAgICB0b2dnbGVDbGFzcyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29sbGFwc2UtYWxsJyksICdoaWRkZW4nKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY29sbGFwc2VBbGwoKSB7XG4gICAgICAgIGNvbnN0IHNlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNoYW5nZXM6bm90KC5jb2xsYXBzZWQpJyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRvZ2dsZUNsYXNzKHNlY3Rpb25zW2ldLCAnY29sbGFwc2VkJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0b2dnbGVDbGFzcyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZXhwYW5kLWFsbCcpLCAnaGlkZGVuJyk7XG4gICAgICAgIHRvZ2dsZUNsYXNzKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb2xsYXBzZS1hbGwnKSwgJ2hpZGRlbicpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbihlbGVtZW50KSB7XG4gICAgICAgIHdoaWxlIChlbGVtZW50Lmxhc3RDaGlsZCkge1xuICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5sYXN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZU1vZGFsQ29udGFpbmVyKCkge1xuICAgICAgICBjb25zdCBtb2RhbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbW9kYWxFbGVtZW50LmlkID0gJ21vZGFsLWNvbnRhaW5lcic7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbEVsZW1lbnQpO1xuXG4gICAgICAgIHJldHVybiBtb2RhbEVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgICAgIGNvbnN0IG1vZGFsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1jb250YWluZXInKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChtb2RhbEVsZW1lbnQpO1xuICAgICAgfVxuICAgIDwvc2NyaXB0PlxuICA8L2JvZHk+XG48L2h0bWw+XG5gO1xuIl19