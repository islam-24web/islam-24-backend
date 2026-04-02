/**
 * article controller
 */

import { factories } from "@strapi/strapi";

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
  })
);
