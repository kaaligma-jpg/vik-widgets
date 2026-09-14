// fixphone.js — add phone and email fields to the insurance recruit profile
const fs = require('fs');
const FILE = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(FILE, 'utf8');
fs.writeFileSync(FILE + '.bak-phone', s);

const OLD = `      <div class="rfield"><label>Last name</label><input data-tfield="lastName" value="\${escapeHtml(r.lastName)}"></div>
      <div class="rfield"><label>Date recruited</label>`;

const NEW = `      <div class="rfield"><label>Last name</label><input data-tfield="lastName" value="\${escapeHtml(r.lastName)}"></div>
      <div class="rfield"><label>Phone</label><input type="tel" data-tfield="phone" placeholder="416 555 0123" value="\${escapeHtml(r.phone)}"></div>
      <div class="rfield"><label>Email</label><input type="email" data-tfield="email" placeholder="name@example.com" value="\${escapeHtml(r.email)}"></div>
      <div class="rfield"><label>Date recruited</label>`;

if (s.includes(OLD)) {
  s = s.replace(OLD, NEW);
  fs.writeFileSync(FILE, s);
  console.log('OK — phone and email fields added');
} else {
  console.log('SKIP — profile grid not found, nothing changed');
}
