// fix-neo-combined-lead.js
// 1. Neo now creates ONE insurance lead per person instead of two
//    (category "Both" when the client has an insurance gap AND a retirement gap).
// 2. The insurance dashboard shows TWO coloured badges side by side for "Both".
//
// Run from ~/vik-widgets with:  node fix-neo-combined-lead.js

const fs = require('fs');

const NEO = 'neo-widget.html';
const DASH = 'vik-insurance-dashboard.html';

// ---------- edits ----------

const neoEdits = [
  {
    label: 'Neo: build one combined category instead of two',
    old: `    const gaps = [];
    if (needsInsurance) gaps.push('Insurance');
    if (needsRetirement) gaps.push('Investment');`,
    new: `    const gaps = [];
    if (needsInsurance && needsRetirement) gaps.push('Both');
    else if (needsInsurance) gaps.push('Insurance');
    else if (needsRetirement) gaps.push('Investment');`
  },
  {
    label: 'Neo: set insurance status for combined leads',
    old: `        insuranceStatus: category === 'Insurance' ? 'No' : '',`,
    new: `        insuranceStatus: (category === 'Insurance' || category === 'Both') ? 'No' : '',`
  },
  {
    label: 'Neo: set retirement status for combined leads',
    old: `        retirementStatus: category === 'Investment' ? 'No' : '',`,
    new: `        retirementStatus: (category === 'Investment' || category === 'Both') ? 'No' : '',`
  },
  {
    label: 'Neo: source note wording for combined leads',
    old: `client said they don't have \${category === 'Insurance' ? 'life insurance' : 'a retirement/investment plan'}.\``,
    new: `client said they don't have \${category === 'Both' ? 'life insurance or a retirement/investment plan' : (category === 'Insurance' ? 'life insurance' : 'a retirement/investment plan')}.\``
  }
];

const dashEdits = [
  {
    label: 'Dashboard: add the two-badge helper',
    old: `function categoryBadgeClass(c){
  return c.leadCategory==='Both' ? 'both' : (c.leadCategory==='Investment' ? 'investment' : 'insurance');
}`,
    new: `function categoryBadgeClass(c){
  return c.leadCategory==='Both' ? 'both' : (c.leadCategory==='Investment' ? 'investment' : 'insurance');
}

function categoryBadges(c){
  if(c.leadCategory === 'Both'){
    return '<span class="badge insurance">Insurance</span> <span class="badge investment">Investment</span>';
  }
  return '<span class="badge ' + categoryBadgeClass(c) + '">' + (c.leadCategory || 'Insurance') + '</span>';
}`
  },
  {
    label: 'Dashboard: badges in the list row',
    old: `<td><span class="badge \${categoryBadgeClass(c)}">\${c.leadCategory||'Insurance'}</span></td>`,
    new: `<td>\${categoryBadges(c)}</td>`
  },
  {
    label: 'Dashboard: badges in the card view',
    old: `          <span class="badge \${categoryBadgeClass(c)}">\${c.leadCategory||'Insurance'}</span>`,
    new: `          \${categoryBadges(c)}`
  },
  {
    label: 'Dashboard: badges in the detail panel',
    old: `<dt>Category</dt><dd><span class="badge \${categoryBadgeClass(c)}">\${c.leadCategory||'Insurance'}</span></dd>`,
    new: `<dt>Category</dt><dd>\${categoryBadges(c)}</dd>`
  }
];

// ---------- runner ----------

function loadOrDie(file){
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    console.error('ERROR: could not open ' + file + ' — are you in ~/vik-widgets?');
    process.exit(1);
  }
}

function applyAll(file, edits){
  let src = loadOrDie(file);
  const results = [];

  for (const edit of edits) {
    const count = src.split(edit.old).length - 1;
    if (count !== 1) {
      console.error('ERROR: "' + edit.label + '" matched ' + count + ' times (expected 1).');
      console.error('Nothing has been written to any file.');
      process.exit(1);
    }
    results.push({ edit, src });
    src = src.split(edit.old).join(edit.new);
  }

  return src;
}

// Check BOTH files fully before writing anything.
const neoOut = applyAll(NEO, neoEdits);
const dashOut = applyAll(DASH, dashEdits);

let n = 0;
const total = neoEdits.length + dashEdits.length;
for (const e of neoEdits) { n++; console.log('ok  ' + n + '/' + total + '  ' + e.label); }
for (const e of dashEdits) { n++; console.log('ok  ' + n + '/' + total + '  ' + e.label); }

fs.writeFileSync(NEO + '.backup', loadOrDie(NEO), 'utf8');
fs.writeFileSync(DASH + '.backup', loadOrDie(DASH), 'utf8');
console.log('ok       saved backups (.backup) for both files');

fs.writeFileSync(NEO, neoOut, 'utf8');
fs.writeFileSync(DASH, dashOut, 'utf8');

console.log('');
console.log('DONE — ' + total + ' of ' + total + ' edits applied.');
console.log('Note: this affects NEW leads only. The existing vins10008 / vins10009 pair');
console.log('stays as two rows until you merge them by hand.');
