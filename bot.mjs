// Long-polling bot: /diamonds (or /start) and /bankai send fresh widgets.
// Usage: BOT_TOKEN=... node bot.mjs
import { readFileSync } from 'node:fs';

const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) {
  console.error('Set BOT_TOKEN');
  process.exit(1);
}
const load = f => readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');
const WIDGETS = {
  '/diamonds': { html: load('widget.html'), height: 360 },
  '/start': { html: load('widget.html'), height: 360 },
  '/bankai': { html: load('bankai.html'), height: 440 },
};

async function api(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.error_code} ${data.description}`);
  return data.result;
}

async function handle(msg) {
  const w = WIDGETS[(msg.text || '').split(/[\s@]/)[0]];
  if (!w) return;
  try {
    await api('sendWidget', { chat_id: msg.chat.id, ...w });
  } catch (e) {
    console.error(e.message);
    // widgets are private-chat only in production
    await api('sendMessage', { chat_id: msg.chat.id, text: 'Не получилось отправить виджет. Виджеты работают только в личке с ботом.' }).catch(() => {});
  }
}

await api('setMyCommands', { commands: [
  { command: 'diamonds', description: '⛏ Прислать новый виджет с алмазной рудой' },
  { command: 'bankai', description: '🗡 Банкай Гина — Камишини но Яри' },
] });
const me = await api('getMe');
console.log(`@${me.username} is running. Commands: /diamonds, /bankai`);

let offset = 0;
for (;;) {
  try {
    const updates = await api('getUpdates', { offset, timeout: 50, allowed_updates: ['message'] });
    for (const u of updates) {
      offset = u.update_id + 1;
      if (u.message) handle(u.message);
    }
  } catch (e) {
    console.error(e.message);
    await new Promise(r => setTimeout(r, 3000));
  }
}
