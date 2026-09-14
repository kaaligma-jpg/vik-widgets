const fs = require('fs');
const f = 'vik-mortgage-dashboard.html';
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('sasha-speak') !== -1) { console.log('ALREADY'); process.exit(0); }
const OLD = "function speakSashaReply(text){\n  if(!window.speechSynthesis) return;\n  window.speechSynthesis.cancel();\n  const utter = new SpeechSynthesisUtterance(text);\n  utter.rate = 1;\n  utter.pitch = 1;\n  window.speechSynthesis.speak(utter);\n}";
if (s.indexOf(OLD) === -1) { console.log('MISS'); process.exit(1); }
const NEW = fs.readFileSync('newspeak.txt', 'utf8').trim();
fs.writeFileSync(f + '.bak-mvoice', s);
fs.writeFileSync(f, s.replace(OLD, NEW));
console.log('VOICE_IN');
