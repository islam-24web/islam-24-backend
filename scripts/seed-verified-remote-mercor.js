/**
 * Seed the first manually reviewed Verified Remote opportunity.
 *
 * This creates/updates the Mercor MS Word Documents Specialist role as
 * under_review, not public. Replace the source/application URLs in Strapi,
 * set status=published and isPublished=true only after manual review.
 */

const STRAPI_URL = (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
const TOKEN = process.env.STRAPI_API_TOKEN || process.env.STRAPI_SEED_TOKEN;
const REVIEWED_AT = process.env.VERIFIED_REMOTE_REVIEWED_AT || "2026-06-02";

if (!TOKEN) {
  console.error("STRAPI_API_TOKEN or STRAPI_SEED_TOKEN is required");
  process.exit(1);
}

async function strapi(method, path, body) {
  const res = await fetch(`${STRAPI_URL}/api/${path.replace(/^\//, "")}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`Strapi ${method} ${path} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  return json;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

async function findOrCreateCompany(name) {
  const slug = slugify(name);
  const existing = await strapi(
    "GET",
    `companies?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[limit]=1`,
  );
  if (existing.data?.[0]) return existing.data[0].documentId;

  const created = await strapi("POST", "companies", {
    data: {
      name,
      slug,
      locale: "en",
      publishedAt: new Date().toISOString(),
    },
  });
  return created.data.documentId;
}

async function findExistingJob(externalId) {
  const existing = await strapi(
    "GET",
    `jobs?filters[externalId][$eq]=${encodeURIComponent(externalId)}&publicationState=preview&pagination[limit]=1`,
  );
  return existing.data?.[0]?.documentId;
}

async function main() {
  const companyId = await findOrCreateCompany("Mercor");
  const externalId = "verified-remote-mercor-ms-word-documents-specialist";
  const slug = "ms-word-documents-specialist-mercor";
  const existingId = await findExistingJob(externalId);

  const shared = {
    externalId,
    slug,
    originalTitle: "MS Word Expert - Document Specialist",
    company: companyId,
    sourceUrl: "https://www.linkedin.com/jobs/view/REPLACE_WITH_OFFICIAL_SOURCE",
    applicationUrl: "https://mercor.com/REPLACE_WITH_REFERRAL_OR_APPLICATION_LINK",
    applyUrl: "https://mercor.com/REPLACE_WITH_REFERRAL_OR_APPLICATION_LINK",
    isReferral: true,
    sourceReviewedAt: REVIEWED_AT,
    status: "under_review",
    isPublished: false,
    employmentType: "CONTRACTOR",
    jobLocationType: "TELECOMMUTE",
    payText: "$60-$150 per hour",
    datePosted: new Date(REVIEWED_AT).toISOString(),
    validThrough: new Date("2026-12-31T23:59:59.000Z").toISOString(),
  };

  const en = {
    ...shared,
    locale: "en",
    title: "MS Word Documents Specialist",
    category: "Document Specialist / AI Training / Remote Work",
    remoteType: "Fully remote",
    contractType: "Hourly contract / Independent contractor",
    summary:
      "Mercor is hiring Microsoft Word specialists to support a document conversion and refinement project for one of the world's leading AI companies.\n\nThis is not a basic typing role.\n\nThe role requires someone who can recreate, structure, and polish professional documents with strong attention to formatting, layout, tables, references, and document fidelity.",
    responsibilities:
      "Convert legacy documents into modern Word files.\nRecreate complex document layouts with accuracy.\nWork with tables, references, and inline objects.\nApply consistent document styles and templates.\nOrganize sections and document structure.\nImprove clarity, formatting, and professional polish.\nWork independently on a flexible remote schedule.",
    requirements:
      "Expert-level Microsoft Word skills.\nStrong understanding of document styles.\nExperience with templates, sections, tables, and references.\nKnowledge of track changes.\nStrong attention to detail.\nClear written English.\nAbility to work independently on a flexible schedule.\nExperience preparing reports, professional documents, or business documentation.",
    contractDetails:
      "Independent contractor role.\nFully remote.\nFlexible schedule.\nWeekly payments.\nPayments through Stripe or Wise.\nProject duration may vary based on needs and performance.\nH1-B or STEM OPT candidates are not supported for this role.",
    seoTitle: "MS Word Documents Specialist - Mercor | Verified Remote",
    seoDescription:
      "Verified remote hourly contract role for Microsoft Word document specialists at Mercor.",
  };

  const ar = {
    title: "أخصائي تنسيق وإعداد مستندات وورد",
    slug,
    titleArabic: "أخصائي تنسيق وإعداد مستندات وورد",
    category: "Document Specialist / AI Training / Remote Work",
    remoteType: "عن بُعد بالكامل",
    contractType: "عقد بالساعة / مستقل",
    summary:
      "تبحث شركة Mercor عن متخصصين محترفين في استخدام وورد للعمل على مشروع لتحويل وتطوير المستندات لصالح إحدى شركات الذكاء الاصطناعي العالمية.\n\nهذه ليست وظيفة كتابة عادية.\n\nالمطلوب شخص يستطيع إعادة بناء مستندات احترافية بدقة عالية، مع الحفاظ على التنسيق، البنية، الجداول، المراجع، والتفاصيل الصغيرة التي تصنع فرقًا في جودة المستند النهائي.",
    responsibilities:
      "تحويل مستندات قديمة إلى ملفات وورد حديثة ومنسقة.\nإعادة إنشاء تصميمات مستندية معقدة بدقة.\nالتعامل مع الجداول والمراجع والعناصر الداخلية داخل المستند.\nتطبيق أنماط تنسيق موحدة وقوالب واضحة.\nتنظيم الأقسام والبنية العامة للمستند.\nتحسين وضوح المستند وجودته المهنية.\nالعمل بمرونة وبشكل مستقل عن بُعد.",
    requirements:
      "احتراف استخدام مايكروسوفت وورد.\nإجادة التعامل مع أنماط التنسيق.\nخبرة في القوالب والأقسام والجداول والمراجع.\nمعرفة باستخدام خاصية تعقب التغييرات.\nدقة عالية في مراجعة التفاصيل.\nإجادة الكتابة باللغة الإنجليزية.\nالقدرة على العمل بشكل مستقل ووفق جدول مرن.\nخبرة في إعداد التقارير أو المستندات المهنية أو الوثائق المؤسسية.",
    contractDetails:
      "العمل كمستقل.\nالوظيفة عن بُعد بالكامل.\nالجدول مرن.\nالدفع أسبوعي.\nالدفع يتم عبر Stripe أو Wise.\nمدة المشروع قد تختلف حسب احتياج العمل والأداء.\nهذه الفرصة لا تدعم مرشحي H1-B أو STEM OPT.",
    seoTitle: "أخصائي مستندات وورد - Mercor | Verified Remote",
    seoDescription:
      "فرصة عمل عن بُعد لمتخصصي Microsoft Word لدى Mercor، ضمن مشروع مدفوع بالساعة.",
  };

  let documentId = existingId;
  if (documentId) {
    await strapi("PUT", `jobs/${documentId}?locale=en`, { data: en });
  } else {
    const created = await strapi("POST", "jobs", { data: en });
    documentId = created.data.documentId;
  }

  await strapi("PUT", `jobs/${documentId}?locale=ar`, { data: ar });

  console.log(`Seeded Verified Remote Mercor job as under_review: ${documentId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
