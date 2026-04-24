#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════
 * 🌱 MASTER SEED SCRIPT — سباق الفردوس
 * ════════════════════════════════════════════════════════════════
 * يزرع كل البيانات من HTML v17 في Strapi v5
 *
 * الاستخدام:
 *   1. cd /path/to/islam-24/backend
 *   2. احفظ الملف باسم scripts/seed-all.js
 *   3. عدّل STRAPI_URL و API_TOKEN
 *   4. node scripts/seed-all.js
 *
 * المحتوى اللي بيزرعه:
 *   - 4 App Domains
 *   - 22 App Categories
 *   - 5 Ranks (الرتب)
 *   - ~80 App Tasks
 *   - 99 Divine Names
 *   - 70 Heart Deeds
 *   - 100 Maqams
 *   - 40+ Dhikrs
 *   - ~20 Achievements
 * ════════════════════════════════════════════════════════════════
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN  = process.env.STRAPI_API_TOKEN || 'YOUR_TOKEN_HERE';

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_TOKEN}`,
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
async function createOne(endpoint, data) {
  const url = `${STRAPI_URL}/api/${endpoint}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`  ❌ ${endpoint}: ${res.status} — ${err.slice(0, 200)}`);
      return null;
    }
    const json = await res.json();
    return json.data?.documentId || json.data?.id;
  } catch (e) {
    console.error(`  ❌ ${endpoint}: ${e.message}`);
    return null;
  }
}

async function seedGroup(label, endpoint, items, transform = (x) => x) {
  console.log(`\n📁 ${label} (${items.length})...`);
  const map = {};
  let ok = 0, fail = 0;
  for (const item of items) {
    const data = transform(item);
    const id = await createOne(endpoint, data);
    if (id) {
      ok++;
      // Use a stable key for lookup later
      if (item.slug) map[item.slug] = id;
      else if (item.code) map[item.code] = id;
      else if (item.id) map[item.id] = id;
    } else {
      fail++;
    }
  }
  console.log(`  ✅ ${ok} created${fail ? `, ❌ ${fail} failed` : ''}`);
  return map;
}

// ─────────────────────────────────────────────────────────────────
// 1. DOMAINS
// ─────────────────────────────────────────────────────────────────
const DOMAINS = [
  { name: 'الدين',      slug: 'religion',     icon: '🕌', color: '#C9A84C', order: 1 },
  { name: 'العمل',      slug: 'work',         icon: '💼', color: '#3B82F6', order: 2 },
  { name: 'الأسرة',     slug: 'family',       icon: '👨‍👩‍👧', color: '#8B5CF6', order: 3 },
  { name: 'الإنتاجية',  slug: 'productivity', icon: '⚡', color: '#F59E0B', order: 4 },
];

// ─────────────────────────────────────────────────────────────────
// 2. CATEGORIES
// ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  // Religion
  { name: 'صلاة',    slug: 'salah',     icon: '🕌', color: '#C9A84C', order: 1, domainSlug: 'religion' },
  { name: 'قرآن',    slug: 'quran',     icon: '📖', color: '#C9A84C', order: 2, domainSlug: 'religion' },
  { name: 'أذكار',   slug: 'adhkar',    icon: '📿', color: '#C9A84C', order: 3, domainSlug: 'religion' },
  { name: 'علم',     slug: 'ilm',       icon: '🎓', color: '#C9A84C', order: 4, domainSlug: 'religion' },
  { name: 'إحسان',   slug: 'ihsan',     icon: '🤝', color: '#C9A84C', order: 5, domainSlug: 'religion' },
  { name: 'أسبوعي',  slug: 'weekly-r',  icon: '📅', color: '#C9A84C', order: 6, domainSlug: 'religion' },
  { name: 'شهري',    slug: 'monthly-r', icon: '🗓️', color: '#C9A84C', order: 7, domainSlug: 'religion' },
  { name: 'سنوي',    slug: 'yearly-r',  icon: '🏆', color: '#C9A84C', order: 8, domainSlug: 'religion' },
  // Work
  { name: 'تخطيط',   slug: 'planning',  icon: '📋', color: '#3B82F6', order: 1, domainSlug: 'work' },
  { name: 'إنتاج',   slug: 'output',    icon: '⚡', color: '#3B82F6', order: 2, domainSlug: 'work' },
  { name: 'تقييم',   slug: 'review',    icon: '📊', color: '#3B82F6', order: 3, domainSlug: 'work' },
  { name: 'تواصل',   slug: 'comms',     icon: '💬', color: '#3B82F6', order: 4, domainSlug: 'work' },
  { name: 'تطوير',   slug: 'develop',   icon: '🌱', color: '#3B82F6', order: 5, domainSlug: 'work' },
  // Family
  { name: 'أسرة',    slug: 'family-g',  icon: '👨‍👩‍👧', color: '#8B5CF6', order: 1, domainSlug: 'family' },
  { name: 'تربية',   slug: 'parenting', icon: '🌱', color: '#8B5CF6', order: 2, domainSlug: 'family' },
  { name: 'زواج',    slug: 'marriage',  icon: '💍', color: '#8B5CF6', order: 3, domainSlug: 'family' },
  // Productivity
  { name: 'صباح',    slug: 'morning',   icon: '🌅', color: '#F59E0B', order: 1, domainSlug: 'productivity' },
  { name: 'إنتاج',   slug: 'prod-out',  icon: '⚡', color: '#F59E0B', order: 2, domainSlug: 'productivity' },
  { name: 'عادات',   slug: 'habits',    icon: '🔄', color: '#F59E0B', order: 3, domainSlug: 'productivity' },
  { name: 'صحة',     slug: 'health',    icon: '💪', color: '#F59E0B', order: 4, domainSlug: 'productivity' },
  { name: 'تعلم',    slug: 'learn',     icon: '📚', color: '#F59E0B', order: 5, domainSlug: 'productivity' },
  { name: 'تخطيط',   slug: 'prod-plan', icon: '📋', color: '#F59E0B', order: 6, domainSlug: 'productivity' },
];

// ─────────────────────────────────────────────────────────────────
// 3. RANKS
// ─────────────────────────────────────────────────────────────────
const RANKS = [
  {
    level: 1, name: 'المُبتدِئ', description: 'خطواتك الأولى على طريق التقرّب',
    quranReference: '﴿ وَسَارِعُوٓاْ إِلَىٰ مَغۡفِرَةٖ مِّن رَّبِّكُمۡ ﴾',
    minPoints: 0, maxPoints: 500, icon: '🌱', color: '#6B7280',
  },
  {
    level: 2, name: 'السَّالِك', description: 'تسلك الطريق بهمة وإصرار',
    quranReference: '﴿ وَمَن يَخۡرُجۡ مِنۢ بَيۡتِهِۦ مُهَاجِرًا إِلَى ٱللَّهِ وَرَسُولِهِۦ ﴾',
    minPoints: 501, maxPoints: 2500, icon: '🚶', color: '#3B82F6',
  },
  {
    level: 3, name: 'المُجتهِد', description: 'تجتهد في طاعة ربك وترتقي درجاته',
    quranReference: '﴿ وَٱلَّذِينَ جَٰهَدُواْ فِينَا لَنَهۡدِيَنَّهُمۡ سُبُلَنَا ﴾',
    minPoints: 2501, maxPoints: 10000, icon: '🏃', color: '#10B981',
  },
  {
    level: 4, name: 'المُقَرَّب', description: 'من عباد الله المقربين إليه',
    quranReference: '﴿ وَٱلسَّٰبِقُونَ ٱلسَّٰبِقُونَ أُوْلَـٰٓئِكَ ٱلۡمُقَرَّبُونَ ﴾',
    minPoints: 10001, maxPoints: 30000, icon: '🌟', color: '#C9A84C',
  },
  {
    level: 5, name: 'السَّابِق', description: 'في طليعة السابقين إلى الخيرات',
    quranReference: '﴿ أُوْلَـٰٓئِكَ هُمُ ٱلسَّـٰبِقُونَ ﴾',
    minPoints: 30001, maxPoints: 999999999, icon: '👑', color: '#E8D48B',
  },
];

// ─────────────────────────────────────────────────────────────────
// 4. TASKS (MASSIVE — religion + work + family + productivity)
// ─────────────────────────────────────────────────────────────────
const TASKS = require('./seed-data/tasks.json');

// ─────────────────────────────────────────────────────────────────
// 5. DIVINE NAMES (99 أسماء الله الحسنى)
// ─────────────────────────────────────────────────────────────────
const DIVINE_NAMES = require('./seed-data/divine-names.json');

// ─────────────────────────────────────────────────────────────────
// 6. HEART DEEDS (70 عمل من أعمال القلوب)
// ─────────────────────────────────────────────────────────────────
const HEART_DEEDS = require('./seed-data/heart-deeds.json');

// ─────────────────────────────────────────────────────────────────
// 7. MAQAMS (100 منزلة من مدارج السالكين)
// ─────────────────────────────────────────────────────────────────
const MAQAMS = require('./seed-data/maqams.json');

// ─────────────────────────────────────────────────────────────────
// 8. DHIKRS (الأذكار)
// ─────────────────────────────────────────────────────────────────
const DHIKRS = require('./seed-data/dhikrs.json');

// ─────────────────────────────────────────────────────────────────
// 9. ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  // Tasbih milestones
  { code: 'tasbih_100',   title: 'مئة تسبيحة', description: 'بلغت 100 تسبيحة', icon: '📿', category: 'tasbih', requiredCount: 100, pointsReward: 50, rarity: 'common' },
  { code: 'tasbih_1k',    title: 'ألف تسبيحة', description: 'بلغت 1,000 تسبيحة', icon: '🌟', category: 'tasbih', requiredCount: 1000, pointsReward: 200, rarity: 'common' },
  { code: 'tasbih_10k',   title: 'عشرة آلاف', description: 'بلغت 10,000 تسبيحة', icon: '✨', category: 'tasbih', requiredCount: 10000, pointsReward: 1000, rarity: 'rare' },
  { code: 'tasbih_100k',  title: 'مئة ألف', description: 'بلغت 100,000 تسبيحة', icon: '🌠', category: 'tasbih', requiredCount: 100000, pointsReward: 5000, rarity: 'epic' },
  { code: 'tasbih_1m',    title: 'المليون', description: 'بلغت مليون تسبيحة', icon: '👑', category: 'tasbih', requiredCount: 1000000, pointsReward: 50000, rarity: 'legendary' },

  // Streak milestones
  { code: 'streak_7',     title: 'أسبوع كامل', description: '7 أيام متواصلة', icon: '🔥', category: 'streak', requiredCount: 7, pointsReward: 100, rarity: 'common' },
  { code: 'streak_30',    title: 'شهر بلا انقطاع', description: '30 يوم متواصل', icon: '🔥🔥', category: 'streak', requiredCount: 30, pointsReward: 500, rarity: 'rare' },
  { code: 'streak_100',   title: 'مئة يوم', description: '100 يوم متواصل', icon: '🏆', category: 'streak', requiredCount: 100, pointsReward: 2000, rarity: 'epic' },
  { code: 'streak_365',   title: 'سنة كاملة', description: 'سنة كاملة بلا انقطاع', icon: '👑', category: 'streak', requiredCount: 365, pointsReward: 10000, rarity: 'legendary' },

  // Divine Names
  { code: 'names_33',     title: 'ثلث الأسماء', description: 'دعوت بـ 33 اسم', icon: '🕊️', category: 'divine_names', requiredCount: 33, pointsReward: 300, rarity: 'common' },
  { code: 'names_66',     title: 'ثلثا الأسماء', description: 'دعوت بـ 66 اسم', icon: '🌙', category: 'divine_names', requiredCount: 66, pointsReward: 600, rarity: 'rare' },
  { code: 'names_99',     title: 'من أحصاها دخل الجنة', description: 'دعوت بكل الأسماء الحسنى', icon: '⭐', category: 'divine_names', requiredCount: 99, pointsReward: 2000, rarity: 'legendary' },

  // Heart Deeds
  { code: 'hearts_10',    title: 'عشرة أعمال قلبية', description: 'طبّقت 10 أعمال قلبية', icon: '💚', category: 'heart_deeds', requiredCount: 10, pointsReward: 300, rarity: 'common' },
  { code: 'hearts_35',    title: 'نصف أعمال القلوب', description: 'طبّقت 35 عمل قلبي', icon: '💛', category: 'heart_deeds', requiredCount: 35, pointsReward: 800, rarity: 'rare' },
  { code: 'hearts_70',    title: 'كل أعمال القلوب', description: 'طبّقت كل الأعمال القلبية السبعين', icon: '❤️', category: 'heart_deeds', requiredCount: 70, pointsReward: 3000, rarity: 'legendary' },

  // Maqams
  { code: 'maqams_25',    title: 'ربع المدارج', description: 'بلغت 25 منزلة', icon: '🏔️', category: 'maqams', requiredCount: 25, pointsReward: 500, rarity: 'common' },
  { code: 'maqams_50',    title: 'نصف المدارج', description: 'بلغت 50 منزلة', icon: '⛰️', category: 'maqams', requiredCount: 50, pointsReward: 1500, rarity: 'rare' },
  { code: 'maqams_100',   title: 'كل المدارج', description: 'بلغت 100 منزلة', icon: '🗻', category: 'maqams', requiredCount: 100, pointsReward: 5000, rarity: 'legendary' },

  // Rank achievements
  { code: 'rank_2',       title: 'سالك الطريق', description: 'ترقيت إلى رتبة السالك', icon: '🚶', category: 'rank', requiredCount: 1, pointsReward: 100, rarity: 'common' },
  { code: 'rank_3',       title: 'مجتهد', description: 'ترقيت إلى رتبة المجتهد', icon: '🏃', category: 'rank', requiredCount: 1, pointsReward: 500, rarity: 'rare' },
  { code: 'rank_4',       title: 'مقرّب', description: 'ترقيت إلى رتبة المقرّب', icon: '🌟', category: 'rank', requiredCount: 1, pointsReward: 2000, rarity: 'epic' },
  { code: 'rank_5',       title: 'من السابقين', description: 'بلغت أعلى رتبة: السابق', icon: '👑', category: 'rank', requiredCount: 1, pointsReward: 10000, rarity: 'legendary' },

  // Quran
  { code: 'quran_khatm',  title: 'ختمة واحدة', description: 'أتممت ختمة كاملة', icon: '📖', category: 'quran', requiredCount: 1, pointsReward: 3000, rarity: 'rare' },
];

// ─────────────────────────────────────────────────────────────────
// MAIN EXECUTION
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('🌱 SABBAQ FIRDAWS — MASTER SEED');
  console.log('═══════════════════════════════════════════════');
  console.log(`Target: ${STRAPI_URL}`);
  console.log('');

  // 1. Domains
  const domainMap = await seedGroup('Domains', 'app-domains', DOMAINS);

  // 2. Categories (link to domain)
  const categoryMap = {};
  console.log(`\n📂 Categories (${CATEGORIES.length})...`);
  let catOk = 0;
  for (const cat of CATEGORIES) {
    const { domainSlug, ...data } = cat;
    const domainId = domainMap[domainSlug];
    if (domainId) data.domain = domainId;
    const id = await createOne('app-categories', data);
    if (id) {
      categoryMap[cat.slug] = id;
      catOk++;
    }
  }
  console.log(`  ✅ ${catOk} created`);

  // 3. Ranks
  await seedGroup('Ranks', 'ranks', RANKS);

  // 4. Tasks (link to category)
  console.log(`\n✅ Tasks (${TASKS.length})...`);
  let taskOk = 0;
  for (const task of TASKS) {
    const { categorySlug, ...data } = task;
    const catId = categoryMap[categorySlug];
    if (catId) data.category = catId;
    const id = await createOne('app-tasks', data);
    if (id) taskOk++;
  }
  console.log(`  ✅ ${taskOk} created`);

  // 5. Divine Names
  await seedGroup('Divine Names', 'app-divine-names', DIVINE_NAMES);

  // 6. Heart Deeds
  await seedGroup('Heart Deeds', 'app-heart-deeds', HEART_DEEDS);

  // 7. Maqams
  await seedGroup('Maqams', 'app-maqams', MAQAMS);

  // 8. Dhikrs
  await seedGroup('Dhikrs', 'app-dhikrs', DHIKRS);

  // 9. Achievements
  await seedGroup('Achievements', 'achievements', ACHIEVEMENTS);

  console.log('\n═══════════════════════════════════════════════');
  console.log('✨ SEED COMPLETED');
  console.log('═══════════════════════════════════════════════');
  console.log('\n📋 Next steps:');
  console.log('  1. Settings → Users & Permissions → Roles → Public');
  console.log('  2. Enable find + findOne for all new Content Types');
  console.log('  3. Test: curl ' + STRAPI_URL + '/api/ranks');
}

main().catch(console.error);
