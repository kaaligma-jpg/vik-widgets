const fs = require('fs');
let s = fs.readFileSync('fixmode-ins.js', 'utf8');
const OLD = 'rep("body: JSON.stringify({ dealCode:c.dealCode, name:c.name, email:c.email, phone:c.phone, message:text, autoSend:c.sashaAutoSend, history:c.sashaChat, researchNotes:c.researchNotes })",';
const NEW = 'rep("body: JSON.stringify({ dealCode:c.dealCode, name:c.name, email:c.email, phone:c.phone, message:text, autoSend:c.sashaAutoSend, researchNotes:c.researchNotes, history:c.sashaChat, whatsappReplied:c.whatsappReplied })",';
if (s.indexOf(OLD) === -1) { console.log('NO_OLD'); process.exit(1); }
s = s.replace(OLD, NEW);
const O2 = "history: thread, researchNotes:c.researchNotes })";
const N2 = "researchNotes:c.researchNotes, history: thread, whatsappReplied:c.whatsappReplied })";
if (s.indexOf(O2) === -1) { console.log('NO_O2'); process.exit(1); }
s = s.replace(O2, N2);
fs.writeFileSync('fixmode-ins.js', s);
console.log('DONE');
