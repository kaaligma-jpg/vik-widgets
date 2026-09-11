// fix-fna-helper-text.js
// Replaces the out-of-date FNA helper line in the insurance dashboard.
// Run from ~/vik-widgets with:  node fix-fna-helper-text.js

const fs = require('fs');
const FILE = 'vik-insurance-dashboard.html';

const OLD = `Sasha's email sending isn't fully wired yet — this drops the link into her chat below so you can confirm/copy it out for now.`;
const NEW = `Sends the FNA link to this client by email, via Sasha.`;

let src;
try {
  src = fs.readFileSync(FILE, 'utf8');
} catch (e) {
  console.error('ERROR: could not open ' + FILE + ' — are you in ~/vik-widgets?');
  process.exit(1);
}

const count = src.split(OLD).length - 1;

if (count !== 1) {
  console.error('ERROR: expected to find the old line exactly once, found ' + count + '. Nothing written.');
  process.exit(1);
}

console.log('ok  1/1  found the old helper line');

fs.writeFileSync(FILE + '.backup', src, 'utf8');
console.log('ok       saved backup to ' + FILE + '.backup');

fs.writeFileSync(FILE, src.split(OLD).join(NEW), 'utf8');
console.log('ok       replaced with the new wording');
console.log('');
console.log('DONE — 1 of 1 edit applied.');
