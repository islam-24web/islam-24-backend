/**
 * user-profile custom routes
 * مسارات مخصصة للمسابقة والترتيب
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/user-profiles/me',
      handler: 'user-profile.findMe',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/user-profiles/sync',
      handler: 'user-profile.syncProfile',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/user-profiles/add-points',
      handler: 'user-profile.addPoints',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/user-profiles/leaderboard',
      handler: 'user-profile.leaderboard',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/user-profiles/my-rank',
      handler: 'user-profile.myRank',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/user-profiles/reset-weekly',
      handler: 'user-profile.resetWeekly',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/user-profiles/reset-monthly',
      handler: 'user-profile.resetMonthly',
      config: { auth: false },
    },
  ],
};
