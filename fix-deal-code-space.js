// fix-deal-code-space.js
// Changes deal-code generation so the prefix is separated from the number
// by a space. This is what makes the Gmail forwarding filters actually fire.
//
//   mortgage:  vmtz1XXXX  ->  vmtg 1XXXX
//   insurance: vins1XXXX  ->  vinc 1XXXX
//
// Run this from the folder that holds your vik-widgets files.

const fs = require('fs');

const FILES = [
  'vik-mortgage-dashboard.html',
  'vik-insurance-dashboard.html',
  'neo-widget.html',
  'nikki-widget.html'
];

const REPLACEMENTS = [
  { from: "'vmtz1'", to: "'vmtg 1'" },
  { from: "'vins1'", to: "'vinc 1'" }
];

let totalChanges = 0;
let filesTouched = 0;

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.log('SKIPPED (not in this folder): ' + file);
    continue;
  }

  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  let fileChanges = 0;

  for (const r of REPLACEMENTS) {
    const parts = text.split(r.from);
    const count = parts.length - 1;
    if (count > 0) {
      text = parts.join(r.to);
      fileChanges += count;
      console.log('  ' + file + ': replaced ' + count + ' x ' + r.from + ' -> ' + r.to);
    }
  }

  if (fileChanges === 0) {
    console.log('NO CHANGE NEEDED: ' + file);
    continue;
  }

  fs.writeFileSync(file + '.backup-code-space', original, 'utf8');
  fs.writeFileSync(file, text, 'utf8');
  totalChanges += fileChanges;
  filesTouched++;
  console.log('UPDATED: ' + file + '  (backup saved as ' + file + '.backup-code-space)');
}

console.log('');
console.log('---------------------------------------');
console.log('Files updated: ' + filesTouched);
console.log('Total replacements: ' + totalChanges);
console.log('---------------------------------------');

if (totalChanges === 0) {
  console.log('Nothing changed. Are you in the right folder?');
} else {
  console.log('Now commit and push, then hard-refresh the dashboards.');
}
