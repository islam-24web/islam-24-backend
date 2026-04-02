/**
 * category controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    // Override find to auto-populate
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          parent: { fields: ["name", "slug"] },
          children: { fields: ["name", "slug"] },
          articles: {
            fields: ["title", "slug", "excerpt", "published_date"],
            populate: {
              featured_image: {
                fields: ["url", "alternativeText", "width", "height"],
              },
            },
          },
          seo: {
            populate: {
              og_image: { fields: ["url", "width", "height"] },
            },
          },
        },
      };

      return super.find(ctx);
    },

    // Custom: find category by slug
    async findBySlug(ctx) {
      const { slug } = ctx.params;

      const entities = await strapi.entityService.findMany(
        "api::category.category",
        {
          filters: { slug },
          populate: {
            parent: true,
            children: true,
            articles: {
              populate: {
                featured_image: true,
                category: true,
              },
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
        return ctx.notFound("Category not found");
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    },
  })
);
