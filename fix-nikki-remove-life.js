// fix-nikki-remove-life.js
// Removes 'Life Insurance' from Nikki's "What brings you here today?" menu
// and deletes its three sub-choices. Living Benefits, Retirement Planning
// and General Inquiry are untouched.
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
// EDIT 1 — drop Life Insurance from the menu.
// ---------------------------------------------------------------
edits.push({
  name: 'remove Life Insurance from the menu',
  find: `    addChoices(['Life Insurance', 'Living Benefits', 'Retirement Planning', 'General Inquiry'], (choice) => {`,
  replace: `    addChoices(['Living Benefits', 'Retirement Planning', 'General Inquiry'], (choice) => {`
});

// ---------------------------------------------------------------
// EDIT 2 — delete the Life Insurance block and its three options.
// ---------------------------------------------------------------
const lifeBlock = `  'Life Insurance': {
    intro: "Good — let's narrow it down a little. Which of these is closest to what's on your mind?",
    options: [
      {
        label: "Make sure my family is okay if I'm gone",
        family: 'Life - income replacement',
        explain: "That's the core of it. A tax-free amount goes to the people you name, so the income you were bringing in doesn't just stop. Some plans cover a set number of years, others last your whole life."
      },
      {
        label: 'Cover the mortgage or debts',
        family: 'Life - term / debt coverage',
        explain: "This is usually the most affordable kind — coverage for a set term, sized to clear the mortgage and any loans so nobody inherits the payments."
      },
      {
        label: 'Build something with cash value I can use later',
        family: 'Life - permanent / UL',
        explain: "That's permanent coverage. It never expires, and part of what you pay builds value inside the policy that you can borrow against or draw on down the road."
      }
    ]
  },
  'Living Benefits': {`;

edits.push({
  name: 'delete the Life Insurance sub-choices',
  find: lifeBlock,
  replace: `  'Living Benefits': {`
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
