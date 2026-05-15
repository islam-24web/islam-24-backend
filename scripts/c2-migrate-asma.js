#!/usr/bin/env node
/**
 * Phase C2 — migrate the 99 Asma Allah articles into divine-name entities.
 *
 * Idempotent. Dry-run by default. Run with --apply to mutate.
 *
 * Sequence (each step independent + re-runnable):
 *   1. Fetch all articles in `names-of-allah` category.
 *   2. Parse number / arabic / transliteration from each article's slug+title.
 *   3. For each, upsert a divine-name row (preserving slug `name-NN-X`).
 *   4. Seed paired-name relations (mercy / opposite / quranic).
 *   5. Unpublish the source articles (reversible; do NOT delete).
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

if (!TOKEN) {
  console.error("ERROR: STRAPI_API_TOKEN must be set in env.");
  process.exit(1);
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
    throw new Error(`${method} ${path} → ${res.status} ${res.statusText} :: ${text.slice(0, 400)}`);
  }
  return res.status === 204 ? null : res.json();
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
  const existing = await fetchAll(
    "/divine-names?fields[0]=number&fields[1]=slug",
  );
  const bySlug = new Map(existing.map((e) => [e.slug, e]));
  console.log(`   ${existing.length} existing divine-name rows`);

  const resultBySlug = new Map();
  for (const it of items) {
    const already = bySlug.get(it.slug);
    if (already) {
      console.log(`   skip  exists  ${it.slug} (#${it.number})`);
      resultBySlug.set(it.slug, already);
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
    } else {
      resultBySlug.set(it.slug, { documentId: `<dry-${it.slug}>`, number: it.number, slug: it.slug });
    }
  }
  return resultBySlug;
}

async function step4_pairings(resultBySlug) {
  console.log("\n=== Step 4 — Seed pair relations ===");

  async function linkPair(field, slugA, slugB) {
    const a = resultBySlug.get(`name-${findNumber(slugA)}-${slugA}`);
    const b = resultBySlug.get(`name-${findNumber(slugB)}-${slugB}`);
    if (!a || !b) {
      console.log(`   skip  ${field}: missing entity for ${slugA} or ${slugB}`);
      return;
    }
    console.log(`   ${APPLY ? "link" : "[dry] link"}  ${field}: ${slugA} ↔ ${slugB}`);
    if (APPLY) {
      // Set inversedBy self-relation: writing on one side propagates.
      await api("PUT", `/divine-names/${a.documentId}`, {
        data: { [field]: { connect: [b.documentId] } },
      });
    }
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
}

async function step5_unpublishArticles(items) {
  console.log("\n=== Step 5 — Unpublish source articles ===");
  if (SKIP_UNPUBLISH) {
    console.log("   --skip-unpublish flag set; leaving articles published");
    return;
  }
  for (const it of items) {
    const a = it.source;
    if (!a.publishedAt) {
      console.log(`   skip  already unpublished  ${a.slug}`);
      continue;
    }
    console.log(`   ${APPLY ? "unpublish" : "[dry] unpublish"}  ${a.slug}`);
    if (APPLY) {
      await api("PUT", `/articles/${a.documentId}`, { data: { publishedAt: null } });
    }
  }
}

// ─── Run ───────────────────────────────────────────────────────────────

(async () => {
  console.log(`Phase C2 migration — target: ${STRAPI_URL}`);
  console.log(`Mode: ${APPLY ? "APPLY (mutating prod)" : "DRY RUN (no writes)"}`);
  if (SKIP_UNPUBLISH) console.log("(--skip-unpublish: source articles will stay published)");

  try {
    const items = await step1_collectArticles();
    const resultBySlug = await step3_upsertEntities(items);
    await step4_pairings(resultBySlug);
    await step5_unpublishArticles(items);

    console.log(`\nDone. ${APPLY ? "" : "Re-run with --apply to perform writes."}`);
  } catch (err) {
    console.error("\nFAILED:", err.message);
    process.exit(1);
  }
})();
