export default `
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
