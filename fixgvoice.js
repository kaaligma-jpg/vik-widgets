const fs = require('fs');
const f = 'vik-mortgage-dashboard.html';
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('GURU_VOICE_ID') !== -1) { console.log('ALREADY'); process.exit(0); }
const A = "function speakSashaReply(text){";
const B = "const GURU_VOICE_ID = 'TWutjvRaJqAX89preB4e';\nfunction speakSashaReply(text, voiceId){";
if (s.indexOf(A) === -1) { console.log('MISS a'); process.exit(1); }
s = s.replace(A, B);
const C = "body: JSON.stringify({ text: clean })";
const D = "body: JSON.stringify(voiceId ? { text: clean, voiceId: voiceId } : { text: clean })";
if (s.indexOf(C) === -1) { console.log('MISS c'); process.exit(1); }
s = s.replace(C, D);
const E = "  if(isVoice) speakSashaReply(replyText);\n}\nfunction toggleGuruVoice(){";
const G = "  if(isVoice) speakSashaReply(replyText, GURU_VOICE_ID);\n}\nfunction toggleGuruVoice(){";
if (s.indexOf(E) === -1) { console.log('MISS e'); process.exit(1); }
s = s.replace(E, G);
fs.writeFileSync(f + '.bak-gvoice', fs.readFileSync(f));
fs.writeFileSync(f, s);
console.log('GVOICE_IN');
