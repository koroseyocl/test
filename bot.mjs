// Long-polling bot: /diamonds (or /start) sends a fresh diamond-rain widget.
// Usage: BOT_TOKEN=... node bot.mjs
import { readFileSync } from 'node:fs';

const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) {
  console.error('Set BOT_TOKEN');
  process.exit(1);
}
const html = readFileSync(new URL('./widget.html', import.meta.url), 'utf8');

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

function sendWidget(chat_id) {
  return api('sendWidget', { chat_id, html, height: 340, caption: '💎 Тапни по блоку, чтобы разбить его' });
}

async function handle(msg) {
  const cmd = (msg.text || '').split(/[\s@]/)[0];
  if (cmd !== '/diamonds' && cmd !== '/start') return;
  try {
    await sendWidget(msg.chat.id);
  } catch (e) {
    console.error(e.message);
    // widgets are private-chat only in production
    await api('sendMessage', { chat_id: msg.chat.id, text: 'Не получилось отправить виджет. Виджеты работают только в личке с ботом.' }).catch(() => {});
  }
}

await api('setMyCommands', { commands: [{ command: 'diamonds', description: '💎 Прислать новый виджет с алмазами' }] });
const me = await api('getMe');
console.log(`@${me.username} is running. Send /diamonds in the chat.`);

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
