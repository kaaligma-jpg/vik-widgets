// fix-nikki-subchoices.js
// When a lead picks Life Insurance or Living Benefits, Nikki now asks one
// plain-language follow-up and explains what that option actually means,
// before going into the five topic questions as usual.
// Retirement Planning and General Inquiry are unchanged.
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
// EDIT 1 — replace askService so it branches into the sub-question.
// ---------------------------------------------------------------
const oldAskService = `function askService() {
  setInputMode(false);
  showTyping(() => {
    addBubble("What brings you here today?", 'neo');
    addChoices(['Life Insurance', 'Living Benefits', 'Retirement Planning', 'General Inquiry'], (choice) => {
      lead.service = choice;
      askTopicMenu();
    });
  });
}`;

const newAskService = `/* Plain-language sub-choices. The client picks something they actually
   understand; the productFamily field records what it maps to, so the
   dashboard knows without asking them to name a product. */
const SERVICE_DETAIL = {
  'Life Insurance': {
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
  'Living Benefits': {
    intro: "Good — let's narrow it down a little. Which of these is closest to what's on your mind?",
    options: [
      {
        label: 'If I got seriously ill',
        family: 'Living benefits - critical illness',
        explain: "Critical illness coverage. If you're diagnosed with something serious — cancer, heart attack, stroke are the common ones — you get a lump sum, tax-free, to spend however you need. It pays whether or not you go back to work."
      },
      {
        label: "If I couldn't work for a while",
        family: 'Living benefits - disability',
        explain: "Disability coverage. It replaces a portion of your income each month while you can't work. Your ability to earn is usually your biggest asset, and it's the one most people never insure."
      },
      {
        label: 'Care costs later in life',
        family: 'Living benefits - long-term care',
        explain: "Long-term care coverage. It helps pay for help at home or in a facility if you can't manage on your own, so the cost doesn't land on your savings or your kids."
      }
    ]
  }
};

function askServiceDetail(service) {
  const detail = SERVICE_DETAIL[service];
  if (!detail) { askTopicMenu(); return; }

  showTyping(() => {
    addBubble(detail.intro, 'neo');
    addChoices(detail.options.map(o => o.label), (choiceLabel) => {
      const picked = detail.options.find(o => o.label === choiceLabel);
      lead.serviceDetail = choiceLabel;
      lead.productFamily = picked ? picked.family : '';
      showTyping(() => {
        addBubble(picked ? picked.explain : '', 'neo');
        askTopicMenu();
      });
    });
  });
}

function askService() {
  setInputMode(false);
  showTyping(() => {
    addBubble("What brings you here today?", 'neo');
    addChoices(['Life Insurance', 'Living Benefits', 'Retirement Planning', 'General Inquiry'], (choice) => {
      lead.service = choice;
      if (SERVICE_DETAIL[choice]) askServiceDetail(choice);
      else askTopicMenu();
    });
  });
}`;

edits.push({ name: 'sub-choices + explanations', find: oldAskService, replace: newAskService });

// ---------------------------------------------------------------
// EDIT 2 — carry the answer through to the lead record so it reaches
// the dashboard rather than being lost when the chat closes.
// ---------------------------------------------------------------
const oldNotes = `      sourceNotes: \`Language: \${lead.language || '—'}; Living Benefits: \${lead.livingBenefits || '—'}; Death and Legacy: \${lead.legacy || '—'}; Retirement Guarantees: \${lead.guarantees || '—'}; Staying Wealthy: \${lead.wealth || '—'}; Estate Planning: \${lead.estate || '—'}; Newsletter: \${lead.newsletter || '—'}\`,`;

const newNotes = `      sourceNotes: \`Language: \${lead.language || '—'}; Interest: \${lead.serviceDetail || '—'}\${lead.productFamily ? ' (' + lead.productFamily + ')' : ''}; Living Benefits: \${lead.livingBenefits || '—'}; Death and Legacy: \${lead.legacy || '—'}; Retirement Guarantees: \${lead.guarantees || '—'}; Staying Wealthy: \${lead.wealth || '—'}; Estate Planning: \${lead.estate || '—'}; Newsletter: \${lead.newsletter || '—'}\`,`;

edits.push({ name: 'record the answer in sourceNotes', find: oldNotes, replace: newNotes });

// ---------------------------------------------------------------
// EDIT 3 — show it on the summary card at the end of the chat.
// ---------------------------------------------------------------
const oldRow = `    <div class="row"><span>Living Benefits</span><span>\${lead.livingBenefits || '—'}</span></div>`;

const newRow = `    \${lead.serviceDetail ? \`<div class="row"><span>Interest</span><span>\${lead.serviceDetail}</span></div>\` : ''}
    <div class="row"><span>Living Benefits</span><span>\${lead.livingBenefits || '—'}</span></div>`;

edits.push({ name: 'show it on the summary card', find: oldRow, replace: newRow });

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
