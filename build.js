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
  ["/maps/", "Maps", "maps"],
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
  <link
