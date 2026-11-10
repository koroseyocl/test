# 💎 Diamond Rain — Telegram HTML widget

Виджет для Telegram Bot API 10.4 (`sendWidget`, ноябрь 2026): майнкрафтовские алмазные блоки падают, разбиваются о пол на текстурные куски и алмазики, а куски при сильном ударе дробятся ещё мельче. Тап по блоку разбивает его в воздухе, тап по пустому месту бросает новый блок.

- `widget.html` — сам виджет (Canvas 2D, без сети, ~2.5 КБ после zlib).
- `send.mjs` — проверка лимитов и отправка.

```bash
node send.mjs --check                          # проверить лимиты 32 КБ / 4 КБ zlib
BOT_TOKEN=123:abc CHAT_ID=111 node send.mjs     # отправить (только в личку с ботом)
```

Бот с командой `/diamonds` (присылает новый виджет), должен быть постоянно запущен:

```bash
BOT_TOKEN=123:abc node bot.mjs                  # Windows cmd: set BOT_TOKEN=123:abc& node bot.mjs
```

Локально можно открыть `widget.html` в браузере.
