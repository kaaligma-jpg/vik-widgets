const fs=require('fs');const f='vik-mortgage-dashboard.html';let s=fs.readFileSync(f,'utf8');
if(s.indexOf('renderDayChat')!==-1){console.log('ALREADY');process.exit(0);}
fs.writeFileSync(f+'.bak-dchat',s);
let n=0;
const row = '      <div><b>Day ${d}</b> — ${escapeHtml(MORTGAGE_GURU_TASKS[d-1])}<div class="note-meta">Also: add 5 new connects to the Top 100 list</div></div>';
const newrow = '      <div style="flex:1;"><b>Day ${d}</b> — ${escapeHtml(MORTGAGE_GURU_TASKS[d-1])}<div class="note-meta">Also: add 5 new connects to the Top 100 list</div>${renderDayChat(r,d,dueYet)}</div>';
if(s.includes(row)){s=s.replace(row,newrow);n++;}
const a3 = 'function logDailyReply(id, day, outcome){';
if(s.includes(a3)){s=s.replace(a3, fs.readFileSync('dchat.txt','utf8')+'\n'+a3);n++;}
fs.writeFileSync(f,s);console.log('PATCHED '+n+'/2');
