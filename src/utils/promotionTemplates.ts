/**
 * Promotion Templates Store
 * 
 * Placeholders: {{providerName}}, {{specialization}}, {{profileUrl}}
 */

export interface PromotionTemplateItem {
  id: string;
  title: string;
  category?: string;
  content: string;
  notes?: string;
}

export interface PlatformConfig {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  webUrl: string;
  templates: PromotionTemplateItem[];
}

export type BrandService = 'TherapyMantra' | 'OCDMantra' | 'PhysioMantra' | 'PrideMantra' | 'NutritionMantra' | 'YogaMantra' | string;

const DEFAULT_TEMPLATES: Record<string, PlatformConfig> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking & thought leadership',
    iconName: 'Share2',
    color: '#0a66c2',
    webUrl: 'https://www.linkedin.com/feed/',
    templates: [
      {
        id: 'li-1',
        title: '1. Professional Announcement',
        category: 'Announcement',
        content: `I'm pleased to share that I'm now accepting online consultations through TherapyMantra.

My name is {{providerName}} and I specialize in {{specialization}}. Partnering with TherapyMantra allows me to connect seamlessly with individuals looking for specialized support.

If you or someone in your network is seeking professional guidance, feel free to review my credentials or schedule a session directly:

{{profileUrl}}

Looking forward to continuing this work and supporting client well-being.`
      },
      {
        id: 'li-2',
        title: '2. Educational Thought Leadership',
        category: 'Thought Leadership',
        content: `Consistent health care is fundamental to long-term well-being. Yet, many individuals delay seeking guidance until distress becomes overwhelming.

As a {{specialization}}, I focus on helping clients develop effective coping strategies, foster emotional resilience, and maintain balanced relationships.

I have opened dedicated consultation slots on TherapyMantra for individuals seeking structured guidance.

You can learn more about my work or schedule an appointment here:

{{profileUrl}}`
      },
      {
        id: 'li-3',
        title: '3. Storytelling & Client Care',
        category: 'Storytelling',
        content: `One of the most rewarding aspects of working as a {{specialization}} is witnessing a client move from feeling stuck to rebuilding confidence and clarity.

My name is {{providerName}}, and I believe establishing a safe, trusting therapeutic alliance is where meaningful progress begins.

If you are navigating personal challenges or preparing for a new life transition, I am here to assist.

View my professional profile and current availability on TherapyMantra:

{{profileUrl}}`
      }
    ]
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Visual stories, captions, reels & bio',
    iconName: 'Globe',
    color: '#c026d3',
    webUrl: 'https://www.instagram.com/',
    templates: [
      {
        id: 'ig-1',
        title: 'Feed Caption',
        category: 'Feed',
        content: `Taking the first step toward personal growth requires clarity and support. 

As a {{specialization}}, I'm now accepting consultations through TherapyMantra 💙

If you're looking for support with {{specialization}}, I'd be happy to help.

Book here 👇
{{profileUrl}}`
      },
      {
        id: 'ig-2',
        title: 'Story Text',
        category: 'Story',
        content: `Mental well-being is an ongoing journey ✨
I'm {{providerName}} and I'm now accepting online consultation sessions on TherapyMantra.

🔗 Tap here to view profile & book:
{{profileUrl}}`
      },
      {
        id: 'ig-3',
        title: 'Bio Example',
        category: 'Bio',
        content: `{{providerName}} | {{specialization}}
🤝 Online Consultations on TherapyMantra
👇 Book a session below
{{profileUrl}}`
      },
      {
        id: 'ig-4',
        title: 'Reel Caption',
        category: 'Reels',
        content: `Small, consistent daily habits build long-term resilience. If you've been feeling overwhelmed lately, professional guidance in {{specialization}} can make all the difference.

I provide virtual sessions through TherapyMantra. 

🔗 Link in bio to get started:
{{profileUrl}}`
      }
    ]
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    description: 'Community-oriented updates & family reach',
    iconName: 'Share2',
    color: '#2563eb',
    webUrl: 'https://www.facebook.com/',
    templates: [
      {
        id: 'fb-1',
        title: 'Community Announcement',
        category: 'Community',
        content: `Hello everyone,

I wanted to share a quick update regarding my practice. My name is {{providerName}} and I am currently offering confidential online consultations in {{specialization}} through TherapyMantra.

If you or someone in your community could benefit from structured support, please feel free to share this post or view my profile details here:

{{profileUrl}}

Wishing you all health and peace.`
      }
    ]
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Direct status updates & business profile info',
    iconName: 'MessageSquare',
    color: '#16a34a',
    webUrl: 'https://web.whatsapp.com/',
    templates: [
      {
        id: 'wa-1',
        title: 'Business About / Description',
        category: 'Profile Info',
        content: `{{providerName}} — {{specialization}}. Online consultations available on TherapyMantra: {{profileUrl}}`
      },
      {
        id: 'wa-2',
        title: 'Status Update',
        category: 'Status',
        content: `Now accepting appointments through TherapyMantra.

{{specialization}}

Book here:
{{profileUrl}}`
      },
      {
        id: 'wa-3',
        title: 'Availability Message',
        category: 'Direct Update',
        content: `Hello! Virtual consultation slots are currently open for {{specialization}} with {{providerName}}. You can review my bio and reserve a time at {{profileUrl}}`
      }
    ]
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'Short insights & direct profile links',
    iconName: 'FileText',
    color: '#0284c7',
    webUrl: 'https://x.com/',
    templates: [
      {
        id: 'tw-1',
        title: '1. Professional Short Post',
        category: 'Short Post',
        content: `Prioritizing well-being is a sign of strength, not weakness. As a {{specialization}}, I'm now conducting online consultations on TherapyMantra.

Book a session here: {{profileUrl}}`
      },
      {
        id: 'tw-2',
        title: '2. Healthcare Insight',
        category: 'Insight',
        content: `Effective care isn't about giving advice—it's about empowering individuals with tools for clarity and resilience. My name is {{providerName}} and my virtual sessions in {{specialization}} are now open on TherapyMantra: {{profileUrl}}`
      }
    ]
  },
  email: {
    id: 'email',
    name: 'Email & Outreach',
    description: 'Professional introduction & consultation details',
    iconName: 'Mail',
    color: '#4f46e5',
    webUrl: 'https://mail.google.com/mail/u/0/#inbox?compose=new',
    templates: [
      {
        id: 'em-1',
        title: '1. Professional Client Introduction',
        category: 'Outreach',
        content: `Subject: Professional Support & Consultations – TherapyMantra

Hi,

I hope you're doing well.

I wanted to introduce TherapyMantra, a platform that connects individuals with qualified mental health professionals.

As a {{specialization}}, I am available for structured online consultations through TherapyMantra.

If you or someone in your network may benefit from professional support, you can view my credentials and availability here:

{{profileUrl}}

Feel free to reach out if you'd like to know more.

Warm regards,

{{providerName}}`
      },
      {
        id: 'em-2',
        title: '2. Professional Referral Notice',
        category: 'Referral',
        content: `Subject: Consultation Availability & Practice Update – TherapyMantra

Hello,

I am writing to share an update regarding my practice. I am currently offering virtual consultations through TherapyMantra.

In my work as a {{specialization}}, I focus on supporting clients with evidence-based care and structured guidance.

For booking details or to view my clinical profile, please visit:

{{profileUrl}}

Thank you for your time, and please feel free to share this with anyone seeking specialized guidance.

Sincerely,

{{providerName}}`
      },
      {
        id: 'em-3',
        title: '3. Concise Email Footer / Bio',
        category: 'Signature',
        content: `Subject: Online Consultation Booking – {{providerName}}

Hi,

For confidential online consultations and appointments in {{specialization}}, you can access my profile directly through TherapyMantra:

{{profileUrl}}

Best regards,

{{providerName}}
{{specialization}}`
      }
    ]
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    description: 'Educational answers & value-first participation',
    iconName: 'MessageSquare',
    color: '#ea580c',
    webUrl: 'https://www.reddit.com/',
    templates: [
      {
        id: 'rd-1',
        title: 'Educational Ending (Value-First Guidelines)',
        category: 'Guidelines & Ending',
        content: `[DO NOT POST PROMOTIONAL SPAM. ANSWER THE USER'S QUESTION IN DETAIL FIRST.]

---
GOOD EXAMPLE ENDING:
"Hope this breakdown helps clarify your question! 

My name is {{providerName}}, and as a {{specialization}}, I regularly address these challenges. If you'd like to explore structured support, you can find my professional profile here: {{profileUrl}}"`
      }
    ]
  },
  quora: {
    id: 'quora',
    name: 'Quora',
    description: 'In-depth answers with natural profile attribution',
    iconName: 'HelpCircle',
    color: '#b91c1c',
    webUrl: 'https://www.quora.com/',
    templates: [
      {
        id: 'qr-1',
        title: 'In-Depth Answer Attribution',
        category: 'Attribution',
        content: `[PROVIDE A COMPREHENSIVE, HIGH-VALUE CLINICAL ANSWER FIRST.]

---
RECOMMENDED CLOSING ATTRIBUTION:
"Building resilience is a continuous process that improves with evidence-based guidance. 

My name is {{providerName}} and as a {{specialization}}, I regularly address these topics in my practice. For more details or to schedule a virtual consultation, you are welcome to visit my TherapyMantra profile: {{profileUrl}}"`
      }
    ]
  }
};

const OCD_TEMPLATES: Record<string, PlatformConfig> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking & ERP clinical focus',
    iconName: 'Share2',
    color: '#0a66c2',
    webUrl: 'https://www.linkedin.com/feed/',
    templates: [
      {
        id: 'li-ocd-1',
        title: '1. ERP Practice Announcement',
        category: 'Announcement',
        content: `I am pleased to announce that I am now offering specialized Exposure and Response Prevention (ERP) consultations through OCDMantra.

My name is {{providerName}} and I specialize in {{specialization}}. OCD requires evidence-based, specialized care, and partnering with OCDMantra allows me to support individuals navigating Obsessive-Compulsive Disorder with structured ERP protocols.

If you or someone in your network is seeking specialized OCD therapy, view my profile & availability here:

{{profileUrl}}`
      },
      {
        id: 'li-ocd-2',
        title: '2. ERP & OCD Clinical Insight',
        category: 'Thought Leadership',
        content: `Standard talk therapy can often accidentally reinforce OCD compulsions. Evidence-based treatment like Exposure & Response Prevention (ERP) is the gold standard for long-term recovery.

As an OCD specialist focusing on {{specialization}}, I help clients systematically face anxiety triggers without engaging in compulsive rituals.

I have opened dedicated ERP consultation slots on OCDMantra. Learn more or schedule a session:

{{profileUrl}}`
      },
      {
        id: 'li-ocd-3',
        title: '3. Understanding Compulsions & ERP',
        category: 'Education',
        content: `Breaking free from the OCD cycle requires stepping away from reassurance-seeking and embracing uncertainty with ERP tools.

My name is {{providerName}}, and I am committed to delivering compassionate, evidence-based ERP therapy.

View my clinical bio and open ERP consultation slots on OCDMantra:

{{profileUrl}}`
      }
    ]
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Visual ERP tips, reels & OCD education',
    iconName: 'Globe',
    color: '#c026d3',
    webUrl: 'https://www.instagram.com/',
    templates: [
      {
        id: 'ig-ocd-1',
        title: 'Feed Caption - ERP Focus',
        category: 'Feed',
        content: `Recovery from OCD is possible with evidence-based Exposure & Response Prevention (ERP) 🧠✨

As an OCD specialist in {{specialization}}, I'm now accepting virtual ERP consultations on OCDMantra.

Book a direct 1-on-1 session below 👇
{{profileUrl}}`
      },
      {
        id: 'ig-ocd-2',
        title: 'Story Text - OCD Support',
        category: 'Story',
        content: `Struggling with intrusive thoughts or compulsions? 💭
I'm {{providerName}}, specializing in ERP therapy. Virtual consultations are open on OCDMantra.

🔗 Tap to view profile & book:
{{profileUrl}}`
      },
      {
        id: 'ig-ocd-3',
        title: 'Bio Example - OCD Specialist',
        category: 'Bio',
        content: `{{providerName}} | {{specialization}}
🧠 ERP Therapy for OCD on OCDMantra
👇 Schedule an online consultation
{{profileUrl}}`
      }
    ]
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    description: 'OCD community & family support posts',
    iconName: 'Share2',
    color: '#2563eb',
    webUrl: 'https://www.facebook.com/',
    templates: [
      {
        id: 'fb-ocd-1',
        title: 'OCD Support Announcement',
        category: 'Community',
        content: `Hello everyone,

I wanted to share that I am currently offering specialized online ERP therapy for Obsessive-Compulsive Disorder (OCD) through OCDMantra.

My name is {{providerName}} and I work with clients seeking evidence-based tools for intrusive thoughts, contamination fears, and compulsive behaviors.

View my profile and book a session directly here:

{{profileUrl}}`
      }
    ]
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Direct status updates & OCD client inquiries',
    iconName: 'MessageSquare',
    color: '#16a34a',
    webUrl: 'https://web.whatsapp.com/',
    templates: [
      {
        id: 'wa-ocd-1',
        title: 'Business About / Description',
        category: 'Profile Info',
        content: `{{providerName}} — {{specialization}} | ERP Therapy on OCDMantra: {{profileUrl}}`
      },
      {
        id: 'wa-ocd-2',
        title: 'Status Update',
        category: 'Status',
        content: `Now accepting online ERP therapy appointments for OCD on OCDMantra.

Book here:
{{profileUrl}}`
      }
    ]
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'OCD advocacy & short ERP tips',
    iconName: 'FileText',
    color: '#0284c7',
    webUrl: 'https://x.com/',
    templates: [
      {
        id: 'tw-ocd-1',
        title: 'ERP & OCD Advocacy',
        category: 'Short Post',
        content: `Compulsions offer temporary relief, but ERP offers long-term recovery. As an OCD therapist specializing in {{specialization}}, my virtual consultation slots are open on OCDMantra:

{{profileUrl}}`
      }
    ]
  },
  email: {
    id: 'email',
    name: 'Email & Outreach',
    description: 'Specialized ERP consultation introduction & referrals',
    iconName: 'Mail',
    color: '#4f46e5',
    webUrl: 'https://mail.google.com/mail/u/0/#inbox?compose=new',
    templates: [
      {
        id: 'em-ocd-1',
        title: '1. ERP Practice & Client Introduction',
        category: 'Outreach',
        content: `Subject: Specialized ERP Therapy for OCD – OCDMantra

Hi,

I hope you're doing well.

I wanted to share that I am currently offering specialized Exposure and Response Prevention (ERP) consultations through OCDMantra.

OCD requires evidence-based, specialized care. As an OCD specialist focusing on {{specialization}}, I help clients systematically face anxiety triggers without engaging in compulsive rituals.

If you or someone in your network is seeking specialized ERP support for OCD, you can view my credentials and current availability here:

{{profileUrl}}

Feel free to reach out if you'd like to learn more.

Warm regards,

{{providerName}}`
      },
      {
        id: 'em-ocd-2',
        title: '2. Professional ERP Clinical Referral',
        category: 'Referral',
        content: `Subject: OCD & ERP Consultation Availability – OCDMantra

Hello,

I am writing to share an update regarding my clinical practice. I am accepting new virtual ERP consultation clients on OCDMantra.

In my work as a {{specialization}}, I utilize Exposure & Response Prevention (ERP) protocols to support individuals navigating intrusive thoughts and compulsions.

You can review my clinical profile or schedule a direct consultation here:

{{profileUrl}}

Thank you for your time, and please feel free to forward this to colleagues or clients seeking OCD treatment.

Sincerely,

{{providerName}}`
      },
      {
        id: 'em-ocd-3',
        title: '3. Concise ERP Consultation Footer',
        category: 'Signature',
        content: `Subject: ERP Therapy & Consultation Booking – {{providerName}}

Hi,

For confidential online ERP consultations for Obsessive-Compulsive Disorder (OCD), you can access my profile directly through OCDMantra:

{{profileUrl}}

Best regards,

{{providerName}}
{{specialization}}`
      }
    ]
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    description: 'OCD educational advice & ERP attribution',
    iconName: 'MessageSquare',
    color: '#ea580c',
    webUrl: 'https://www.reddit.com/',
    templates: [
      {
        id: 'rd-ocd-1',
        title: 'r/OCD Educational Response Ending',
        category: 'Guidelines & Ending',
        content: `[PROVIDE A DETAILED, HELPFUL ERP EXPLANATION FIRST - DO NOT SPAM.]

---
RECOMMENDED CLOSING ATTRIBUTION:
"Learning to sit with anxiety without executing compulsions takes guidance and practice.

My name is {{providerName}}, and as a {{specialization}}, I focus on ERP for OCD. If you're seeking structured virtual sessions, you can view my profile on OCDMantra: {{profileUrl}}"`
      }
    ]
  }
};

export const PHYSIO_TEMPLATES: Record<string, PlatformConfig> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Physical therapy clinical announcements & rehabilitation networks',
    iconName: 'Globe',
    color: '#0a66c2',
    webUrl: 'https://www.linkedin.com/feed/',
    templates: [
      {
        id: 'li-physio-1',
        title: 'Physiotherapy Practice Announcement',
        category: 'Clinical Post',
        content: `I am pleased to share that I am accepting online physiotherapy & rehabilitation consultation appointments through PhysioMantra!

My name is {{providerName}} and I work with clients seeking evidence-based physical therapy for musculoskeletal recovery, posture correction, post-op rehab, and chronic pain management.

If you or someone in your network needs professional physiotherapy guidance, you can schedule a session directly through my profile:

🔗 {{profileUrl}}

#Physiotherapy #PhysioMantra #Rehabilitation #PhysicalTherapy #MusculoskeletalHealth`
      }
    ]
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Exercise form reels & rehabilitation bio links',
    iconName: 'Share2',
    color: '#c026d3',
    webUrl: 'https://www.instagram.com/',
    templates: [
      {
        id: 'ig-physio-1',
        title: 'Physio Profile Bio',
        category: 'Bio Link',
        content: `Physiotherapist & Movement Specialist 🏋️‍♂️✨
Empowering recovery, posture correction & pain management.
👇 Book online physio consultations on PhysioMantra:
{{profileUrl}}`
      }
    ]
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    description: 'Physiotherapy community & rehabilitation posts',
    iconName: 'Share2',
    color: '#2563eb',
    webUrl: 'https://www.facebook.com/',
    templates: [
      {
        id: 'fb-physio-1',
        title: 'Physiotherapy Support Announcement',
        category: 'Community',
        content: `Hello everyone,

I wanted to share that I am currently offering specialized online physiotherapy consultations through PhysioMantra.

My name is {{providerName}} and I assist individuals with targeted exercise therapy, injury rehabilitation, and pain relief.

View my profile and book a session directly here:

{{profileUrl}}`
      }
    ]
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Direct status updates & physio client inquiries',
    iconName: 'MessageSquare',
    color: '#16a34a',
    webUrl: 'https://web.whatsapp.com/',
    templates: [
      {
        id: 'wa-physio-1',
        title: 'Business About / Description',
        category: 'Profile Info',
        content: `{{providerName}} — {{specialization}} | Physical Therapy on PhysioMantra: {{profileUrl}}`
      },
      {
        id: 'wa-physio-2',
        title: 'Status Update',
        category: 'Status',
        content: `Now accepting online physiotherapy appointments on PhysioMantra.

Book your session here:
{{profileUrl}}`
      }
    ]
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'Physiotherapy & posture tips',
    iconName: 'FileText',
    color: '#0284c7',
    webUrl: 'https://x.com/',
    templates: [
      {
        id: 'tw-physio-1',
        title: 'Physio & Movement Advocacy',
        category: 'Short Post',
        content: `Targeted exercise therapy and movement guidance build long-term physical health. As a physiotherapist specializing in {{specialization}}, my virtual consultation slots are open on PhysioMantra:

{{profileUrl}}`
      }
    ]
  },
  email: {
    id: 'email',
    name: 'Email & Outreach',
    description: 'Specialized physiotherapy consultation introduction & referrals',
    iconName: 'Mail',
    color: '#4f46e5',
    webUrl: 'https://mail.google.com/mail/u/0/#inbox?compose=new',
    templates: [
      {
        id: 'em-physio-1',
        title: '1. Physiotherapy Practice & Client Introduction',
        category: 'Outreach',
        content: `Subject: Professional Physiotherapy & Rehabilitation Consultations – PhysioMantra

Hi,

I hope you're doing well.

I wanted to share that I am currently offering specialized online physiotherapy consultations through PhysioMantra.

As a {{specialization}}, I help clients with targeted physical therapy protocols, posture correction, injury recovery, and pain management.

If you or someone in your network is seeking physical therapy support, you can view my credentials and current availability here:

{{profileUrl}}

Feel free to reach out if you'd like to learn more.

Warm regards,

{{providerName}}`
      },
      {
        id: 'em-physio-2',
        title: '2. Professional Physio Referral Notice',
        category: 'Referral',
        content: `Subject: Physiotherapy Consultation Availability – PhysioMantra

Hello,

I am writing to share an update regarding my clinical practice. I am accepting new virtual physical therapy consultation clients on PhysioMantra.

In my work as a {{specialization}}, I utilize evidence-based movement protocols to support individuals navigating musculoskeletal recovery and injury rehabilitation.

You can review my clinical profile or schedule a direct consultation here:

{{profileUrl}}

Thank you for your time, and please feel free to forward this to anyone seeking physical therapy care.

Sincerely,

{{providerName}}`
      },
      {
        id: 'em-physio-3',
        title: '3. Concise Physio Consultation Footer',
        category: 'Signature',
        content: `Subject: Physiotherapy Consultation Booking – {{providerName}}

Hi,

For confidential online physiotherapy consultations, you can access my profile directly through PhysioMantra:

{{profileUrl}}

Best regards,

{{providerName}}
{{specialization}}`
      }
    ]
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    description: 'Physiotherapy advice & rehabilitation attribution',
    iconName: 'MessageSquare',
    color: '#ea580c',
    webUrl: 'https://www.reddit.com/',
    templates: [
      {
        id: 'rd-physio-1',
        title: 'r/Physiotherapy Response Ending',
        category: 'Guidelines & Ending',
        content: `[PROVIDE DETAILED, HELPFUL MOVEMENT/EXERCISE ADVICE FIRST - DO NOT SPAM.]

---
RECOMMENDED CLOSING ATTRIBUTION:
"Consistent movement therapy and proper exercise technique take guidance and practice.

My name is {{providerName}}, and as a {{specialization}}, I focus on physical rehabilitation. If you're seeking structured virtual sessions, you can view my profile on PhysioMantra: {{profileUrl}}"`
      }
    ]
  }
};

/**
 * Replace placeholders in template text strictly without fake fallbacks
 */
export function interpolateTemplate(
  templateText: string,
  vars: { providerName?: string; specialization?: string; profileUrl?: string; brandName?: string }
): string {
  const {
    providerName = '',
    specialization = '',
    profileUrl = '',
    brandName = 'TherapyMantra'
  } = vars;

  const defaultSpec = brandName.toLowerCase().includes('ocd')
    ? 'OCD & ERP Specialist'
    : brandName.toLowerCase().includes('physio')
    ? 'Physiotherapist'
    : 'Specialist';

  const specValue = specialization || defaultSpec;

  // Helper to ensure proper article ("a" vs "an") before specialization if preceded by "as a " or "as an "
  const formattedSpec = specValue.trim();

  let result = templateText
    .replaceAll('{{providerName}}', providerName)
    .replaceAll('{{name}}', providerName)
    .replaceAll('as a {{specialization}}', (match) => {
      const firstChar = formattedSpec.charAt(0).toLowerCase();
      const article = ['a', 'e', 'i', 'o', 'u'].includes(firstChar) ? 'an' : 'a';
      return `as ${article} ${formattedSpec}`;
    })
    .replaceAll('as an {{specialization}}', (match) => {
      const firstChar = formattedSpec.charAt(0).toLowerCase();
      const article = ['a', 'e', 'i', 'o', 'u'].includes(firstChar) ? 'an' : 'a';
      return `as ${article} ${formattedSpec}`;
    })
    .replaceAll('{{specialization}}', formattedSpec)
    .replaceAll('{{profileUrl}}', profileUrl);

  if (brandName && brandName !== 'TherapyMantra' && !result.includes(brandName)) {
    result = result.replaceAll('TherapyMantra', brandName);
  }

  return result;
}

/**
 * Get all available promotion platform configurations for a brand
 */
export function getPromotionPlatforms(brandName: string = 'TherapyMantra'): PlatformConfig[] {
  const brandLower = brandName.toLowerCase();
  if (brandLower.includes('ocd')) {
    return Object.values(OCD_TEMPLATES);
  }
  if (brandLower.includes('physio')) {
    return Object.values(PHYSIO_TEMPLATES);
  }
  return Object.values(DEFAULT_TEMPLATES);
}
