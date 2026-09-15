import { sql } from '../db/index.js';

export interface Challenge {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  durationDays: number;
  coverImage: string;
  category: string;
  status: 'active' | 'upcoming' | 'archived';
  dailyTimeMinutes: number;
  keyMilestones: Array<{ day: number; title: string; reward: string }>;
}

export interface ChallengeEnrollment {
  id: string | number;
  userId: string;
  challengeId: string;
  status: 'active' | 'completed' | 'paused';
  enrolledAt: string;
  currentDay: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardSlice {
  top: Array<{ rank: number; name: string; score: number; streak: number }>;
  me: { rank: number; score: number; streak: number } | null;
  updatedAt: string;
}

export interface ChallengeDashboardPayload {
  state: 'active' | 'no_active_challenge';
  challenge?: Challenge | null;
  enrollment?: ChallengeEnrollment | null;
  progress?: {
    percentage: number;
    daysRemaining: number;
    completedDays: number;
    totalDays: number;
    currentStreak?: number;
    longestStreak?: number;
    isTodayCompleted: boolean;
    isChallengeCompleted?: boolean;
  };
  today?: {
    dayNumber: number;
    title: string;
    description: string;
    estimatedMinutes: number;
    actionRoute: string;
    isCompleted: boolean;
  };
  nextUp?: {
    dayNumber: number;
    title: string;
    description: string;
    estimatedMinutes: number;
    actionRoute: string;
    tag?: string;
  } | null;
  milestones?: Array<{ day: number; title: string; isReached: boolean; isCurrent: boolean }>;
  insights?: string[];
  suggestions?: Array<{
    id: string;
    title: string;
    description?: string;
    tag: string;
    estimatedMinutes?: number;
    actionRoute: string;
  }>;
  therapyRecommendation?: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    actionRoute: string;
  };
  leaderboard?: LeaderboardSlice;
  community?: {
    activeParticipants: number;
    message: string;
  };
  availableChallenges?: Challenge[];
}

const SEED_CHALLENGES: Challenge[] = [
  {
    id: 'mantra_21',
    slug: 'mantra-21',
    name: 'Mantra 21',
    tagline: '21 days to show up for your mind.',
    description: 'A universal 21-day mental wellness challenge built around small, consistent actions, micro-habits, and self-discovery.',
    durationDays: 21,
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    category: 'Mental Wellness',
    status: 'active',
    dailyTimeMinutes: 10,
    keyMilestones: [
      { day: 1, title: 'First Step', reward: 'Starter Badge' },
      { day: 7, title: 'Consistency Checkpoint', reward: '7-Day Streak Badge' },
      { day: 14, title: 'Halfway Momentum', reward: 'Momentum Finisher' },
      { day: 21, title: 'Finisher Circle', reward: 'Mantra 21 Finisher Medal' }
    ]
  },
  {
    id: 'morning_calm_7',
    slug: 'morning-calm-7',
    name: '7-Day Morning Calm',
    tagline: 'Start your mornings with grounded clarity.',
    description: '7 days of 5-minute morning anchors, breathwork micro-steps, and intentional focus before your day begins.',
    durationDays: 7,
    coverImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
    category: 'Daily Grounding',
    status: 'active',
    dailyTimeMinutes: 5,
    keyMilestones: [
      { day: 1, title: 'Morning Spark', reward: 'Early Riser' },
      { day: 4, title: 'Rhythm Builder', reward: 'Grounded State' },
      { day: 7, title: '7-Day Anchor', reward: 'Morning Master' }
    ]
  },
  {
    id: 'sleep_reset_14',
    slug: 'sleep-reset-14',
    name: '14-Day Sleep & Unwind',
    tagline: 'Build an effortless bedtime routine.',
    description: 'Unwind your mind, release racing thoughts, and establish restful evening habits that last beyond two weeks.',
    durationDays: 14,
    coverImage: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80',
    category: 'Rest & Recovery',
    status: 'active',
    dailyTimeMinutes: 8,
    keyMilestones: [
      { day: 1, title: 'Unwind Onset', reward: 'Evening Pause' },
      { day: 7, title: 'Deep Rest', reward: 'Sleep Restorer' },
      { day: 14, title: '14-Day Reset', reward: 'Sleep Champion' }
    ]
  }
];

export const challengeService = {
  async ensureTables() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS challenges (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          tagline VARCHAR(255),
          description TEXT,
          duration_days INT NOT NULL DEFAULT 21,
          cover_image VARCHAR(500),
          category VARCHAR(100) DEFAULT 'Mental Wellness',
          status VARCHAR(50) DEFAULT 'active',
          daily_time_minutes INT DEFAULT 10,
          key_milestones JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS challenge_enrollments (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          challenge_id VARCHAR(100) NOT NULL DEFAULT 'mantra_21',
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          current_day INT NOT NULL DEFAULT 1,
          completed_days INT NOT NULL DEFAULT 0,
          current_streak INT NOT NULL DEFAULT 0,
          longest_streak INT NOT NULL DEFAULT 0,
          last_activity_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS challenge_activity_completions (
          id BIGSERIAL PRIMARY KEY,
          enrollment_id BIGINT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          challenge_id VARCHAR(100) NOT NULL DEFAULT 'mantra_21',
          challenge_day INT NOT NULL,
          activity_id VARCHAR(255) NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB DEFAULT '{}'::jsonb,
          CONSTRAINT unique_user_challenge_day UNIQUE (user_id, challenge_id, challenge_day)
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS challenge_leaderboard_snapshots (
          id BIGSERIAL PRIMARY KEY,
          challenge_id VARCHAR(100) NOT NULL DEFAULT 'mantra_21',
          snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
          total_participants INT DEFAULT 0,
          generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_challenge_snapshot_date UNIQUE (challenge_id, snapshot_date)
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS challenge_leaderboard_entries (
          id BIGSERIAL PRIMARY KEY,
          snapshot_id BIGINT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          user_display_name VARCHAR(255),
          rank INT NOT NULL,
          score INT NOT NULL DEFAULT 0,
          streak INT NOT NULL DEFAULT 0,
          completed_days INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Seed challenges if empty
      const existingChallenges = await sql`SELECT COUNT(*) as count FROM challenges;`;
      if (Number(existingChallenges[0]?.count || 0) === 0) {
        for (const item of SEED_CHALLENGES) {
          await sql`
            INSERT INTO challenges (
              id, slug, name, tagline, description, duration_days, cover_image, category, status, daily_time_minutes, key_milestones
            ) VALUES (
              ${item.id}, ${item.slug}, ${item.name}, ${item.tagline}, ${item.description}, 
              ${item.durationDays}, ${item.coverImage}, ${item.category}, ${item.status}, 
              ${item.dailyTimeMinutes}, ${JSON.stringify(item.keyMilestones)}::jsonb
            ) ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
    } catch (err) {
      console.warn('[ChallengeService] Ensure tables note:', err);
    }
  },

  /**
   * Get list of all available active challenges in the catalogue
   */
  async getAvailableChallenges(): Promise<Challenge[]> {
    await this.ensureTables();
    const rows = await sql`
      SELECT * FROM challenges 
      WHERE status = 'active'
      ORDER BY duration_days DESC;
    `;

    if (!rows || rows.length === 0) {
      return SEED_CHALLENGES;
    }

    return rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      tagline: r.tagline || '',
      description: r.description || '',
      durationDays: Number(r.duration_days || 21),
      coverImage: r.cover_image || '',
      category: r.category || 'Mental Wellness',
      status: r.status,
      dailyTimeMinutes: Number(r.daily_time_minutes || 10),
      keyMilestones: r.key_milestones || []
    }));
  },

  /**
   * Get single challenge metadata by ID or Slug
   */
  async getChallengeByIdOrSlug(idOrSlug: string): Promise<Challenge | null> {
    await this.ensureTables();
    const rows = await sql`
      SELECT * FROM challenges 
      WHERE id = ${idOrSlug} OR slug = ${idOrSlug}
      LIMIT 1;
    `;

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        tagline: r.tagline || '',
        description: r.description || '',
        durationDays: Number(r.duration_days || 21),
        coverImage: r.cover_image || '',
        category: r.category || 'Mental Wellness',
        status: r.status,
        dailyTimeMinutes: Number(r.daily_time_minutes || 10),
        keyMilestones: r.key_milestones || []
      };
    }

    const fallback = SEED_CHALLENGES.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    return fallback || null;
  },

  /**
   * Get the current active challenge enrollment for a user
   */
  async getActiveUserEnrollment(userId: string): Promise<ChallengeEnrollment | null> {
    await this.ensureTables();
    const cleanUserId = String(userId).trim();

    const rows = await sql`
      SELECT * FROM challenge_enrollments
      WHERE user_id = ${cleanUserId} AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return null;
    }

    return this.mapRow(rows[0]);
  },

  /**
   * Authoritative Enrollment with One-Active-Challenge Rule enforcement.
   * If user already has an active enrollment in THIS challenge, returns it idempotently.
   * If user has an active enrollment in ANOTHER challenge, rejects with 409 conflict error.
   */
  async enrollUser(userId: string, challengeId: string = 'mantra_21'): Promise<{ success: boolean; enrollment?: ChallengeEnrollment; error?: string; code?: string }> {
    await this.ensureTables();
    const cleanUserId = String(userId).trim();
    const cleanChallengeId = String(challengeId).trim();

    // 1. Check if user has ANY active challenge enrollment
    const activeEnrollment = await this.getActiveUserEnrollment(cleanUserId);
    if (activeEnrollment) {
      if (activeEnrollment.challengeId === cleanChallengeId) {
        // Idempotent return of existing enrollment
        return { success: true, enrollment: activeEnrollment };
      } else {
        // User already has an active enrollment in a different challenge
        return {
          success: false,
          error: `You are currently enrolled in ${activeEnrollment.challengeId}. Please complete or finish your active challenge before joining another.`,
          code: 'ACTIVE_CHALLENGE_EXISTS'
        };
      }
    }

    // 2. Validate target challenge exists
    const challenge = await this.getChallengeByIdOrSlug(cleanChallengeId);
    if (!challenge) {
      return { success: false, error: 'Challenge not found', code: 'CHALLENGE_NOT_FOUND' };
    }

    // 3. Create canonical enrollment
    const inserted = await sql`
      INSERT INTO challenge_enrollments (
        user_id,
        challenge_id,
        status,
        current_day,
        completed_days,
        current_streak,
        longest_streak,
        enrolled_at
      ) VALUES (
        ${cleanUserId},
        ${challenge.id},
        'active',
        1,
        0,
        0,
        0,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id, challenge_id)
      DO UPDATE SET status = 'active', updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    if (inserted && inserted.length > 0) {
      return { success: true, enrollment: this.mapRow(inserted[0]) };
    }

    const fallback = await this.getActiveUserEnrollment(cleanUserId);
    return { success: true, enrollment: fallback || undefined };
  },

  /**
   * Aggregated, single-roundtrip dashboard payload for /challenges
   */
  async getDashboardPayload(userId: string): Promise<ChallengeDashboardPayload> {
    await this.ensureTables();
    const cleanUserId = String(userId).trim();

    const activeEnrollment = await this.getActiveUserEnrollment(cleanUserId);

    // STATE 1: User has NO active challenge -> Return catalogue & catalogue metadata
    if (!activeEnrollment) {
      const available = await this.getAvailableChallenges();
      return {
        state: 'no_active_challenge',
        availableChallenges: available
      };
    }

    // STATE 2: User HAS an active challenge -> Build aggregated active dashboard
    const challenge = await this.getChallengeByIdOrSlug(activeEnrollment.challengeId);
    const totalDays = challenge?.durationDays || 21;
    const currentDay = Math.min(activeEnrollment.currentDay || 1, totalDays);
    const completedDays = activeEnrollment.completedDays || 0;

    // Check if today's activity is already completed
    const todayCompletion = await sql`
      SELECT id FROM challenge_activity_completions
      WHERE user_id = ${cleanUserId} AND challenge_id = ${activeEnrollment.challengeId} AND challenge_day = ${currentDay}
      LIMIT 1;
    `;
    const isTodayCompleted = Boolean(todayCompletion && todayCompletion.length > 0);

    // Milestones status
    const keyMilestones = challenge?.keyMilestones || [
      { day: 1, title: 'Started', reward: 'Starter' },
      { day: 7, title: 'First Milestone', reward: 'Streak 7' },
      { day: 14, title: 'Halfway', reward: 'Momentum' },
      { day: 21, title: 'Finisher', reward: 'Medal' }
    ];

    const milestones = keyMilestones.map((m) => ({
      day: m.day,
      title: m.title,
      isReached: completedDays >= m.day,
      isCurrent: currentDay === m.day
    }));

    // Dynamic Day Definition mapping for Mantra 21
    const DAY_TITLES: Record<number, { title: string; tagline: string; minutes: number; route: string; tag: string }> = {
      1: { title: 'Start Where You Are', tagline: 'Choose one small thing that makes today 1% easier.', minutes: 4, route: '/task/mantra21-day-1', tag: 'MOMENTUM' },
      2: { title: 'Noticing the Body', tagline: 'Map physical tension and give your nervous system a 2-minute anchor.', minutes: 5, route: '/task/mantra21-day-2', tag: 'SOMATIC AWARENESS' },
      3: { title: 'Thoughts Are Not Facts', tagline: 'See automatic critical thoughts as mental weather, not truth.', minutes: 6, route: '/task/mantra21-day-3', tag: 'COGNITIVE CLARITY' },
      4: { title: 'See the Cycle', tagline: 'Understand how thoughts, feelings, body, and actions feed into each other.', minutes: 7, route: '/task/mantra21-day-4', tag: 'CBT PATTERNS' },
      5: { title: 'Your Inner Dialogue', tagline: 'Notice the voice inside and shift from self-judgment to objective observation.', minutes: 5, route: '/task/mantra21-day-5', tag: 'SELF-TALK' },
      6: { title: 'Finding Micro-Enjoyment', tagline: 'Discover small moments and simple routines that still bring a spark.', minutes: 6, route: '/task/mantra21-day-6', tag: 'POSITIVE ACTIVATION' },
      7: { title: 'Consistency Checkpoint', tagline: 'Celebrate reaching your 7-day milestone and lock in your daily rhythm.', minutes: 5, route: '/task/mantra21-day-7', tag: 'MILESTONE' },
      8: { title: 'Mapping Your Support Circle', tagline: 'Identify the people and safe spaces you can lean on when things feel heavy.', minutes: 5, route: '/task/mantra21-day-8', tag: 'SOCIAL SUPPORT' },
      9: { title: 'Values Over Pressure', tagline: 'Clarify what truly matters to you versus external expectations.', minutes: 6, route: '/task/mantra21-day-9', tag: 'CORE VALUES' },
      10: { title: 'The Gentle Boundary', tagline: 'Learn to protect your mental energy with low-friction personal boundaries.', minutes: 5, route: '/task/mantra21-day-10', tag: 'ENERGY MANAGEMENT' },
      11: { title: 'Reclaiming Your Energy', tagline: 'Identify sneaky energy drains and restore your daily battery.', minutes: 6, route: '/task/mantra21-day-11', tag: 'RESTORATION' },
      12: { title: 'Overcoming Procrastination', tagline: 'Break the avoidance freeze using the 2-minute behavioral bridge.', minutes: 5, route: '/task/mantra21-day-12', tag: 'ACTION ACTIVATION' },
      13: { title: 'Self-Compassion in Action', tagline: 'Treat yourself with the same kindness you would offer a close friend.', minutes: 5, route: '/task/mantra21-day-13', tag: 'SELF-COMPASSION' },
      14: { title: 'Halfway Momentum', tagline: 'Two full weeks completed. Anchor your progress and step into the final stretch.', minutes: 6, route: '/task/mantra21-day-14', tag: 'MILESTONE' },
      15: { title: 'Mindful Breathing Anchors', tagline: 'Practical physiological breathwork for immediate nervous system de-escalation.', minutes: 5, route: '/task/mantra21-day-15', tag: 'SOMATIC CALM' },
      16: { title: 'Decisional Balance', tagline: 'Make grounded choices when feeling torn or paralyzed by indecision.', minutes: 6, route: '/task/mantra21-day-16', tag: 'DECISION AGILITY' },
      17: { title: 'Untangling Worry Loops', tagline: 'Separate what is within your sphere of control from what is not.', minutes: 5, route: '/task/mantra21-day-17', tag: 'WORRY CONTROL' },
      18: { title: 'Rewarding Small Wins', tagline: 'Train your brain to recognize and reinforce everyday progress.', minutes: 5, route: '/task/mantra21-day-18', tag: 'REINFORCEMENT' },
      19: { title: 'Creating Your Sanctuary Routine', tagline: 'Design a predictable 3-minute evening wind-down anchor.', minutes: 6, route: '/task/mantra21-day-19', tag: 'DAILY RHYTHM' },
      20: { title: 'Looking Back & Ahead', tagline: 'Review the insights and tools you have collected across 20 days.', minutes: 6, route: '/task/mantra21-day-20', tag: 'REFLECTION' },
      21: { title: 'Finisher Circle', tagline: 'Complete Day 21, unlock your finisher medal, and access the final podium.', minutes: 7, route: '/task/mantra21-day-21', tag: 'CHALLENGE FINISHER' }
    };

    const currentDayDef = DAY_TITLES[currentDay] || {
      title: `Day ${String(currentDay).padStart(2, '0')} Practice`,
      tagline: 'Show up for today with intentional focus and steady micro-actions.',
      minutes: 5,
      route: `/task/mantra21-day-${currentDay}`,
      tag: 'DAILY PRACTICE'
    };

    const nextDayNum = Math.min(21, currentDay + 1);
    const nextDayDef = DAY_TITLES[nextDayNum] || {
      title: `Day ${String(nextDayNum).padStart(2, '0')} Practice`,
      tagline: 'Continue your rhythm with tomorrow\'s focused practice.',
      minutes: 5,
      route: `/task/mantra21-day-${nextDayNum}`,
      tag: 'NEXT PRACTICE'
    };

    // Today's dynamic challenge action item
    const todayAction = {
      dayNumber: currentDay,
      title: currentDayDef.title,
      description: currentDayDef.tagline,
      estimatedMinutes: currentDayDef.minutes,
      actionRoute: currentDayDef.route,
      isCompleted: isTodayCompleted
    };

    // Next upcoming activity preview
    const nextUp = currentDay < 21 ? {
      dayNumber: nextDayNum,
      title: nextDayDef.title,
      description: nextDayDef.tagline,
      estimatedMinutes: nextDayDef.minutes,
      actionRoute: nextDayDef.route,
      tag: nextDayDef.tag
    } : null;

    // Deterministic Personalization derived from user signals
    const userSignals = await sql`
      SELECT signal, strength, source_type FROM user_personalization_signals
      WHERE user_id = ${cleanUserId}
      ORDER BY updated_at DESC
      LIMIT 10;
    `;

    // Extract deterministic insights from user activity & completions
    const activityCountRes = await sql`
      SELECT COUNT(DISTINCT activity_id) as total_activities, COUNT(DISTINCT challenge_day) as total_days
      FROM challenge_activity_completions
      WHERE user_id = ${cleanUserId};
    `;
    const distinctActivities = Number(activityCountRes[0]?.total_activities || 0);
    const completedDaysCount = Number(activityCountRes[0]?.total_days || completedDays);

    let insights: string[] = [];
    if (completedDaysCount >= 5) {
      insights.push("You've maintained a steady rhythm of showing up day after day.");
    }
    if (distinctActivities >= 3) {
      insights.push(`You've explored ${distinctActivities} different wellbeing tools and techniques.`);
    }
    if (userSignals?.some((s: any) => s.signal?.includes('tiny_step') || s.signal?.includes('depression_one_tiny_step'))) {
      insights.push("You respond particularly well to short, focused micro-actions.");
    }
    if (insights.length === 0) {
      if (completedDaysCount > 0) {
        insights.push("You've taken your initial steps. Your personal patterns will emerge naturally as you go.");
      } else {
        insights.push("Keep exploring. Your personal patterns will appear here as you go.");
      }
    }

    const suggestions = [
      {
        id: 'support_circle',
        title: 'Your Support Circle',
        description: 'Identify the people you can lean on when things feel heavy.',
        tag: 'ACTIVITY',
        estimatedMinutes: 5,
        actionRoute: '/task/depression-where-am-i-right-now'
      },
      {
        id: 'find_enjoyment',
        title: 'Find Your Enjoyment',
        description: 'Discover small moments and simple routines that still feel worth doing.',
        tag: 'ACTIVITY',
        estimatedMinutes: 6,
        actionRoute: '/task/depression-one-tiny-step'
      },
      {
        id: 'emotion_wheel',
        title: 'Emotion Wheel Explorer',
        description: 'Map out exactly what you are feeling beyond simple labels.',
        tag: 'SELF-DISCOVERY',
        estimatedMinutes: 4,
        actionRoute: '/task/emotion-wheel'
      }
    ];

    // Contextual Therapy Support Prompt (subtle, non-clinical, deterministic)
    const therapyRecommendation = {
      title: 'A LITTLE MORE SUPPORT',
      subtitle: 'You don\'t have to figure everything out alone.',
      description: 'If you\'d like someone beside you through this journey, explore structured 1-on-1 therapy support.',
      ctaText: 'EXPLORE SUPPORT →',
      actionRoute: '/task/how-can-therapy-help'
    };

    // Leaderboard Snapshot Slice
    const leaderboardSlice = await this.getLeaderboardSnapshotSlice(activeEnrollment.challengeId, cleanUserId);

    return {
      state: 'active',
      challenge,
      enrollment: activeEnrollment,
      progress: {
        percentage: Math.min(100, Math.round((completedDays / totalDays) * 100)),
        daysRemaining: Math.max(0, totalDays - completedDays),
        completedDays,
        totalDays,
        currentStreak: activeEnrollment.currentStreak || 0,
        longestStreak: activeEnrollment.longestStreak || 0,
        isTodayCompleted,
        isChallengeCompleted: activeEnrollment.status === 'completed' || completedDays >= totalDays
      },
      today: todayAction,
      nextUp,
      milestones,
      insights,
      suggestions,
      therapyRecommendation,
      leaderboard: leaderboardSlice,
      community: {
        activeParticipants: 4280,
        message: "Everyone is on their own day. Everyone is simply showing up."
      }
    };
  },

  /**
   * Fast Leaderboard slice reader using pre-computed daily snapshots
   */
  async getLeaderboardSnapshotSlice(challengeId: string = 'mantra_21', currentUserId?: string): Promise<LeaderboardSlice> {
    await this.ensureTables();

    // 1. Get latest snapshot
    let snapshot = await sql`
      SELECT * FROM challenge_leaderboard_snapshots
      WHERE challenge_id = ${challengeId}
      ORDER BY snapshot_date DESC, generated_at DESC
      LIMIT 1;
    `;

    // If no snapshot exists today, generate one on demand
    if (!snapshot || snapshot.length === 0) {
      await this.generateDailyLeaderboardSnapshot(challengeId);
      snapshot = await sql`
        SELECT * FROM challenge_leaderboard_snapshots
        WHERE challenge_id = ${challengeId}
        ORDER BY snapshot_date DESC, generated_at DESC
        LIMIT 1;
      `;
    }

    const snapshotId = snapshot[0]?.id;
    const updatedAt = snapshot[0]?.generated_at || new Date().toISOString();

    if (!snapshotId) {
      return {
        top: [
          { rank: 1, name: 'Aarav K.', score: 21, streak: 21 },
          { rank: 2, name: 'Riya S.', score: 19, streak: 19 },
          { rank: 3, name: 'Karan M.', score: 18, streak: 18 }
        ],
        me: { rank: 4, score: 17, streak: 1 },
        updatedAt
      };
    }

    // Top 5 entries
    const topEntries = await sql`
      SELECT rank, user_display_name, score, streak
      FROM challenge_leaderboard_entries
      WHERE snapshot_id = ${snapshotId}
      ORDER BY rank ASC
      LIMIT 5;
    `;

    // Current user's entry
    let userEntry = null;
    if (currentUserId) {
      const myRow = await sql`
        SELECT rank, score, streak
        FROM challenge_leaderboard_entries
        WHERE snapshot_id = ${snapshotId} AND user_id = ${String(currentUserId).trim()}
        LIMIT 1;
      `;
      if (myRow && myRow.length > 0) {
        userEntry = {
          rank: Number(myRow[0].rank),
          score: Number(myRow[0].score),
          streak: Number(myRow[0].streak)
        };
      }
    }

    const top = topEntries.map((e: any) => ({
      rank: Number(e.rank),
      name: e.user_display_name || 'Challenger',
      score: Number(e.score),
      streak: Number(e.streak)
    }));

    return {
      top: top.length > 0 ? top : [
        { rank: 1, name: 'Aarav K.', score: 21, streak: 21 },
        { rank: 2, name: 'Riya S.', score: 19, streak: 19 },
        { rank: 3, name: 'Karan M.', score: 18, streak: 18 }
      ],
      me: userEntry || { rank: 4, score: 17, streak: 1 },
      updatedAt
    };
  },

  /**
   * Scheduled/Batch aggregation to generate a clean leaderboard snapshot
   */
  async generateDailyLeaderboardSnapshot(challengeId: string = 'mantra_21') {
    try {
      await this.ensureTables();

      // Create new snapshot record
      const snapRes = await sql`
        INSERT INTO challenge_leaderboard_snapshots (challenge_id, snapshot_date, generated_at)
        VALUES (${challengeId}, CURRENT_DATE, CURRENT_TIMESTAMP)
        ON CONFLICT (challenge_id, snapshot_date)
        DO UPDATE SET generated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;

      const snapshotId = snapRes[0]?.id;
      if (!snapshotId) return;

      // Wipe old entries for this snapshot date
      await sql`DELETE FROM challenge_leaderboard_entries WHERE snapshot_id = ${snapshotId};`;

      // Aggregate consistency rankings based purely on completed_days & streak (NO mental health scores)
      const rankedParticipants = await sql`
        SELECT 
          e.user_id,
          COALESCE(u.name, 'Challenger') as display_name,
          (e.completed_days * 10 + e.current_streak * 2) as score,
          e.current_streak,
          e.completed_days,
          ROW_NUMBER() OVER (ORDER BY (e.completed_days * 10 + e.current_streak * 2) DESC, e.enrolled_at ASC) as rank
        FROM challenge_enrollments e
        LEFT JOIN users u ON e.user_id = u.user_id
        WHERE e.challenge_id = ${challengeId} AND e.status = 'active'
        LIMIT 100;
      `;

      if (rankedParticipants && rankedParticipants.length > 0) {
        for (const p of rankedParticipants) {
          await sql`
            INSERT INTO challenge_leaderboard_entries (
              snapshot_id, user_id, user_display_name, rank, score, streak, completed_days
            ) VALUES (
              ${snapshotId},
              ${p.user_id},
              ${p.display_name},
              ${Number(p.rank)},
              ${Number(p.score)},
              ${Number(p.current_streak || 0)},
              ${Number(p.completed_days || 0)}
            );
          `;
        }
      } else {
        // Seed default initial demo participants
        const defaultList = [
          { uid: 'challenger_1', name: 'Aarav K.', rank: 1, score: 21, streak: 21, days: 2 },
          { uid: 'challenger_2', name: 'Riya S.', rank: 2, score: 19, streak: 19, days: 1 },
          { uid: 'challenger_3', name: 'Karan M.', rank: 3, score: 18, streak: 18, days: 1 },
          { uid: '234306', name: 'You (Challenger)', rank: 4, score: 17, streak: 1, days: 1 }
        ];

        for (const item of defaultList) {
          await sql`
            INSERT INTO challenge_leaderboard_entries (
              snapshot_id, user_id, user_display_name, rank, score, streak, completed_days
            ) VALUES (
              ${snapshotId}, ${item.uid}, ${item.name}, ${item.rank}, ${item.score}, ${item.streak}, ${item.days}
            );
          `;
        }
      }
    } catch (e) {
      console.warn('[ChallengeService] Error generating leaderboard snapshot:', e);
    }
  },

  mapRow(row: any): ChallengeEnrollment {
    return {
      id: row.id,
      userId: row.user_id,
      challengeId: row.challenge_id,
      status: row.status,
      enrolledAt: row.enrolled_at,
      currentDay: Number(row.current_day || 1),
      completedDays: Number(row.completed_days || 0),
      currentStreak: Number(row.current_streak || 0),
      longestStreak: Number(row.longest_streak || 0),
      lastActivityAt: row.last_activity_at || null,
      completedAt: row.completed_at || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
};
