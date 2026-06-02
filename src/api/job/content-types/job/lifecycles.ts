import { errors } from "@strapi/utils";

const { ValidationError } = errors;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function applyManualDefaults(data: Record<string, any>) {
  const title = String(data.title ?? "").trim();
  const baseSlug = slugify([title, data.companyName].filter(Boolean).join(" ")) || slugify(title) || "verified-remote-job";

  if (!data.slug && title) data.slug = baseSlug;
  if (!data.externalId && title) data.externalId = `verified-remote-${baseSlug}`;

  const reviewed = data.sourceReviewedAt
    ? new Date(data.sourceReviewedAt)
    : new Date();

  if (!data.datePosted) data.datePosted = reviewed.toISOString();
  if (!data.validThrough) {
    data.validThrough = data.expiresAt
      ? new Date(data.expiresAt).toISOString()
      : addDays(reviewed, 180);
  }

  if (data.applicationUrl && !data.applyUrl) data.applyUrl = data.applicationUrl;
  if (data.applyUrl && !data.applicationUrl) data.applicationUrl = data.applyUrl;

  if (!data.metaTitle && !data.seoTitle && title) {
    data.seoTitle = `${title} | Verified Remote`;
  }

  if (!data.metaDescription && !data.seoDescription) {
    const summary = String(data.summary ?? data.descriptionShort ?? "").trim();
    if (summary) data.seoDescription = summary.slice(0, 160);
  }
}

function isPublishingAttempt(data: Record<string, any>) {
  return (
    data.status === "published" ||
    data.isPublished === true ||
    (typeof data.publishedAt === "string" && data.publishedAt.length > 0)
  );
}

function valueFrom(data: Record<string, any>, existing: Record<string, any> | null, key: string) {
  return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : existing?.[key];
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasCompany(data: Record<string, any>, existing: Record<string, any> | null) {
  if (!Object.prototype.hasOwnProperty.call(data, "company")) {
    return Boolean(existing?.company);
  }

  const company = data.company;
  if (!company) return false;
  if (typeof company === "string" || typeof company === "number") return true;
  if (Array.isArray(company)) return company.length > 0;
  if (Array.isArray(company.connect) && company.connect.length > 0) return true;
  if (Array.isArray(company.set)) return company.set.length > 0;
  if (company.documentId || company.id || company.name) return true;
  if (Array.isArray(company.disconnect) && company.disconnect.length > 0) return false;
  return Object.keys(company).length > 0;
}

async function getExistingJob(where: Record<string, any>) {
  if (!where || Object.keys(where).length === 0) return null;
  return strapi.db.query("api::job.job").findOne({
    where,
    populate: {
      company: true,
    },
  });
}

async function assertPublishableJob(data: Record<string, any>, existing: Record<string, any> | null = null) {
  if (!isPublishingAttempt(data)) return;

  const missing: string[] = [];
  const status = valueFrom(data, existing, "status");
  const isPublished = valueFrom(data, existing, "isPublished");
  const applicationUrl = valueFrom(data, existing, "applicationUrl") || valueFrom(data, existing, "applyUrl");

  if (status !== "published") missing.push("status must be published");
  if (isPublished !== true) missing.push("isPublished must be true");
  if (!hasText(valueFrom(data, existing, "title"))) missing.push("title");
  if (!hasCompany(data, existing)) missing.push("company");
  if (!hasText(valueFrom(data, existing, "sourceUrl"))) missing.push("sourceUrl");
  if (!hasText(applicationUrl)) missing.push("applicationUrl");
  if (!hasText(valueFrom(data, existing, "sourceReviewedAt"))) missing.push("sourceReviewedAt");
  if (!hasText(valueFrom(data, existing, "remoteType"))) missing.push("remoteType");
  if (!hasText(valueFrom(data, existing, "contractType"))) missing.push("contractType");
  if (!hasText(valueFrom(data, existing, "payText"))) missing.push("payText");
  if (!hasText(valueFrom(data, existing, "category"))) missing.push("category");
  if (!hasText(valueFrom(data, existing, "summary"))) missing.push("summary");
  if (!hasText(valueFrom(data, existing, "responsibilities"))) missing.push("responsibilities");
  if (!hasText(valueFrom(data, existing, "requirements"))) missing.push("requirements");
  if (!hasText(valueFrom(data, existing, "contractDetails"))) missing.push("contractDetails");

  if (missing.length > 0) {
    throw new ValidationError(
      `Verified Remote jobs cannot be published until these fields are complete: ${missing.join(", ")}.`,
    );
  }
}

export default {
  async beforeCreate(event: { params: { data: Record<string, any> } }) {
    applyManualDefaults(event.params.data);
    await assertPublishableJob(event.params.data);
  },
  async beforeUpdate(event: { params: { data: Record<string, any>; where: Record<string, any> } }) {
    applyManualDefaults(event.params.data);
    const existing = await getExistingJob(event.params.where);
    await assertPublishableJob(event.params.data, existing);
  },
};
