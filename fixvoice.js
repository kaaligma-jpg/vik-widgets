const fs = require('fs');
const f = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('sasha-speak') !== -1) { console.log('ALREADY THERE'); process.exit(0); }
const old = "function speakSashaReply(text){\n  if(!window.speechSynthesis) return;\n  window.speechSynthesis.cancel();\n  const utter = new SpeechSynthesisUtterance(text);\n  utter.rate = 1;\n  utter.pitch = 1;\n  window.speechSynthesis.speak(utter);\n}";
if (s.indexOf(old) === -1) { console.log('OLD FUNCTION NOT FOUND - stopping, nothing changed'); process.exit(1); }
fs.writeFileSync(f + '.bak-voice', s);
fs.writeFileSync(f, s.replace(old, fs.readFileSync('newspeak.txt', 'utf8').trim()));
console.log('VOICE SWAPPED');
