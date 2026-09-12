// fix-nikki-form-topics.js
// Brings the self-fill form in line with the chat flow:
//  - the "What brings you here?" dropdown now lists the same five topics
//  - the "stay wealthy" question is replaced by the children's education question
// Run from ~/vik-widgets

const fs = require('fs');

const FILE = 'nikki-widget.html';

if (!fs.existsSync(FILE)) {
  console.log('STOP: nikki-widget.html not found here.');
  console.log('Run this from the widgets folder:  cd ~/vik-widgets');
  process.exit(1);
}

let src = fs.readFileSync(FILE, 'utf8');
const original = src;

const edits = [];

// ---------------------------------------------------------------
// EDIT 1 — the dropdown now matches Nikki's five topics.
// ---------------------------------------------------------------
edits.push({
  name: 'dropdown options',
  find: `      <select id="f_service">
        <option value="">Select one...</option>
        <option>Life Insurance</option>
        <option>Living Benefits</option>
        <option>Retirement Planning</option>
        <option>General Inquiry</option>
      </select>`,
  replace: `      <select id="f_service">
        <option value="">Select one...</option>
        <option>Living Benefits</option>
        <option>Legacy and Protection</option>
        <option>Retirement and Wealth</option>
        <option>Children's Education Planning</option>
        <option>Estate Planning</option>
      </select>`
});

// ---------------------------------------------------------------
// EDIT 2 — education question replaces the staying-wealthy question.
// ---------------------------------------------------------------
edits.push({
  name: 'education question',
  find: `      <label>Do you have a structure in place to stay wealthy, not just build it?</label>
      <select id="f_wealth">
        <option value="">Select one...</option>
        <option>Yes</option>
        <option>No</option>
      </select>`,
  replace: `      <label>Is there something set aside specifically for your children's education?</label>
      <select id="f_education">
        <option value="">Select one...</option>
        <option>Yes</option>
        <option>No</option>
      </select>`
});

// ---------------------------------------------------------------
// EDIT 3 — the form's own check list.
// ---------------------------------------------------------------
edits.push({
  name: 'required-field list',
  find: `      { id: 'f_wealth', label: 'Staying wealthy question' },`,
  replace: `      { id: 'f_education', label: "Children's education question" },`
});

// ---------------------------------------------------------------
// EDIT 4 — save the answer under the same name the chat uses.
// ---------------------------------------------------------------
edits.push({
  name: 'save the answer',
  find: `      lead.wealth = document.getElementById('f_wealth').value;`,
  replace: `      lead.education = document.getElementById('f_education').value;`
});

// ---------------------------------------------------------------
// Check every edit matches exactly once BEFORE writing anything.
// ---------------------------------------------------------------
let ok = 0;
const problems = [];

for (const e of edits) {
  const count = src.split(e.find).length - 1;
  if (count === 1) { ok++; }
  else { problems.push(`  - "${e.name}" matched ${count} times (needed exactly 1)`); }
}

console.log(`ok ${ok}/${edits.length}`);

if (problems.length) {
  console.log('NOTHING WAS CHANGED. Problems:');
  problems.forEach(p => console.log(p));
  process.exit(1);
}

for (const e of edits) src = src.split(e.find).join(e.replace);

fs.writeFileSync(FILE + '.backup', original, 'utf8');
fs.writeFileSync(FILE, src, 'utf8');

console.log('Saved. Backup written to nikki-widget.html.backup');
