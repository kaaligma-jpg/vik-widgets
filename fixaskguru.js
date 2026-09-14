// fixaskguru.js — port the Ask Guru chat panel onto the insurance dashboard
const fs = require('fs');
const FILE = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(FILE, 'utf8');
fs.writeFileSync(FILE + '.bak-askguru', s);
let ok = 0;

// ---- 1. the panel itself, above the recruit toolbar -----------------------
const A1 = `      <div class="stats" id="recruitStats"></div>

      <div class="toolbar">
        <input id="recruitSearch" placeholder="Search recruits by name...">`;

const R1 = `      <div class="stats" id="recruitStats"></div>

      <div style="border:1px solid var(--line); border-radius:10px; padding:10px 12px; margin:10px 0; background:#FBFAF6;">
        <div style="font-weight:700; font-size:13px; margin-bottom:6px;">Ask Guru</div>
        <div id="guruChatWrap"></div>
        <div style="display:flex; gap:8px; align-items:flex-start; margin-top:8px;">
          <textarea id="guruChatInput" rows="2" placeholder="Ask Guru about your recruits…" style="flex:1;"></textarea>
          <button class="sasha-voice-btn" id="guruVoiceBtn" type="button" onclick="toggleGuruVoice()" title="Talk to Guru by voice">&#127897;</button>
          <button class="btn small" type="button" onclick="sendGuruMessage()">Send</button>
        </div>
        <div class="sasha-voice-hint" id="guruVoiceHint"></div>
      </div>

      <div class="toolbar">
        <input id="recruitSearch" placeholder="Search recruits by name...">`;

if (s.includes(A1)) { s = s.replace(A1, R1); ok++; console.log('OK 1 — panel added'); }
else console.log('SKIP 1 — recruit stats block not found');

// ---- 2. let speakSashaReply take a voice id -------------------------------
const A2 = `function speakSashaReply(text){
  const clean = String(text||'').replace(/\\s+/g,' ').trim();
  if(!clean) return;`;

const R2 = `function speakSashaReply(text, voiceId){
  const clean = String(text||'').replace(/\\s+/g,' ').trim();
  if(!clean) return;`;

const A2b = `    body: JSON.stringify({ text: clean })
  }).then(function(r){
    if(!r.ok) throw new Error('tts ' + r.status);`;

const R2b = `    body: JSON.stringify(voiceId ? { text: clean, voiceId: voiceId } : { text: clean })
  }).then(function(r){
    if(!r.ok) throw new Error('tts ' + r.status);`;

if (s.includes(A2) && s.includes(A2b)) {
  s = s.replace(A2, R2).replace(A2b, R2b);
  ok++; console.log('OK 2 — voice id supported');
} else console.log('SKIP 2 — speakSashaReply not found');

// ---- 3. the chat logic, appended before the init calls --------------------
const A3 = `populateFilters();
loadClients();
loadRecruits();`;

const R3 = `// ---- Ask Guru: Vik asking Guru about the insurance recruits. Sends to nobody. ----
const GURU_VOICE_ID = 'TWutjvRaJqAX89preB4e';
let guruChat = [];
let guruRecognition = null;

function renderGuruChat(){
  const wrap = document.getElementById('guruChatWrap');
  if(!wrap) return;
  if(!guruChat.length){
    wrap.innerHTML = '<div class="note-empty">Ask Guru who is behind, who went quiet, or how someone is doing.</div>';
    return;
  }
  wrap.innerHTML = '<div class="sasha-chat">' + guruChat.map(function(m){
    return '<div class="sasha-msg ' + (m.from==='Vik'?'vik':'sasha') + '">'
      + '<div class="item-meta">' + (m.from==='Vik'?'You':'Guru') + '</div>'
      + '<div>' + escapeHtml(m.text) + '</div></div>';
  }).join('') + '</div>';
  wrap.scrollTop = wrap.scrollHeight;
}

function guruDigest(){
  return (recruits||[]).map(function(r){
    const done = r.examStages ? r.examStages.filter(function(e){ return e && e.done; }).length : 0;
    return {
      name: r.name || ((r.firstName||'') + ' ' + (r.lastName||'')).trim(),
      side: 'insurance',
      day: r.programDay || 1,
      coachingLevel: r.coachingLevel || '',
      studyLevel: r.studyLevel || '',
      learningLevel: r.learningLevel || '',
      personalGrowthLevel: r.personalGrowthLevel || '',
      examStagesDone: done,
      superSaturdays: (r.superSaturdays||[]).length,
      prospects: (r.prospects||[]).length,
      nameList: (r.nameList||[]).length,
      salesMade: r.salesMade || 0,
      peopleRecruited: r.peopleRecruited || 0
    };
  });
}

async function sendGuruMessage(isVoice){
  const input = document.getElementById('guruChatInput');
  if(!input) return;
  const text = input.value.trim();
  if(!text) return;
  guruChat.push({ from:'Vik', text: text });
  input.value = '';
  renderGuruChat();
  let replyText;
  try{
    const res = await fetch('https://fincop-backend.onrender.com/guru-chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message: text, history: guruChat, recruits: guruDigest() })
    });
    if(!res.ok) throw new Error('guru backend error ' + res.status);
    const data = await res.json();
    replyText = (data && data.reply) || 'Got it.';
  }catch(e){
    replyText = "I couldn't reach my backend just now. Try again in a moment.";
  }
  guruChat.push({ from:'Guru', text: replyText });
  renderGuruChat();
  if(isVoice) speakSashaReply(replyText, GURU_VOICE_ID);
}

function toggleGuruVoice(){
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = document.getElementById('guruVoiceBtn');
  const hint = document.getElementById('guruVoiceHint');
  if(!SpeechRecognitionAPI){ showToast('Voice needs Chrome or Edge.'); return; }
  if(guruRecognition){ guruRecognition.stop(); return; }
  guruRecognition = new SpeechRecognitionAPI();
  guruRecognition.lang = 'en-US';
  guruRecognition.continuous = false;
  guruRecognition.interimResults = false;
  guruRecognition.onstart = function(){ if(btn) btn.classList.add('listening'); if(hint) hint.textContent = 'Listening… speak now.'; };
  guruRecognition.onresult = function(event){
    const inp = document.getElementById('guruChatInput');
    if(inp) inp.value = event.results[0][0].transcript;
    if(hint) hint.textContent = '';
    sendGuruMessage(true);
  };
  guruRecognition.onerror = function(){ if(hint) hint.textContent = 'Tap the mic and try again.'; };
  guruRecognition.onend = function(){ if(btn) btn.classList.remove('listening'); guruRecognition = null; };
  guruRecognition.start();
}

populateFilters();
loadClients();
loadRecruits();
renderGuruChat();`;

if (s.includes(A3)) { s = s.replace(A3, R3); ok++; console.log('OK 3 — chat logic added'); }
else console.log('SKIP 3 — init block not found');

fs.writeFileSync(FILE, s);
console.log('Done: ' + ok + ' of 3 applied. Backup: ' + FILE + '.bak-askguru');
