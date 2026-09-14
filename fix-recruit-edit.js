// fix-recruit-edit.js
// Adds an "Edit details" button on the mortgage recruit page so name, email and phone can be corrected.
// Run inside ~/vik-widgets

const fs = require('fs');
const FILE = 'vik-mortgage-dashboard.html';

let src = fs.readFileSync(FILE, 'utf8');
const edits = [];

// ---------- EDIT 1: the edit form + save function ----------
const FN_FIND = "  document.getElementById('addRecruitOverlay').classList.add('show');\n}";

const FN_REPLACE = [
"  document.getElementById('addRecruitOverlay').classList.add('show');",
"}",
"",
"// Edit an existing recruit's details (reuses the add-recruit panel).",
"let editingRecruitId = null;",
"",
"function closeRecruitEditPanel(){",
"  document.getElementById('addRecruitOverlay').classList.remove('show');",
"}",
"",
"function openEditRecruitForm(id){",
"  const r = mortgageRecruits.find(x=>x.id===id);",
"  if(!r) return;",
"  editingRecruitId = id;",
"  document.getElementById('addRecruitPanel').innerHTML = [",
"    '<h2>Edit recruit</h2>',",
"    '<div class=\"field-row\">',",
"      '<div class=\"field\"><label>First name</label><input id=\"editRecFirst\" value=\"' + escapeHtml(r.firstName||'') + '\"></div>',",
"      '<div class=\"field\"><label>Last name</label><input id=\"editRecLast\" value=\"' + escapeHtml(r.lastName||'') + '\"></div>',",
"    '</div>',",
"    '<div class=\"field-row\">',",
"      '<div class=\"field\"><label>Email</label><input id=\"editRecEmail\" value=\"' + escapeHtml(r.email||'') + '\"></div>',",
"      '<div class=\"field\"><label>Phone</label><input id=\"editRecPhone\" value=\"' + escapeHtml(r.phone||'') + '\"></div>',",
"    '</div>',",
"    '<div class=\"panel-actions\"><div></div><div class=\"right\">',",
"      '<button class=\"btn secondary\" onclick=\"closeRecruitEditPanel()\">Cancel</button> ',",
"      '<button class=\"btn\" onclick=\"submitEditRecruit()\">Save changes</button>',",
"    '</div></div>'",
"  ].join('');",
"  document.getElementById('addRecruitOverlay').classList.add('show');",
"}",
"",
"function submitEditRecruit(){",
"  const id = editingRecruitId;",
"  const r = mortgageRecruits.find(x=>x.id===id);",
"  if(!r) return;",
"  const first = document.getElementById('editRecFirst').value.trim();",
"  if(!first){ showToast('First name required'); return; }",
"  r.firstName = first;",
"  r.lastName  = document.getElementById('editRecLast').value.trim();",
"  r.email     = document.getElementById('editRecEmail').value.trim();",
"  r.phone     = document.getElementById('editRecPhone').value.trim();",
"  saveRecruits();",
"  closeRecruitEditPanel();",
"  renderRecruits();",
"  if(currentRecruitDetailId===id) openRecruitDetail(id);",
"  showToast('Recruit updated');",
"}"
].join('\n');

edits.push({ name: 'add edit form and save function', find: FN_FIND, replace: FN_REPLACE });

// ---------- EDIT 2: the Edit button on the detail page ----------
const BTN_FIND = '    <button class="btn secondary small" onclick="closeRecruitDetail()" style="margin-bottom:16px;">\u2190 Back to recruits</button>';

const BTN_REPLACE = [
'    <button class="btn secondary small" onclick="closeRecruitDetail()" style="margin-bottom:16px;">\u2190 Back to recruits</button>',
'    <button class="btn secondary small" onclick="openEditRecruitForm(\'${r.id}\')" style="margin-bottom:16px; margin-left:8px;">Edit details</button>'
].join('\n');

edits.push({ name: 'add Edit details button', find: BTN_FIND, replace: BTN_REPLACE });

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

fs.copyFileSync(FILE, FILE + '.backup-recruit-edit');
fs.writeFileSync(FILE, src, 'utf8');
console.log('ok ' + ok + '/' + edits.length);
console.log('backup saved as ' + FILE + '.backup-recruit-edit');
