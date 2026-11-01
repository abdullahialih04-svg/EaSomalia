// Fetches open Somalia jobs from the ReliefWeb API and saves them to data/jobs.json.
// Needs Node 18+ and an approved appname in the RELIEFWEB_APPNAME environment variable.
import { readFile, writeFile, mkdir } from "node:fs/promises";

const APPNAME = process.env.RELIEFWEB_APPNAME;
if (!APPNAME) {
  console.error("Set RELIEFWEB_APPNAME first.");
  process.exit(1);
}

// Leave empty for all Somalia jobs. To limit to selected organizations,
// list their ReliefWeb short names, for example ["UNICEF", "WFP", "IOM"].
const ORGS = [];

const OUT = "data/jobs.json";
const BASE = process.env.RELIEFWEB_BASE ?? "https://api.reliefweb.int"; // only changed for testing

const conditions = [{ field: "country.iso3", value: "SOM" }];
if (ORGS.length) {
  conditions.push({ field: "source.shortname", value: ORGS, operator: "OR" });
}

const body = {
  filter: { operator: "AND", conditions },
  fields: { include: ["title", "url", "source.name", "date.created", "date.closing", "city"] },
  sort: ["date.created:desc"],
  limit: 100,
};

const res = await fetch(`${BASE}/v2/jobs?appname=${encodeURIComponent(APPNAME)}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`ReliefWeb status: ${res.status}`);

if (!res.ok) {
  // Exit without touching the old file, so the site keeps showing the last good list.
  console.error(text.slice(0, 600));
  process.exit(1);
}

const json = JSON.parse(text);
const data = json.data ?? [];
console.log(`ReliefWeb returned ${data.length} jobs (totalCount: ${json.totalCount})`);
if (!data.length) console.log(text.slice(0, 600));

// Some fields come back as plain text and some as objects with a name, so handle both.
const label = (x) => (typeof x === "string" ? x : x?.name);
const first = (x) => label(Array.isArray(x) ? x[0] : x);

const now = Date.now();
const jobs = data
  .map((j) => ({
    id: j.id,
    title: j.fields.title,
    org: first(j.fields.source),
    city: first(j.fields.city),
    posted: j.fields.date?.created ?? null,
    closes: j.fields.date?.closing ?? null,
    url: j.fields.url,
  }))
  // Keep only jobs that have not closed yet.
  .filter((j) => !j.closes || new Date(j.closes).getTime() > now);

console.log(`${jobs.length} of them are still open.`);

// Only write when the list changed, so the repo does not get a commit every run.
let previous = [];
try {
  previous = JSON.parse(await readFile(OUT, "utf8")).jobs ?? [];
} catch {}

if (JSON.stringify(previous) === JSON.stringify(jobs)) {
  console.log("No changes to save.");
} else {
  await mkdir("data", { recursive: true });
  await writeFile(OUT, JSON.stringify({ updated: new Date().toISOString(), jobs }, null, 2) + "\n");
  console.log(`Saved ${jobs.length} open jobs.`);
}
