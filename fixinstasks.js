const fs = require('fs');
const F = 'vik-insurance-dashboard.html';
let s = fs.readFileSync(F, 'utf8');
fs.writeFileSync(F + '.bak-instasks', s);
let ok = 0;

// 1. Endpoint + loader, right after RECRUIT_ENDPOINT
const a1 = "const RECRUIT_ENDPOINT = 'https://fincop-backend.onrender.com/app-data/insurance-recruits';";
if (s.includes(a1)) {
  s = s.replace(a1, a1 + `
const INS_TASKS_ENDPOINT = 'https://fincop-backend.onrender.com/app-data/insurance-guru-tasks';
let insuranceGuruTasks = [];
async function loadInsuranceGuruTasks(){
  try{
    const res = await fetch(INS_TASKS_ENDPOINT);
    const data = await res.json();
    insuranceGuruTasks = data && data.value ? JSON.parse(data.value) : [];
  }catch(e){ insuranceGuruTasks = []; }
}
function insurancePhaseLabel(day){
  if(day <= 30) return 'Phase 1 — Build the ground you stand on (Days 1-30)';
  if(day <= 60) return 'Phase 2 — Rhythm beats effort (Days 31-60)';
  return 'Phase 3 — Carry someone else (Days 61-90)';
}
function shiftProgramDay(id, delta){
  const r = recruits.find(x=>x.id===id);
  if(!r) return;
  let d = (r.programDay || 1) + delta;
  if(d < 1) d = 1;
  if(d > 90) d = 90;
  r.programDay = d;
  saveRecruits();
  renderRecruitDetailPanel(r);
}`);
  ok++;
}

// 2. Load the tasks whenever recruits load
const a2 = "  }catch(e){ recruits = []; }\n  renderRecruits();";
if (s.includes(a2)) {
  s = s.replace(a2, "  }catch(e){ recruits = []; }\n  await loadInsuranceGuruTasks();\n  renderRecruits();");
  ok++;
}

// 3. The panel block, right after the header row
const a3 = `      <span class="risk-badge \${risk?'flag':'ok'}">\${risk?'At risk':'On track'}</span>
    </div>
`;
if (s.includes(a3)) {
  s = s.replace(a3, a3 + `
    <div class="rsection-title">90-day programme</div>
    <div style="background:#f6f7f9;border-radius:10px;padding:12px 14px;margin-bottom:14px;">
      <div style="font-size:12px;color:#666;margin-bottom:4px;">\${insurancePhaseLabel(r.programDay||1)}</div>
      <div style="font-weight:600;margin-bottom:6px;">Day \${r.programDay||1} of 90</div>
      <div style="line-height:1.45;">\${escapeHtml((insuranceGuruTasks[(r.programDay||1)-1]) || 'Tasks not loaded yet.')}</div>
      <div style="font-size:12px;color:#666;margin-top:8px;">Also: add 5 new names to your list.</div>
      <div style="margin-top:10px;display:flex;gap:8px;">
        <button class="btn ghost small" type="button" onclick="shiftProgramDay('\${r.id}',-1)">← Previous day</button>
        <button class="btn ghost small" type="button" onclick="shiftProgramDay('\${r.id}',1)">Next day →</button>
      </div>
    </div>
`);
  ok++;
}

fs.writeFileSync(F, s);
console.log('OK ' + ok + ' of 3');
