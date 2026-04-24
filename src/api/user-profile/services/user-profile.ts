/**
 * user-profile service
 * حساب الرتب والنقاط
 */

import { factories } from '@strapi/strapi';

// عتبات الرتب الخمسة (يمكن تعديلها من app-setting)
const DEFAULT_RANK_THRESHOLDS = [
  { level: 1, name: 'المُبتدِئ',  nameEn: 'Novice',   min: 0,      max: 500 },
  { level: 2, name: 'السَّالِك',   nameEn: 'Seeker',   min: 501,    max: 2500 },
  { level: 3, name: 'المُجتهِد',  nameEn: 'Striver',  min: 2501,   max: 10000 },
  { level: 4, name: 'المُقَرَّب',  nameEn: 'Devoted',  min: 10001,  max: 30000 },
  { level: 5, name: 'السَّابِق',   nameEn: 'Foremost', min: 30001,  max: Infinity },
];

export default factories.createCoreService('api::user-profile.user-profile', ({ strapi }) => ({

  /**
   * حساب رتبة المستخدم بناءً على إجمالي النقاط
   */
  async calculateRank(totalPoints: number): Promise<number> {
    const thresholds = await this.getRankThresholds();
    for (const tier of thresholds) {
      if (totalPoints >= tier.min && totalPoints <= tier.max) {
        return tier.level;
      }
    }
    return 1;
  },

  /**
   * جلب عتبات الرتب من الإعدادات (أو الافتراضي)
   */
  async getRankThresholds() {
    try {
      const settings = await strapi.db.query('api::app-setting.app-setting').findOne({});
      if (settings && (settings as any).rankThresholds) {
        return (settings as any).rankThresholds;
      }
    } catch (e) {
      // fallback to defaults
    }
    return DEFAULT_RANK_THRESHOLDS;
  },

  /**
   * حساب النقاط المتوقعة من نشاط معين
   */
  calculatePointsForEvent(eventType: string, meta?: any): number {
    const RULES: Record<string, number> = {
      tasbih: 1,                    // كل تسبيحة = 1 نقطة
      deed_today: 50,               // مهمة يومية
      deed_week: 150,               // مهمة أسبوعية
      deed_month: 400,              // مهمة شهرية
      deed_year: 1000,              // مهمة سنوية
      heart_deed: 200,              // عمل قلبي
      divine_name: 150,             // اسم من أسماء الله
      maqam: 250,                   // مقام من مدارج السالكين
      lecture: 100,                 // محاضرة
      quran_page: 30,               // صفحة قرآن
      surah_complete: 500,          // إتمام سورة
      streak_day: 10,               // يوم متواصل
      perfect_day: 300,             // يوم 100%
    };
    return RULES[eventType] || 0;
  },

  /**
   * فحص ما إذا كان المستخدم استحق ترقية في الرتبة
   */
  async checkRankPromotion(profileId: number): Promise<{ promoted: boolean; oldRank: number; newRank: number }> {
    const profile = await strapi.db.query('api::user-profile.user-profile').findOne({
      where: { id: profileId },
    });

    if (!profile) return { promoted: false, oldRank: 0, newRank: 0 };

    const oldRank = profile.currentRankLevel || 1;
    const newRank = await this.calculateRank(profile.totalPoints || 0);

    if (newRank > oldRank) {
      await strapi.db.query('api::user-profile.user-profile').update({
        where: { id: profileId },
        data: { currentRankLevel: newRank },
      });
      return { promoted: true, oldRank, newRank };
    }

    return { promoted: false, oldRank, newRank };
  },
}));
