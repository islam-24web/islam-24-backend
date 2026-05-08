#!/usr/bin/env node
/**
 * ═════════════════════════════════════════════════════════════════
 *  Jobs MVP seeder — sources + bilingual job-categories
 * ═════════════════════════════════════════════════════════════════
 *
 *  Usage:
 *    cd backend
 *    STRAPI_URL=http://localhost:1337 \
 *    STRAPI_SEED_TOKEN=<your-local-full-access-token> \
 *    node scripts/seed-jobs-mvp.js
 *
 *  Or set them in backend/.env.local and:
 *    node --env-file=.env.local scripts/seed-jobs-mvp.js
 *
 *  Idempotent: re-running skips existing sources (by slug) and
 *  existing job-categories (by EN slug).
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const STRAPI_URL = (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
const TOKEN = process.env.STRAPI_SEED_TOKEN || process.env.STRAPI_API_TOKEN;

if (!TOKEN) {
  console.error("✗ Missing STRAPI_SEED_TOKEN (or STRAPI_API_TOKEN).");
  console.error("  Create one in Strapi admin → Settings → API Tokens (Full access).");
  process.exit(1);
}

const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

const SEED_DIR = path.join(__dirname, "_SEED", "seed-data");
const sources = JSON.parse(fs.readFileSync(path.join(SEED_DIR, "sources.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(SEED_DIR, "job-categories.json"), "utf8"));

// ───────────────────────── helpers ─────────────────────────

async function api(method, endpoint, body) {
  const url = `${STRAPI_URL}/api/${endpoint.replace(/^\//, "")}`;
  const res = await fetch(url, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

async function findBySlug(endpoint, slug, locale) {
  const q = new URLSearchParams();
  q.set("filters[slug][$eq]", slug);
  q.set("pagination[limit]", "1");
  if (locale) q.set("locale", locale);
  const { ok, json } = await api("GET", `${endpoint}?${q}`);
  if (!ok || !json?.data?.length) return null;
  return json.data[0];
}

// ───────────────────────── preflight ─────────────────────────

async function preflight() {
  console.log(`→ Strapi at ${STRAPI_URL}`);
  const { ok, status } = await api("GET", "i18n/locales");
  if (!ok) {
    console.warn(`⚠ Cannot read /api/i18n/locales (HTTP ${status}). Proceeding without locale verification.`);
    console.warn("  If category AR localizations fail, ensure Arabic (ar) is added in Settings → Internationalization.");
    return;
  }
  const { json } = await api("GET", "i18n/locales");
  const codes = (json || []).map((l) => l.code);
  console.log(`  locales found: ${codes.join(", ") || "(none)"}`);
  if (!codes.includes("en")) {
    console.error("✗ English (en) locale missing. Aborting.");
    process.exit(1);
  }
  if (!codes.includes("ar")) {
    console.error("✗ Arabic (ar) locale missing. Add it in Strapi admin → Settings → Internationalization → Add new locale (code: ar).");
    process.exit(1);
  }
}

// ───────────────────────── sources ─────────────────────────

async function seedSources() {
  console.log("\n→ Sources");
  let created = 0, skipped = 0, failed = 0;
  for (const src of sources) {
    const existing = await findBySlug("sources", src.slug);
    if (existing) {
      console.log(`  · skip   ${src.name} (already exists)`);
      skipped++;
      continue;
    }
    const { ok, status, json } = await api("POST", "sources", { data: src });
    if (ok) {
      console.log(`  ✓ create ${src.name}`);
      created++;
    } else {
      console.error(`  ✗ fail   ${src.name} — HTTP ${status}: ${JSON.stringify(json?.error || json).slice(0, 200)}`);
      failed++;
    }
  }
  console.log(`  ${created} created, ${skipped} skipped, ${failed} failed`);
}

// ─────────────────────── job-categories ───────────────────────

async function seedJobCategories() {
  console.log("\n→ Job Categories (bilingual)");
  let created = 0, skipped = 0, failed = 0;
  let arCreated = 0, arSkipped = 0, arFailed = 0;

  for (const cat of categories) {
    const enSlug = cat.en.slug;
    const enExisting = await findBySlug("job-categories", enSlug, "en");
    let documentId;

    if (enExisting) {
      documentId = enExisting.documentId;
      console.log(`  · skip EN  ${cat.en.name}`);
      skipped++;
    } else {
      const enBody = {
        data: {
          name: cat.en.name,
          slug: cat.en.slug,
          description: cat.en.description,
          icon: cat.icon,
          locale: "en",
          publishedAt: new Date().toISOString(),
        },
      };
      const { ok, status, json } = await api("POST", "job-categories", enBody);
      if (!ok) {
        console.error(`  ✗ EN  ${cat.en.name} — HTTP ${status}: ${JSON.stringify(json?.error || json).slice(0, 200)}`);
        failed++;
        continue;
      }
      documentId = json.data.documentId;
      console.log(`  ✓ EN  ${cat.en.name} → ${documentId}`);
      created++;
    }

    const arExisting = await findBySlug("job-categories", cat.ar.slug, "ar");
    if (arExisting && arExisting.documentId === documentId) {
      console.log(`  · skip AR  ${cat.ar.name}`);
      arSkipped++;
      continue;
    }

    const arBody = {
      data: {
        name: cat.ar.name,
        slug: cat.ar.slug,
        description: cat.ar.description,
        publishedAt: new Date().toISOString(),
      },
    };
    const { ok, status, json } = await api(
      "PUT",
      `job-categories/${documentId}?locale=ar`,
      arBody
    );
    if (ok) {
      console.log(`  ✓ AR  ${cat.ar.name}`);
      arCreated++;
    } else {
      console.error(`  ✗ AR  ${cat.ar.name} — HTTP ${status}: ${JSON.stringify(json?.error || json).slice(0, 200)}`);
      arFailed++;
    }
  }

  console.log(`  EN: ${created} created, ${skipped} skipped, ${failed} failed`);
  console.log(`  AR: ${arCreated} created, ${arSkipped} skipped, ${arFailed} failed`);
}

// ───────────────────────── run ─────────────────────────

(async () => {
  const t0 = Date.now();
  await preflight();
  await seedSources();
  await seedJobCategories();
  console.log(`\n✓ done in ${Date.now() - t0}ms`);
})().catch((e) => {
  console.error("\n✗ fatal:", e);
  process.exit(1);
});
