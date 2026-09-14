const fs = require('fs');
const f = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('onclick=\"switchSashaMode') !== -1) { console.log('ALREADY'); process.exit(0); }
const OLD = '      <div class="layer-pane" id="pane-sasha">\n        <label style="font-weight:400; font-size:12px; display:block; margin:4px 0;">';
if (s.indexOf(OLD) === -1) { console.log('MISS'); process.exit(1); }
const TABS = '      <div class="layer-pane" id="pane-sasha">\n'
  + '        <div class="sasha-mode-row">'
  + '<button class="sasha-tab ${sashaMode!==\'send\'?\'on\':\'\'}" onclick="switchSashaMode(\'${c.id}\',\'talk\')">Talk to Sasha</button>'
  + '<button class="sasha-tab ${sashaMode===\'send\'?\'on\':\'\'}" onclick="switchSashaMode(\'${c.id}\',\'send\')">Send to client</button>'
  + '</div>\n'
  + '        <div class="hint" style="margin:6px 0;">${sashaMode===\'send\' ? \'Sasha will write a message to this client.\' : \'Private. Nothing you say here reaches the client.\'}</div>\n'
  + '        <label style="font-weight:400; font-size:12px; display:${sashaMode===\'send\'?\'block\':\'none\'}; margin:4px 0;">';
s = s.replace(OLD, TABS);
const CSS = '#NOCSS#';
s = s.replace(CSS, '  .sasha-tab{ all:unset; cursor:pointer; font-size:12px; font-weight:600; padding:6px 12px; border-radius:16px; background:#F1EFE8; color:var(--slate); }\n  .sasha-tab.on{ background:var(--brass); color:#fff; }\n  .sasha-mode-row{ display:flex; gap:8px; margin:8px 0 4px; }\n  .sasha-chat{');
s = s.replace('placeholder="Ask Sasha something about this lead…"', 'placeholder="${sashaMode===\'send\' ? \'Tell Sasha what to write…\' : \'Ask Sasha anything about this lead…\'}"');
fs.writeFileSync(f + '.bak-tabs', fs.readFileSync(f));
fs.writeFileSync(f, s);
console.log('TABS_IN');
