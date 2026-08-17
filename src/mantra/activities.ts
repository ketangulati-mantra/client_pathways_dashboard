import { getCurrentService, normalizeService } from './services';

/**
 * Registered Lesson Activities Config
 * Single source of truth for all lesson pathways, point systems, routes, and service availability.
 */
export interface Activity {
  lessonId: string;
  activityId: string;
  title: string;
  rewardPoints: number;
  estimatedDuration: string;
  route: string;
  services: string[]; // e.g. ["therapy"], ["yoga"], or ["*"] for all services
  service?: string;   // Optional legacy string field for display/compatibility
  completionEndpoint?: string;
  redirectAfterCompletion?: boolean;
}

export const activities: Activity[] = [
  {
    lessonId: 'growth-journey',
    activityId: '',
    services: ['*'],
    title: 'Mantra Growth Journey',
    rewardPoints: 25,
    estimatedDuration: '2 min',
    route: '/task/growth-journey'
  },
  {
    lessonId: 'ehr-mantra-ai',
    activityId: '',
    services: ['*'],
    title: 'Run Your Practice Smarter with Mantra EHR + MantraAI',
    rewardPoints: 10,
    estimatedDuration: '3 min',
    route: '/task/ehr-mantra-ai'
  },
  {
    lessonId: 'introduction',
    activityId: '',
    services: ['*'],
    title: 'Introduction to Mantra Platform',
    rewardPoints: 5,
    estimatedDuration: '4 min',
    route: '/task/introduction'
  },
  {
    lessonId: 'mobile-app',
    activityId: '',
    services: ['*'],
    title: 'Download & Review MantraPartner App',
    rewardPoints: 5,
    estimatedDuration: '1 min',
    route: '/task/mobile-app'
  },
  {
    lessonId: 'using-mantra',
    activityId: '',
    services: ['*'],
    title: 'Using Mantra for Your Clients',
    rewardPoints: 10,
    estimatedDuration: '3 min',
    route: '/task/using-mantra'
  },
  {
    lessonId: 'getting-clients',
    activityId: '',
    services: ['*'],
    title: 'Getting Clients from Mantra',
    rewardPoints: 5,
    estimatedDuration: '4 min',
    route: '/task/getting-clients'
  },
  {
    lessonId: 'profile-verification',
    activityId: '',
    services: ['*'],
    title: 'Complete Profile Verification',
    rewardPoints: 10,
    estimatedDuration: '2 min',
    route: '/task/profile-verification'
  },
  {
    lessonId: 'premium-provider',
    activityId: '',
    services: ['*'],
    title: 'What is a Premium Provider?',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/premium-provider'
  },
  {
    lessonId: 'market-yourself',
    activityId: '',
    services: ['therapy'],
    title: 'grow your practice (therapymantra)',
    rewardPoints: 50,
    estimatedDuration: '10 min',
    route: '/task/market-yourself/therapy'
  },
  {
    lessonId: 'ocd-market-yourself',
    activityId: 'ocd-growth',
    services: ['therapy', 'psychiatry'],
    title: 'grow your practice (ocdmantra)',
    rewardPoints: 50,
    estimatedDuration: '10 min',
    route: '/task/ocd-market-yourself/therapy'
  },
  {
    lessonId: 'ocd-certificate',
    activityId: 'ocd-certificate',
    services: ['therapy', 'psychiatry', 'ocd'],
    title: 'Download Your OCD Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '1 min',
    route: '/task/ocd-certificate'
  },
  {
    lessonId: 'physio-market-yourself',
    activityId: 'physio-growth',
    services: ['physiotherapy'],
    title: 'grow your practice (physiomantra)',
    rewardPoints: 50,
    estimatedDuration: '10 min',
    route: '/task/physio-market-yourself/physiotherapy'
  },
  {
    lessonId: 'mantra-market-yourself',
    activityId: 'mantracare-growth',
    services: ['diet', 'coach', 'doctor', 'fitness', 'wellness', '*'],
    title: 'grow your practice (mantracare)',
    rewardPoints: 50,
    estimatedDuration: '10 min',
    route: '/task/mantra-market-yourself'
  },

  {
    lessonId: 'share-linkedin',
    activityId: '',
    services: ['*'],
    title: 'Share on LinkedIn & Earn Points',
    rewardPoints: 5,
    estimatedDuration: '5 min',
    route: '/task/share-linkedin'
  },
  {
    lessonId: 'show-achievements',
    activityId: '',
    services: ['*'],
    title: 'Show Your Achievements & Earn Rewards!',
    rewardPoints: 5,
    estimatedDuration: '5 min',
    route: '/task/show-achievements'
  },
  {
    lessonId: 'getting-paid',
    activityId: '',
    services: ['*'],
    title: 'Getting Paid on MantraCare',
    rewardPoints: 5,
    estimatedDuration: '4 min',
    route: '/task/getting-paid'
  },
  {
    lessonId: 'intern-program',
    activityId: '',
    services: ['therapy'],
    title: 'Mantra Foundation Therapy Intern Program',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/intern-program'
  },
  {
    lessonId: 'intern-certificate',
    activityId: '',
    services: ['therapy'],
    title: 'Download Your Therapy Intern Certificate',
    rewardPoints: 0,
    estimatedDuration: '2 min',
    route: '/task/intern-certificate'
  },
  {
    lessonId: 'session-notes',
    activityId: '',
    services: ['therapy', 'psychiatry'],
    title: 'Session Notes',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/session-notes'
  },
  {
    lessonId: 'couple-therapy',
    activityId: '',
    services: ['therapy'],
    title: 'Couple Therapy on the Mantra App',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/couple-therapy'
  },
  {
    lessonId: 'creating-pathway',
    activityId: '',
    services: ['therapy'],
    title: 'Creating a Pathway for Your Client',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/creating-pathway'
  },
  {
    lessonId: 'canned-responses',
    activityId: '',
    services: ['*'],
    title: 'Mantra Auto-Responses (Canned Responses)',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/canned-responses'
  },
  {
    lessonId: 'mantra-assessments',
    activityId: '',
    services: ['therapy', 'psychiatry'],
    title: 'Sharing Mantra Assessments',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/mantra-assessments'
  },
  {
    lessonId: 'support-hotline',
    activityId: '',
    services: ['therapy', 'listener', 'psychiatry'],
    title: 'Support Our Mental Health Hotline',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/support-hotline'
  },
  {
    lessonId: 'corporate-eap',
    activityId: '',
    services: ['*'],
    title: 'Corporate Growth Partner Program',
    rewardPoints: 50,
    estimatedDuration: '5 min',
    route: '/task/corporate-eap'
  },
  {
    lessonId: 'community-management',
    activityId: '',
    services: ['*'],
    title: 'Community Management - 10 Credits',
    rewardPoints: 10,
    estimatedDuration: '5 min',
    route: '/task/community-management'
  },
  {
    lessonId: 'content-creation',
    activityId: '',
    services: ['therapy', 'listener', 'psychiatry'],
    title: 'Content Creation for Mental Health - 20 Credits',
    rewardPoints: 10,
    estimatedDuration: '2 min',
    route: '/task/content-creation'
  },
  {
    lessonId: 'campus-awareness',
    activityId: '',
    services: ['therapy', 'listener', 'psychiatry'],
    title: 'Campus Ambassador Program',
    rewardPoints: 50,
    estimatedDuration: '2 min',
    route: '/task/campus-awareness'
  },
  {
    lessonId: 'fundraising',
    activityId: '',
    services: ['*'],
    title: 'Fund Raising for Mantra Foundation',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/fundraising'
  },
  {
    lessonId: 'recruit-interns',
    activityId: '',
    services: ['therapy', 'listener', 'psychiatry'],
    title: 'Help Recruit New Therapy Interns & Listeners',
    rewardPoints: 10,
    estimatedDuration: '2 min',
    route: '/task/recruit-interns'
  },
  {
    lessonId: 'refer-services',
    activityId: '',
    services: ['*'],
    title: 'Refer Other Services & Earn',
    rewardPoints: 10,
    estimatedDuration: '2 min',
    route: '/task/refer-services'
  },
  {
    lessonId: 'converting-clients',
    activityId: '',
    services: ['therapy'],
    title: 'Converting Trial Clients',
    rewardPoints: 10,
    estimatedDuration: '2 min',
    route: '/task/converting-clients'
  },
  {
    lessonId: 'insurance',
    activityId: '',
    services: ['therapy'],
    title: 'Insurance for Therapy (US, UK & Canada)',
    rewardPoints: 10,
    estimatedDuration: '3 min',
    route: '/task/insurance'
  },
  {
    lessonId: 'earn-points',
    activityId: '',
    services: ['*'],
    title: 'Earn Points for Every Session',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/earn-points'
  },
  {
    lessonId: 'refer-provider',
    activityId: '',
    services: ['*'],
    title: 'Refer a Provider & Earn Rewards',
    rewardPoints: 20,
    estimatedDuration: '3 min',
    route: '/task/refer-provider'
  },
  {
    lessonId: 'sales-partner',
    activityId: '',
    services: ['*'],
    title: 'Becoming a Mantra Sales Partner',
    rewardPoints: 10,
    estimatedDuration: '5 min',
    route: '/task/sales-partner'
  },

  {
    lessonId: 'provider-certificate',
    activityId: '',
    services: ['therapy'],
    title: 'Download your Therapy Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '1 min',
    route: '/task/provider-certificate'
  },
  {
    lessonId: 'top-listener-recognition',
    activityId: '',
    services: ['listener'],
    title: 'Top Listener of the Month & Recognition',
    rewardPoints: 10,
    estimatedDuration: '5 min',
    route: '/task/top-listener-recognition'
  },
  {
    lessonId: 'listener-certificate',
    activityId: '',
    services: ['listener'],
    title: 'Download Your Listener Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '1 min',
    route: '/task/listener-certificate'
  },
  {
    lessonId: 'yoga-pathway',
    activityId: '',
    services: ['yoga'],
    title: 'Creating a Yoga Pathway for Your Client',
    rewardPoints: 5,
    estimatedDuration: '5 min',
    route: '/task/yoga-pathway'
  },
  {
    lessonId: 'yoga-routine',
    activityId: '',
    services: ['yoga'],
    title: 'Create a Personalized Yoga Routine for Different Client Needs',
    rewardPoints: 5,
    estimatedDuration: '5 min',
    route: '/task/yoga-routine'
  },
  {
    lessonId: 'yoga-mindfulness',
    activityId: '',
    services: ['yoga'],
    title: 'Sharing In-Session Mindfulness or Breathing Exercises to Boost Engagement',
    rewardPoints: 5,
    estimatedDuration: '5 min',
    route: '/task/yoga-mindfulness'
  },
  {
    lessonId: 'yoga-nudging',
    activityId: '',
    services: ['yoga'],
    title: 'Nudging Clients to Practice Daily',
    rewardPoints: 5,
    estimatedDuration: '5 min',
    route: '/task/yoga-nudging'
  },
  {
    lessonId: 'yoga-refer-services',
    activityId: '',
    services: ['yoga'],
    title: 'Refer Other Services like Fit, Diet, Physio etc.',
    rewardPoints: 5,
    estimatedDuration: '5 min',
    route: '/task/yoga-refer-services'
  },
  {
    lessonId: 'yoga-market-profile',
    activityId: '',
    services: ['yoga'],
    title: 'Market Your Profile – Yoga Experts',
    rewardPoints: 5,
    estimatedDuration: '5 min',
    route: '/task/yoga-market-profile'
  },
  {
    lessonId: 'yoga-certificate',
    activityId: '',
    services: ['yoga'],
    title: 'Download Your Yoga Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '2 min',
    route: '/task/yoga-certificate'
  },
  {
    lessonId: 'meal-plans',
    activityId: '',
    services: ['diet'],
    title: 'Build Personalized Meal Plans',
    rewardPoints: 10,
    estimatedDuration: '5 min',
    route: '/meal-plans'
  },
  {
    lessonId: 'diet-auto-responses',
    activityId: '',
    services: ['diet'],
    title: 'Auto Responses To Improve Diet',
    rewardPoints: 5,
    estimatedDuration: '2 min',
    route: '/task/diet-auto-responses'
  },
  {
    lessonId: 'diet-challenges',
    activityId: '',
    services: ['diet'],
    title: 'Challenges To Motivate Diet & Nutrition',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/diet-challenges'
  },
  {
    lessonId: 'physio-challenges',
    activityId: '',
    services: ['physiotherapy'],
    title: 'Challenges To Motivate Physical Recovery',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/physio-challenges'
  },
  {
    lessonId: 'diet-expectations',
    activityId: '',
    services: ['diet'],
    title: 'Expectations From a Dietitian',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/diet-expectations'
  },
  {
    lessonId: 'team-chat-room',
    activityId: '',
    services: ['diet', 'fitness'],
    title: 'How to use the Team Chat Room for Comprehensive Plans',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/team-chat-room'
  },
  {
    lessonId: 'diet-certificate',
    activityId: '',
    services: ['diet'],
    title: 'Download Your Diet Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '2 min',
    route: '/task/diet-certificate'
  },
  {
    lessonId: 'physio-how-it-works',
    activityId: '',
    services: ['physiotherapy'],
    title: 'How PhysioMantra Works',
    rewardPoints: 10,
    estimatedDuration: '3 min',
    route: '/task/physio-how-it-works'
  },
  {
    lessonId: 'physio-exercise-library',
    activityId: '',
    services: ['physiotherapy'],
    title: 'Reviewing the Exercise Library',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/physio-exercise-library'
  },
  {
    lessonId: 'physio-tools',
    activityId: '',
    services: ['physiotherapy'],
    title: 'Additional Tools & Features for Personalized Recovery',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/physio-tools'
  },
  {
    lessonId: 'physio-nudging',
    activityId: '',
    services: ['physiotherapy'],
    title: 'Nudging Clients to Practice Home-Exercise Programs (HEP)',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/physio-nudging'
  },
  {
    lessonId: 'physio-trial-vs-regular',
    activityId: '',
    services: ['physiotherapy'],
    title: 'Trial Session vs Regular Sessions',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/physio-trial-vs-regular'
  },
  {
    lessonId: 'physio-certificate',
    activityId: '',
    services: ['physiotherapy'],
    title: 'Download Your Physio Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '1 min',
    route: '/task/physio-certificate'
  },
  {
    lessonId: 'women-wellness-plan-guide',
    activityId: '',
    services: ['women_wellness', 'diet'],
    title: 'Guide to creating plans for PCOS, menopause, maternity, or hormonal balance',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/women-wellness-plan-guide'
  },
  {
    lessonId: 'women-wellness-resources',
    activityId: '',
    services: ['women_wellness'],
    title: 'Sharing specialized resources',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/women-wellness-resources'
  },
  {
    lessonId: 'women-wellness-sensitive-discussions',
    activityId: '',
    services: ['women_wellness'],
    title: 'Tips for handling sensitive women\'s health discussions on the platform',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/women-wellness-sensitive-discussions'
  },
  {
    lessonId: 'women-wellness-certificate',
    activityId: '',
    services: ['women_wellness'],
    title: 'Download Your Women Wellness Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '1 min',
    route: '/task/women-wellness-certificate'
  },
  {
    lessonId: 'coach-accountability',
    activityId: '',
    services: ['coaching'],
    title: 'Using progress check-ins and accountability reminders on the app via chat',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/coach-accountability'
  },
  {
    lessonId: 'coach-certificate',
    activityId: '',
    services: ['coaching'],
    title: 'Download Your Coach Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '1 min',
    route: '/task/coach-certificate'
  },
  {
    lessonId: 'doctor-prescription',
    activityId: '',
    services: ['psychiatry', 'dermatology'],
    title: 'How to create a prescription in the app',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/doctor-prescription'
  },
  {
    lessonId: 'doctor-international-clients',
    activityId: '',
    services: ['psychiatry', 'dermatology'],
    title: 'Clients from Other Countries',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/doctor-international-clients'
  },
  {
    lessonId: 'doctor-video-consult',
    activityId: '',
    services: ['psychiatry', 'dermatology'],
    title: 'How to provide an efficient initial video consult using the app (history, exam, advice).',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/doctor-video-consult'
  },
  {
    lessonId: 'doctor-followup-nudging',
    activityId: '',
    services: ['psychiatry', 'dermatology'],
    title: 'Tracking follow-up schedules and nudging for compliance (appointments, tests).',
    rewardPoints: 5,
    estimatedDuration: '3 min',
    route: '/task/doctor-followup-nudging'
  },
  {
    lessonId: 'doctor-certificate',
    activityId: '',
    services: ['psychiatry', 'dermatology'],
    title: 'Download Your Doctor Provider Pathway Certificate',
    rewardPoints: 0,
    estimatedDuration: '1 min',
    route: '/task/doctor-certificate'
  }
];

/**
 * Filter all registered activities by service context.
 * - If targetService is 'all' or '*', returns ONLY activities common to ALL services (services includes '*').
 * - Otherwise, returns ONLY activities specific to the target service (excluding '*' common activities).
 */
export const getAvailableActivities = (targetService?: string): Activity[] => {
  const service = normalizeService(targetService || getCurrentService());

  if (service === 'all' || service === '*') {
    return activities.filter(activity => activity.services.includes('*'));
  }

  return activities.filter(activity =>
    !activity.services.includes('*') &&
    activity.services.map(s => normalizeService(s)).includes(service)
  );
};
