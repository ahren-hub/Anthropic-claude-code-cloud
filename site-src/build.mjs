// Assemble the self-contained pages in ../site/ from pages/ + partials/ + photos/.
// Usage: node site-src/build.mjs
//
// Directives understood in pages (and inside included partials):
//   <!-- @include NAME key="value" -->  partials/NAME.html with {{key}} filled in
//   <!-- @include shared-js -->         partials/shared.js wrapped in <script>
//   /*@data:NAME*/[]  or  {}            JSON from DATA below (NAME:arg,arg → args)
//   <!-- @photo-stream -->              one <script> per gallery photo so tiles
//                                       fill in progressively while the page loads
//   src="@photo:SLUG"  alt="@alt:SLUG"  a gallery-size photo + its alt text, inline
import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = join(SRC, '..', 'site');
const read = (p) => readFileSync(join(SRC, p), 'utf8');

const SCENES = {
  index: 'SC. 00 — Home',
  commercial: 'SC. 01 — Commercial',
  cultural: 'SC. 02 — Cultural',
  portfolio: 'SC. 03 — Portfolio',
  about: 'SC. 05 — About',
  contact: 'SC. 06 — Start a project',
};
const PAGES = readdirSync(join(SRC, 'pages')).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5));
const PHOTOS = JSON.parse(read('photos/manifest.json'));

const uri = (file, mime) => `data:${mime};base64,${readFileSync(join(SRC, 'photos', file)).toString('base64')}`;
const full = (p) => uri(`full/${p.slug}.webp`, 'image/webp');
const thumb = (p) => uri(`helix/${p.slug}.jpg`, 'image/jpeg');
const meta = ({ slug, title, cat, alt, ar }) => ({ slug, title, cat, alt, ar });
function pick(slugs) {
  return slugs.map((s) => {
    const p = PHOTOS.find((x) => x.slug === s);
    if (!p) throw new Error(`unknown photo slug "${s}"`);
    return p;
  });
}

const DATA = {
  pages: () => PAGES,
  scenes: () => SCENES,
  photos: () => PHOTOS.map(meta),                                   // metadata only
  'photos-helix': () => PHOTOS.map((p) => ({ u: thumb(p), ar: p.ar })),
  'photo-full': (args) => pick(args).map((p) => ({ ...meta(p), u: full(p) })),
  'photo-thumb': (args) => pick(args).map((p) => ({ ...meta(p), u: thumb(p) })),
};

function include(name, attrs, page) {
  if (name === 'shared-js') return `<script>\n${read('partials/shared.js')}</script>`;
  const vars = { scene: SCENES[page] || '' };
  for (const [, k, v] of attrs.matchAll(/(\w+)="([^"]*)"/g)) vars[k] = v;
  return read(`partials/${name}.html`).replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in vars)) throw new Error(`${page}: partial "${name}" needs ${k}="…"`);
    return vars[k];
  });
}

function build(page) {
  let html = read(`pages/${page}.html`);
  html = html.replace(/<!-- @include ([\w-]+)((?: \w+="[^"]*")*) -->/g, (m, name, attrs) => include(name, attrs, page));
  html = html.replace(/\/\*@data:([\w-]+)(?::([\w,-]+))?\*\/(\[\]|\{\})/g, (m, name, args) => {
    if (!DATA[name]) throw new Error(`${page}: unknown data "${name}"`);
    return JSON.stringify(DATA[name](args ? args.split(',') : []));
  });
  html = html.replace('<!-- @photo-stream -->', () => PHOTOS
    .map((p, i) => `<script>AHRDVS.photo(${i},${JSON.stringify(full(p))})</script>`).join('\n'));
  const attr = (s) => `"${s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}"`;
  html = html.replace(/"@photo:([\w-]+)"/g, (m, s) => attr(full(pick([s])[0])));
  html = html.replace(/"@alt:([\w-]+)"/g, (m, s) => attr(pick([s])[0].alt));
  html = html.replace(/"@brand:([\w-]+)\.(webp|png)"/g, (m, n, e) => attr(uri(`brand/${n}.${e}`, `image/${e}`)));
  html = html.replace(/"@font:([\w.-]+)\.woff2"/g, (m, n) => `"data:font/woff2;base64,${readFileSync(join(SRC, 'fonts', n + '.woff2')).toString('base64')}"`);
  html = html.replace(/"@founder:([\w-]+)"/g, (m, n) => attr(uri(`founder/${n}.webp`, 'image/webp')));
  const left = html.match(/<!-- @[\w-]+[^>]*-->|\/\*@data:[^*]*\*\/|\{\{\w+\}\}|"@(photo|alt|founder|brand|font):/);
  if (left) throw new Error(`${page}: unresolved directive ${left[0]}`);
  return html;
}

mkdirSync(OUT, { recursive: true });
for (const page of PAGES) {
  const file = join(OUT, `${page}.html`);
  writeFileSync(file, build(page));
  console.log(`site/${page}.html`.padEnd(24), `${Math.round(statSync(file).size / 1024)} KB`);
}
