/**
 * Custom job routes
 *
 * Strapi v5: custom routes MUST live in a separate file from the core router.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/jobs/slug/:slug",
      handler: "job.findBySlug",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
