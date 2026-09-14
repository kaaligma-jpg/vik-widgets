const fs=require('fs');const f='recruit.html';let s=fs.readFileSync(f,'utf8');
if(s.indexOf('renderThread')!==-1){console.log('ALREADY');process.exit(0);}
fs.writeFileSync(f+'.bak-rchat',s);
let n=0;
const a1 = "      <h1>Today's answer</h1>";
if(s.includes(a1)){s=s.replace(a1,a1+'\n      <div id="todayThread"></div>');n++;}
const a2 = "  document.getElementById('replyText').value = d.todayText || '';";
const b2 = "  document.getElementById('replyText').value = '';\n  document.getElementById('todayThread').innerHTML = renderThread(d.chat || [], d.firstName);";
if(s.includes(a2)){s=s.replace(a2,b2);n++;}
const a3 = "    const note = x.text ? '<div class=\"muted\">' + esc(x.text) + '</div>' : '';";
if(s.includes(a3)){s=s.replace(a3, "    const note = renderThread(x.chat || [], d.firstName);");n++;}
const fn = "function renderThread(thread, me){\n"
 + "  if(!thread || !thread.length) return '';\n"
 + "  return '<div style=\"border-left:3px solid var(--line); padding-left:10px; margin:10px 0;\">'\n"
 + "    + thread.map(function(m){\n"
 + "      var who = (m.from === 'vik') ? 'Vik' : (me || 'You');\n"
 + "      var when = m.ts ? new Date(m.ts).toLocaleString() : '';\n"
 + "      return '<div style=\"margin-bottom:8px;\"><div class=\"muted\"><b>' + esc(who) + '</b> &middot; ' + esc(when) + '</div>'\n"
 + "        + '<div style=\"white-space:pre-wrap; font-size:14px;\">' + esc(m.text || '') + '</div></div>';\n"
 + "    }).join('') + '</div>';\n"
 + "}\n\n";
const a4 = 'function markButtons(){';
if(s.includes(a4)){s=s.replace(a4, fn + a4);n++;}
fs.writeFileSync(f,s);console.log('PATCHED '+n+'/4');
