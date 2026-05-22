/**
 * article controller
 */

import { factories } from "@strapi/strapi";

const ASMA_SOURCE_CONFIRMATION = "unpublish-asma-allah-source-articles";
const ASMA_SOURCE_PATTERN = /^name-\d{1,2}-/;

export default factories.createCoreController(
  "api::article.article",
  ({ strapi }) => ({
    // Override find to auto-populate relations
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          featured_image: { fields: ["url", "alternativeText", "width", "height"] },
          author_image: { fields: ["url", "alternativeText"] },
          category: { fields: ["name", "slug"] },
          seo: {
            populate: {
              og_image: { fields: ["url", "width", "height"] },
            },
          },
          faqs: true,
          sources: true,
        },
      };

      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    // Override findOne to auto-populate relations
    async findOne(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          featured_image: { fields: ["url", "alternativeText", "width", "height"] },
          author_image: { fields: ["url", "alternativeText"] },
          category: {
            fields: ["name", "slug"],
            populate: {
              parent: { fields: ["name", "slug"] },
            },
          },
          seo: {
            populate: {
              og_image: { fields: ["url", "width", "height"] },
            },
          },
          faqs: true,
          sources: true,
        },
      };

      const { data, meta } = await super.findOne(ctx);
      return { data, meta };
    },

    // Custom: find article by slug
    async findBySlug(ctx) {
      const { slug } = ctx.params;

      const entities = await strapi.entityService.findMany(
        "api::article.article",
        {
          filters: { slug },
          populate: {
            featured_image: true,
            author_image: true,
            category: {
              populate: { parent: true },
            },
            seo: {
              populate: { og_image: true },
            },
            faqs: true,
            sources: true,
          },
          limit: 1,
        }
      );

      const entity = entities?.[0];

      if (!entity) {
        return ctx.notFound("Article not found");
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    },

    async unpublishAsmaAllahSources(ctx) {
      if (ctx.request.body?.confirm !== ASMA_SOURCE_CONFIRMATION) {
        return ctx.badRequest("Missing confirmation token");
      }

      const publishedArticles = await strapi.documents("api::article.article").findMany({
        status: "published",
        filters: {
          category: {
            slug: {
              $eq: "names-of-allah",
            },
          },
        },
        fields: ["documentId", "slug", "publishedAt"],
        pagination: {
          pageSize: 150,
        },
      });

      const sourceArticles = publishedArticles
        .filter((article) => ASMA_SOURCE_PATTERN.test(article.slug || ""))
        .sort((a, b) => a.slug.localeCompare(b.slug));

      if (![0, 99].includes(sourceArticles.length)) {
        return ctx.badRequest("Unexpected source article count", {
          count: sourceArticles.length,
          slugs: sourceArticles.map((article) => article.slug),
        });
      }

      let unpublished = 0;
      const slugs: string[] = [];
      for (const article of sourceArticles) {
        await strapi.documents("api::article.article").unpublish({
          documentId: article.documentId,
        });
        unpublished += 1;
        slugs.push(article.slug);
      }

      const remaining = await strapi.documents("api::article.article").findMany({
        status: "published",
        filters: {
          category: {
            slug: {
              $eq: "names-of-allah",
            },
          },
        },
        fields: ["documentId", "slug", "publishedAt"],
        pagination: {
          pageSize: 150,
        },
      });

      const remainingSources = remaining.filter((article) =>
        ASMA_SOURCE_PATTERN.test(article.slug || "")
      );

      return {
        data: {
          matched: sourceArticles.length,
          unpublished,
          remainingPublished: remainingSources.length,
          slugs,
        },
      };
    },
  })
);
