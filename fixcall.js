const fs = require('fs');
const F = 'vik-mortgage-dashboard.html';
let h = fs.readFileSync(F, 'utf8');
const snip = fs.readFileSync('rcall.txt', 'utf8');
let ok = 0, total = 0;
function rep(a, b){
  total++;
  const n = h.split(a).length - 1;
  if(n !== 1){ console.log('NO MATCH (' + n + ') edit ' + total); return; }
  h = h.replace(a, b); ok++;
}
const ICON = '<button class="call-icon-btn" title="Log a call" onclick="openRecruitCall(REPID)">&#128222;</button>';
rep("r.emailsSent = {};", "r.emailsSent = {};\n    if(!Array.isArray(r.callHistory)) r.callHistory = [];");
rep("<th>Top 100 list</th>", "<th>Top 100 list</th><th></th>");
rep("<td>${r.prospects.length} / 100</td>", "<td>${r.prospects.length} / 100</td>\n      <td onclick=\"event.stopPropagation()\">" + ICON.replace('REPID', "'${r.id}'") + "</td>");
rep(">Edit details</button>", ">Edit details</button>\n    <button class=\"btn secondary small\" style=\"margin-bottom:16px;margin-left:8px;\" onclick=\"openRecruitCall('${r.id}')\">&#128222; Log a call</button>");
rep("function openRecruitDetail(id){", snip + "\nfunction openRecruitDetail(id){");
if(ok === total){
  fs.writeFileSync(F + '.bak-call', fs.readFileSync(F));
  fs.writeFileSync(F, h);
  console.log('ok ' + ok + '/' + total);
} else { console.log('FAILED ' + ok + '/' + total + ' - nothing written'); }
