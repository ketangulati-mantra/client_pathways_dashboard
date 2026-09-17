import { AssessmentSchema } from './assessmentEngine';

export const OCD_RESPONSE_OPTIONS = [
  { label: 'Not at all', score: 0 },
  { label: 'A little', score: 1 },
  { label: 'Moderately', score: 2 },
  { label: 'A lot', score: 3 },
  { label: 'Extremely', score: 4 }
];

export const ocdAssessmentSchema: AssessmentSchema = {
  id: 'ocd-assessment',
  title: 'OCD Check-In',
  description: 'A 2-3 minute check-in to understand how intrusive thoughts, mental rituals, repetitive behaviors, and the need for certainty may be affecting your day.',
  categories: [
    {
      id: 'intrusive_thoughts',
      name: 'Unwanted Thoughts',
      description: 'Experiences with intrusive, unwanted thoughts, doubts, or images that feel hard to dismiss.'
    },
    {
      id: 'compulsions',
      name: 'Repetitive Actions',
      description: 'Physical behaviors like checking, washing, ordering, or repeating actions to relieve discomfort.'
    },
    {
      id: 'mental_rituals',
      name: 'Mental Rituals',
      description: 'Internal rituals such as replaying events, silent counting, neutralizing thoughts, or seeking certainty.'
    },
    {
      id: 'distress',
      name: 'Distress & Control',
      description: 'The intensity of internal tension and difficulty resisting urges to perform rituals.'
    },
    {
      id: 'functional_impact',
      name: 'Daily Impact',
      description: 'Interference with time, focus, work, relationships, sleep, and everyday routines.'
    }
  ],
  thresholds: {
    intrusive_thoughts: [
      { label: 'Minimal', maxScore: 2, color: '#34d399', message: 'Unwanted thoughts appear infrequently and are generally manageable.' },
      { label: 'Noticeable', maxScore: 5, color: '#38bdf8', message: 'Unwanted thoughts or doubts arise with some frequency and take intentional effort to move past.' },
      { label: 'Elevated', maxScore: 8, color: '#fb923c', message: 'Intrusive thoughts or doubts occur often and feel persistently sticky or difficult to dismiss.' }
    ],
    compulsions: [
      { label: 'Minimal', maxScore: 1, color: '#34d399', message: 'Repetitive physical habits rarely interfere with your day.' },
      { label: 'Noticeable', maxScore: 2, color: '#38bdf8', message: 'Some physical checking, washing, or ordering actions occur to relieve brief discomfort.' },
      { label: 'Elevated', maxScore: 4, color: '#fb923c', message: 'Physical repetitive behaviors are frequently used to manage discomfort or seek certainty.' }
    ],
    mental_rituals: [
      { label: 'Minimal', maxScore: 1, color: '#34d399', message: 'Mental reviewing or silent neutralizing is minimal or situational.' },
      { label: 'Noticeable', maxScore: 2, color: '#38bdf8', message: 'Occasional internal replaying, mental checking, or reassuring self-talk is used to ease doubt.' },
      { label: 'Elevated', maxScore: 4, color: '#fb923c', message: 'Internal rituals and mental neutralizing consume notable mental energy.' }
    ],
    distress: [
      { label: 'Minimal', maxScore: 2, color: '#34d399', message: 'Discomfort associated with doubts or urges is mild.' },
      { label: 'Noticeable', maxScore: 5, color: '#38bdf8', message: 'Unwanted thoughts or urges generate noticeable internal tension that feels hard to resist.' },
      { label: 'Elevated', maxScore: 8, color: '#fb923c', message: 'Urges and intrusive thoughts create significant distress and feel very difficult to step back from.' }
    ],
    functional_impact: [
      { label: 'Minimal', maxScore: 2, color: '#34d399', message: 'Little to no impact on your daily schedule, focus, or relationships.' },
      { label: 'Noticeable', maxScore: 5, color: '#38bdf8', message: 'These patterns take up some time or mental focus during work, sleep, or personal life.' },
      { label: 'Elevated', maxScore: 8, color: '#fb923c', message: 'These patterns take up meaningful time and noticeably affect your daily routines or peace of mind.' }
    ]
  },
  questions: [
    {
      id: 'ocd_q1',
      categoryId: 'intrusive_thoughts',
      text: 'How often do unwanted thoughts, doubts, or images pop into your mind and feel difficult to dismiss?',
      options: OCD_RESPONSE_OPTIONS
    },
    {
      id: 'ocd_q2',
      categoryId: 'intrusive_thoughts',
      text: 'How strong is the urge to get complete 100% certainty or reassurance when a doubt arises?',
      options: OCD_RESPONSE_OPTIONS
    },
    {
      id: 'ocd_q3',
      categoryId: 'compulsions',
      text: 'How often do you feel driven to repeat physical actions (such as checking locks/appliances, washing, arranging, or repeating steps) until it feels right?',
      options: OCD_RESPONSE_OPTIONS
    },
    {
      id: 'ocd_q4',
      categoryId: 'mental_rituals',
      text: 'How often do you perform mental rituals (such as replaying past events, silent counting, mentally reviewing conversations, or replacing bad thoughts with good ones)?',
      options: OCD_RESPONSE_OPTIONS
    },
    {
      id: 'ocd_q5',
      categoryId: 'distress',
      text: 'How much distress, anxiety, or internal discomfort do you experience when these thoughts or doubts occur?',
      options: OCD_RESPONSE_OPTIONS
    },
    {
      id: 'ocd_q6',
      categoryId: 'distress',
      text: 'How difficult is it to resist performing a behavior or mental ritual when the urge strikes?',
      options: OCD_RESPONSE_OPTIONS
    },
    {
      id: 'ocd_q7',
      categoryId: 'functional_impact',
      text: 'How much time or mental attention do these thoughts and repetitive rituals consume during your day?',
      options: OCD_RESPONSE_OPTIONS
    },
    {
      id: 'ocd_q8',
      categoryId: 'functional_impact',
      text: 'How much do these patterns interfere with your work, studies, relationships, sleep, or daily routines?',
      options: OCD_RESPONSE_OPTIONS
    }
  ]
};
