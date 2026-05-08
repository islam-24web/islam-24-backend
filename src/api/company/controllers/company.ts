/**
 * company controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::company.company",
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          logo: { fields: ["url", "alternativeText", "width", "height"] },
        },
      };
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async findOne(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          logo: true,
          jobs: {
            fields: ["title", "slug", "datePosted", "salaryUSDMin", "salaryUSDMax"],
            filters: { status: "active" },
          },
        },
      };
      const { data, meta } = await super.findOne(ctx);
      return { data, meta };
    },

    async findBySlug(ctx) {
      const { slug } = ctx.params;
      const locale = (ctx.query?.locale as string) || "en";

      const entities = await strapi.entityService.findMany(
        "api::company.company",
        {
          filters: { slug },
          locale,
          populate: {
            logo: true,
            jobs: {
              filters: { status: "active" },
            },
          },
          limit: 1,
        }
      );

      const entity = entities?.[0];
      if (!entity) return ctx.notFound("Company not found");

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    },
  })
);
