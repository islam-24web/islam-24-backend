/**
 * job-category controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::job-category.job-category",
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          parentCategory: { fields: ["name", "slug"] },
        },
      };
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async findOne(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          parentCategory: true,
          subcategories: { fields: ["name", "slug"] },
        },
      };
      const { data, meta } = await super.findOne(ctx);
      return { data, meta };
    },

    async findBySlug(ctx) {
      const { slug } = ctx.params;
      const locale = (ctx.query?.locale as string) || "en";

      const entities = await strapi.entityService.findMany(
        "api::job-category.job-category",
        {
          filters: { slug },
          locale,
          populate: {
            parentCategory: true,
            subcategories: true,
          },
          limit: 1,
        }
      );

      const entity = entities?.[0];
      if (!entity) return ctx.notFound("Job category not found");

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    },
  })
);
