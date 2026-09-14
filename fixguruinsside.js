// fixguruinsside.js — tell the backend this Guru question came from the insurance side
const fs = require('fs');
const FILE = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(FILE, 'utf8');
fs.writeFileSync(FILE + '.bak-side', s);

const OLD = `      body: JSON.stringify({ message: text, history: guruChat, recruits: guruDigest() })`;
const NEW = `      body: JSON.stringify({ message: text, history: guruChat, recruits: guruDigest(), side: 'insurance' })`;

if (s.includes(OLD)) {
  s = s.replace(OLD, NEW);
  fs.writeFileSync(FILE, s);
  console.log("OK — insurance dashboard now identifies its side");
} else {
  console.log("SKIP — guru-chat call not found, nothing changed");
}
