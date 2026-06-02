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

export default {
  beforeCreate(event: { params: { data: Record<string, any> } }) {
    applyManualDefaults(event.params.data);
  },
  beforeUpdate(event: { params: { data: Record<string, any> } }) {
    applyManualDefaults(event.params.data);
  },
};
