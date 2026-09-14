// fixday.js — one day number everywhere, plus an Edit button on each row
const fs = require('fs');
const FILE = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(FILE, 'utf8');
fs.writeFileSync(FILE + '.bak-day', s);
let ok = 0;

// ---- 1. one function that decides the day, used by everything -------------
const A1 = `function recruitProgramDayLabel(r){
  if(!r.dateRecruited) return '—';
  const days = Math.max(1, Math.floor((Date.now() - new Date(r.dateRecruited).getTime())/86400000)+1);
  return 'Day ' + days;
}`;

const R1 = `function recruitProgramDay(r){
  if(!r || !r.dateRecruited) return null;
  const started = new Date(r.dateRecruited + 'T00:00:00');
  if(isNaN(started.getTime())) return null;
  const today = new Date();
  const a = Date.UTC(started.getFullYear(), started.getMonth(), started.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.floor((b - a)/86400000) + 1;
  if(days < 1) return 1;
  return days;
}
function recruitProgramDayLabel(r){
  const d = recruitProgramDay(r);
  return d === null ? '—' : ('Day ' + d);
}`;

if (s.includes(A1)) { s = s.replace(A1, R1); ok++; console.log('OK 1 — single day calculation'); }
else console.log('SKIP 1 — day helper not found');

// ---- 2. the assignment box follows the real day ---------------------------
const A2 = `      <div style="font-size:12px;color:#666;margin-bottom:4px;">\${insurancePhaseLabel(r.programDay||1)}</div>
      <div style="font-weight:600;margin-bottom:6px;">Day \${r.programDay||1} of 90</div>
      <div style="line-height:1.55;font-size:13.5px;">\${renderAssignment(insuranceGuruTasks[(r.programDay||1)-1])}</div>`;

const R2 = `      \${(()=>{
        const realDay = recruitProgramDay(r);
        if(realDay === null){
          return '<div style="color:#8a6d1f;">No start date yet. Set "Date recruited" below and the programme begins from that date.</div>';
        }
        const viewing = Math.min(90, Math.max(1, r.viewDay || realDay));
        const offTrack = viewing !== realDay;
        return '<div style="font-size:12px;color:#666;margin-bottom:4px;">' + insurancePhaseLabel(viewing) + '</div>'
          + '<div style="font-weight:600;margin-bottom:6px;">Day ' + viewing + ' of 90'
          + (realDay > 90 ? ' <span style="font-weight:400;color:#8a6d1f;">(past day 90)</span>' : '')
          + (offTrack ? ' <span style="font-weight:400;color:#8a6d1f;">— previewing, today is Day ' + Math.min(90, realDay) + '</span>' : '')
          + '</div>'
          + '<div style="line-height:1.55;font-size:13.5px;">' + renderAssignment(insuranceGuruTasks[viewing-1]) + '</div>';
      })()}`;

if (s.includes(A2)) { s = s.replace(A2, R2); ok++; console.log('OK 2 — assignment box follows the date'); }
else console.log('SKIP 2 — assignment box not found');

// ---- 3. buttons preview only, they no longer move the recruit -------------
const A3 = `function shiftProgramDay(id, delta){
  const r = recruits.find(x=>x.id===id);
  if(!r) return;
  let d = (r.programDay || 1) + delta;
  if(d < 1) d = 1;
  if(d > 90) d = 90;
  r.programDay = d;
  saveRecruits();
  renderRecruitDetailPanel(r);
}`;

const R3 = `function shiftProgramDay(id, delta){
  const r = recruits.find(x=>x.id===id);
  if(!r) return;
  const real = recruitProgramDay(r);
  if(real === null) return;
  let d = (r.viewDay || Math.min(90, real)) + delta;
  if(d < 1) d = 1;
  if(d > 90) d = 90;
  r.viewDay = d;
  renderRecruitDetailPanel(r);
}`;

if (s.includes(A3)) { s = s.replace(A3, R3); ok++; console.log('OK 3 — buttons preview only'); }
else console.log('SKIP 3 — shiftProgramDay not found');

// ---- 4. the lower duplicate line goes -------------------------------------
const A4 = `    \${(()=>{
      if(!r.dateRecruited) return '';
      const days = Math.max(1, Math.floor((Date.now() - new Date(r.dateRecruited).getTime())/86400000)+1);
      const phase = days<=30 ? 'Prep (days 1-30)' : (days<=90 ? 'Exam completion (days 31-90)' : 'Past day 90');
      return \`<div class="meta" style="margin-top:6px;">Day \${days} of the program — \${phase}</div>\`;
    })()}`;

if (s.includes(A4)) { s = s.replace(A4, ''); ok++; console.log('OK 4 — duplicate day line removed'); }
else console.log('SKIP 4 — duplicate line not found');

// ---- 5. phone, email and an Edit button on each row -----------------------
const A5 = `      <tr onclick="openRecruitDetail('\${r.id}')">
        <td class="name-cell">\${escapeHtml(r.name)||'—'}<div class="meta">\${escapeHtml(r.professionCategory)||'—'}</div></td>
        <td>\${escapeHtml(r.jobTitle)||'—'}</td>`;

const R5 = `      <tr onclick="openRecruitDetail('\${r.id}')">
        <td class="name-cell">\${escapeHtml(r.name)||'—'}
          <div class="meta">\${escapeHtml(r.phone)||'no phone'} · \${escapeHtml(r.email)||'no email'}</div></td>
        <td>\${escapeHtml(r.jobTitle)||'—'}</td>`;

if (s.includes(A5)) { s = s.replace(A5, R5); ok++; console.log('OK 5 — phone and email on the row'); }
else console.log('SKIP 5 — table row not found');

const A6 = `        <td>\${recruitRiskBadge(r)}</td>
      </tr>\`;`;

const R6 = `        <td>\${recruitRiskBadge(r)}</td>
        <td><button class="btn ghost small" type="button" onclick="event.stopPropagation(); openRecruitDetail('\${r.id}')">Edit</button></td>
      </tr>\`;`;

if (s.includes(A6)) { s = s.replace(A6, R6); ok++; console.log('OK 6 — Edit button added'); }
else console.log('SKIP 6 — risk cell not found');

const A7 = `            <th>Program day</th>`;
const R7 = `            <th>Program day</th>`;
const A8 = `            <th>Risk</th>`;
const R8 = `            <th>Risk</th>
            <th></th>`;

if (s.includes(A8)) { s = s.replace(A8, R8); ok++; console.log('OK 7 — header column added'); }
else console.log('SKIP 7 — risk header not found');

fs.writeFileSync(FILE, s);
console.log('Done: ' + ok + ' of 7 applied. Backup: ' + FILE + '.bak-day');

// ---- 8. Guru's digest should report the real day, not the stale field -----
let s2 = fs.readFileSync(FILE, 'utf8');
const A9 = `      day: r.programDay || 1,`;
const R9 = `      day: recruitProgramDay(r),`;
if (s2.includes(A9)) { s2 = s2.replace(A9, R9); fs.writeFileSync(FILE, s2); console.log('OK 8 — Guru digest uses the real day'); }
else console.log('SKIP 8 — digest day not found');
