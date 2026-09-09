// fix-insurance-vikram-timing.js
//
// Vikram currently starts researching the instant "+ Add client" is clicked,
// while the lead is still blank - so he researches an empty name and writes a
// useless note on the new lead.
//
// This moves his trigger to the moment the lead is SAVED, and only fires him
// if there is actually a name and he hasn't already researched this lead.
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
// EDIT 1 - stop Vikram firing on the blank new lead
// ---------------------------------------------------------------
edit(
  'stop Vikram firing on the blank lead',
  "  openDetail(newId);\n" +
  "  editLead(newId);\n" +
  "  triggerVikramResearch(newId);\n" +
  "});",
  "  openDetail(newId);\n" +
  "  editLead(newId);\n" +
  "  // Vikram is NOT called here on purpose - the lead has no name yet.\n" +
  "  // He is triggered from saveLeadEdit instead, once the name exists.\n" +
  "});"
);

// ---------------------------------------------------------------
// EDIT 2 - fire Vikram when the lead is saved with a name
// ---------------------------------------------------------------
edit(
  'fire Vikram when the lead is saved with a name',
  "  await saveClients();\n" +
  "  render();\n" +
  "  openDetail(id);\n" +
  "  showToast('Lead updated');\n" +
  "}",
  "  await saveClients();\n" +
  "  render();\n" +
  "  openDetail(id);\n" +
  "  showToast('Lead updated');\n" +
  "  // Now that there is a name to work with, let Vikram research - but only\n" +
  "  // once per lead, so editing an existing client doesn't re-run him.\n" +
  "  if(c.name && c.researchStatus !== 'done') triggerVikramResearch(id);\n" +
  "}"
);

// ---------------------------------------------------------------

if (failed) {
  console.log('');
  console.log('Nothing was changed. Send the output above back to Claude.');
  process.exit(1);
}

fs.writeFileSync(FILE + '.backup-vikramtiming', original, 'utf8');
fs.writeFileSync(FILE, src, 'utf8');

console.log('');
console.log('All edits applied. Backup saved as ' + FILE + '.backup-vikramtiming');
