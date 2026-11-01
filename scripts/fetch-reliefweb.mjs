
/**
 * EA SOMALIA — RELIEFWEB JOB FETCHER
 *
 * Fetches published Somalia jobs from ReliefWeb
 * and saves them to data/jobs.json.
 *
 * Requirements:
 * - Node.js 18+
 * - Approved RELIEFWEB_APPNAME GitHub secret
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";

// ==========================================
// 1. Configuration
// ==========================================

const APPNAME = process.env.RELIEFWEB_APPNAME;

if (!APPNAME) {
  console.error("ERROR: RELIEFWEB_APPNAME is missing.");
  process.exit(1);
}

const API_URL =
  "https://api.reliefweb.int/v2/jobs?appname=" +
  encodeURIComponent(APPNAME) +
  "&verbose=1";

const OUTPUT_FILE = "data/jobs.json";

const LIMIT = 100;

// Optional organization filter.
// Leave empty to retrieve all Somalia jobs.
const ORGS = [];

// ==========================================
// 2. Build API request
// ==========================================

const conditions = [
  {
    field: "country.iso3",
    value: "SOM"
  }
];

if (ORGS.length > 0) {
  conditions.push({
    field: "source.shortname",
    value: ORGS,
    operator: "OR"
  });
}

const requestBody = {
  preset: "latest",

  profile: "list",

  filter: {
    operator: "AND",
    conditions
  },

  fields: {
    include: [
      "title",
      "url",
      "source.name",
      "date.created",
      "date.closing",
      "city.name",
      "country.iso3",
      "country.name"
    ]
  },

  sort: ["date.created:desc"],

  limit: LIMIT
};

// ==========================================
// 3. Fetch jobs
// ==========================================

console.log("------------------------------------");
console.log("EA SOMALIA — RELIEFWEB JOB FETCHER");
console.log("------------------------------------");

console.log("Requesting Somalia jobs from ReliefWeb...");

let response;

try {
  response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },

    body: JSON.stringify(requestBody)
  });
} catch (error) {
  console.error("ERROR: Could not connect to ReliefWeb.");
  console.error(error.message);
  process.exit(1);
}

console.log("HTTP status:", response.status);

// ==========================================
// 4. Handle API errors
// ==========================================

const responseText = await response.text();

if (!response.ok) {
  console.error("ReliefWeb API request failed.");
  console.error(responseText.slice(0, 2000));

  if (response.status === 403) {
    console.error(
      "Check whether your RELIEFWEB_APPNAME is approved."
    );
  }

  if (response.status === 400) {
    console.error(
      "Check your API request parameters and filters."
    );
  }

  process.exit(1);
}

// ==========================================
// 5. Validate API response
// ==========================================

let json;

try {
  json = JSON.parse(responseText);
} catch {
  console.error("ERROR: ReliefWeb returned invalid JSON.");
  console.error(responseText.slice(0, 1000));
  process.exit(1);
}

if (!Array.isArray(json.data)) {
  console.error("ERROR: Unexpected ReliefWeb response.");
  console.error("Expected a data array.");
  console.error(JSON.stringify(json, null, 2).slice(0, 2000));
  process.exit(1);
}

console.log("Total matching jobs:", json.totalCount);
console.log("Jobs returned:", json.data.length);

// ==========================================
// 6. Protect against unexpected empty results
// ==========================================

// Do not overwrite the existing file with an empty list.
// Check the API query and GitHub Actions logs first.

if (json.data.length === 0) {
  console.error("------------------------------------");
  console.error("WARNING: ReliefWeb returned zero jobs.");
  console.error("The existing jobs.json will be preserved.");
  console.error("------------------------------------");

  console.error(
    "Check the Somalia country filter, API appname, and API response."
  );

  process.exit(1);
}

// ==========================================
// 7. Normalize ReliefWeb data
// ==========================================

function getName(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return getName(value[0]);
  }

  if (typeof value === "object") {
    return value.name || "";
  }

  return "";
}

const now = Date.now();

const jobs = json.data
  .map((item) => {
    const fields = item.fields || {};

    return {
      id: String(item.id),

      title: fields.title || "",

      url: fields.url || "",

      org: getName(fields.source),

      city: getName(fields.city),

      country: getName(fields.country) || "Somalia",

      posted: fields.date?.created || null,

      closes: fields.date?.closing || null
    };
  })

  // Validate required information.
  .filter((job) => {
    return (
      job.id &&
      job.title &&
      job.url.startsWith("https://reliefweb.int/")
    );
  })

  // Remove expired jobs.
  .filter((job) => {
    if (!job.closes) return true;

    const closingDate = new Date(job.closes).getTime();

    // Keep jobs with missing or invalid closing dates.
    if (!Number.isFinite(closingDate)) return true;

    return closingDate > now;
  });

// ==========================================
// 8. Validate final results
// ==========================================

console.log("------------------------------------");
console.log("Jobs returned:", json.data.length);
console.log("Valid jobs:", jobs.length);
console.log("------------------------------------");

if (jobs.length === 0) {
  console.error("ERROR: No valid open jobs were found.");
  console.error("Existing jobs.json will not be overwritten.");
  process.exit(1);
}

// ==========================================
// 9. Compare with existing data
// ==========================================

let previousJobs = [];

try {
  const previousFile = await readFile(OUTPUT_FILE, "utf8");

  const previousData = JSON.parse(previousFile);

  if (Array.isArray(previousData.jobs)) {
    previousJobs = previousData.jobs;
  }
} catch {
  console.log("No previous jobs file found.");
}

const previousJSON = JSON.stringify(previousJobs);
const currentJSON = JSON.stringify(jobs);

// ==========================================
// 10. Save updated jobs
// ==========================================

await mkdir("data", { recursive: true });

if (previousJSON === currentJSON) {
  console.log("No changes to job listings.");
  console.log("Existing jobs.json remains unchanged.");
} else {
  const output = {
    updated: new Date().toISOString(),
    jobs
  };

  await writeFile(
    OUTPUT_FILE,
    JSON.stringify(output, null, 2) + "\n",
    "utf8"
  );

  console.log("------------------------------------");
  console.log("SUCCESS: Jobs saved.");
  console.log("Total saved:", jobs.length);
  console.log("Output:", OUTPUT_FILE);
  console.log("------------------------------------");
}
