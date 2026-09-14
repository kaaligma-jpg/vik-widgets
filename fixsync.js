const fs = require('fs');
const F = 'vik-mortgage-dashboard.html';
let h = fs.readFileSync(F, 'utf8');
let ok = 0, total = 0;
function rep(a, b){
  total++;
  const n = h.split(a).length - 1;
  if(n !== 1){ console.log('NO MATCH (' + n + ') edit ' + total); return; }
  h = h.replace(a, b); ok++;
}
const SYNC = [
  'const TASKS_ENDPOINT = "https://fincop-backend.onrender.com/app-data/mortgage-guru-tasks";',
  'async function syncGuruTasks(){',
  '  try{',
  '    await fetch(TASKS_ENDPOINT, {',
  '      method: "POST",',
  '      headers: { "Content-Type": "application/json" },',
  '      body: JSON.stringify({ value: JSON.stringify(MORTGAGE_GURU_TASKS) })',
  '    });',
  '  }catch(e){ console.log("task sync failed", e); }',
  '}',
  ''
].join('\n');
rep('async function loadRecruits(){', SYNC + 'async function loadRecruits(){');
rep('mortgageRecruits.forEach(ensureRecruitDefaults);', 'mortgageRecruits.forEach(ensureRecruitDefaults);\nsyncGuruTasks();');
if(ok === total){
  fs.writeFileSync(F + '.bak-sync', fs.readFileSync(F));
  fs.writeFileSync(F, h);
  console.log('ok ' + ok + '/' + total);
} else { console.log('FAILED ' + ok + '/' + total + ' - nothing written'); }
