// fix-nikki-five-topics.js
// 1. Removes the three-button service menu and the Living Benefits sub-choices.
//    "What brings you here today?" is now answered by the five topics directly.
// 2. Replaces the five topics with the agreed set:
//      Living Benefits
//      Legacy and Protection      (was "Death and Legacy")
//      Retirement and Wealth      (merges Retirement Guarantees + Staying Wealthy)
//      Children's Education Planning   (new)
//      Estate Planning
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
// EDIT 1 — delete SERVICE_DETAIL, askServiceDetail and the menu.
// askService now goes straight into the five topics.
// ---------------------------------------------------------------
const oldServiceBlock = `/* Plain-language sub-choices. The client picks something they actually
   understand; the productFamily field records what it maps to, so the
   dashboard knows without asking them to name a product. */
const SERVICE_DETAIL = {
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
    addChoices(['Living Benefits', 'Retirement Planning', 'General Inquiry'], (choice) => {
      lead.service = choice;
      if (SERVICE_DETAIL[choice]) askServiceDetail(choice);
      else askTopicMenu();
    });
  });
}`;

const newServiceBlock = `function askService() {
  setInputMode(false);
  lead.service = 'Insurance';
  askTopicMenu();
}`;

edits.push({ name: 'remove the service menu and sub-choices', find: oldServiceBlock, replace: newServiceBlock });

// ---------------------------------------------------------------
// EDIT 2 — the five topics.
// ---------------------------------------------------------------
const oldTopics = `const TOPICS = [
  {
    key: 'livingBenefits',
    label: 'Living Benefits',
    question: "Here's a real one — if you got sick or hurt tomorrow and couldn't work, is your income protected?"
  },
  {
    key: 'legacy',
    label: 'Death and Legacy',
    question: "Let me ask you something most people avoid — if you weren't here tomorrow, would your family's life stay exactly the same?"
  },
  {
    key: 'guarantees',
    label: 'Retirement Guarantees',
    question: "Quick one on your money — if the market crashed tomorrow, is your principal actually protected?"
  },
  {
    key: 'wealth',
    label: 'Staying Wealthy',
    question: "Here's something worth thinking about — the wealthy don't just get wealthy, they stay wealthy. Do you have a structure in place that protects what you build?"
  },
  {
    key: 'estate',
    label: 'Estate Planning',
    question: "Last one, and it's an important one — when everything you've built passes on, is it going exactly where you want it to?"
  }
];`;

const newTopics = `const TOPICS = [
  {
    key: 'livingBenefits',
    label: 'Living Benefits',
    question: "Here's a real one — if you got sick or hurt tomorrow and couldn't work, is your income protected?"
  },
  {
    key: 'legacy',
    label: 'Legacy and Protection',
    question: "Let me ask you something most people avoid — if you weren't here tomorrow, would your family's life stay exactly the same?"
  },
  {
    key: 'guarantees',
    label: 'Retirement and Wealth',
    question: "Quick one on your money — the RRSPs and investments you're building for retirement, if the market dropped tomorrow, would your principal actually be protected?"
  },
  {
    key: 'education',
    label: "Children's Education Planning",
    question: "Kids' education adds up fast — tuition, books and living costs can run well past a hundred thousand dollars by the time they're done. Is there something set aside just for that?"
  },
  {
    key: 'estate',
    label: 'Estate Planning',
    question: "Last one, and it's an important one — when everything you've built passes on, is it going exactly where you want it to?"
  }
];`;

edits.push({ name: 'the five topics', find: oldTopics, replace: newTopics });

// ---------------------------------------------------------------
// EDIT 3 — the opening line now carries "What brings you here today?"
// ---------------------------------------------------------------
const oldIntro = `    addBubble("I've got five real questions for you — the kind most people don't stop to think about until it's too late. Living benefits, death and legacy, retirement guarantees, staying wealthy, and estate planning.", 'neo');`;

const newIntro = `    addBubble("What brings you here today? I've got five real questions for you — the kind most people don't stop to think about until it's too late. Living benefits, legacy and protection, retirement and wealth, children's education, and estate planning.", 'neo');`;

edits.push({ name: 'opening line', find: oldIntro, replace: newIntro });

// ---------------------------------------------------------------
// EDIT 4 — what gets saved to the dashboard.
// ---------------------------------------------------------------
const oldNotes = `      sourceNotes: \`Language: \${lead.language || '—'}; Interest: \${lead.serviceDetail || '—'}\${lead.productFamily ? ' (' + lead.productFamily + ')' : ''}; Living Benefits: \${lead.livingBenefits || '—'}; Death and Legacy: \${lead.legacy || '—'}; Retirement Guarantees: \${lead.guarantees || '—'}; Staying Wealthy: \${lead.wealth || '—'}; Estate Planning: \${lead.estate || '—'}; Newsletter: \${lead.newsletter || '—'}\`,`;

const newNotes = `      sourceNotes: \`Language: \${lead.language || '—'}; Living Benefits: \${lead.livingBenefits || '—'}; Legacy and Protection: \${lead.legacy || '—'}; Retirement and Wealth: \${lead.guarantees || '—'}; Children's Education: \${lead.education || '—'}; Estate Planning: \${lead.estate || '—'}; Newsletter: \${lead.newsletter || '—'}\`,`;

edits.push({ name: 'dashboard notes', find: oldNotes, replace: newNotes });

// ---------------------------------------------------------------
// EDIT 5 — the summary card at the end of the chat.
// ---------------------------------------------------------------
const oldRows = `    \${lead.serviceDetail ? \`<div class="row"><span>Interest</span><span>\${lead.serviceDetail}</span></div>\` : ''}
    <div class="row"><span>Living Benefits</span><span>\${lead.livingBenefits || '—'}</span></div>
    <div class="row"><span>Death and Legacy</span><span>\${lead.legacy || '—'}</span></div>
    <div class="row"><span>Retirement Guarantees</span><span>\${lead.guarantees || '—'}</span></div>
    <div class="row"><span>Staying Wealthy</span><span>\${lead.wealth || '—'}</span></div>
    <div class="row"><span>Estate Planning</span><span>\${lead.estate || '—'}</span></div>`;

const newRows = `    <div class="row"><span>Living Benefits</span><span>\${lead.livingBenefits || '—'}</span></div>
    <div class="row"><span>Legacy and Protection</span><span>\${lead.legacy || '—'}</span></div>
    <div class="row"><span>Retirement and Wealth</span><span>\${lead.guarantees || '—'}</span></div>
    <div class="row"><span>Children's Education</span><span>\${lead.education || '—'}</span></div>
    <div class="row"><span>Estate Planning</span><span>\${lead.estate || '—'}</span></div>`;

edits.push({ name: 'summary card', find: oldRows, replace: newRows });

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
