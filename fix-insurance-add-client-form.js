// fix-insurance-add-client-form.js
// Removes the old "Client name?" popup on the insurance dashboard.
// "+ Add client" now creates a blank lead and opens it straight into the
// full detail panel with the fields ready to type into — the same way
// "+ Add recruit" already works.
//
// Run this from your ~/vik-widgets folder.

const fs = require('fs');

const file = 'vik-insurance-dashboard.html';

const from = `  const firstName = (prompt('Client first name?') || '').trim();
  if(!firstName) return;
  const lastName = (prompt('Client last name?') || '').trim();
  const name = [firstName, lastName].filter(Boolean).join(' ');`;

const fromOriginal = `  const name = prompt('Client name?');
  if(!name) return;`;

const to = `  const firstName = '';
  const lastName = '';
  const name = '';`;

if (!fs.existsSync(file)) {
  console.log('ERROR: ' + file + ' is not in this folder.');
  process.exit(1);
}

let text = fs.readFileSync(file, 'utf8');
const original = text;
let applied = 0;

// Step 1 — remove the popup, whichever version is currently in the file.
let popupFixed = false;
if (text.split(from).length - 1 === 1) {
  text = text.split(from).join(to);
  popupFixed = true;
  console.log('  ok  removed the two-prompt popup');
} else if (text.split(fromOriginal).length - 1 === 1) {
  text = text.split(fromOriginal).join(to);
  popupFixed = true;
  console.log('  ok  removed the single-prompt popup');
} else {
  console.log('  ! NOT FOUND: the add-client popup');
}
if (popupFixed) applied++;

// Step 2 — make sure firstName/lastName are stored on the new record.
const storeFrom = `    name, phone:'', email:'', age:null, ageBand:'',`;
const storeTo = `    name, firstName, lastName, phone:'', email:'', age:null, ageBand:'',`;
if (text.split(storeFrom).length - 1 === 1) {
  text = text.split(storeFrom).join(storeTo);
  applied++;
  console.log('  ok  store first and last name on the new lead');
} else if (text.indexOf(storeTo) !== -1) {
  applied++;
  console.log('  ok  first and last name already stored (nothing to do)');
} else {
  console.log('  ! NOT FOUND: the new-lead record fields');
}

// Step 3 — open the detail panel and the edit form right away.
const openFrom = `  showToast('Lead added');
  triggerVikramResearch(newId);`;
const openTo = `  openDetail(newId);
  editLead(newId);
  triggerVikramResearch(newId);`;
if (text.split(openFrom).length - 1 === 1) {
  text = text.split(openFrom).join(openTo);
  applied++;
  console.log('  ok  open the full form straight away');
} else {
  console.log('  ! NOT FOUND: the post-add step');
}

console.log('');

if (applied === 3) {
  fs.writeFileSync(file + '.backup-addform', original, 'utf8');
  fs.writeFileSync(file, text, 'utf8');
  console.log('UPDATED: ' + file + '  (backup saved as ' + file + '.backup-addform)');
  console.log('All 3 edits applied. Copy to Desktop/uploads, then commit and push.');
} else {
  console.log('Only ' + applied + ' of 3 edits applied — nothing was written.');
  console.log('Do not commit. Send this output back.');
}
