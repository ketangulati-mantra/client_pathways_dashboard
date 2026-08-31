/**
 * Configuration & Copy for Daily Check-In Milestones
 * Warm, exciting, motivating streak celebration system with Fire identity.
 */

export const MILESTONE_CONFIG = {
  3: {
    milestone: 3,
    periodLabel: '3 Days',
    badgeText: '🔥 3 Day Streak',
    headline: '3 days. You started something real.',
    message: 'Three days in a row of pausing, checking in, and making time for yourself.',
    closing: 'Your streak is alive and growing.',
    shareHeadline: '3 Day Check-In Streak',
    shareSubtitle: "I've made time for myself for 3 days in a row.",
    theme: {
      accentColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.45)',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      flameSize: 'large'
    }
  },
  7: {
    milestone: 7,
    periodLabel: 'A week',
    badgeText: '🔥 7 Day Streak',
    headline: '7 days. You kept showing up.',
    message: 'For a whole week, you made space to check in with yourself every single day.',
    closing: "That's something worth celebrating.",
    shareHeadline: '7 Day Check-In Streak',
    shareSubtitle: "I've made time for myself for 7 days in a row.",
    theme: {
      accentColor: '#f97316',
      glowColor: 'rgba(249, 115, 22, 0.5)',
      gradient: 'linear-gradient(135deg, #fde047 0%, #f97316 55%, #ea580c 100%)',
      flameSize: 'large'
    }
  },
  15: {
    milestone: 15,
    periodLabel: '15 Days',
    badgeText: '🔥 15 Day Streak',
    headline: "15 days. You're locked in.",
    message: 'Fifteen days of making space for yourself. Consistency has become part of your day.',
    closing: 'A genuine habit of self-awareness.',
    shareHeadline: '15 Day Check-In Streak',
    shareSubtitle: "I've made time for myself for 15 days in a row.",
    theme: {
      accentColor: '#f97316',
      glowColor: 'rgba(249, 115, 22, 0.55)',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 60%, #c2410c 100%)',
      flameSize: 'xlarge'
    }
  },
  30: {
    milestone: 30,
    periodLabel: 'A month',
    badgeText: '🔥 30 Day Streak',
    headline: 'A month of making space.',
    message: 'For thirty days, you’ve kept coming back to yourself, one moment at a time.',
    closing: 'You have built an enduring practice.',
    shareHeadline: '30 Day Check-In Streak',
    shareSubtitle: "I've made time for myself for 30 days in a row.",
    theme: {
      accentColor: '#ef4444',
      glowColor: 'rgba(239, 68, 68, 0.55)',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 45%, #dc2626 100%)',
      flameSize: 'xlarge'
    }
  },
  60: {
    milestone: 60,
    periodLabel: '60 Days',
    badgeText: '🔥 60 Day Streak',
    headline: "You've built something remarkable.",
    message: 'Sixty days of showing up, pausing, and making space for what you feel.',
    closing: 'This practice is now a deep part of you.',
    shareHeadline: '60 Day Check-In Streak',
    shareSubtitle: "I've made time for myself for 60 days in a row.",
    theme: {
      accentColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.6)',
      gradient: 'linear-gradient(135deg, #fef08a 0%, #f97316 50%, #b91c1c 100%)',
      flameSize: 'huge'
    }
  },
  100: {
    milestone: 100,
    periodLabel: '100 Days',
    badgeText: '🔥 100 Day Streak',
    headline: '100 days of self-discovery.',
    message: 'One hundred days of dedication to your mental wellbeing and self-presence.',
    closing: 'A truly extraordinary achievement.',
    shareHeadline: '100 Day Check-In Streak',
    shareSubtitle: "I've made time for myself for 100 days in a row.",
    theme: {
      accentColor: '#eab308',
      glowColor: 'rgba(234, 179, 8, 0.65)',
      gradient: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 40%, #ea580c 100%)',
      flameSize: 'huge'
    }
  }
};

export function getMilestoneDetails(milestoneNumber) {
  if (MILESTONE_CONFIG[milestoneNumber]) {
    return MILESTONE_CONFIG[milestoneNumber];
  }

  return {
    milestone: milestoneNumber,
    periodLabel: `${milestoneNumber} Days`,
    badgeText: `🔥 ${milestoneNumber} Day Streak`,
    headline: `${milestoneNumber} days of showing up.`,
    message: `For ${milestoneNumber} consecutive days, you've taken time to check in with yourself.`,
    closing: 'Keep your streak going, one moment at a time.',
    shareHeadline: `${milestoneNumber} Day Check-In Streak`,
    shareSubtitle: `I've made time for myself for ${milestoneNumber} days in a row.`,
    theme: {
      accentColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.5)',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 55%, #ea580c 100%)',
      flameSize: 'large'
    }
  };
}
