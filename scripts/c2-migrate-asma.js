#!/usr/bin/env node
/**
 * Phase C2 — migrate the 99 Asma Allah articles into divine-name entities.
 *
 * Idempotent. Dry-run by default. Run with --apply to mutate.
 *
 * Sequence (each phase independent + re-runnable):
 *   1. Fetch all articles in `names-of-allah` category.
 *   2. Parse number / arabic / transliteration from each article's slug+title.
 *   3. `--phase=create`: upsert divine-name rows (preserving slug `name-NN-X`).
 *   4. `--phase=pairs`: seed paired-name relations after all 99 rows exist.
 *   5. `--phase=unpublish`: unpublish source articles after rows + pairs verify.
 *
 * Requires that the divine-name content type is live on the backend
 * (i.e., the C2 schema commit must have deployed via Railway).
 *
 * Take a Railway Postgres snapshot before --apply.
 */

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://islam-24-backend-production.up.railway.app";
const TOKEN = process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;
const APPLY = process.argv.includes("--apply");
const SKIP_UNPUBLISH = process.argv.includes("--skip-unpublish");
const PHASE = readPhase();
const DELAY_MS = Number.parseInt(process.env.C2_DELAY_MS || "750", 10);
const MAX_RETRIES = Number.parseInt(process.env.C2_MAX_RETRIES || "4", 10);
const EXPECTED_COUNT = 99;

if (!TOKEN) {
  console.error("ERROR: STRAPI_API_TOKEN must be set in env.");
  process.exit(1);
}

if (APPLY && PHASE === "all") {
  console.error("ERROR: --apply requires --phase=create, --phase=pairs, or --phase=unpublish.");
  process.exit(1);
}

function readPhase() {
  if (process.argv.includes("--create-only")) return "create";
  if (process.argv.includes("--pairs-only")) return "pairs";
  if (process.argv.includes("--unpublish-only")) return "unpublish";
  const arg = process.argv.find((a) => a.startsWith("--phase="));
  const phase = arg ? arg.slice("--phase=".length) : "all";
  const allowed = new Set(["all", "create", "pairs", "unpublish"]);
  if (!allowed.has(phase)) {
    console.error("ERROR: --phase must be one of: all, create, pairs, unpublish.");
    process.exit(1);
  }
  return phase;
}

// ─── Hand-curated pair seeds (decision 7) ──────────────────────────────
// Pairs are by slug suffix (e.g. "ar-rahman" from "name-1-ar-rahman").

const MERCY_PAIRS = [
  ["ar-rahman", "ar-rahim"],
];

const OPPOSITE_PAIRS = [
  ["al-qabid", "al-basit"],   // 20 ↔ 21
  ["al-khafid", "ar-rafi"],   // 22 ↔ 23
  ["al-muizz", "al-mudhill"], // 24 ↔ 25
  ["al-muqaddim", "al-muakhkhir"], // 71 ↔ 72
];

// Qur'anic group from al-Hadid 57:3 — 4 names interconnected as a set
const QURANIC_GROUPS = [
  ["al-awwal", "al-akhir", "az-zahir", "al-batin"], // 73, 74, 75, 76
];

// ─── HTTP helpers ──────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(method, path, body, options = {}) {
  const url = `${STRAPI_URL}/api${path}`;
  const retries = options.retries ?? (APPLY && method !== "GET" ? MAX_RETRIES : 0);
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) return res.status === 204 ? null : res.json();

      const text = await res.text();
      const retryable = [502, 503, 504].includes(res.status);
      if (!retryable || attempt >= retries) {
        throw new Error(`${method} ${path} → ${res.status} ${res.statusText} :: ${text.slice(0, 400)}`);
      }
      const wait = 1000 * 2 ** attempt;
      console.log(`   retry ${attempt + 1}/${retries} after ${res.status} on ${method} ${path} (${wait}ms)`);
      await sleep(wait);
    } catch (err) {
      if (attempt >= retries) throw err;
      const wait = 1000 * 2 ** attempt;
      console.log(`   retry ${attempt + 1}/${retries} after network error on ${method} ${path} (${wait}ms)`);
      await sleep(wait);
    }
    attempt += 1;
  }
}

async function fetchAll(path) {
  const out = [];
  let page = 1;
  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await api("GET", `${path}${sep}pagination[page]=${page}&pagination[pageSize]=100`);
    out.push(...(res.data || []));
    const pc = res.meta?.pagination?.pageCount ?? 1;
    if (page >= pc) break;
    page += 1;
  }
  return out;
}

// ─── Parsing ───────────────────────────────────────────────────────────

function parseArticle(article) {
  // slug: name-NN-translit  e.g. "name-13-al-musawwir"
  const slugMatch = /^name-(\d{1,2})-(.+)$/.exec(article.slug);
  if (!slugMatch) return null;
  const number = parseInt(slugMatch[1], 10);
  const translit = slugMatch[2]; // already kebab-cased
  // arabic: pull from title between "اسم الله " and " — "
  const arMatch = /^اسم\s+الله\s+(.+?)\s+—/u.exec(article.title || "");
  const arabic = arMatch ? arMatch[1].trim() : null;
  // human transliteration ("Ar-Rahman" from "ar-rahman")
  const transliteration = translit
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("-");
  return { number, slug: article.slug, slugSuffix: translit, arabic, transliteration };
}

// ─── Steps ─────────────────────────────────────────────────────────────

async function step1_collectArticles() {
  console.log("\n=== Step 1 — Collect Asma Allah articles ===");
  const arts = await fetchAll(
    "/articles?filters[category][slug][$eq]=names-of-allah&fields[0]=title&fields[1]=slug&fields[2]=content&fields[3]=excerpt&fields[4]=publishedAt",
  );
  console.log(`   ${arts.length} articles found in names-of-allah`);
  const parsed = [];
  for (const a of arts) {
    const p = parseArticle(a);
    if (!p) {
      console.log(`   skip  unparseable slug: ${a.slug}`);
      continue;
    }
    parsed.push({ ...p, source: a });
  }
  console.log(`   ${parsed.length} parseable`);
  return parsed;
}

async function step3_upsertEntities(items) {
  console.log("\n=== Step 3 — Upsert divine-name entities ===");
  const existing = await fetchExistingDivineNames();
  const bySlug = new Map(existing.map((e) => [e.slug, e]));
  console.log(`   ${existing.length} existing divine-name rows`);

  const resultBySlug = new Map();
  let created = 0;
  let skipped = 0;
  for (const it of items) {
    const already = bySlug.get(it.slug);
    if (already) {
      console.log(`   skip  exists  ${it.slug} (#${it.number})`);
      resultBySlug.set(it.slug, already);
      skipped += 1;
      continue;
    }
    const payload = {
      data: {
        number: it.number,
        arabic: it.arabic || it.transliteration,
        transliteration: it.transliteration,
        slug: it.slug,
        body: it.source.content || "",
        quickAnswer: (it.source.excerpt || "").slice(0, 320),
      },
    };
    console.log(`   ${APPLY ? "create" : "[dry] create"}  ${it.slug} (#${it.number}, ${it.arabic || "?"})`);
    if (APPLY) {
      const res = await api("POST", "/divine-names", payload);
      resultBySlug.set(it.slug, res.data);
      created += 1;
      if (DELAY_MS > 0) await sleep(DELAY_MS);
    } else {
      resultBySlug.set(it.slug, { documentId: `<dry-${it.slug}>`, number: it.number, slug: it.slug });
      created += 1;
    }
  }
  console.log(`   summary: ${created} ${APPLY ? "created" : "would create"} · ${skipped} skipped`);
  return { resultBySlug, created, skipped };
}

async function step4_pairings(resultBySlug) {
  console.log("\n=== Step 4 — Seed pair relations ===");
  assertAllEntitiesPresent(resultBySlug);
  let linked = 0;

  async function linkPair(field, slugA, slugB) {
    const a = resultBySlug.get(`name-${findNumber(slugA)}-${slugA}`);
    const b = resultBySlug.get(`name-${findNumber(slugB)}-${slugB}`);
    if (!a || !b) {
      console.log(`   skip  ${field}: missing entity for ${slugA} or ${slugB}`);
      return;
    }
    console.log(`   ${APPLY ? "link" : "[dry] link"}  ${field}: ${slugA} ↔ ${slugB}`);
    const current = Array.isArray(a[field]) ? a[field] : [];
    const currentIds = current.map((item) => item.documentId).filter(Boolean);
    const nextIds = [...new Set([...currentIds, b.documentId])];
    if (APPLY) {
      // Strapi replaces relation state for this self-M2M shape, so preserve
      // locally accumulated connections when linking multiple targets.
      await api("PUT", `/divine-names/${a.documentId}`, {
        data: { [field]: { connect: nextIds } },
      });
      if (DELAY_MS > 0) await sleep(DELAY_MS);
    }
    a[field] = [...current, b];
    linked += 1;
  }

  function findNumber(slugSuffix) {
    for (const [slug, _] of resultBySlug) {
      if (slug.endsWith(`-${slugSuffix}`)) {
        const m = /^name-(\d{1,2})-/.exec(slug);
        if (m) return m[1];
      }
    }
    return "?";
  }

  for (const [a, b] of MERCY_PAIRS) await linkPair("mercyPair", a, b);
  for (const [a, b] of OPPOSITE_PAIRS) await linkPair("oppositePair", a, b);
  for (const group of QURANIC_GROUPS) {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        await linkPair("quranicPair", group[i], group[j]);
      }
    }
  }
  console.log(`   summary: ${linked} ${APPLY ? "linked" : "would link"}`);
  if (linked !== expectedPairCount()) {
    throw new Error(`pair-link count mismatch: expected ${expectedPairCount()}, got ${linked}`);
  }
  return linked;
}

async function step5_unpublishArticles(items, resultBySlug) {
  console.log("\n=== Step 5 — Unpublish source articles ===");
  if (SKIP_UNPUBLISH) {
    console.log("   --skip-unpublish flag set; leaving articles published");
    return;
  }
  assertAllEntitiesPresent(resultBySlug);
  if (APPLY) await verifyExpectedPairLinks();
  let unpublished = 0;
  let skipped = 0;
  for (const it of items) {
    const a = it.source;
    if (!a.publishedAt) {
      console.log(`   skip  already unpublished  ${a.slug}`);
      skipped += 1;
      continue;
    }
    console.log(`   ${APPLY ? "unpublish" : "[dry] unpublish"}  ${a.slug}`);
    if (APPLY) {
      await api("PUT", `/articles/${a.documentId}`, { data: { publishedAt: null } });
      unpublished += 1;
      if (DELAY_MS > 0) await sleep(DELAY_MS);
    } else {
      unpublished += 1;
    }
  }
  console.log(`   summary: ${unpublished} ${APPLY ? "unpublished" : "would unpublish"} · ${skipped} skipped`);
  if (APPLY) await verifySourceArticlesUnpublished();
}

async function fetchExistingDivineNames(populatePairs = false) {
  const pairPopulate =
    "&populate[mercyPair][fields][0]=slug&populate[oppositePair][fields][0]=slug&populate[quranicPair][fields][0]=slug";
  return fetchAll(
    `/divine-names?fields[0]=number&fields[1]=slug${populatePairs ? pairPopulate : ""}`,
  );
}

function expectedPairCount() {
  return MERCY_PAIRS.length + OPPOSITE_PAIRS.length + QURANIC_GROUPS.reduce(
    (sum, group) => sum + (group.length * (group.length - 1)) / 2,
    0,
  );
}

function assertAllEntitiesPresent(resultBySlug) {
  const slugs = [...resultBySlug.keys()];
  if (slugs.length !== EXPECTED_COUNT) {
    throw new Error(`divine-name row gate failed: expected ${EXPECTED_COUNT}, found ${slugs.length}`);
  }
}

function hasRelation(entity, field, slug) {
  const rel = entity[field];
  const rows = Array.isArray(rel) ? rel : rel?.data || [];
  return rows.some((r) => r.slug === slug || r.attributes?.slug === slug);
}

async function verifyExpectedPairLinks() {
  const rows = await fetchExistingDivineNames(true);
  const bySuffix = new Map(rows.map((row) => [row.slug.replace(/^name-\d{1,2}-/, ""), row]));
  let present = 0;

  function requirePair(field, a, b) {
    const rowA = bySuffix.get(a);
    const rowB = bySuffix.get(b);
    if (!rowA || !rowB) throw new Error(`pair verification missing entity: ${a} or ${b}`);
    if (!hasRelation(rowA, field, rowB.slug) && !hasRelation(rowB, field, rowA.slug)) {
      throw new Error(`pair verification failed: ${field} ${a} ↔ ${b} missing`);
    }
    present += 1;
  }

  for (const [a, b] of MERCY_PAIRS) requirePair("mercyPair", a, b);
  for (const [a, b] of OPPOSITE_PAIRS) requirePair("oppositePair", a, b);
  for (const group of QURANIC_GROUPS) {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        requirePair("quranicPair", group[i], group[j]);
      }
    }
  }
  if (present !== expectedPairCount()) {
    throw new Error(`pair verification count mismatch: expected ${expectedPairCount()}, got ${present}`);
  }
  console.log(`   verified ${present} expected pair links`);
}

async function verifySourceArticlesUnpublished() {
  const rows = await fetchAll(
    "/articles?status=published&filters[category][slug][$eq]=names-of-allah&fields[0]=slug&fields[1]=publishedAt",
  );
  const liveNames = rows.filter((row) => /^name-\d{1,2}-/.test(row.slug || ""));
  if (liveNames.length > 0) {
    throw new Error(
      `unpublish verification failed: ${liveNames.length} source articles still published (${liveNames
        .slice(0, 5)
        .map((row) => row.slug)
        .join(", ")})`,
    );
  }
  console.log("   verified source articles are no longer published");
}

// ─── Run ───────────────────────────────────────────────────────────────

(async () => {
  console.log(`Phase C2 migration — target: ${STRAPI_URL}`);
  console.log(`Mode: ${APPLY ? "APPLY (mutating prod)" : "DRY RUN (no writes)"}`);
  console.log(`Phase: ${PHASE}`);
  if (APPLY) console.log(`Pacing: ${DELAY_MS}ms between writes · ${MAX_RETRIES} retries on 502/503/504`);
  if (SKIP_UNPUBLISH) console.log("(--skip-unpublish: source articles will stay published)");

  try {
    const items = await step1_collectArticles();
    let resultBySlug;

    if (PHASE === "all" || PHASE === "create") {
      ({ resultBySlug } = await step3_upsertEntities(items));
      if (PHASE === "create") {
        console.log("\nDone. Create phase complete.");
        return;
      }
    } else {
      const existing = await fetchExistingDivineNames(PHASE === "pairs" || PHASE === "unpublish");
      resultBySlug = new Map(existing.map((e) => [e.slug, e]));
      console.log(`\n=== Existing divine-name entities ===\n   ${existing.length} existing divine-name rows`);
    }

    if (PHASE === "all" || PHASE === "pairs") {
      await step4_pairings(resultBySlug);
      if (PHASE === "pairs") {
        console.log("\nDone. Pair phase complete.");
        return;
      }
    }

    if (PHASE === "all" || PHASE === "unpublish") {
      await step5_unpublishArticles(items, resultBySlug);
    }

    console.log(`\nDone. ${APPLY ? "" : "Re-run with --apply to perform writes."}`);
  } catch (err) {
    console.error("\nFAILED:", err.message);
    process.exit(1);
  }
})();
