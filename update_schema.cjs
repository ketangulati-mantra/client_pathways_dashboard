const fs = require('fs');

const schemaContent = `import { AssessmentSchema } from './assessmentEngine';

const OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Often', value: 2 },
  { label: 'Almost always', value: 3 }
];

export const dass21Schema: AssessmentSchema = {
  id: 'dass21',
  title: 'Emotional Well-Being Assessment',
  description: 'Please read each statement and select a response that indicates how much the statement applied to you over the past week. There are no right or wrong answers.',
  categories: [
    { id: 'depression', name: 'Depression', description: 'Measures low positive affect, loss of self-esteem and incentive, and sense of hopelessness.' },
    { id: 'anxiety', name: 'Anxiety', description: 'Measures autonomic arousal, skeletal muscle effects, situational anxiety, and subjective experience of anxious affect.' },
    { id: 'stress', name: 'Stress', description: 'Measures tension, irritability, and a tendency to overreact to stressful events.' }
  ],
  thresholds: {
    // New Healthcare Color Palette:
    // Minimal: #34d399 (Soft Green)
    // Mild: #60a5fa (Soft Blue)
    // Moderate: #fbbf24 (Amber)
    // Severe: #fb923c (Warm Orange)
    // Extremely Severe: #f87171 (Soft Red)
    
    depression: [
      { label: 'Minimal', maxScore: 4, color: '#34d399', message: 'You are currently experiencing minimal to no signs of depression. Keep focusing on the positive habits that support your daily wellbeing!' },
      { label: 'Mild', maxScore: 6, color: '#60a5fa', message: 'You might be experiencing occasional low moods. This is completely normal. Gentle self-care and staying connected with loved ones can be very helpful.' },
      { label: 'Moderate', maxScore: 10, color: '#fbbf24', message: 'You may be experiencing some depressive feelings that are affecting your energy. Many people experience this, and speaking with a therapist can provide valuable relief.' },
      { label: 'Severe', maxScore: 13, color: '#fb923c', message: 'Your responses suggest you are carrying a heavy emotional weight right now. We highly recommend connecting with a professional who can help you navigate this.' },
      { label: 'Extremely Severe', maxScore: 21, color: '#f87171', message: 'You are going through a very difficult time and experiencing a high level of distress. Please know you do not have to do this alone. Reaching out for professional support is the best next step.' }
    ],
    anxiety: [
      { label: 'Minimal', maxScore: 3, color: '#34d399', message: 'Your anxiety levels appear minimal. You seem to be managing day-to-day stress very effectively!' },
      { label: 'Mild', maxScore: 5, color: '#60a5fa', message: 'You are showing mild signs of anxiety, which is a natural response to a busy life. Simple mindfulness or breathing exercises can help keep you grounded.' },
      { label: 'Moderate', maxScore: 7, color: '#fbbf24', message: 'You may be experiencing occasional anxiety that is impacting your peace of mind. Professional guidance can help you build strong coping strategies.' },
      { label: 'Severe', maxScore: 9, color: '#fb923c', message: 'You are experiencing significant anxiety right now. Speaking with a therapist can provide a safe space to understand and relieve these feelings.' },
      { label: 'Extremely Severe', maxScore: 21, color: '#f87171', message: 'Your anxiety is currently very high, and it must feel overwhelming. Professional support is strongly recommended to help you feel safe and grounded again.' }
    ],
    stress: [
      { label: 'Minimal', maxScore: 7, color: '#34d399', message: 'Your stress levels are minimal. You are doing a great job maintaining a balanced routine!' },
      { label: 'Mild', maxScore: 9, color: '#60a5fa', message: 'You are carrying a mild level of stress. Remember to take small, intentional breaks throughout your day to breathe deeply.' },
      { label: 'Moderate', maxScore: 12, color: '#fbbf24', message: 'Your score suggests you are dealing with moderate stress. A therapist can help you develop tailored techniques to manage this tension before it builds up.' },
      { label: 'Severe', maxScore: 16, color: '#fb923c', message: 'You are experiencing a severe amount of stress. It is deeply important to prioritize your well-being and let someone help you carry the load.' },
      { label: 'Extremely Severe', maxScore: 21, color: '#f87171', message: 'You are under an exceptionally high level of stress right now. Please consider reaching out to a professional to help you manage and reduce this burden.' }
    ]
  },
  questions: [
    { id: 'q1', categoryId: 'stress', text: 'I found it hard to wind down', options: OPTIONS },
    { id: 'q2', categoryId: 'anxiety', text: 'I was aware of dryness of my mouth', options: OPTIONS },
    { id: 'q3', categoryId: 'depression', text: 'I couldn\\'t seem to experience any positive feeling at all', options: OPTIONS },
    { id: 'q4', categoryId: 'anxiety', text: 'I experienced breathing difficulty', options: OPTIONS },
    { id: 'q5', categoryId: 'depression', text: 'I found it difficult to work up the initiative to do things', options: OPTIONS },
    { id: 'q6', categoryId: 'stress', text: 'I tended to over-react to situations', options: OPTIONS },
    { id: 'q7', categoryId: 'anxiety', text: 'I experienced trembling (e.g. in the hands)', options: OPTIONS },
    { id: 'q8', categoryId: 'stress', text: 'I felt that I was using a lot of nervous energy', options: OPTIONS },
    { id: 'q9', categoryId: 'anxiety', text: 'I was worried about situations in which I might panic', options: OPTIONS },
    { id: 'q10', categoryId: 'depression', text: 'I felt that I had nothing to look forward to', options: OPTIONS },
    { id: 'q11', categoryId: 'stress', text: 'I found myself getting agitated', options: OPTIONS },
    { id: 'q12', categoryId: 'stress', text: 'I found it difficult to relax', options: OPTIONS },
    { id: 'q13', categoryId: 'depression', text: 'I felt down-hearted and blue', options: OPTIONS },
    { id: 'q14', categoryId: 'stress', text: 'I was intolerant of anything that kept me from getting on with what I was doing', options: OPTIONS },
    { id: 'q15', categoryId: 'anxiety', text: 'I felt I was close to panic', options: OPTIONS },
    { id: 'q16', categoryId: 'depression', text: 'I was unable to become enthusiastic about anything', options: OPTIONS },
    { id: 'q17', categoryId: 'depression', text: 'I felt I wasn\\'t worth much as a person', options: OPTIONS },
    { id: 'q18', categoryId: 'stress', text: 'I felt that I was rather touchy', options: OPTIONS },
    { id: 'q19', categoryId: 'anxiety', text: 'I was aware of the action of my heart in the absence of physical exertion', options: OPTIONS },
    { id: 'q20', categoryId: 'anxiety', text: 'I felt scared without any good reason', options: OPTIONS },
    { id: 'q21', categoryId: 'depression', text: 'I felt that life was meaningless', options: OPTIONS }
  ]
};
`;

fs.writeFileSync('src/utils/dass21Schema.ts', schemaContent);
console.log('Schema updated.');
