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
const FN = [
  'function renderRecruitCalls(r){',
  '  const list = Array.isArray(r.callHistory) ? r.callHistory.slice().reverse() : [];',
  '  if(!list.length) return \'<div class="hint">No calls logged yet.</div>\';',
  '  return list.map(function(c){',
  '    return \'<div style="border-left:2px solid var(--line);padding:4px 0 4px 10px;margin-bottom:8px;">\'',
  '      + \'<div class="hint">\' + escapeHtml(c.direction||\'Call\') + \' - \' + new Date(c.ts).toLocaleString() + \'</div>\'',
  '      + \'<div>\' + escapeHtml(c.text||\'\') + \'</div></div>\';',
  '  }).join(\'\');',
  '}',
  ''
].join('\n');
rep('function openRecruitCall(id){', FN + 'function openRecruitCall(id){');
rep('<div class="sechead">Top 100 prospecting list', '<div class="sechead">Call history</div>\n      <dd style="margin-top:6px;">${renderRecruitCalls(r)}</dd>\n\n      <div class="sechead">Top 100 prospecting list');
if(ok === total){
  fs.writeFileSync(F + '.bak-call2', fs.readFileSync(F));
  fs.writeFileSync(F, h);
  console.log('ok ' + ok + '/' + total);
} else { console.log('FAILED ' + ok + '/' + total + ' - nothing written'); }
