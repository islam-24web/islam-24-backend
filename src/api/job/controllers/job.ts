/**
 * job controller
 *
 * Auto-populates company / jobCategory / source / physicalLocation on read.
 * Adds findBySlug for the public job-detail page.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::job.job",
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          company: {
            fields: ["name", "slug"],
            populate: {
              logo: {
                fields: ["url", "alternativeText", "width", "height"],
              },
            },
          },
          jobCategory: { fields: ["name", "slug"] },
          source: { fields: ["name", "slug", "baseUrl"] },
          physicalLocation: true,
        },
      };
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async findOne(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          company: { populate: { logo: true } },
          jobCategory: true,
          source: true,
          physicalLocation: true,
        },
      };
      const { data, meta } = await super.findOne(ctx);
      return { data, meta };
    },

    async findBySlug(ctx) {
      const { slug } = ctx.params;
      const locale = (ctx.query?.locale as string) || "en";

      const entities = await strapi.entityService.findMany("api::job.job", {
        filters: { slug, status: "active" },
        locale,
        populate: {
          company: { populate: { logo: true } },
          jobCategory: true,
          source: true,
          physicalLocation: true,
        },
        limit: 1,
      });

      const entity = entities?.[0];
      if (!entity) return ctx.notFound("Job not found");

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    },
  })
);
