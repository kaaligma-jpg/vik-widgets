// fix-insurance-two-bugs.js
//
// Fixes two things on the insurance dashboard:
//
//   BUG 1 - the edit form goes read-only by itself.
//           Cause: Vikram's background research finishes a second or two later
//           and refreshes the panel, wiping whatever edit form was open.
//           Fix: remember when Vik is mid-edit and skip the background refresh.
//
//   BUG 2 - a client Vik added himself shows Source: Nikki.
//           Cause: the badge only knew "Neo" or "everything else = Nikki".
//           Fix: add a case for manually added leads.
//
// Refuses to write anything unless every edit matches. Saves a .backup file.

const fs = require('fs');

const FILE = 'vik-insurance-dashboard.html';

if (!fs.existsSync(FILE)) {
  console.log('STOP: cannot find ' + FILE + ' in this folder.');
  console.log('Are you inside ~/vik-widgets ?');
  process.exit(1);
}

let src = fs.readFileSync(FILE, 'utf8');
const original = src;
let failed = false;

function edit(label, find, replace) {
  const count = src.split(find).length - 1;
  if (count !== 1) {
    console.log('FAILED  ' + label + '  (found ' + count + ' matches, expected 1)');
    failed = true;
    return;
  }
  src = src.replace(find, replace);
  console.log('ok      ' + label);
}

// ---------------------------------------------------------------
// EDIT 1 - add the "am I mid-edit?" flag, and fix the Source badge
// ---------------------------------------------------------------
edit(
  'add edit-in-progress flag + fix Source badge',
  "function sourceBadgeFor(c){\n" +
  "  return (c.sourceAgent||'').indexOf('Neo') !== -1\n" +
  "    ? `<span class=\"badge neo\">Neo</span>`\n" +
  "    : `<span class=\"badge nikki\">Nikki</span>`;\n" +
  "}",
  "// True while Vik has an edit form open. Background refreshes check this so\n" +
  "// they don't wipe what he's typing.\n" +
  "let isEditingLead = false;\n" +
  "\n" +
  "function sourceBadgeFor(c){\n" +
  "  const s = c.sourceAgent || '';\n" +
  "  if(s.indexOf('Neo') !== -1) return `<span class=\"badge neo\">Neo</span>`;\n" +
  "  if(s.indexOf('Vik') !== -1 || s.indexOf('manual') !== -1) return `<span class=\"badge\">Vik</span>`;\n" +
  "  return `<span class=\"badge nikki\">Nikki</span>`;\n" +
  "}"
);

// ---------------------------------------------------------------
// EDIT 2 - opening the read-only panel means the edit form is closed
// ---------------------------------------------------------------
edit(
  'clear the flag when the panel opens read-only',
  "function openDetail(id){\n" +
  "  openRecruitId = null;",
  "function openDetail(id){\n" +
  "  isEditingLead = false;\n" +
  "  openRecruitId = null;"
);

// ---------------------------------------------------------------
// EDIT 3 - opening the edit form sets the flag
// ---------------------------------------------------------------
edit(
  'set the flag when the edit form opens',
  "function editLead(id){\n" +
  "  const c = clients.find(x=>x.id===id);\n" +
  "  if(!c) return;\n" +
  "  const wrap = document.getElementById('detailFieldsView');",
  "function editLead(id){\n" +
  "  const c = clients.find(x=>x.id===id);\n" +
  "  if(!c) return;\n" +
  "  isEditingLead = true;\n" +
  "  const wrap = document.getElementById('detailFieldsView');"
);

// ---------------------------------------------------------------
// EDIT 4 - the background refreshes now respect the flag.
// There are three of these (Vikram research, and two Sasha ones),
// so this one expects exactly 3 matches.
// ---------------------------------------------------------------
{
  const find = "if(document.getElementById('overlay').classList.contains('show')){ openDetail(id);";
  const replace = "if(!isEditingLead && document.getElementById('overlay').classList.contains('show')){ openDetail(id);";
  const count = src.split(find).length - 1;
  if (count !== 3) {
    console.log('FAILED  guard the background refreshes  (found ' + count + ' matches, expected 3)');
    failed = true;
  } else {
    src = src.split(find).join(replace);
    console.log('ok      guard the background refreshes (3 places)');
  }
}

// ---------------------------------------------------------------

if (failed) {
  console.log('');
  console.log('Nothing was changed. Send the output above back to Claude.');
  process.exit(1);
}

fs.writeFileSync(FILE + '.backup-twobugs', original, 'utf8');
fs.writeFileSync(FILE, src, 'utf8');

console.log('');
console.log('All edits applied. Backup saved as ' + FILE + '.backup-twobugs');
