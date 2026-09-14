const fs = require('fs');
const f = 'vik-mortgage-dashboard.html';
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('vikramChatWrap') !== -1) { console.log('ALREADY'); process.exit(0); }
const NAVOLD = '      <button id="navRecruitsBtn" onclick="showView(\'recruits\')">Recruits (Guru)</button>\n';
if (s.indexOf(NAVOLD) === -1) { console.log('MISS nav'); process.exit(1); }
s = s.replace(NAVOLD, NAVOLD + '      <button id="navVikramBtn" onclick="showView(\'vikram\')">Ask Vikram</button>\n');
const VOLD = '    <div id="view-clients">\n';
if (s.indexOf(VOLD) === -1) { console.log('MISS view'); process.exit(1); }
const PANEL = '    <div id="view-vikram" style="display:none;">\n'
  + '      <h1>Ask Vikram</h1>\n'
  + '      <p class="sub">Vikram sees the mortgage pipeline, the insurance pipeline and the recruit programme together. Private to you &mdash; he never sends anything to anyone.</p>\n'
  + '      <div id="vikramChatWrap"></div>\n'
  + '      <div class="note-add-row">\n'
  + '        <textarea id="vikramChatInput" rows="2" placeholder="What is stuck? Who should I chase today?"></textarea>\n'
  + '        <button class="sasha-voice-btn" id="vikramVoiceBtn" onclick="toggleVikramVoice()" title="Talk to Vikram by voice">&#127897;</button>\n'
  + '        <button class="btn small" onclick="sendVikramMessage()">Send</button>\n'
  + '      </div>\n'
  + '      <div class="sasha-voice-hint" id="vikramVoiceHint"></div>\n'
  + '    </div>\n\n';
s = s.replace(VOLD, PANEL + VOLD);
const SV = "  if(view==='recruits'){ closeRecruitDetail(); renderRecruits(); }";
if (s.indexOf(SV) === -1) { console.log('MISS showview'); process.exit(1); }
s = s.replace(SV, "  document.getElementById('view-vikram').style.display = (view==='vikram') ? '' : 'none';\n  document.getElementById('navVikramBtn').classList.toggle('active', view==='vikram');\n  if(view==='vikram') renderVikramChat();\n" + SV);
const JS = fs.readFileSync('vikramui.txt', 'utf8');
const a2 = "document.getElementById('recruitSearch').addEventListener('input', renderRecruits);";
if (s.indexOf(a2) === -1) { console.log('MISS js'); process.exit(1); }
s = s.replace(a2, JS + '\n' + a2);
fs.writeFileSync(f + '.bak-vikramui', fs.readFileSync(f));
fs.writeFileSync(f, s);
console.log('VIKRAMUI_IN');
