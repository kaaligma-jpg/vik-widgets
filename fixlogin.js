const fs = require('fs');
const f = 'vik-mortgage-dashboard.html';
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('openRecruitLogin') !== -1) { console.log('ALREADY THERE'); process.exit(0); }
fs.writeFileSync(f + '.bak-login', s);
const anchor = 'onclick="openRecruitCall(\'${r.id}\')">&#128222; Log a call</button>';
if (s.indexOf(anchor) === -1) { console.log('BUTTON ANCHOR NOT FOUND'); process.exit(1); }
s = s.replace(anchor, anchor +
  '\n    <button class="btn secondary small" style="margin-bottom:16px;margin-left:8px;" onclick="openRecruitLogin(\'${r.id}\')">&#128273; Login link</button>');
const a2 = 'const PHASE_LABELS = {';
if (s.indexOf(a2) === -1) { console.log('FN ANCHOR NOT FOUND'); process.exit(1); }
s = s.replace(a2, fs.readFileSync('rlogin.txt', 'utf8') + '\n' + a2);
fs.writeFileSync(f, s);
console.log('LOGIN LINK ADDED');
