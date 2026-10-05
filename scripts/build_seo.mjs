// SEO build for Vika's Academy (run with Bun from the project root: bun scripts/build_seo.mjs)
//
// The academy app (index.html) renders with JavaScript. For search traffic this script generates plain HTML:
//   glossary/index.html          all terms grouped by mission (DefinedTermSet)
//   glossary/<term-id>/index.html one page per term (DefinedTerm), Ukrainian + English on the same page
//   sitemap.xml, robots.txt
// Terms are always English; explanations UA + EN. Duplicated ids across modules: the first module wins
// (same rule as the app and glossary.json). For developers: in ClayArena these pages become /glossary/<term>/
// with canonical on clayarena.com (see ClayAway rules spec, section "Glossary").
import { mkdirSync, writeFileSync } from "fs";

const BASE = "https://fenix-112323.github.io/vika-academy/";
const TODAY = new Date().toISOString().slice(0, 10);
globalThis.window = {};
for (const f of ["sporting", "compak", "guns", "technique", "organizer"]) await import(`../data/${f}.js`);
const MODS = window.ACADEMY.sort((a, b) => a.order - b.order);
const TERMS = {}; const ORDER = [];
for (const m of MODS) for (const t of m.terms) {
  if (TERMS[t.id]) { (TERMS[t.id].also_in ||= []).push(m.module); continue; }
  TERMS[t.id] = { ...t, module: m.module, module_uk: m.title_uk, module_en: m.title_en }; ORDER.push(t.id);
}
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SET = { "@type": "DefinedTermSet", name: "ClayAway clay shooting glossary", url: BASE + "glossary/" };

const CSS = `:root{color-scheme:dark;--bg:#030712;--surface:rgba(255,255,255,.04);--line:rgba(255,255,255,.1);--ink:#F3F4F6;--soft:#D1D5DB;--muted:#9CA3AF;--em:#34D399;--clay:#FB923C}
*{box-sizing:border-box}html,body{margin:0}body{background:var(--bg);color:var(--ink);font:16px/1.65 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--em)}header{border-bottom:1px solid var(--line)}header .in,main{max-width:900px;margin:0 auto;padding-inline:16px}header .in{padding-block:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
main{padding-block:20px 72px}.brand{color:var(--ink);text-decoration:none;font-weight:700}.crumbs{font-size:13px;color:var(--muted)}.crumbs a{color:var(--muted)}
h1{font-size:clamp(28px,5vw,44px);line-height:1.1;margin:8px 0 6px}h2{font-size:20px;margin:28px 0 8px}.aka{color:var(--muted)}.k{font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--em)}
p,li{color:var(--soft);max-width:72ch}.box{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:10px 0}.tip{background:rgba(251,146,60,.12);border-radius:12px;padding:12px 14px;color:#FED7AA}
.rel{display:flex;gap:6px;flex-wrap:wrap}.rel a{border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-size:13px;text-decoration:none}
.list{columns:3 220px;column-gap:24px}.list a{display:block;padding:2px 0;text-decoration:none;color:var(--soft)}.list a:hover{color:#fff}
.btn{display:inline-block;background:#059669;color:#fff;border-radius:10px;padding:8px 14px;font-weight:600;text-decoration:none;margin-top:8px}
footer{max-width:900px;margin:0 auto;padding:0 16px 40px;font-size:12.5px;color:var(--muted)}`;

function head({ title, desc, url, ld, type = "article" }) {
  return `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="Академія Віки · ClayAway">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}og-image.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png">
<meta property="og:locale" content="uk_UA"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${BASE}og-image.png">
<meta name="theme-color" content="#030712"><link rel="icon" type="image/png" href="${BASE}favicon.png">
${ld.map(x => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join("\n")}
<style>${CSS}</style>
</head>
<body>
<header><div class="in"><a class="brand" href="${BASE}">Академія Віки</a><nav class="crumbs"><a href="${BASE}glossary/">Глосарій</a></nav><span style="flex:1"></span><a href="${BASE}">Навчатися в Академії →</a></div></header>`;
}
const foot = `<footer>Академія Віки · ClayAway by ClayArena. Терміни англійською, пояснення українською та англійською. Правила й цифри звіряйте з офіційними регламентами FITASC.</footer></body></html>`;

function termPage(id) {
  const t = TERMS[id], url = `${BASE}glossary/${id}/`;
  const title = `${t.term} — що це в стендовій стрільбі | Глосарій ClayAway`;
  const desc = `${t.term}: ${t.short_uk} ${t.short_en}`.slice(0, 300);
  const ld = [
    { "@context": "https://schema.org", "@type": "DefinedTerm", name: t.term, alternateName: t.aka || [], description: `${t.short_uk} / ${t.short_en}`,
      termCode: id, url, inDefinedTermSet: SET, inLanguage: ["uk", "en"] },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Академія Віки", item: BASE },
      { "@type": "ListItem", position: 2, name: "Глосарій", item: BASE + "glossary/" },
      { "@type": "ListItem", position: 3, name: t.term, item: url }] }];
  const rel = (t.related || []).filter(r => TERMS[r]);
  const html = head({ title, desc, url, ld }) + `
<main>
<div class="k">${esc(t.cat)} · ${esc(t.module_uk)}</div>
<h1>${esc(t.term)}</h1>
${t.aka?.length ? `<div class="aka">Також: ${esc(t.aka.join(", "))}</div>` : ""}
<h2>Що це</h2><p><b>${esc(t.short_uk)}</b></p><p lang="en">${esc(t.short_en)}</p>
<h2>Детально</h2><p>${esc(t.long_uk)}</p><p lang="en">${esc(t.long_en)}</p>
${t.uk_usage && t.uk_usage !== "—" ? `<h2>Як кажуть українською</h2><p>${esc(t.uk_usage)}</p>` : ""}
${t.coach_en ? `<h2>Як це звучить на стенді</h2><div class="box"><p lang="en"><b>“${esc(t.coach_en)}”</b></p><p>${esc(t.coach_uk)}</p></div>` : ""}
${t.tip_uk ? `<h2>Порада перекладачеві</h2><div class="tip">${esc(t.tip_uk)}</div>` : ""}
${rel.length ? `<h2>Повʼязані терміни</h2><div class="rel">${rel.map(r => `<a href="${BASE}glossary/${r}/">${esc(TERMS[r].term)}</a>`).join("")}</div>` : ""}
<a class="btn" href="${BASE}">Вивчати в Академії Віки →</a>
</main>` + foot;
  mkdirSync(`glossary/${id}`, { recursive: true });
  writeFileSync(`glossary/${id}/index.html`, html);
  return url;
}

const urls = [BASE, BASE + "glossary/"];
for (const id of ORDER) urls.push(termPage(id));

const listLd = [{ "@context": "https://schema.org", ...SET, description: "Терміни стендової стрільби англійською з поясненнями українською та англійською",
  hasDefinedTerm: ORDER.map(id => ({ "@type": "DefinedTerm", name: TERMS[id].term, url: `${BASE}glossary/${id}/` })) }];
writeFileSync("glossary/index.html", head({ title: `Глосарій стендової стрільби — ${ORDER.length} термінів | Академія Віки`,
  desc: `Sporting, Compak Sporting, рушниці й набої, техніка й мова тренера, організація змагань: ${ORDER.length} англійських термінів з поясненнями українською та англійською.`,
  url: BASE + "glossary/", ld: listLd, type: "website" }) + `
<main><div class="k">ClayAway Academy</div><h1>Глосарій стендової стрільби</h1>
<p>${ORDER.length} термінів англійською — так їх кажуть тренери й судді в усьому світі — з поясненнями українською та англійською.</p>
${MODS.map(m => `<h2>${esc(m.title_uk)}</h2><div class="list">${ORDER.filter(id => TERMS[id].module === m.module).sort((a, b) => TERMS[a].term.localeCompare(TERMS[b].term)).map(id => `<a href="${BASE}glossary/${id}/">${esc(TERMS[id].term)}</a>`).join("")}</div>`).join("\n")}
</main>` + foot);

writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${BASE}sitemap.xml\n`);
console.log("terms", ORDER.length, "urls", urls.length);
