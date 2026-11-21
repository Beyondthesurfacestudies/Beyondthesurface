// Beyond the Surface – builds the website into the folder _site.
// All files live side by side (no folders needed).
// A study is any file named like 2026-11-01-some-title.md
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const OUT = "_site";
const md = new MarkdownIt({ html: true, typographer: true });

const read = (f, fallback = "") => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : fallback);
const site = {
  title: "Beyond the Surface",
  tagline: "Bible studies that look past the obvious and dig into the text.",
  description: "In-depth Bible studies: context, original language and application, one passage at a time.",
  author: "Charlotte",
  language: "en",
  url: "https://beyondthesurfacestudies.com",
  instagram: "https://www.instagram.com/beyond_the_surface_studies/",
  bibleapp: "https://www.bible.com/nl/organizations/a25773d0-84ae-4698-b7bc-ec6a4838bd63",
  newsletter: "",
  ...JSON.parse(read("site.json", "{}")),
};
site.url = site.url.replace(/\/$/, "");

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const readableDate = (d) => d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const isoDate = (d) => d.toISOString().slice(0, 10);
const readingTime = (html) => Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200)) + " min read";
const year = new Date().getFullYear();
const LOGO = ["logo.jpg", "logo.jpeg", "logo.png", "logo.webp", "Logo.jpg", "Logo.png"].find((f) => fs.existsSync(f));

const NAV = [
  ["/studies/", "Studies", "studies"],
  ["/themes/", "Themes", "themes"],
  ["/words/", "Word Studies", "words"],
  ["/plans/", "Reading Plans", "plans"],
  ["/about/", "About", "about"],
];

const newsletter = () => site.newsletter ? `<section class="newsletter">
  <div class="wrap narrow newsletter-inner">
    <h2>Get new studies in your inbox</h2>
    <p>A short email whenever a new study is published. No spam, unsubscribe anytime.</p>
    <form action="${esc(site.newsletter)}" method="post" class="newsletter-form">
      <input type="email" name="email_address" placeholder="Your email address" aria-label="Your email address" required>
      <button type="submit" class="btn">Subscribe</button>
    </form>
  </div>
</section>` : "";

function write(url, content) {
  const file = path.join(OUT, url.endsWith("/") ? url + "index.html" : url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// ---------- Studies ----------
const STUDY_FILE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;
const studies = fs.readdirSync(".")
  .filter((f) => STUDY_FILE.test(f))
  .map((f) => {
    const [, datePart, slugPart] = f.match(STUDY_FILE);
    const { data, content } = matter(read(f));
    const date = data.date ? new Date(data.date) : new Date(datePart + "T00:00:00Z");
    const slug = slugPart.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const topics = Array.isArray(data.topics) ? data.topics.map(String) : data.topics ? [String(data.topics)] : [];
    return { ...data, title: data.title || slugPart.replace(/-/g, " "), topics, date, slug, url: `/studies/${slug}/`, html: md.render(content) };
  })
  .sort((a, b) => b.date - a.date);

// ---------- Layout ----------
function page({ title, description, url, type = "website", body, current = "", image = "" }) {
  const ogImage = image || LOGO;
  const fullTitle = title && title !== site.title ? `${esc(title)} · ${esc(site.title)}` : esc(site.title);
  return `<!DOCTYPE html>
<html lang="${site.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fullTitle}</title>
  <meta name="description" content="${esc(description || site.description)}">
  <link rel="canonical" href="${site.url}${url}">
  <meta property="og:site_name" content="${esc(site.title)}">
  <meta property="og:title" content="${esc(title || site.title)}">
  <meta property="og:description" content="${esc(description || site.description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${site.url}${url}">
  ${ogImage ? `<meta property="og:image" content="${site.url}/${ogImage}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="/">
        <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 11c4-3 8.5-3 13 0s9 3 13 0" /><path class="d2" d="M8 18.5c2.7-1.8 5.3-1.8 8 0s5.3 1.8 8 0" /><path class="d3" d="M12 25c1.3-.9 2.7-.9 4 0s2.7.9 4 0" /></svg>
        <span>${esc(site.title)}</span>
      </a>
      <nav class="nav" aria-label="Main">
${NAV.map(([href, label, key]) => `        <a href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`).join("\n")}
      </nav>
    </div>
  </header>
  <main id="main">
${body}
  </main>
  ${newsletter()}
  <footer class="site-footer">
    <div class="wrap footer-inner">
      <p class="footer-verse">“Deep calls to deep.” <span>Psalm 42:7</span></p>
      <p class="footer-links">${site.instagram ? `<a href="${esc(site.instagram)}">Instagram</a>` : ""}${site.bibleapp ? `<a href="${esc(site.bibleapp)}">Bible App</a>` : ""}<span>© ${year} ${esc(site.title)}</span></p>
    </div>
  </footer>
</body>
</html>`;
}

const card = (s) => `<a class="card${s.image ? " has-image" : ""}" href="${s.url}" data-search="${esc([s.title, s.passage, s.summary, ...s.topics].filter(Boolean).join(" ").toLowerCase())}" data-topics="${esc(s.topics.join("|"))}">
  ${s.image ? `<img class="card-image" src="/${esc(s.image)}" alt="" loading="lazy">` : ""}
  ${s.passage ? `<p class="eyebrow">${esc(s.passage)}</p>` : ""}
  <h3>${esc(s.title)}</h3>
  ${s.summary ? `<p>${esc(s.summary)}</p>` : ""}
  <p class="meta"><time datetime="${isoDate(s.date)}">${readableDate(s.date)}</time>${s.pdf ? ' <span class="pdf-badge">PDF</span>' : ""}</p>
</a>`;

// ---------- Pages ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);

// Home
write("/", page({
  url: "/",
  body: `<section class="hero">
  <div class="wrap hero-inner">
    <div class="hero-text">
      <p class="eyebrow light">Bible studies</p>
      <h1>Go deeper than<br>a first reading.</h1>
      <p class="hero-lede">${esc(site.description)}</p>
      <a class="btn" href="/studies/">Browse the studies</a>
    </div>
    ${LOGO ? `<img class="hero-logo" src="/${LOGO}" alt="Beyond the Surface: sunlight shining down into the deep sea" width="900" height="1124">` : ""}
  </div>
  <svg class="waves" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 60c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0v60H0z" fill="var(--paper)"/>
  </svg>
</section>
<section class="wrap section">
  <div class="section-head">
    <h2>Latest studies</h2>
    <a class="more" href="/studies/">View all →</a>
  </div>
  ${studies.length ? `<div class="grid">${studies.slice(0, 6).map(card).join("\n")}</div>` : `<p class="empty">The first study is on its way.</p>`}
</section>
<section class="wrap section approach">
  <h2>How these studies work</h2>
  <ol class="steps">
    <li><span>1</span><h3>Observe</h3><p>Slow down and read the passage carefully. What does the text actually say?</p></li>
    <li><span>2</span><h3>Interpret</h3><p>Look at context, culture and key words to understand what it meant then.</p></li>
    <li><span>3</span><h3>Apply</h3><p>Ask what it means for us now, and end with questions to reflect on or discuss.</p></li>
  </ol>
</section>`,
}));

// Studies overview
const allTopics = [...new Set(studies.flatMap((s) => s.topics))].sort();
write("/studies/", page({
  title: "Studies", url: "/studies/", current: "studies",
  body: `<section class="wrap section page-head">
  <h1>All studies</h1>
  <p class="lede">${studies.length} ${studies.length === 1 ? "study" : "studies"}, newest first.</p>
  <div class="filters">
    <input id="q" type="search" placeholder="Search by title, passage or topic…" aria-label="Search studies">
    ${allTopics.length ? `<div class="chips" role="group" aria-label="Filter by topic">
      <button class="chip" aria-pressed="true" data-topic="">All</button>
      ${allTopics.map((t) => `<button class="chip" aria-pressed="false" data-topic="${esc(t)}">${esc(t)}</button>`).join("")}
    </div>` : ""}
  </div>
  <div class="grid" id="list">${studies.map(card).join("\n")}</div>
  <p class="empty" id="none" hidden>No studies match your search.</p>
</section>
<script>
  (() => {
    const q = document.getElementById("q"), cards = [...document.querySelectorAll("#list .card")];
    const chips = [...document.querySelectorAll(".chip")], none = document.getElementById("none");
    let topic = "";
    function apply() {
      const term = q.value.trim().toLowerCase(); let shown = 0;
      cards.forEach(c => {
        const ok = (!term || c.dataset.search.includes(term)) && (!topic || c.dataset.topics.split("|").includes(topic));
        c.hidden = !ok; if (ok) shown++;
      });
      none.hidden = shown > 0;
    }
    q.addEventListener("input", apply);
    chips.forEach(b => b.addEventListener("click", () => {
      topic = b.dataset.topic; chips.forEach(x => x.setAttribute("aria-pressed", x === b)); apply();
    }));
  })();
</script>`,
}));

// Individual studies
studies.forEach((s, i) => {
  const older = studies[i + 1], newer = studies[i - 1];
  write(s.url, page({
    title: s.title, description: s.summary, url: s.url, type: "article", current: "studies", image: s.image,
    body: `<article class="study">
  <header class="study-head wrap narrow">
    <a class="back" href="/studies/">← All studies</a>
    ${s.passage ? `<p class="eyebrow">${esc(s.passage)}</p>` : ""}
    <h1>${esc(s.title)}</h1>
    ${s.summary ? `<p class="lede">${esc(s.summary)}</p>` : ""}
    <p class="meta">
      <time datetime="${isoDate(s.date)}">${readableDate(s.date)}</time>
      <span aria-hidden="true">·</span> ${readingTime(s.html)}
      ${s.topics.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
    </p>
  </header>
  <div class="prose wrap narrow">
${s.html}
  </div>
  ${s.pdf ? `<div class="wrap narrow">
    <a class="download" href="/files/${encodeURIComponent(s.pdf)}" download>
      <span class="download-icon" aria-hidden="true">↓</span>
      <span><strong>Download this study</strong><small>PDF · for print or group use</small></span>
    </a>
  </div>` : ""}
  ${older || newer ? `<nav class="pager wrap narrow" aria-label="More studies">
    ${older ? `<a class="pager-link" href="${older.url}"><small>← Older</small>${esc(older.title)}</a>` : "<span></span>"}
    ${newer ? `<a class="pager-link right" href="${newer.url}"><small>Newer →</small>${esc(newer.title)}</a>` : ""}
  </nav>` : ""}
</article>`,
  }));
});

// Simple pages (About, Themes, Word Studies, Reading Plans)
for (const [file, url, title, key] of [
  ["about.md", "/about/", "About", "about"],
  ["themes.md", "/themes/", "Themes", "themes"],
  ["words.md", "/words/", "Word Studies", "words"],
  ["plans.md", "/plans/", "Reading Plans", "plans"],
]) {
  const src = matter(read(file, `# ${title}\n\nComing soon.`));
  const html = md.render(src.content.replace(/<\/?section[^>]*>/g, "").replace(/\{\{\s*site\.author\s*\}\}/g, site.author));
  write(url, page({
    title: src.data.title || title, description: src.data.summary, url, current: key,
    body: `<section class="wrap narrow section prose page-head">\n${html}\n</section>`,
  }));
}

// Static files
for (const f of fs.readdirSync(".")) {
  if (f === "style.css" || /\.(svg|png|jpe?g|webp|gif|ico)$/i.test(f)) fs.copyFileSync(f, path.join(OUT, f));
}
const pdfs = fs.readdirSync(".").filter((f) => f.toLowerCase().endsWith(".pdf"));
if (pdfs.length) {
  fs.mkdirSync(path.join(OUT, "files"), { recursive: true });
  pdfs.forEach((f) => fs.copyFileSync(f, path.join(OUT, "files", f)));
}

// Sitemap + robots
const urls = ["/", "/studies/", "/themes/", "/words/", "/plans/", "/about/", ...studies.map((s) => s.url)];
write("/sitemap.xml", `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join("\n")}
</urlset>`);
write("/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`Built ${studies.length} studies into ${OUT}/`);
