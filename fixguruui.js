const fs = require('fs');
const f = 'vik-mortgage-dashboard.html';
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('guruChatWrap') !== -1) { console.log('ALREADY'); process.exit(0); }
const OLDP = '      <div class="stats" id="recruitStats"></div>\n';
const i = s.indexOf(OLDP);
if (i === -1) { console.log('MISS panel'); process.exit(1); }
const PANEL = '      <div class="stats" id="recruitStats"></div>\n\n'
  + '      <div style="border:1px solid var(--line); border-radius:10px; padding:10px 12px; margin:10px 0; background:#FBFAF6;">\n'
  + '        <div style="font-weight:700; font-size:13px; margin-bottom:6px;">Ask Guru</div>\n'
  + '        <div id="guruChatWrap"></div>\n'
  + '        <div class="note-add-row">\n'
  + '          <textarea id="guruChatInput" rows="2" placeholder="Ask Guru about your recruits…"></textarea>\n'
  + '          <button class="sasha-voice-btn" id="guruVoiceBtn" onclick="toggleGuruVoice()" title="Talk to Guru by voice">&#127897;</button>\n'
  + '          <button class="btn small" onclick="sendGuruMessage()">Send</button>\n'
  + '        </div>\n'
  + '        <div class="sasha-voice-hint" id="guruVoiceHint"></div>\n'
  + '      </div>\n';
s = s.slice(0, i) + PANEL + s.slice(i + OLDP.length);
const JS = fs.readFileSync('guruui.txt', 'utf8');
const a2 = "document.getElementById('recruitSearch').addEventListener('input', renderRecruits);";
if (s.indexOf(a2) === -1) { console.log('MISS js'); process.exit(1); }
s = s.replace(a2, JS + '\n' + a2 + '\nrenderGuruChat();');
fs.writeFileSync(f + '.bak-guruui', fs.readFileSync(f));
fs.writeFileSync(f, s);
console.log('GURUUI_IN');
