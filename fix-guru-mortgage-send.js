// fix-guru-mortgage-send.js
// Adds a working "Send today's page" button to each mortgage recruit's Guru section.
// Run inside ~/vik-widgets

const fs = require('fs');
const FILE = 'vik-mortgage-dashboard.html';

let src = fs.readFileSync(FILE, 'utf8');
const edits = [];

// ---------- EDIT 1: remember which days have been emailed ----------
edits.push({
  name: 'add emailsSent field',
  find: `  if(typeof r.startDate !== 'string') r.startDate = null; // ISO date Guru's Day 1 email goes out`,
  replace: `  if(typeof r.startDate !== 'string') r.startDate = null; // ISO date Guru's Day 1 email goes out
  if(!r.emailsSent || typeof r.emailsSent !== 'object') r.emailsSent = {}; // { "6": "2026-09-13T..." }`
});

// ---------- EDIT 2: the send function ----------
edits.push({
  name: 'add sendGuruDayEmail function',
  find: `  } else if(!checked){
    showToast('Guru paused for ' + (r.firstName||'this recruit'));
  }
  saveRecruits();
  renderRecruits();
  if(currentRecruitDetailId===id) openRecruitDetail(id);
}`,
  replace: `  } else if(!checked){
    showToast('Guru paused for ' + (r.firstName||'this recruit'));
  }
  saveRecruits();
  renderRecruits();
  if(currentRecruitDetailId===id) openRecruitDetail(id);
}

// Sends the recruit's current day page as an email, from Guru.
const GURU_SEND_ENDPOINT = 'https://fincop-backend.onrender.com/guru-test-send';

async function sendGuruDayEmail(id){
  const r = mortgageRecruits.find(x=>x.id===id);
  if(!r) return;
  if(!r.email){ showToast('No email address on file for this recruit'); return; }
  const day = currentProgramDay(r);
  if(!day || day < 1){ showToast('Program has not started yet'); return; }

  const task = MORTGAGE_GURU_TASKS[day-1];
  const subject = 'Day ' + day + ' of 90 — Team Vik';
  const body = 'Day ' + day + ' of 90\\n\\n'
    + task + '\\n\\n'
    + 'Also: add 5 new connects to your Top 100 list.\\n\\n'
    + 'Reply to this email when it is done, or tell me what got in the way.';

  showToast('Sending Day ' + day + ' to ' + (r.firstName||'recruit') + '...');
  try{
    const res = await fetch(GURU_SEND_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: r.email, subject: subject, body: body })
    });
    const out = await res.json();
    if(out && out.sent){
      r.emailsSent[String(day)] = new Date().toISOString();
      saveRecruits();
      showToast('Day ' + day + ' sent to ' + r.email);
      if(currentRecruitDetailId===id) openRecruitDetail(id);
    } else {
      showToast('Could not send — try again');
    }
  }catch(e){
    showToast('Could not send — check the connection and try again');
  }
}`
});

// ---------- EDIT 3: replace the "not configured" note with the button ----------
const NOTE_FIND = '        <div class="hint" style="margin-top:4px;">Note: the email account Guru sends from isn\'t configured yet, so daily emails are queued here rather than actually sent. Tracking (green/red) still works the same way once you log a recruit\'s reply below \u2014 flip it over to live sending once the account is set up.</div>';

const NOTE_REPLACE = [
'        ${r.guruAssigned && cur >= 1 && cur <= 90 ? `',
'        <div style="margin-top:8px;">',
'          <button class="btn small" onclick="sendGuruDayEmail(\'${r.id}\')">Send Day ${cur} to ${escapeHtml(r.firstName||\'recruit\')}</button>',
'          <span class="hint" style="margin-left:8px;">${r.emailsSent && r.emailsSent[String(cur)] ? \'Already sent \' + new Date(r.emailsSent[String(cur)]).toLocaleString() : \'Not sent yet\'}</span>',
'        </div>',
'        <div class="hint" style="margin-top:6px;">Sends from Guru. Reply comes back to Vik \u2014 log it with Mark done / Mark not done below.</div>',
'        ` : \'\'}'
].join('\n');

edits.push({ name: 'replace note with send button', find: NOTE_FIND, replace: NOTE_REPLACE });

// ---------- apply ----------
let ok = 0;
for(const e of edits){
  const n = src.split(e.find).length - 1;
  if(n !== 1){
    console.log('FAILED — "' + e.name + '" matched ' + n + ' times (needs exactly 1). Nothing written.');
    process.exit(1);
  }
  src = src.replace(e.find, e.replace);
  ok++;
}

fs.copyFileSync(FILE, FILE + '.backup-guru-send');
fs.writeFileSync(FILE, src, 'utf8');
console.log('ok ' + ok + '/' + edits.length);
console.log('backup saved as ' + FILE + '.backup-guru-send');
