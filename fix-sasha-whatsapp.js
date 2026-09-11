// fix-sasha-whatsapp.js
//
// PIECE 1 of 3 — teaches Sasha to send on WhatsApp as a third channel.
//
// WhatsApp rule: the FIRST message to a person must use an approved template.
// Once they reply, freeform messages are allowed for 24 hours.
// So: if the client has not replied yet, Sasha sends the approved template
// (dream_home_followup). If they have replied, she sends her own wording.
//
// Piece 2 (a webhook that marks a client as "has replied") and Piece 3
// (pointing Twilio at that webhook) come after this.
//
// Run from ~/fincop-backend with:  node fix-sasha-whatsapp.js
// Then run the SAME script from ~/vik-widgets to update the dashboard.

const fs = require('fs');
const path = require('path');

const here = path.basename(process.cwd());

// ---------------------------------------------------------------
// server.js edits (run from ~/fincop-backend)
// ---------------------------------------------------------------

const serverEdits = [
  {
    label: 'server: add the WhatsApp send function',
    old: `async function sendSmsAsSasha({ to, body }) {
  const client = getTwilioClient();
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,       // e.g. '+14165551234'
    // from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,  // <- uncomment for WhatsApp
    to: to,
    // to: 'whatsapp:' + to,                                  // <- uncomment for WhatsApp
    body: body
  });
}`,
    new: `async function sendSmsAsSasha({ to, body }) {
  const client = getTwilioClient();
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,       // e.g. '+14165551234'
    to: to,
    body: body
  });
}

// WhatsApp. The first message to any person must use an approved template;
// after they reply, freeform is allowed for 24 hours.
// Template "dream_home_followup", approved Sep 2026.
const WHATSAPP_TEMPLATE_SID = 'HXbd9075b2cc77493d6a3bf2e2ac371ba0';

async function sendWhatsAppAsSasha({ to, body, name, hasReplied }) {
  const client = getTwilioClient();
  const from = 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER;
  const waTo = 'whatsapp:' + to;

  if (hasReplied) {
    await client.messages.create({ from: from, to: waTo, body: body });
    return { usedTemplate: false };
  }

  await client.messages.create({
    from: from,
    to: waTo,
    contentSid: WHATSAPP_TEMPLATE_SID,
    contentVariables: JSON.stringify({ '1': name || 'there' })
  });
  return { usedTemplate: true };
}`
  },
  {
    label: 'server: accept whatsappReplied from the dashboard',
    old: `    const { dealCode, name, email, phone, message, history, autoSend, researchNotes } = req.body;`,
    new: `    const { dealCode, name, email, phone, message, history, autoSend, researchNotes, whatsappReplied } = req.body;`
  },
  {
    label: 'server: tell Sasha WhatsApp is its own channel',
    old: `(he may say "text", "SMS", "WhatsApp", or just "message" — treat "text"/"SMS"/"WhatsApp" as CHANNEL: SMS, and anything else default to CHANNEL: EMAIL)`,
    new: `(he may say "text" or "SMS" — treat those as CHANNEL: SMS; if he says "WhatsApp" use CHANNEL: WHATSAPP; anything else defaults to CHANNEL: EMAIL)`
  },
  {
    label: 'server: add WHATSAPP to the reply format',
    old: `CHANNEL: <EMAIL or SMS>`,
    new: `CHANNEL: <EMAIL, SMS, or WHATSAPP>`
  },
  {
    label: 'server: no subject line for WhatsApp',
    old: `SUBJECT: <a short natural subject line — write "n/a" if CHANNEL is SMS>`,
    new: `SUBJECT: <a short natural subject line — write "n/a" if CHANNEL is SMS or WHATSAPP>`
  },
  {
    label: 'server: recognise WHATSAPP in Sasha\'s reply',
    old: `const channelMatch = raw.match(/CHANNEL:\\s*(EMAIL|SMS)/i);`,
    new: `const channelMatch = raw.match(/CHANNEL:\\s*(EMAIL|SMS|WHATSAPP)/i);`
  },
  {
    label: 'server: send on WhatsApp when asked',
    old: `        if (channel === 'SMS' && phone) {
          await sendSmsAsSasha({ to: phone, body });
          sent = true;
        } else if (channel === 'EMAIL' && email) {`,
    new: `        if (channel === 'SMS' && phone) {
          await sendSmsAsSasha({ to: phone, body });
          sent = true;
        } else if (channel === 'WHATSAPP' && phone) {
          const waResult = await sendWhatsAppAsSasha({
            to: phone,
            body: body,
            name: name,
            hasReplied: !!whatsappReplied
          });
          sent = true;
          if (waResult.usedTemplate) {
            sendError = 'Note: sent as the approved WhatsApp template (first contact), not the wording above. Once they reply, Sasha can write freely.';
          }
        } else if (channel === 'EMAIL' && email) {`
  },
  {
    label: 'server: no phone number message covers WhatsApp too',
    old: `          sendError = channel === 'SMS' ? 'No phone number on file' : 'No email on file';`,
    new: `          sendError = (channel === 'SMS' || channel === 'WHATSAPP') ? 'No phone number on file' : 'No email on file';`
  },
  {
    label: 'server: report the WhatsApp recipient correctly',
    old: `      to: channel === 'SMS' ? (phone || null) : (email || null),`,
    new: `      to: (channel === 'SMS' || channel === 'WHATSAPP') ? (phone || null) : (email || null),`
  }
];

// ---------------------------------------------------------------
// dashboard edits (run from ~/vik-widgets)
// ---------------------------------------------------------------

const dashEdits = [
  {
    label: 'dashboard: send whatsappReplied along with the message',
    old: `body: JSON.stringify({ dealCode:c.dealCode, name:c.name, email:c.email, phone:c.phone, message:text, autoSend:c.sashaAutoSend, researchNotes:c.researchNotes, history:c.sashaChat })`,
    new: `body: JSON.stringify({ dealCode:c.dealCode, name:c.name, email:c.email, phone:c.phone, message:text, autoSend:c.sashaAutoSend, researchNotes:c.researchNotes, history:c.sashaChat, whatsappReplied:c.whatsappReplied })`
  }
];

// ---------------------------------------------------------------

function run(file, edits){
  let src;
  try {
    src = fs.readFileSync(file, 'utf8');
  } catch (e) {
    console.error('ERROR: could not open ' + file + ' in this folder.');
    process.exit(1);
  }

  let out = src;
  for (const edit of edits) {
    const count = out.split(edit.old).length - 1;
    if (count !== 1) {
      console.error('ERROR: "' + edit.label + '" matched ' + count + ' times (expected 1).');
      console.error('Nothing has been written.');
      process.exit(1);
    }
    out = out.split(edit.old).join(edit.new);
  }

  let n = 0;
  for (const edit of edits) {
    n++;
    console.log('ok  ' + n + '/' + edits.length + '  ' + edit.label);
  }

  fs.writeFileSync(file + '.backup', src, 'utf8');
  console.log('ok       saved backup to ' + file + '.backup');

  fs.writeFileSync(file, out, 'utf8');
  console.log('');
  console.log('DONE — ' + edits.length + ' of ' + edits.length + ' edits applied to ' + file + '.');
}

if (fs.existsSync('server.js')) {
  console.log('Found server.js — updating the backend.');
  console.log('');
  run('server.js', serverEdits);
  console.log('');
  console.log('Next: commit and push, then run this same script from ~/vik-widgets.');
} else if (fs.existsSync('vik-insurance-dashboard.html')) {
  console.log('Found the insurance dashboard — updating it.');
  console.log('');
  run('vik-insurance-dashboard.html', dashEdits);
} else {
  console.error('ERROR: run this from ~/fincop-backend or ~/vik-widgets.');
  console.error('Current folder: ' + here);
  process.exit(1);
}
