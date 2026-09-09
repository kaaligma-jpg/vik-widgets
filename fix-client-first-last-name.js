// fix-client-first-last-name.js
// Splits the CLIENT name field into "First name" and "Last name" on both
// dashboards. Recruits and prospects already had this; clients did not.
//
// The stored c.name is still kept (everything downstream reads it), and
// firstName / lastName are now saved alongside it.
//
// Run this from your ~/vik-widgets folder.

const fs = require('fs');

function patch(file, edits) {
  if (!fs.existsSync(file)) {
    console.log('SKIPPED (not in this folder): ' + file);
    return 0;
  }

  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  let applied = 0;

  for (const e of edits) {
    const count = text.split(e.from).length - 1;
    if (count === 0) {
      console.log('  ! NOT FOUND in ' + file + ': ' + e.label);
      continue;
    }
    if (count > 1) {
      console.log('  ! FOUND ' + count + ' TIMES (skipped, not safe) in ' + file + ': ' + e.label);
      continue;
    }
    text = text.split(e.from).join(e.to);
    applied++;
    console.log('  ok  ' + e.label);
  }

  if (applied === 0) {
    console.log('NO CHANGES made to ' + file);
    return 0;
  }

  fs.writeFileSync(file + '.backup-name-split', original, 'utf8');
  fs.writeFileSync(file, text, 'utf8');
  console.log('UPDATED: ' + file + '  (backup saved as ' + file + '.backup-name-split)');
  return applied;
}

// ---------------------------------------------------------------
// MORTGAGE DASHBOARD
// ---------------------------------------------------------------
const mortgageEdits = [
  {
    label: 'mortgage: form field -> two name boxes',
    from: `    <div class="field"><label>Full name</label><input id="f_name" value="\${escapeHtml(c.name)}"></div>`,
    to: `    <div class="field-row">
      <div class="field"><label>First name</label><input id="f_firstName" value="\${escapeHtml(c.firstName || (c.name||'').split(' ')[0] || '')}"></div>
      <div class="field"><label>Last name</label><input id="f_lastName" value="\${escapeHtml(c.lastName || (c.name||'').split(' ').slice(1).join(' ') || '')}"></div>
    </div>`
  },
  {
    label: 'mortgage: draft capture',
    from: `  if(!g('f_name')) return; // form not currently rendered, nothing to capture
  formFieldDraft = {
    name: val('f_name'),`,
    to: `  if(!g('f_firstName')) return; // form not currently rendered, nothing to capture
  formFieldDraft = {
    firstName: val('f_firstName'),
    lastName: val('f_lastName'),
    name: [val('f_firstName'), val('f_lastName')].filter(Boolean).join(' '),`
  },
  {
    label: 'mortgage: save validation',
    from: `  const name = document.getElementById('f_name').value.trim();
  if(!name){ showToast('Name is required'); return; }`,
    to: `  const firstName = document.getElementById('f_firstName').value.trim();
  const lastName = document.getElementById('f_lastName').value.trim();
  const name = [firstName, lastName].filter(Boolean).join(' ');
  if(!firstName){ showToast('First name is required'); return; }`
  },
  {
    label: 'mortgage: store both parts',
    from: `  const data = {
    name,
    phone: document.getElementById('f_phone').value.trim(),`,
    to: `  const data = {
    name,
    firstName,
    lastName,
    phone: document.getElementById('f_phone').value.trim(),`
  }
];

// ---------------------------------------------------------------
// INSURANCE DASHBOARD
// ---------------------------------------------------------------
const insuranceEdits = [
  {
    label: 'insurance: edit field -> two name boxes',
    from: `      <dt>Name</dt><dd><input type="text" id="editName" value="\${escapeHtml(c.name||'')}"></dd>`,
    to: `      <dt>First name</dt><dd><input type="text" id="editFirstName" value="\${escapeHtml(c.firstName || (c.name||'').split(' ')[0] || '')}"></dd>
      <dt>Last name</dt><dd><input type="text" id="editLastName" value="\${escapeHtml(c.lastName || (c.name||'').split(' ').slice(1).join(' ') || '')}"></dd>`
  },
  {
    label: 'insurance: save both parts',
    from: `  c.name = document.getElementById('editName').value.trim();`,
    to: `  c.firstName = document.getElementById('editFirstName').value.trim();
  c.lastName = document.getElementById('editLastName').value.trim();
  c.name = [c.firstName, c.lastName].filter(Boolean).join(' ');`
  }
];

console.log('Mortgage dashboard:');
const a = patch('vik-mortgage-dashboard.html', mortgageEdits);
console.log('');
console.log('Insurance dashboard:');
const b = patch('vik-insurance-dashboard.html', insuranceEdits);

console.log('');
console.log('---------------------------------------');
console.log('Total edits applied: ' + (a + b) + ' of 6');
console.log('---------------------------------------');
if (a + b < 6) {
  console.log('Some edits did not apply. Do not commit — send this output back.');
} else {
  console.log('All good. Copy to Desktop/uploads, then commit and push.');
}
