export default [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: "*",
      origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://islam-24-frontend.vercel.app",
      "https://islam-24.com",
      "https://www.islam-24.com"
    ],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
