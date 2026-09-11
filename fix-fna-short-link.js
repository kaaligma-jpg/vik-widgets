// fix-fna-short-link.js
// Shortens the FNA link:
//   dream-home-plus-life-fna.html?client=...   ->   fna.html?c=...
//
// Renames the form file, updates the dashboard's FNA_BASE_URL, and changes
// the query parameter the form reads from "client" to "c".
//
// Run from ~/vik-widgets with:  node fix-fna-short-link.js

const fs = require('fs');

const OLD_FILE = 'dream-home-plus-life-fna.html';
const NEW_FILE = 'fna.html';
const DASH = 'vik-insurance-dashboard.html';

function loadOrDie(file){
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    console.error('ERROR: could not open ' + file + ' — are you in ~/vik-widgets?');
    process.exit(1);
  }
}

function applyEdits(src, edits, fileLabel){
  let out = src;
  for (const edit of edits) {
    const count = out.split(edit.old).length - 1;
    if (count !== 1) {
      console.error('ERROR: in ' + fileLabel + ', "' + edit.label + '" matched ' + count + ' times (expected 1).');
      console.error('Nothing has been written to any file.');
      process.exit(1);
    }
    out = out.split(edit.old).join(edit.new);
  }
  return out;
}

// ---------- the form ----------

const formEdits = [
  {
    label: 'Form: read ?c= instead of ?client=',
    old: `const clientId = new URLSearchParams(window.location.search).get('client');`,
    new: `const clientId = new URLSearchParams(window.location.search).get('c');`
  }
];

// ---------- the dashboard ----------

const dashEdits = [
  {
    label: 'Dashboard: point at the new short filename',
    old: `const FNA_BASE_URL = 'https://kaaligma-jpg.github.io/vik-widgets/dream-home-plus-life-fna.html';`,
    new: `const FNA_BASE_URL = 'https://kaaligma-jpg.github.io/vik-widgets/fna.html';`
  }
];

// ---------- check everything before writing ----------

if (fs.existsSync(NEW_FILE)) {
  console.error('ERROR: ' + NEW_FILE + ' already exists. Nothing written.');
  process.exit(1);
}

const formSrc = loadOrDie(OLD_FILE);
const dashSrc = loadOrDie(DASH);

const formOut = applyEdits(formSrc, formEdits, OLD_FILE);
const dashOut = applyEdits(dashSrc, dashEdits, DASH);

// The dashboard builds the link as FNA_BASE_URL + '?client=' + id somewhere.
// Find and report it so nothing silently breaks.
const clientParamCount = dashOut.split('?client=').length - 1;
if (clientParamCount === 0) {
  console.error('ERROR: could not find "?client=" in the dashboard. Nothing written.');
  process.exit(1);
}

const dashFinal = dashOut.split('?client=').join('?c=');

console.log('ok  1/3  Form: reads ?c= instead of ?client=');
console.log('ok  2/3  Dashboard: FNA_BASE_URL points at fna.html');
console.log('ok  3/3  Dashboard: builds ?c= links (' + clientParamCount + ' place(s) updated)');

// ---------- write ----------

fs.writeFileSync(OLD_FILE + '.backup', formSrc, 'utf8');
fs.writeFileSync(DASH + '.backup', dashSrc, 'utf8');
console.log('ok       saved backups (.backup) for both files');

fs.writeFileSync(NEW_FILE, formOut, 'utf8');
fs.unlinkSync(OLD_FILE);
fs.writeFileSync(DASH, dashFinal, 'utf8');

console.log('ok       renamed ' + OLD_FILE + ' to ' + NEW_FILE);
console.log('');
console.log('DONE — 3 of 3 edits applied.');
console.log('New link shape: kaaligma-jpg.github.io/vik-widgets/fna.html?c=<id>');
console.log('Any FNA link sent before now will stop working.');
