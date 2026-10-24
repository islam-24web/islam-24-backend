/**
 * job-subscriber controller
 *
 * Default CRUD inherited from core; intentionally not exposed via Public role.
 * Custom actions: confirm + unsubscribe (token-gated, called from Next.js).
 */

import { factories } from "@strapi/strapi";

const UID = "api::job-subscriber.job-subscriber" as const;

async function findByToken(strapi, token: string) {
  if (!token || typeof token !== "string" || token.length < 32) return null;
  const rows = await strapi.entityService.findMany(UID, {
    filters: { confirmationToken: token },
    limit: 1,
  });
  return rows?.[0] ?? null;
}

export default factories.createCoreController(UID, ({ strapi }) => ({
  async confirm(ctx) {
    const { token } = ctx.params;
    const sub = await findByToken(strapi, token);
    if (!sub) return ctx.notFound("invalid or expired token");

    if (sub.unsubscribedAt) {
      return ctx.badRequest("subscription was canceled; please subscribe again");
    }
    if (sub.confirmedAt) {
      return { status: "already-confirmed", email: sub.email };
    }

    await strapi.entityService.update(UID, sub.id, {
      data: { confirmedAt: new Date().toISOString() },
    });

    return { status: "confirmed", email: sub.email };
  },

  async unsubscribe(ctx) {
    const { token } = ctx.params;
    const sub = await findByToken(strapi, token);
    if (!sub) return ctx.notFound("invalid or expired token");

    if (sub.unsubscribedAt) {
      return { status: "already-unsubscribed", email: sub.email };
    }

    await strapi.entityService.update(UID, sub.id, {
      data: { unsubscribedAt: new Date().toISOString() },
    });

    return { status: "unsubscribed", email: sub.email };
  },
}));
