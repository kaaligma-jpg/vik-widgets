// fixassigned.js — add the "Guru assigned" switch to insurance recruits
const fs = require('fs');
const FILE = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(FILE, 'utf8');
fs.writeFileSync(FILE + '.bak-assigned', s);
let ok = 0;

// ---- 1. the switch, inside the programme box ------------------------------
const A1 = `      <div style="margin-top:10px;display:flex;gap:8px;">
        <button class="btn ghost small" type="button" onclick="shiftProgramDay('\${r.id}',-1)">← Previous day</button>
        <button class="btn ghost small" type="button" onclick="shiftProgramDay('\${r.id}',1)">Next day →</button>
      </div>`;

const R1 = `      <div style="margin-top:10px;display:flex;gap:8px;">
        <button class="btn ghost small" type="button" onclick="shiftProgramDay('\${r.id}',-1)">← Previous day</button>
        <button class="btn ghost small" type="button" onclick="shiftProgramDay('\${r.id}',1)">Next day →</button>
      </div>
      <div style="margin-top:12px;padding-top:10px;border-top:1px solid #e3e5e9;">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
          <input type="checkbox" \${r.guruAssigned?'checked':''} onchange="toggleGuruAssigned('\${r.id}', this.checked)">
          <span><strong>Guru assigned</strong> — send this recruit their assignment every morning</span>
        </label>
        <div style="font-size:12px;color:#666;margin-top:6px;">\${guruSendStatus(r)}</div>
      </div>`;

if (s.includes(A1)) { s = s.replace(A1, R1); ok++; console.log('OK 1 — switch added'); }
else console.log('SKIP 1 — day buttons not found');

// ---- 2. the two functions behind it ---------------------------------------
const A2 = `function recruitProgramDayLabel(r){`;

const R2 = `function toggleGuruAssigned(id, checked){
  const r = recruits.find(x=>x.id===id);
  if(!r) return;
  if(checked && !r.dateRecruited){
    showToast('Set "Date recruited" first — that is the day the programme starts from.');
    renderRecruitDetailPanel(r);
    return;
  }
  if(checked && !r.email){
    showToast('Add an email address first — Guru sends the assignment by email.');
    renderRecruitDetailPanel(r);
    return;
  }
  r.guruAssigned = !!checked;
  saveRecruits();
  renderRecruits();
  renderRecruitDetailPanel(r);
}
function guruSendStatus(r){
  if(!r.guruAssigned) return 'Off. Nothing is being sent to this recruit.';
  const d = recruitProgramDay(r);
  if(d === null) return 'No start date — nothing will send.';
  if(d > 90) return 'Past Day 90. The programme is finished.';
  const sentCount = r.emailsSent ? Object.keys(r.emailsSent).length : 0;
  return 'On. Today is Day ' + d + '. ' + sentCount + ' of 90 sent so far to ' + (r.email || 'no email on file') + '.';
}
function recruitProgramDayLabel(r){`;

if (s.includes(A2)) { s = s.replace(A2, R2); ok++; console.log('OK 2 — functions added'); }
else console.log('SKIP 2 — day label function not found');

// ---- 3. default the field on load -----------------------------------------
const A3 = `      if(!r.programDay) r.programDay = 1;`;
const R3 = `      if(!r.programDay) r.programDay = 1;
      if(typeof r.guruAssigned !== 'boolean') r.guruAssigned = false;`;

if (s.includes(A3)) { s = s.replace(A3, R3); ok++; console.log('OK 3 — field defaulted'); }
else console.log('SKIP 3 — load defaults not found');

// ---- 4. a count at the top so it is visible at a glance -------------------
const A4 = `<div class="lbl">Fully licensed</div>`;
const R4 = `<div class="lbl">Fully licensed</div></div>
    <div class="stat"><div class="num">\${recruits.filter(r=>r.guruAssigned).length}</div><div class="lbl">Guru assigned</div>`;

if (s.includes(A4)) { s = s.replace(A4, R4); ok++; console.log('OK 4 — counter added'); }
else console.log('SKIP 4 — stats block not found');

fs.writeFileSync(FILE, s);
console.log('Done: ' + ok + ' of 4 applied. Backup: ' + FILE + '.bak-assigned');
