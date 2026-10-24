/**
 * page controller
 *
 * Handles Dynamic Zone population for the page builder blocks.
 * Strapi v4 requires explicit populate for Dynamic Zones using the
 * "on" syntax: populate[content][on][blocks.hero][populate] = *
 */

import { factories } from "@strapi/strapi";

// Reusable populate config for the Dynamic Zone
const dynamicZonePopulate = {
  content: {
    on: {
      "blocks.hero": {
        populate: {
          background_image: {
            fields: ["url", "alternativeText", "width", "height"],
          },
        },
      },
      "blocks.text-block": {
        populate: "*",
      },
      "blocks.image-block": {
        populate: {
          image: {
            fields: ["url", "alternativeText", "width", "height", "caption"],
          },
        },
      },
      "blocks.cta-block": {
        populate: "*",
      },
      "blocks.services-block": {
        populate: {
          items: true,
        },
      },
    },
  },
  seo: {
    populate: {
      og_image: {
        fields: ["url", "width", "height"],
      },
    },
  },
};

export default factories.createCoreController(
  "api::page.page",
  ({ strapi }) => ({
    // Override find
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: dynamicZonePopulate,
      };
      return super.find(ctx);
    },

    // Override findOne
    async findOne(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: dynamicZonePopulate,
      };
      return super.findOne(ctx);
    },

    // Custom: find page by slug
    async findBySlug(ctx) {
      const { slug } = ctx.params;

      const entities = await strapi.entityService.findMany(
        "api::page.page",
        {
          filters: { slug },
          populate: {
            content: {
              on: {
                "blocks.hero": {
                  populate: { background_image: true },
                },
                "blocks.text-block": {
                  populate: true,
                },
                "blocks.image-block": {
                  populate: { image: true },
                },
                "blocks.cta-block": {
                  populate: true,
                },
                "blocks.services-block": {
                  populate: { items: true },
                },
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
        return ctx.notFound("Page not found");
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    },
  })
);
