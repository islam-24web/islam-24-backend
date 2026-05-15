#!/usr/bin/env node
/**
 * Phase C0 — editorial cleanup against prod Strapi.
 *
 * Idempotent. Dry-run by default. Run with --apply to actually mutate.
 * Reads STRAPI_URL + STRAPI_TOKEN from env.
 *
 * What it does (in order, each step independent + safe to re-run):
 *   1. Unpublish auto-generated stub articles (slug or title pattern).
 *   2. Move "Surah Rahman" article out of `islamic-names` → `quran-tafsir`.
 *   3. Create `mental-health` category if missing.
 *   4. Assign the depression article → `mental-health`.
 *   5. Set `duas` as parent of `istikhara-dua` (uses existing parent/children schema).
 *   6. Rename الأذكار category slug `category` → `adhkar`.
 *   7. Delete `islamic-names` category (only if it has zero articles now).
 *
 * NOT done by this script (owner-side, in Strapi admin UI):
 *   - Setting admin labels / descriptions for Phase B fields.
 *   - Polishing surviving editorial articles.
 *
 * Take a Railway Postgres snapshot before running with --apply.
 */

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://islam-24-backend-production.up.railway.app";
const TOKEN = process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;
const APPLY = process.argv.includes("--apply");
const VERBOSE = process.argv.includes("--verbose");

if (!TOKEN) {
  console.error("ERROR: STRAPI_API_TOKEN (or STRAPI_TOKEN) must be set in env.");
  process.exit(1);
}

// Titles that mark an auto-generated stub:
const STUB_TITLE_PATTERNS = [
  /شرح\s+كامل\s+بالتفصيل\s+من\s+الكتاب\s+والسنة/u,
  /Complete\s+Islamic\s+Guide\s+with\s+Evidence/i,
];
// Titles that must NEVER be classified as stubs even if a stub regex matches:
const SAFE_TITLE_PATTERNS = [
  /شرح\s+مفصل\s+من\s+الكتاب\s+والسنة\s+وأقوال\s+العلماء/u, // Asma Allah pattern
];
const STUB_SLUG_PATTERNS = [
  /^ar-[a-f0-9]+-[a-f0-9]+$/, // ar-deadbe-deadbe form
  /^[a-z0-9-]+-[a-f0-9]{6}$/, // topic-deadbe form
];
const TEST_SLUGS = new Set(["article", "test-istikhara-001"]);

const log = {
  info: (m) => console.log(m),
  step: (m) => console.log(`\n=== ${m} ===`),
  detail: (m) => VERBOSE && console.log(`   ${m}`),
  action: (verb, m) => console.log(`   ${APPLY ? verb : "[dry] " + verb}  ${m}`),
  skip: (m) => console.log(`   skip  ${m}`),
  warn: (m) => console.log(`   WARN  ${m}`),
};

async function api(method, path, body) {
  const url = `${STRAPI_URL}/api${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status} ${res.statusText} :: ${text.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

async function fetchAll(path) {
  const out = [];
  let page = 1;
  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await api(
      "GET",
      `${path}${sep}pagination[page]=${page}&pagination[pageSize]=100`,
    );
    out.push(...(res.data || []));
    const pc = res.meta?.pagination?.pageCount ?? 1;
    if (page >= pc) break;
    page += 1;
  }
  return out;
}

function isStub(article) {
  const title = article.title || "";
  const slug = article.slug || "";
  if (TEST_SLUGS.has(slug) || title.trim().toLowerCase() === "test") return true;
  if (SAFE_TITLE_PATTERNS.some((r) => r.test(title))) return false;
  if (STUB_TITLE_PATTERNS.some((r) => r.test(title))) return true;
  if (STUB_SLUG_PATTERNS.some((r) => r.test(slug))) return true;
  return false;
}

// ─── Steps ────────────────────────────────────────────────────────────

async function step1_unpublishStubs() {
  log.step("Step 1 — Unpublish auto-generated stubs");
  const articles = await fetchAll(
    "/articles?fields[0]=title&fields[1]=slug&fields[2]=publishedAt",
  );
  const stubs = articles.filter(isStub);
  log.info(`   ${articles.length} articles total · ${stubs.length} match stub patterns`);
  for (const a of stubs) {
    const alreadyUnpublished = !a.publishedAt;
    if (alreadyUnpublished) {
      log.skip(`already unpublished — "${a.title.slice(0, 60)}" (${a.slug})`);
      continue;
    }
    log.action("unpublish", `"${a.title.slice(0, 60)}" (${a.slug})`);
    if (APPLY) {
      await api("PUT", `/articles/${a.documentId}`, { data: { publishedAt: null } });
    }
  }
}

async function step2_moveSurahRahman() {
  log.step("Step 2 — Move Surah Rahman article out of islamic-names");
  const islamicNames = await fetchAll(
    "/categories?filters[slug][$eq]=islamic-names&populate[articles][fields][0]=title&populate[articles][fields][1]=slug",
  );
  if (islamicNames.length === 0) {
    log.skip("islamic-names category not found (already deleted?)");
    return;
  }
  const target = await fetchAll("/categories?filters[slug][$eq]=quran-tafsir");
  if (target.length === 0) {
    log.warn("quran-tafsir category missing — skipping move");
    return;
  }
  const arts = islamicNames[0].articles || [];
  if (arts.length === 0) {
    log.skip("islamic-names has 0 articles — nothing to move");
    return;
  }
  for (const a of arts) {
    log.action("move →quran-tafsir", `"${a.title.slice(0, 60)}" (${a.slug})`);
    if (APPLY) {
      await api("PUT", `/articles/${a.documentId}`, {
        data: { category: target[0].documentId },
      });
    }
  }
}

async function step3_createMentalHealth() {
  log.step("Step 3 — Create mental-health category");
  const existing = await fetchAll("/categories?filters[slug][$eq]=mental-health");
  if (existing.length > 0) {
    log.skip("mental-health already exists");
    return existing[0];
  }
  log.action("create", "category mental-health");
  if (APPLY) {
    const res = await api("POST", "/categories", {
      data: {
        name: "الصحة النفسية",
        slug: "mental-health",
        description:
          "محتوى عن الصحة النفسية والاضطرابات النفسية وأساليب العلاج من منظور علمي وإسلامي.",
      },
    });
    return res.data;
  }
  return null;
}

async function step4_assignDepression(mentalHealthCat) {
  log.step("Step 4 — Assign the depression article to mental-health");
  const candidates = await fetchAll(
    "/articles?filters[slug][$eq]=depression-causes-symptoms-treatment-guide&populate[category][fields][0]=slug",
  );
  if (candidates.length === 0) {
    log.warn("depression article not found by slug");
    return;
  }
  const a = candidates[0];
  if (a.category?.slug === "mental-health") {
    log.skip("depression article already in mental-health");
    return;
  }
  if (!mentalHealthCat) {
    log.skip("(dry-run: would assign to mental-health once created)");
    return;
  }
  log.action("assign", `"${a.title.slice(0, 60)}" → mental-health`);
  if (APPLY) {
    await api("PUT", `/articles/${a.documentId}`, {
      data: { category: mentalHealthCat.documentId },
    });
  }
}

async function step5_subcatIstikhara() {
  log.step("Step 5 — Set duas as parent of istikhara-dua");
  const duas = await fetchAll("/categories?filters[slug][$eq]=duas");
  const istikhara = await fetchAll(
    "/categories?filters[slug][$eq]=istikhara-dua&populate[parent][fields][0]=slug",
  );
  if (duas.length === 0 || istikhara.length === 0) {
    log.warn("duas or istikhara-dua category missing");
    return;
  }
  if (istikhara[0].parent?.slug === "duas") {
    log.skip("istikhara-dua already parented to duas");
    return;
  }
  log.action("parent", "istikhara-dua → duas");
  if (APPLY) {
    await api("PUT", `/categories/${istikhara[0].documentId}`, {
      data: { parent: duas[0].documentId },
    });
  }
}

async function step6_renameAdhkar() {
  log.step("Step 6 — Rename الأذكار slug `category` → `adhkar`");
  const cats = await fetchAll("/categories?filters[slug][$eq]=category");
  if (cats.length === 0) {
    const already = await fetchAll("/categories?filters[slug][$eq]=adhkar");
    log.skip(already.length ? "already renamed to `adhkar`" : "no category with slug `category` found");
    return;
  }
  log.action("rename-slug", `category → adhkar  (id=${cats[0].id})`);
  if (APPLY) {
    await api("PUT", `/categories/${cats[0].documentId}`, {
      data: { slug: "adhkar" },
    });
  }
}

async function step7_deleteIslamicNames() {
  log.step("Step 7 — Delete `islamic-names` category (only if empty)");
  const cats = await fetchAll(
    "/categories?filters[slug][$eq]=islamic-names&populate[articles][fields][0]=slug",
  );
  if (cats.length === 0) {
    log.skip("islamic-names already deleted");
    return;
  }
  const arts = cats[0].articles || [];
  if (arts.length > 0) {
    log.warn(
      `islamic-names still has ${arts.length} article(s) — NOT deleting. Run again after step 2.`,
    );
    arts.forEach((a) => log.detail(`  - ${a.slug}`));
    return;
  }
  log.action("delete", `category islamic-names (documentId=${cats[0].documentId})`);
  if (APPLY) {
    await api("DELETE", `/categories/${cats[0].documentId}`);
  }
}

// ─── Run ──────────────────────────────────────────────────────────────

(async () => {
  log.info(`Phase C0 cleanup — target: ${STRAPI_URL}`);
  log.info(`Mode: ${APPLY ? "APPLY (mutating prod)" : "DRY RUN (no writes)"}`);
  try {
    await step1_unpublishStubs();
    await step2_moveSurahRahman();
    const mh = await step3_createMentalHealth();
    await step4_assignDepression(mh);
    await step5_subcatIstikhara();
    await step6_renameAdhkar();
    await step7_deleteIslamicNames();
    log.info(`\nDone. ${APPLY ? "" : "Re-run with --apply to perform writes."}`);
  } catch (err) {
    console.error("\nFAILED:", err.message);
    process.exit(1);
  }
})();
