#!/usr/bin/env node
// Рисует все карточки из data/cards.json в папку cards/ через headless Chrome.
// Запуск:  node brand/render.js          — все карточки
//          node brand/render.js 04 у07   — только те, чьё имя содержит эти куски

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PHOTOS = path.join(ROOT, 'photos', 'отобранные');
const OUT = path.join(ROOT, 'cards');
const TMP = path.join(OUT, '.tmp');

const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'brand', 'tokens.json'), 'utf8'));
const F = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'firma.json'), 'utf8'));
const CARDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cards.json'), 'utf8'));

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lines = s => esc(s).split('\n').join('<br>');

function background(photo) {
  const p = photo ? path.join(PHOTOS, photo) : null;
  if (p && fs.existsSync(p)) {
    return `background-image:url("file://${encodeURI(p)}");background-size:cover;background-position:center;`;
  }
  // фото ещё нет — рисуем заглушку, чтобы было видно, какого кадра не хватает
  return `background:
      repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 22px, rgba(255,255,255,0) 22px 44px),
      linear-gradient(160deg,#3a3f47,#22262c 60%,#15181c);`;
}

const missing = new Set();

function html(card) {
  const story = card.тип === 'история';
  const [w, h] = story ? T.размеры.история : T.размеры.квадрат;
  const pad = story ? T.поля.история : T.поля.квадрат;
  const c = T.цвета;

  if (card.фото && !fs.existsSync(path.join(PHOTOS, card.фото))) missing.add(card.фото);

  const mark = `<svg viewBox="0 0 24 24" fill="none" stroke="${c.на_акценте}" stroke-width="2.2" stroke-linecap="round">
    <path d="M3 13l2-5.5A2 2 0 016.9 6h10.2a2 2 0 011.9 1.5L21 13"/><path d="M3 13h18v4H3z"/>
    <circle cx="7" cy="17.5" r="1.6" fill="${c.на_акценте}" stroke="none"/><circle cx="17" cy="17.5" r="1.6" fill="${c.на_акценте}" stroke="none"/></svg>`;

  const logo = `<div class="logo"><div class="mark">${mark}</div>
    <div class="wordmark"><b>${esc(F.название)}</b>${F.подпись ? `<span>${esc(F.подпись)}</span>` : ''}</div></div>`;

  const bullets = (card.пункты || []).map((t, i) =>
    `<li><em>${String(i + 1).padStart(2, '0')}</em><span>${esc(t)}</span></li>`).join('');

  const body = story ? `
    ${logo}
    <div class="mid">
      ${card.надзаголовок ? `<div class="kicker">${esc(card.надзаголовок)}</div>` : ''}
      <div class="h1">${lines(card.заголовок)}</div>
      <div class="rule"></div>
      <ul>${bullets}</ul>
    </div>
    <div class="foot">
      <div class="ph">${esc(F.телефон)}</div>
      <div class="ad">${esc(F.адрес)} · ${esc(F.часы)}</div>
    </div>`
    : `
    <div class="top">${logo}</div>
    <div class="bottom">
      ${card.надзаголовок ? `<div class="kicker">${esc(card.надзаголовок)}</div>` : ''}
      <div class="h1">${lines(card.заголовок)}</div>
      ${card.цена ? `<div class="price"><i>от</i><b>${esc(card.цена)}</b></div>` : ''}
    </div>`;

  return `<!doctype html><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden}
  body{font-family:${T.шрифт};background:${c.фон};position:relative}
  .photo{position:absolute;inset:0;${background(card.фото)}}
  .scrim{position:absolute;inset:0;background:linear-gradient(to top, ${c.фон} ${story ? '30%' : '26%'}, rgba(22,24,29,.74) ${story ? '55%' : '52%'}, rgba(22,24,29,.18))}
  .wrap{position:absolute;inset:0;padding:${story ? '96px ' + pad + 'px' : pad + 'px'};display:flex;flex-direction:column}
  .logo{display:flex;align-items:center;gap:18px}
  .mark{width:74px;height:74px;border-radius:18px;background:${c.акцент};display:flex;align-items:center;justify-content:center;flex:none}
  .mark svg{width:44px;height:44px}
  .wordmark{line-height:1}
  .wordmark b{display:block;font-size:40px;font-weight:800;letter-spacing:-.02em;color:${c.текст}}
  .wordmark span{display:block;font-size:21px;font-weight:600;letter-spacing:.22em;color:${c.текст_приглушённый};margin-top:8px}
  .top{position:relative}
  .bottom{position:relative;margin-top:auto}
  .kicker{font-size:${story ? 30 : 26}px;font-weight:700;letter-spacing:.2em;color:${c.акцент};margin-bottom:22px}
  .h1{font-size:${story ? 108 : 84}px;font-weight:800;line-height:.98;letter-spacing:-.03em;color:${c.текст}}
  .mid{margin:auto 0}
  .rule{width:132px;height:10px;background:${c.акцент};border-radius:5px;margin:44px 0 52px}
  ul{list-style:none;display:flex;flex-direction:column;gap:34px}
  li{display:flex;gap:26px;align-items:flex-start;font-size:42px;font-weight:600;line-height:1.24;color:${c.текст}}
  li em{font-style:normal;color:${c.акцент};font-weight:800;flex:none}
  .price{margin-top:34px;display:inline-flex;align-items:baseline;gap:14px;background:${c.акцент};border-radius:${T.радиус_плашки}px;padding:18px 30px}
  .price i{font-style:normal;font-size:28px;font-weight:700;color:${c.на_акценте};opacity:.8}
  .price b{font-size:52px;font-weight:800;color:${c.на_акценте};letter-spacing:-.02em}
  .foot{margin-top:auto;border-top:3px solid rgba(255,255,255,.22);padding-top:44px}
  .foot .ph{font-size:56px;font-weight:800;color:${c.текст};letter-spacing:-.02em}
  .foot .ad{font-size:30px;font-weight:500;color:${c.текст_приглушённый};margin-top:14px}
  </style><div class="photo"></div><div class="scrim"></div><div class="wrap">${body}</div>`;
}

function shoot(card) {
  const [w, h] = card.тип === 'история' ? T.размеры.история : T.размеры.квадрат;
  const src = path.join(TMP, card.файл + '.html');
  const png = path.join(OUT, card.файл + '.png');
  fs.writeFileSync(src, html(card));
  return new Promise((res, rej) => {
    execFile(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
      '--force-device-scale-factor=1', `--screenshot=${png}`, `--window-size=${w},${h}`,
      'file://' + encodeURI(src)], err => err ? rej(err) : res(card.файл));
  });
}

(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  const filters = process.argv.slice(2);
  const list = filters.length ? CARDS.filter(c => filters.some(f => c.файл.includes(f))) : CARDS;

  for (let i = 0; i < list.length; i += 4) {
    const batch = await Promise.all(list.slice(i, i + 4).map(shoot));
    batch.forEach(n => console.log('  ✓ ' + n + '.png'));
  }

  console.log(`\nГотово: ${list.length} шт. в папке cards/`);
  if (missing.size) {
    console.log('\nПока без фото (стоит заглушка), не хватает кадров:');
    [...missing].sort().forEach(m => console.log('  · ' + m));
    console.log('Положите файлы с такими именами в photos/отобранные/ и запустите снова.');
  }
})();
