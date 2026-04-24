/**
 * user-profile controller
 * يحتوي على endpoints مخصصة للمسابقة والترتيب
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-profile.user-profile', ({ strapi }) => ({

  // GET /api/user-profiles/me?firebaseUid=xxx
  // جلب ملف المستخدم بـ Firebase UID
  async findMe(ctx) {
    const { firebaseUid } = ctx.query;
    if (!firebaseUid) {
      return ctx.badRequest('firebaseUid is required');
    }

    const profile = await strapi.db.query('api::user-profile.user-profile').findOne({
      where: { firebaseUid },
      populate: ['achievements'],
    });

    if (!profile) {
      return ctx.notFound('Profile not found');
    }

    return { data: profile };
  },

  // POST /api/user-profiles/sync
  // مزامنة بيانات المستخدم من التطبيق (upsert)
  async syncProfile(ctx) {
    const body = ctx.request.body?.data || ctx.request.body;
    if (!body?.firebaseUid) {
      return ctx.badRequest('firebaseUid is required');
    }

    const existing = await strapi.db.query('api::user-profile.user-profile').findOne({
      where: { firebaseUid: body.firebaseUid },
    });

    let result;
    if (existing) {
      result = await strapi.db.query('api::user-profile.user-profile').update({
        where: { id: existing.id },
        data: { ...body, lastActiveAt: new Date() },
      });
    } else {
      result = await strapi.db.query('api::user-profile.user-profile').create({
        data: {
          ...body,
          lastActiveAt: new Date(),
          weekStartedAt: new Date(),
          monthStartedAt: new Date(),
        },
      });
    }

    return { data: result };
  },

  // POST /api/user-profiles/add-points
  // إضافة نقاط لمستخدم معين
  async addPoints(ctx) {
    const { firebaseUid, points, eventType, eventRef } = ctx.request.body?.data || ctx.request.body;

    if (!firebaseUid || typeof points !== 'number') {
      return ctx.badRequest('firebaseUid and points are required');
    }

    const profile = await strapi.db.query('api::user-profile.user-profile').findOne({
      where: { firebaseUid },
    });

    if (!profile) {
      return ctx.notFound('Profile not found');
    }

    // تسجيل الحدث
    await strapi.db.query('api::points-event.points-event').create({
      data: {
        user_profile: profile.id,
        points,
        eventType: eventType || 'manual',
        eventRef: eventRef || null,
        occurredAt: new Date(),
      },
    });

    // تحديث النقاط الإجمالية
    const newTotal = (profile.totalPoints || 0) + points;
    const newWeekly = (profile.weeklyPoints || 0) + points;
    const newMonthly = (profile.monthlyPoints || 0) + points;

    // تحديد الرتبة الجديدة
    const newRank = await (strapi.service('api::user-profile.user-profile') as any).calculateRank(newTotal);

    const rankUp = newRank > (profile.currentRankLevel || 1);

    const updated = await strapi.db.query('api::user-profile.user-profile').update({
      where: { id: profile.id },
      data: {
        totalPoints: newTotal,
        weeklyPoints: newWeekly,
        monthlyPoints: newMonthly,
        currentRankLevel: newRank,
        lastActiveAt: new Date(),
      },
    });

    return {
      data: updated,
      meta: { rankUp, previousRank: profile.currentRankLevel, newRank },
    };
  },

  // GET /api/user-profiles/leaderboard?scope=all_time&limit=100
  async leaderboard(ctx) {
    const { scope = 'all_time', limit = 100, country } = ctx.query;

    const orderField =
      scope === 'weekly' ? 'weeklyPoints' :
      scope === 'monthly' ? 'monthlyPoints' :
      'totalPoints';

    const filters: any = { isPublic: true };
    if (country) filters.country = country;

    const profiles = await strapi.db.query('api::user-profile.user-profile').findMany({
      where: filters,
      orderBy: { [orderField]: 'desc' },
      limit: Number(limit),
      select: [
        'id', 'firebaseUid', 'displayName', 'photoURL', 'country',
        'totalPoints', 'weeklyPoints', 'monthlyPoints',
        'tasbihTotal', 'streak', 'currentRankLevel'
      ],
    });

    const ranked = profiles.map((p, i) => ({
      rank: i + 1,
      ...p,
      score: p[orderField as keyof typeof p],
    }));

    return { data: ranked, meta: { scope, count: ranked.length } };
  },

  // GET /api/user-profiles/my-rank?firebaseUid=xxx&scope=all_time
  // ترتيبي الحالي بين كل المستخدمين
  async myRank(ctx) {
    const { firebaseUid, scope = 'all_time' } = ctx.query;
    if (!firebaseUid) return ctx.badRequest('firebaseUid is required');

    const profile = await strapi.db.query('api::user-profile.user-profile').findOne({
      where: { firebaseUid: firebaseUid as string },
    });
    if (!profile) return ctx.notFound('Profile not found');

    const orderField =
      scope === 'weekly' ? 'weeklyPoints' :
      scope === 'monthly' ? 'monthlyPoints' :
      'totalPoints';

    const myScore = profile[orderField as keyof typeof profile] as number || 0;

    // عدد الناس الأفضل مني
    const countAbove = await strapi.db.query('api::user-profile.user-profile').count({
      where: {
        [orderField]: { $gt: myScore },
        isPublic: true,
      },
    });

    // العدد الإجمالي
    const totalUsers = await strapi.db.query('api::user-profile.user-profile').count({
      where: { isPublic: true },
    });

    const myRankPosition = countAbove + 1;

    // الشخص اللي قبلي مباشرة
    const nextUser = await strapi.db.query('api::user-profile.user-profile').findOne({
      where: {
        [orderField]: { $gt: myScore },
        isPublic: true,
      },
      orderBy: { [orderField]: 'asc' },
      select: ['displayName', orderField],
    });

    const pointsToNext = nextUser
      ? (nextUser[orderField as keyof typeof nextUser] as number) - myScore + 1
      : 0;

    return {
      data: {
        rank: myRankPosition,
        totalUsers,
        score: myScore,
        currentRankLevel: profile.currentRankLevel,
        pointsToNext,
        nextUserName: nextUser?.displayName || null,
        percentile: totalUsers > 0 ? Math.round((1 - (myRankPosition - 1) / totalUsers) * 100) : 100,
      },
    };
  },

  // POST /api/user-profiles/reset-weekly
  // تصفير النقاط الأسبوعية (يُستدعى كل يوم اثنين)
  async resetWeekly(ctx) {
    const profiles = await strapi.db.query('api::user-profile.user-profile').findMany({});
    const now = new Date();
    for (const p of profiles) {
      await strapi.db.query('api::user-profile.user-profile').update({
        where: { id: p.id },
        data: { weeklyPoints: 0, weekStartedAt: now },
      });
    }
    return { data: { reset: profiles.length } };
  },

  // POST /api/user-profiles/reset-monthly
  async resetMonthly(ctx) {
    const profiles = await strapi.db.query('api::user-profile.user-profile').findMany({});
    const now = new Date();
    for (const p of profiles) {
      await strapi.db.query('api::user-profile.user-profile').update({
        where: { id: p.id },
        data: { monthlyPoints: 0, monthStartedAt: now },
      });
    }
    return { data: { reset: profiles.length } };
  },
}));
