const fs = require('fs');
let s = fs.readFileSync('fixmode.js', 'utf8');
function sw(a, b) {
  if (s.indexOf(a) === -1) { console.log('NOTFOUND: ' + a.slice(0, 40)); process.exit(1); }
  s = s.split(a).join(b);
}
sw('\\n  if(!Array.isArray(c.sashaTalk)) c.sashaTalk = [];\\n  if(typeof',
   '\\n      if(!Array.isArray(c.sashaTalk)) c.sashaTalk = [];\\n      if(typeof');
sw('\\n  if(typeof c.sashaAutoSend', '\\n      if(typeof c.sashaAutoSend');
sw('rep("  if(!Array.isArray(c.sashaChat)) c.sashaChat = [];',
   'rep("      if(!Array.isArray(c.sashaChat)) c.sashaChat = [];');
sw('    "  if(!Array.isArray(c.sashaChat)) c.sashaChat = [];',
   '    "      if(!Array.isArray(c.sashaChat)) c.sashaChat = [];');
fs.writeFileSync('fixmode-ins.js', s);
console.log('MADE');
