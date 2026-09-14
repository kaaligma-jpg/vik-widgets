// fixgap.js — put the assignment label on its own line
const fs = require('fs');
const FILE = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(FILE, 'utf8');
fs.writeFileSync(FILE + '.bak-gap', s);

const OLD = `      out += '<div style="margin-bottom:9px;">'
           + '<span style="display:inline-block;font-size:11px;letter-spacing:.06em;'
           + 'text-transform:uppercase;color:#7a7f87;font-weight:700;margin-right:6px;">'
           + escapeHtml(label) + '</span>'
           + '<span>' + escapeHtml(body) + '</span></div>';`;

const NEW = `      out += '<div style="margin-bottom:11px;">'
           + '<div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;'
           + 'color:#7a7f87;font-weight:700;margin-bottom:3px;">'
           + escapeHtml(label) + '</div>'
           + '<div>' + escapeHtml(body) + '</div></div>';`;

if (s.includes(OLD)) {
  s = s.replace(OLD, NEW);
  fs.writeFileSync(FILE, s);
  console.log('OK — label now sits on its own line');
} else {
  console.log('SKIP — block not found, nothing changed');
}
