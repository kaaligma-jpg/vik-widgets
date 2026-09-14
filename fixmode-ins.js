const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('switchSashaMode') !== -1) { console.log('ALREADY'); process.exit(0); }
fs.writeFileSync(f + '.bak-mode', s);
let n = 0;
function repSoft(a,b){ if(s.indexOf(a)===-1){console.log("skip empty-text");return;} s=s.split(a).join(b); n++; }
function rep(a, b) {
  const i = s.indexOf(a);
  if (i === -1) { console.log('MISS: ' + a.slice(0, 60)); process.exit(1); }
  if (s.indexOf(a, i + 1) !== -1) { console.log('DUPE: ' + a.slice(0, 60)); process.exit(1); }
  s = s.slice(0, i) + b + s.slice(i + a.length);
  n++;
}

// 1. CSS for the two sub-tabs
rep("  .sasha-voice-hint{",
    "  .sasha-tab{ all:unset; cursor:pointer; font-size:12px; font-weight:600; padding:6px 12px; border-radius:16px; background:#F1EFE8; color:var(--slate); }\n" +
    "  .sasha-tab.on{ background:var(--brass); color:#fff; }\n" +
    "  .sasha-mode-row{ display:flex; gap:8px; margin:8px 0 4px; }\n" +
    "  .sasha-voice-hint{");

// 2. default array for the private thread
rep("      if(!Array.isArray(c.sashaChat)) c.sashaChat = [];\n      if(typeof c.sashaAutoSend",
    "      if(!Array.isArray(c.sashaChat)) c.sashaChat = [];\n      if(!Array.isArray(c.sashaTalk)) c.sashaTalk = [];\n      if(typeof c.sashaAutoSend");

// 3. renderSashaChat reads whichever thread is open
rep("function renderSashaChat(c){\n  const items = (c.sashaChat||[]).slice()",
    "let sashaMode = 'talk';\nfunction switchSashaMode(id, mode){ sashaMode = mode; openDetail(id); switchLayerTab(id,'sasha'); }\nfunction renderSashaChat(c){\n  const talking = (sashaMode !== 'send');\n  const items = ((talking ? c.sashaTalk : c.sashaChat)||[]).slice()");
repSoft("No conversation with Sasha yet on this deal — ask her something below.",
    "${talking ? 'Nothing here yet. Whatever you say here stays between you and Sasha.' : 'No client messages drafted on this deal yet.'}");

// 4. sendSashaMessage - route to the right thread and tell the backend which mode
const A = "  if(!Array.isArray(c.sashaChat)) c.sashaChat = [];\n  c.sashaChat.push({ from:'Vik', text, ts: Date.now() });";
const B = "  const talking = (sashaMode !== 'send');\n  if(!Array.isArray(c.sashaChat)) c.sashaChat = [];\n  if(!Array.isArray(c.sashaTalk)) c.sashaTalk = [];\n  const thread = talking ? c.sashaTalk : c.sashaChat;\n  thread.push({ from:'Vik', text, ts: Date.now() });";
rep(A, B);
rep("body: JSON.stringify({ dealCode:c.dealCode, name:c.name, email:c.email, phone:c.phone, message:text, autoSend:c.sashaAutoSend, researchNotes:c.researchNotes, history:c.sashaChat, whatsappReplied:c.whatsappReplied })",
    "body: JSON.stringify({ mode: talking ? 'talk' : 'send', dealCode:c.dealCode, name:c.name, email:c.email, phone:c.phone, message:text, autoSend: talking ? false : c.sashaAutoSend, researchNotes:c.researchNotes, history: thread, whatsappReplied:c.whatsappReplied })");
rep("if(!res.ok) throw new Error('sasha backend not live yet');", "if(!res.ok) throw new Error('sasha backend error ' + res.status);");
rep("    c.sashaChat.push({ from:'Sasha', text: replyText, ts: Date.now() });\n  }catch(e){", "    thread.push({ from:'Sasha', text: replyText, ts: Date.now() });\n  }catch(e){");
rep("    replyText = \"Noted — I can't draft or send yet since my backend isn't connected. Once Vik wires up my endpoint, I'll reply here and \" + (c.sashaAutoSend ? \"send this on my own.\" : \"hold it for your approval first.\");\n    c.sashaChat.push({ from:'Sasha', text: replyText, ts: Date.now() });",
    "    replyText = \"I couldn't reach my backend just now, so nothing was sent. Try again in a moment.\";\n    thread.push({ from:'Sasha', text: replyText, ts: Date.now() });");

// 5. the two tabs above the chat, and the hint that changes with them
const OLDHINT = '<div class="hint" style="margin:6px 0;">Talk to Sasha about this deal';
const hi = s.indexOf(OLDHINT);
if (hi === -1) { console.log('skip hint'); fs.writeFileSync(f, s); console.log('OK ' + n); process.exit(0); }
const he = s.indexOf('</div>', s.indexOf('</label></div>', hi)) + 6;
const NEWHINT =
  '<div class="sasha-mode-row">'
  + '<button class="sasha-tab ${sashaMode!==\'send\'?\'on\':\'\'}" onclick="switchSashaMode(\'${c.id}\',\'talk\')">Talk to Sasha</button>'
  + '<button class="sasha-tab ${sashaMode===\'send\'?\'on\':\'\'}" onclick="switchSashaMode(\'${c.id}\',\'send\')">Send to client</button>'
  + '</div>'
  + '<div class="hint" style="margin:6px 0;">${sashaMode===\'send\' ? \'Sasha will write a message to this client. Auto-send: <label style="font-weight:600;"><input type="checkbox" id="sasha_autosend_\'+c.id+\'" \'+(c.sashaAutoSend?\'checked\':\'\')+\' onchange="toggleSashaAutoSend(&quot;\'+c.id+\'&quot;, this.checked)"> let Sasha send without asking me first</label>\' : \'Private. Nothing you say here reaches the client. Ask her anything about this deal.\'}</div>';
s = s.slice(0, hi) + NEWHINT + s.slice(he);
n++;

// 6. placeholder text follows the mode too
rep('placeholder="Ask Sasha something about this deal…"', 'placeholder="${sashaMode===\'send\' ? \'Tell Sasha what to write to this client…\' : \'Ask Sasha anything about this deal…\'}"');

console.log('OK ' + n);
fs.writeFileSync(f, s);
