/**
 * Custom job-subscriber routes — confirm + unsubscribe by token.
 * Both protected by API token (called server-side from the Next.js handler);
 * the URL token is the per-subscriber confirmation key, not the auth.
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/job-subscribers/confirm/:token",
      handler: "job-subscriber.confirm",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/job-subscribers/unsubscribe/:token",
      handler: "job-subscriber.unsubscribe",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
