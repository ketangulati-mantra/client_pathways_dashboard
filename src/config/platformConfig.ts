export interface PlatformConfig {
  id: string;
  name: string;
  tagline: string;
  subtitle: string;
  logo: string;
  primaryColor: string;
  secondaryColor?: string;
  gradient: string;
  listingBaseUrl: string;
  demoProfileUrl: string;
  sampleListingId: string;
  submissionService: string;
  activityId: string;
  lessonId: string;
  youtubeVideos: {
    gettingClients: string;
    gettingClientsPoster?: string;
    marketProfile: string;
    marketProfilePoster?: string;
  };
  supportedPlatforms: Array<{
    id: string;
    name: string;
    color: string;
    why: string;
    bestPractice: string;
    placements: string[];
    url: string;
  }>;
  shareTemplates: Record<string, (url: string) => string>;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  therapymantra: {
    id: 'therapymantra',
    name: 'TherapyMantra',
    tagline: 'Grow Your Practice',
    subtitle: 'Learn how to increase your visibility, attract more clients, and grow your TherapyMantra listing through proven strategies.',
    logo: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785828110/therapymantraIcon_kie5d3.png',
    primaryColor: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    listingBaseUrl: 'https://therapists.therapymantra.co/list/therapist/',
    demoProfileUrl: 'https://therapists.therapymantra.co/list/therapist/demo-provider',
    sampleListingId: 'demo-provider',
    submissionService: 'corporate',
    activityId: 'grow-your-practice',
    lessonId: 'market-yourself',
    youtubeVideos: {
      gettingClients: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829768/vidssave.com_Getting_Clients_from_Mantra_Business_Growth_through_Platform_Visibility_1080P_o0lhmj.mp4',
      gettingClientsPoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumnail_2_YT_ubtbev.jpg',
      marketProfile: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829769/Market_Your_Profile_1080P_v6wtcx.mp4',
      marketProfilePoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumbnail_1_YT_t5egvr.jpg'
    },
    supportedPlatforms: [
      {
        id: 'linkedin',
        name: 'LinkedIn',
        color: '#0a66c2',
        why: 'Primary professional network for corporate clients & healthcare peers.',
        bestPractice: 'Pin your TherapyMantra listing URL in your profile Featured Section & Experience bio.',
        placements: ['Featured Section', 'Experience Bio', 'Weekly Educational Posts'],
        url: 'https://linkedin.com'
      },
      {
        id: 'instagram',
        name: 'Instagram',
        color: '#c026d3',
        why: 'Visual platform ideal for sharing short mental health educational carousel tips & Reels.',
        bestPractice: 'Place your TherapyMantra profile link in your Instagram bio link.',
        placements: ['Bio Link', 'Story Highlights', 'Reels CTA'],
        url: 'https://instagram.com'
      },
      {
        id: 'facebook',
        name: 'Facebook',
        color: '#2563eb',
        why: 'Reaches client communities, support groups, and family wellness demographics.',
        bestPractice: 'Add your TherapyMantra booking URL to your profile About section & pinned post.',
        placements: ['About Section', 'Pinned Post', 'Wellness Groups'],
        url: 'https://facebook.com'
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        color: '#059669',
        why: 'Direct messaging channel for client inquiries and auto-reply scheduling.',
        bestPractice: 'Add your TherapyMantra link to your WhatsApp Business About profile & Status updates.',
        placements: ['Business Profile About', 'Status Stories', 'Auto-Reply'],
        url: 'https://whatsapp.com'
      },
      {
        id: 'twitter',
        name: 'Twitter / X',
        color: '#0284c7',
        why: 'Real-time mental health advocacy and healthcare community discussions.',
        bestPractice: 'Add your TherapyMantra link in your bio and pin a post about your consultation availability.',
        placements: ['Profile Bio', 'Pinned Tweet', 'Educational Threads'],
        url: 'https://x.com'
      }
    ],
    shareTemplates: {
      linkedin: (url: string) => `I am proud to offer online therapy & wellness consultations on TherapyMantra.\n\nSchedule a session directly on my profile:\n🔗 ${url}\n\n#MentalHealth #TherapyMantra #OnlineTherapy`,
      instagram: (url: string) => `Licensed Mental Health Professional ✨\nHelping you heal, grow, and thrive\n👇 Book a session on TherapyMantra:\n${url}`,
      facebook: (url: string) => `Book online therapy sessions directly on TherapyMantra. Direct calendar scheduling available: ${url}`,
      whatsapp: (url: string) => `Hello! You can view my available TherapyMantra consultation slots and book a direct session online here: ${url}`,
      twitter: (url: string) => `Online therapy and wellness consultations available on TherapyMantra. Schedule a direct session: ${url}`
    }
  },
  ocdmantra: {
    id: 'ocdmantra',
    name: 'OCDMantra',
    tagline: 'OCDMantra Growth Academy',
    subtitle: 'Learn how to increase your visibility, attract ERP clients, and grow your OCDMantra listing through proven strategies.',
    logo: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png',
    primaryColor: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    listingBaseUrl: 'https://ocdmantra.com/list/therapist/',
    demoProfileUrl: 'https://ocdmantra.com/list/therapist/demo',
    sampleListingId: 'ocd-specialist',
    submissionService: 'corporate',
    activityId: 'ocd-growth',
    lessonId: 'ocd-market-yourself',
    youtubeVideos: {
      gettingClients: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829768/vidssave.com_Getting_Clients_from_Mantra_Business_Growth_through_Platform_Visibility_1080P_o0lhmj.mp4',
      gettingClientsPoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumnail_2_YT_ubtbev.jpg',
      marketProfile: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829769/Market_Your_Profile_1080P_v6wtcx.mp4',
      marketProfilePoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumbnail_1_YT_t5egvr.jpg'
    },
    supportedPlatforms: [
      {
        id: 'linkedin',
        name: 'LinkedIn',
        color: '#0a66c2',
        why: 'Connect with ERP specialists & corporate wellness programs.',
        bestPractice: 'Pin your OCDMantra listing URL in your profile Featured Section.',
        placements: ['Featured Section', 'Experience Bio'],
        url: 'https://linkedin.com'
      }
    ],
    shareTemplates: {
      linkedin: (url: string) => `Specialized Exposure & Response Prevention (ERP) for OCD on OCDMantra.\n\nBook a consultation: ${url}`,
      instagram: (url: string) => `OCD Specialist & ERP Professional ✨\n👇 Book a session on OCDMantra:\n${url}`,
      facebook: (url: string) => `Book specialized ERP therapy sessions on OCDMantra: ${url}`,
      whatsapp: (url: string) => `Hello! Book a direct OCD consultation here: ${url}`,
      twitter: (url: string) => `OCD therapy consultations available on OCDMantra: ${url}`
    }
  },
  physiomantra: {
    id: 'physiomantra',
    name: 'PhysioMantra',
    tagline: 'PhysioMantra Growth Academy',
    subtitle: 'Learn how to increase your visibility, attract physiotherapy clients, and grow your PhysioMantra listing.',
    logo: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1786001822/Physio_mantra_logo_zuxinh.png',
    primaryColor: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    listingBaseUrl: 'https://physiomantra.com/list/therapist/',
    demoProfileUrl: 'https://physiomantra.com/list/therapist/demo',
    sampleListingId: 'physio-specialist',
    submissionService: 'corporate',
    activityId: 'physio-growth',
    lessonId: 'physio-market-yourself',
    youtubeVideos: {
      gettingClients: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829768/vidssave.com_Getting_Clients_from_Mantra_Business_Growth_through_Platform_Visibility_1080P_o0lhmj.mp4',
      gettingClientsPoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumnail_2_YT_ubtbev.jpg',
      marketProfile: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829769/Market_Your_Profile_1080P_v6wtcx.mp4',
      marketProfilePoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumbnail_1_YT_t5egvr.jpg'
    },
    supportedPlatforms: [],
    shareTemplates: {
      linkedin: (url: string) => `Licensed Physiotherapy & Rehabilitation on PhysioMantra: ${url}`
    }
  },
  pridemantra: {
    id: 'pridemantra',
    name: 'PrideMantra',
    tagline: 'PrideMantra Growth Academy',
    subtitle: 'Learn how to increase your visibility and grow your LGBTQIA+ affirmative therapy practice on PrideMantra.',
    logo: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg',
    primaryColor: '#e11d48',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    listingBaseUrl: 'https://pridemantra.com/list/therapist/',
    demoProfileUrl: 'https://pridemantra.com/list/therapist/demo',
    sampleListingId: 'pride-specialist',
    submissionService: 'corporate',
    activityId: 'pride-growth',
    lessonId: 'pride-market-yourself',
    youtubeVideos: {
      gettingClients: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829768/vidssave.com_Getting_Clients_from_Mantra_Business_Growth_through_Platform_Visibility_1080P_o0lhmj.mp4',
      gettingClientsPoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumnail_2_YT_ubtbev.jpg',
      marketProfile: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829769/Market_Your_Profile_1080P_v6wtcx.mp4',
      marketProfilePoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumbnail_1_YT_t5egvr.jpg'
    },
    supportedPlatforms: [],
    shareTemplates: {
      linkedin: (url: string) => `LGBTQIA+ Affirmative Therapy consultations on PrideMantra: ${url}`
    }
  },
  mantracare: {
    id: 'mantracare',
    name: 'MantraCare',
    tagline: 'MantraCare Growth Academy',
    subtitle: 'Learn how to increase your visibility, attract clients across all healthcare modalities, and grow your practice on MantraCare.',
    logo: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg',
    primaryColor: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    listingBaseUrl: 'https://mantra.care/list/provider/',
    demoProfileUrl: 'https://mantra.care/list/provider/demo',
    sampleListingId: 'mantra-specialist',
    submissionService: 'corporate',
    activityId: 'mantracare-growth',
    lessonId: 'mantra-market-yourself',
    youtubeVideos: {
      gettingClients: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829768/vidssave.com_Getting_Clients_from_Mantra_Business_Growth_through_Platform_Visibility_1080P_o0lhmj.mp4',
      gettingClientsPoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumnail_2_YT_ubtbev.jpg',
      marketProfile: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1785829769/Market_Your_Profile_1080P_v6wtcx.mp4',
      marketProfilePoster: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785830152/thumbnail_1_YT_t5egvr.jpg'
    },
    supportedPlatforms: [],
    shareTemplates: {
      linkedin: (url: string) => `Online health & wellness consultations on MantraCare: ${url}`
    }
  }
};
