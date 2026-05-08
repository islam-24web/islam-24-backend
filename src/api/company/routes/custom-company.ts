export default {
  routes: [
    {
      method: "GET",
      path: "/companies/slug/:slug",
      handler: "company.findBySlug",
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
