// fixassign.js — format the long 90-day assignments in the insurance dashboard
const fs = require('fs');
const FILE = 'vik-insurance-dashboard.html';

let s = fs.readFileSync(FILE, 'utf8');
fs.writeFileSync(FILE + '.bak-assign', s);
let ok = 0;

// ---- Edit 1: add the formatter + new phase labels --------------------------
const anchor1 = `function insurancePhaseLabel(day){
  if(day <= 30) return 'Phase 1 — Build the ground you stand on (Days 1-30)';
  if(day <= 60) return 'Phase 2 — Rhythm beats effort (Days 31-60)';
  return 'Phase 3 — Carry someone else (Days 61-90)';
}`;

const replace1 = `function insurancePhaseLabel(day){
  if(day <= 30) return 'Phase 1 — Qualify, and build the ground you stand on (Days 1-30)';
  if(day <= 60) return 'Phase 2 — Clear the licence, and learn to sit with people (Days 31-60)';
  return 'Phase 3 — Finish the licence, and carry someone else (Days 61-90)';
}
function renderAssignment(raw){
  if(!raw) return '<div style="color:#888;">Assignment not loaded yet.</div>';
  const blocks = String(raw).split(/\\n\\s*\\n/);
  let out = '';
  blocks.forEach(function(b, i){
    let t = b.trim();
    if(!t) return;
    if(i === 0){
      out += '<div style="font-weight:700;font-size:15px;margin-bottom:10px;">' + escapeHtml(t) + '</div>';
      return;
    }
    const m = t.match(/^\\*\\*(.+?)[.:]?\\*\\*\\s*([\\s\\S]*)$/);
    if(m){
      const label = m[1].replace(/[.:]\\s*$/, '');
      const body = m[2].trim();
      out += '<div style="margin-bottom:9px;">'
           + '<span style="display:inline-block;font-size:11px;letter-spacing:.06em;'
           + 'text-transform:uppercase;color:#7a7f87;font-weight:700;margin-right:6px;">'
           + escapeHtml(label) + '</span>'
           + '<span>' + escapeHtml(body) + '</span></div>';
    } else {
      out += '<div style="margin-bottom:9px;">' + escapeHtml(t.replace(/\\*\\*/g,'')) + '</div>';
    }
  });
  return out;
}`;

if (s.includes(anchor1)) { s = s.replace(anchor1, replace1); ok++; console.log('OK 1 — formatter added'); }
else console.log('SKIP 1 — phase label block not found');

// ---- Edit 2: use the formatter in the detail panel -------------------------
const anchor2 = `      <div style="line-height:1.45;">\${escapeHtml((insuranceGuruTasks[(r.programDay||1)-1]) || 'Tasks not loaded yet.')}</div>
      <div style="font-size:12px;color:#666;margin-top:8px;">Also: add 5 new names to your list.</div>`;

const replace2 = `      <div style="line-height:1.55;font-size:13.5px;">\${renderAssignment(insuranceGuruTasks[(r.programDay||1)-1])}</div>
      <div style="font-size:12px;color:#666;margin-top:10px;padding-top:8px;border-top:1px solid #e3e5e9;">Every working day: 10 new conversations started, 5 new names added to your list.</div>`;

if (s.includes(anchor2)) { s = s.replace(anchor2, replace2); ok++; console.log('OK 2 — detail panel wired'); }
else console.log('SKIP 2 — task line not found');

// ---- Edit 3: give the box room --------------------------------------------
const anchor3 = `    <div style="background:#f6f7f9;border-radius:10px;padding:12px 14px;margin-bottom:14px;">
      <div style="font-size:12px;color:#666;margin-bottom:4px;">\${insurancePhaseLabel(r.programDay||1)}</div>`;

const replace3 = `    <div style="background:#f6f7f9;border-radius:10px;padding:14px 16px;margin-bottom:14px;max-height:460px;overflow-y:auto;">
      <div style="font-size:12px;color:#666;margin-bottom:4px;">\${insurancePhaseLabel(r.programDay||1)}</div>`;

if (s.includes(anchor3)) { s = s.replace(anchor3, replace3); ok++; console.log('OK 3 — box resized'); }
else console.log('SKIP 3 — box style not found');

fs.writeFileSync(FILE, s);
console.log('Done: ' + ok + ' of 3 applied. Backup: ' + FILE + '.bak-assign');
