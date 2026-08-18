// Знаки для «Выхлоп-Эксперт». Цвета — из brand/tokens.json («Тёплый графит»).
const АКЦЕНТ = '#FF8A1F';
const ФОН = '#16181D';

const ЗНАКИ = {
  // «Поток» — торец выхлопной трубы, из неё расходятся три струи
  1: `
    <circle cx="66" cy="100" r="32" fill="none" stroke="${АКЦЕНТ}" stroke-width="17"/>
    <g fill="none" stroke="${АКЦЕНТ}" stroke-width="14" stroke-linecap="round">
      <path d="M114 84 Q 140 62 166 62"/>
      <path d="M120 100 H 180"/>
      <path d="M114 116 Q 140 138 166 138"/>
    </g>`,

  // «Э» — монограмма «Эксперт», собранная из отрезков трубы
  2: `
    <g fill="none" stroke="${АКЦЕНТ}" stroke-width="22" stroke-linecap="round">
      <path d="M57.4 70.2 A 52 52 0 1 1 57.4 129.8"/>
      <path d="M84 100 H 140"/>
    </g>`,

  // «Эмблема» — плотный круг-торец трубы с вырезанной буквой Э
  3: `
    <circle cx="100" cy="100" r="78" fill="${АКЦЕНТ}"/>
    <g fill="none" stroke="${ФОН}" stroke-width="17" stroke-linecap="round" transform="translate(-3 0)">
      <path d="M74.5 78.7 A 36 36 0 1 1 74.5 121.3"/>
      <path d="M93 100 H 128"/>
    </g>`,
};

const svg = (n, размер) =>
  `<svg viewBox="0 0 200 200" width="${размер}" height="${размер}" xmlns="http://www.w3.org/2000/svg">
     <rect width="200" height="200" fill="${ФОН}"/>${ЗНАКИ[n]}</svg>`;
