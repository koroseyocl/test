// Checks widget limits and sends it via Bot API 10.4 sendWidget.
// Usage: node send.mjs --check | BOT_TOKEN=... CHAT_ID=... node send.mjs
import { readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const html = readFileSync(new URL('./widget.html', import.meta.url), 'utf8');
const raw = Buffer.byteLength(html);
const packed = deflateSync(html, { level: 9 }).length;
console.log(`widget.html: ${raw} B raw (max 32768), ${packed} B zlib-9 (max 4096)`);
if (raw > 32768 || packed > 4096) {
  console.error('Widget exceeds Telegram limits');
  process.exit(1);
}
if (process.argv.includes('--check')) process.exit(0);

const { BOT_TOKEN, CHAT_ID } = process.env;
if (!BOT_TOKEN || !CHAT_ID) {
  console.error('Set BOT_TOKEN and CHAT_ID (widgets work only in private chats with the bot)');
  process.exit(1);
}
const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendWidget`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ chat_id: CHAT_ID, html, height: 340, caption: '⛏ Тапай по руде, чтобы добыть алмазы' }),
});
const body = await res.json();
if (!body.ok) {
  console.error(body);
  process.exit(1);
}
console.log('Sent, message_id =', body.result.message_id);
