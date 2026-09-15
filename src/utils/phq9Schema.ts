import { AssessmentSchema } from './assessmentEngine';

const OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several Days', value: 1 },
  { label: 'More Than Half the Days', value: 2 },
  { label: 'Nearly Every Day', value: 3 }
];

export const phq9Schema: AssessmentSchema = {
  id: 'phq9',
  title: 'A Self-Check for Low Mood',
  description: 'This short self-check helps you better understand whether you\'ve been experiencing signs commonly associated with low mood or depression. This is NOT a diagnosis. It is designed to help you reflect on how you\'ve been feeling and determine whether speaking with a professional could be helpful.',
  categories: [
    { id: 'depression', name: 'Overall Depression Level', description: 'Measures the severity of depression symptoms based on the PHQ-9 criteria.' }
  ],
  thresholds: {
    // Colors matching standard progression: 
    // Minimal (Green), Mild (Blue), Moderate (Amber), Moderately Severe (Orange), Severe (Red)
    depression: [
      { 
        label: 'Minimal', 
        maxScore: 4, 
        color: '#34d399', 
        message: 'You are currently experiencing minimal to no signs of low mood. Keep focusing on the positive habits that support your daily wellbeing!' 
      },
      { 
        label: 'Mild', 
        maxScore: 9, 
        color: '#60a5fa', 
        message: 'You might be experiencing occasional low moods. This is completely normal. Gentle self-care and staying connected with loved ones can be very helpful.' 
      },
      { 
        label: 'Moderate', 
        maxScore: 14, 
        color: '#fbbf24', 
        message: 'You may be experiencing some depressive feelings that are affecting your energy. Many people experience this, and speaking with a therapist can provide valuable relief.' 
      },
      { 
        label: 'Moderately Severe', 
        maxScore: 19, 
        color: '#fb923c', 
        message: 'Your responses suggest you are carrying a heavy emotional weight right now. We highly recommend connecting with a professional who can help you navigate this.' 
      },
      { 
        label: 'Severe', 
        maxScore: 27, 
        color: '#f87171', 
        message: 'You are going through a very difficult time and experiencing a high level of distress. Please know you do not have to do this alone. Reaching out for professional support is the best next step.' 
      }
    ]
  },
  questions: [
    { id: 'q1', categoryId: 'depression', text: 'Little interest or pleasure in doing things', options: OPTIONS },
    { id: 'q2', categoryId: 'depression', text: 'Feeling down, depressed, or hopeless', options: OPTIONS },
    { id: 'q3', categoryId: 'depression', text: 'Trouble falling or staying asleep, or sleeping too much', options: OPTIONS },
    { id: 'q4', categoryId: 'depression', text: 'Feeling tired or having little energy', options: OPTIONS },
    { id: 'q5', categoryId: 'depression', text: 'Poor appetite or overeating', options: OPTIONS },
    { id: 'q6', categoryId: 'depression', text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down', options: OPTIONS },
    { id: 'q7', categoryId: 'depression', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', options: OPTIONS },
    { id: 'q8', categoryId: 'depression', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual', options: OPTIONS },
    { id: 'q9', categoryId: 'depression', text: 'Thoughts that you would be better off dead, or of hurting yourself in some way', options: OPTIONS }
  ]
};
