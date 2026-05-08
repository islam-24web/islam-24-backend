export default {
  routes: [
    {
      method: "GET",
      path: "/job-categories/slug/:slug",
      handler: "job-category.findBySlug",
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
