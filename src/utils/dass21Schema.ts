import { AssessmentSchema } from './assessmentEngine';

export const ASSESSMENT_OPTIONS = [
  { label: 'Not at all', score: 1 },
  { label: 'Sometimes', score: 2 },
  { label: 'Often', score: 3 },
  { label: 'Almost always', score: 4 }
];

export const dass21Schema: AssessmentSchema = {
  id: 'emotional-wellbeing-assessment',
  title: 'Emotional Well-Being Assessment',
  description: 'Please read each statement and select how much it applied to you over the past week. There are no right or wrong answers.',
  categories: [
    {
      id: 'anxiety',
      name: 'Anxiety',
      description: 'Measures situational anxiety, physical tension, and feelings of nervousness.'
    },
    {
      id: 'depression',
      name: 'Depression',
      description: 'Measures low energy, lack of positive feelings, and difficulty feeling enthusiastic.'
    },
    {
      id: 'stress',
      name: 'Stress',
      description: 'Measures difficulty relaxing, restlessness, and emotional tension.'
    }
  ],
  thresholds: {
    anxiety: [
      { label: 'Mild', maxScore: 5, color: '#34d399', message: 'Your responses suggest mild or situational anxiety. Everyday stress can sometimes feel elevated, but gentle mindfulness and breathing can keep you grounded.' },
      { label: 'Moderate', maxScore: 8, color: '#fbbf24', message: 'Your responses suggest moderate anxiety. You may be experiencing occasional physical or mental tension that impacts your calm.' },
      { label: 'Severe', maxScore: 10, color: '#fb923c', message: 'Your responses indicate elevated anxiety that may be interfering with your daily peace of mind.' },
      { label: 'Extremely Severe', maxScore: 12, color: '#f87171', message: 'Your responses indicate a high level of anxiety and distress right now. Connecting with a professional can provide safety and relief.' }
    ],
    depression: [
      { label: 'Mild', maxScore: 5, color: '#34d399', message: 'Your responses suggest minimal to mild low mood. Gentle self-care and staying connected with supportive routines is helpful.' },
      { label: 'Moderate', maxScore: 8, color: '#fbbf24', message: 'Your responses suggest moderate low mood or low enthusiasm. Speaking with a therapist can provide valuable guidance.' },
      { label: 'Severe', maxScore: 10, color: '#fb923c', message: 'Your responses suggest you are carrying a noticeable emotional weight right now.' },
      { label: 'Extremely Severe', maxScore: 12, color: '#f87171', message: 'Your responses suggest a high level of emotional heaviness. Professional guidance can help you navigate this safely.' }
    ],
    stress: [
      { label: 'Mild', maxScore: 5, color: '#34d399', message: 'Your responses indicate a manageable level of everyday stress.' },
      { label: 'Moderate', maxScore: 8, color: '#fbbf24', message: 'Your responses suggest moderate stress and difficulty unwinding. Small intentional breaks can help restore balance.' },
      { label: 'Severe', maxScore: 10, color: '#fb923c', message: 'Your responses suggest high stress levels that may affect your sleep and energy.' },
      { label: 'Extremely Severe', maxScore: 12, color: '#f87171', message: 'Your responses suggest an intense level of stress right now. Letting a professional help you unpack this can bring relief.' }
    ]
  },
  questions: [
    {
      id: 'q1',
      categoryId: 'anxiety',
      text: 'I was about to panic',
      options: ASSESSMENT_OPTIONS
    },
    {
      id: 'q2',
      categoryId: 'anxiety',
      text: 'I felt my heart beating fast even though I had not made any physical effort',
      options: ASSESSMENT_OPTIONS
    },
    {
      id: 'q3',
      categoryId: 'anxiety',
      text: 'I was afraid for no reason',
      options: ASSESSMENT_OPTIONS
    },
    {
      id: 'q4',
      categoryId: 'depression',
      text: 'I felt that nothing could make me feel excited',
      options: ASSESSMENT_OPTIONS
    },
    {
      id: 'q5',
      categoryId: 'depression',
      text: 'I felt sad and depressed',
      options: ASSESSMENT_OPTIONS
    },
    {
      id: 'q6',
      categoryId: 'depression',
      text: 'I could not get enthusiastic about anything',
      options: ASSESSMENT_OPTIONS
    },
    {
      id: 'q7',
      categoryId: 'stress',
      text: 'I had a hard time relaxing',
      options: ASSESSMENT_OPTIONS
    },
    {
      id: 'q8',
      categoryId: 'stress',
      text: 'I felt restless',
      options: ASSESSMENT_OPTIONS
    },
    {
      id: 'q9',
      categoryId: 'stress',
      text: 'I found it difficult to relax',
      options: ASSESSMENT_OPTIONS
    }
  ]
};
