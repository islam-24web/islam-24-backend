/**
 * Custom article routes
 *
 * IMPORTANT for Strapi v4:
 * - Custom routes MUST be in a separate file from the core router
 * - Each route MUST have type: "content-api" so the permissions plugin can see it
 * - Filename can be anything except "article.ts" (that's the core router)
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/articles/slug/:slug",
      handler: "article.findBySlug",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
