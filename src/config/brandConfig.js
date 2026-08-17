// Brand configuration for multi-platform reusability
export const BRAND_CONFIGS = {
  therapymantra: {
    id: 'therapymantra',
    name: 'TherapyMantra',
    tagline: 'TherapyMantra Growth Academy',
    subtitle: 'Learn how to increase your visibility, attract more clients, and grow your TherapyMantra listing through proven strategies.',
    logoUrl: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg',
    primaryColor: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    demoProfileUrl: 'https://therapists.therapymantra.co/list/therapist/demo',
    sampleListingId: '229102/erica-khanna',
    submissionService: 'corporate',
    activityId: 'grow-your-practice',
    lessonId: 'market-yourself',
    videos: {
      gettingClients: 'https://www.youtube.com/embed/VMWKdPGYoN4',
      marketProfile: 'https://www.youtube.com/embed/PvvqTeCUmWE'
    },
    shareTemplates: {
      linkedin: (url) => `I am proud to offer online therapy & wellness consultations on TherapyMantra.\n\nSchedule a session directly on my profile:\n🔗 ${url}\n\n#MentalHealth #TherapyMantra #OnlineTherapy`,
      instagram: (url) => `Licensed Mental Health Professional ✨\nHelping you heal, grow, and thrive\n👇 Book a session on TherapyMantra:\n${url}`,
      facebook: (url) => `Book online therapy sessions directly on TherapyMantra. Direct calendar scheduling available: ${url}`,
      whatsapp: (url) => `Hello! You can view my available TherapyMantra consultation slots and book a direct session online here: ${url}`,
      twitter: (url) => `Online therapy and wellness consultations available on TherapyMantra. Schedule a direct session: ${url}`
    }
  },
  ocdmantra: {
    id: 'ocdmantra',
    name: 'OCDMantra',
    tagline: 'OCDMantra Growth Academy',
    subtitle: 'Learn how to increase your visibility, attract ERP clients, and grow your OCDMantra listing.',
    logoUrl: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg',
    primaryColor: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    demoProfileUrl: 'https://ocdmantra.com/therapist/demo',
    sampleListingId: 'ocd-specialist',
    submissionService: 'corporate',
    activityId: 'ocd-growth',
    lessonId: 'ocd-market-yourself',
    videos: {
      gettingClients: 'https://www.youtube.com/embed/VMWKdPGYoN4',
      marketProfile: 'https://www.youtube.com/embed/PvvqTeCUmWE'
    },
    shareTemplates: {
      linkedin: (url) => `Specialized Exposure & Response Prevention (ERP) for OCD on OCDMantra.\n\nBook a consultation: ${url}`,
      instagram: (url) => `OCD Specialist & ERP Specialist ✨\n👇 Book a session on OCDMantra:\n${url}`,
      facebook: (url) => `Book specialized ERP therapy sessions on OCDMantra: ${url}`,
      whatsapp: (url) => `Hello! Book a direct OCD consultation here: ${url}`,
      twitter: (url) => `OCD therapy consultations available on OCDMantra: ${url}`
    }
  },
  physiomantra: {
    id: 'physiomantra',
    name: 'PhysioMantra',
    tagline: 'PhysioMantra Growth Academy',
    subtitle: 'Learn how to increase your visibility, attract physiotherapy clients, and grow your PhysioMantra listing.',
    logoUrl: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg',
    primaryColor: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    demoProfileUrl: 'https://physiomantra.com/therapist/demo',
    sampleListingId: 'physio-specialist',
    submissionService: 'corporate',
    activityId: 'physio-growth',
    lessonId: 'physio-market-yourself',
    videos: {
      gettingClients: 'https://www.youtube.com/embed/VMWKdPGYoN4',
      marketProfile: 'https://www.youtube.com/embed/PvvqTeCUmWE'
    },
    shareTemplates: {
      linkedin: (url) => `Specialized Physiotherapy & Rehabilitation on PhysioMantra.\n\nBook a consultation: ${url}`,
      instagram: (url) => `Licensed Physiotherapist ✨\n👇 Book a session on PhysioMantra:\n${url}`,
      facebook: (url) => `Book specialized physiotherapy consultations on PhysioMantra: ${url}`,
      whatsapp: (url) => `Hello! Book a direct physiotherapy consultation here: ${url}`,
      twitter: (url) => `Physiotherapy consultations available on PhysioMantra: ${url}`
    }
  },
  mantracare: {
    id: 'mantracare',
    name: 'MantraCare',
    tagline: 'MantraCare Growth Academy',
    subtitle: 'Learn how to increase your visibility, attract global clients, and grow your MantraCare provider listing.',
    logoUrl: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg',
    primaryColor: '#0284c7',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    demoProfileUrl: 'https://mantracare.org/provider/demo',
    sampleListingId: 'mantra-provider',
    submissionService: 'corporate',
    activityId: 'mantra-growth',
    lessonId: 'mantra-market-yourself',
    videos: {
      gettingClients: 'https://www.youtube.com/embed/VMWKdPGYoN4',
      marketProfile: 'https://www.youtube.com/embed/PvvqTeCUmWE'
    },
    shareTemplates: {
      linkedin: (url) => `Online healthcare & wellness consultations on MantraCare.\n\nBook a consultation: ${url}`,
      instagram: (url) => `Healthcare & Wellness Specialist ✨\n👇 Book a session on MantraCare:\n${url}`,
      facebook: (url) => `Book online consultations on MantraCare: ${url}`,
      whatsapp: (url) => `Hello! Book a direct consultation here: ${url}`,
      twitter: (url) => `Healthcare consultations available on MantraCare: ${url}`
    }
  }
};
