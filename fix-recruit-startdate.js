// fix-recruit-startdate.js
// Adds a "Guru start date" field to the recruit Edit form, so the day number can be corrected.
// Run inside ~/vik-widgets

const fs = require('fs');
const FILE = 'vik-mortgage-dashboard.html';

let src = fs.readFileSync(FILE, 'utf8');
const edits = [];

// ---------- EDIT 1: add the field to the form ----------
const F1 = "      '<div class=\"field\"><label>Phone</label><input id=\"editRecPhone\" value=\"' + escapeHtml(r.phone||'') + '\"></div>',\n    '</div>',";

const R1 = [
"      '<div class=\"field\"><label>Phone</label><input id=\"editRecPhone\" value=\"' + escapeHtml(r.phone||'') + '\"></div>',",
"    '</div>',",
"    '<div class=\"field-row\">',",
"      '<div class=\"field\"><label>Guru start date (Day 1)</label><input type=\"date\" id=\"editRecStart\" value=\"' + (r.startDate||'') + '\"></div>',",
"      '<div class=\"field\"><label>&nbsp;</label><div class=\"hint\">Day 1 is this date. Move it back to jump the recruit forward, forward to push them back. Leave blank to stop the count.</div></div>',",
"    '</div>',"
].join('\n');

edits.push({ name: 'add start date field', find: F1, replace: R1 });

// ---------- EDIT 2: save it ----------
const F2 = "  r.phone     = document.getElementById('editRecPhone').value.trim();";

const R2 = [
"  r.phone     = document.getElementById('editRecPhone').value.trim();",
"  const sd = document.getElementById('editRecStart').value.trim();",
"  r.startDate = sd ? sd : null;"
].join('\n');

edits.push({ name: 'save start date', find: F2, replace: R2 });

// ---------- apply ----------
let ok = 0;
for(const e of edits){
  const n = src.split(e.find).length - 1;
  if(n !== 1){
    console.log('FAILED \u2014 "' + e.name + '" matched ' + n + ' times (needs exactly 1). Nothing written.');
    process.exit(1);
  }
  src = src.replace(e.find, e.replace);
  ok++;
}

fs.copyFileSync(FILE, FILE + '.backup-startdate');
fs.writeFileSync(FILE, src, 'utf8');
console.log('ok ' + ok + '/' + edits.length);
console.log('backup saved as ' + FILE + '.backup-startdate');
