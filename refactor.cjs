const fs = require('fs');
let code = fs.readFileSync('src/components/index.jsx', 'utf8');

// 1. Add import
if (!code.includes('useTranslation')) {
  code = code.replace(/import React(.*?);/, "import React$1;\nimport { useTranslation } from 'react-i18next';");
}

// Helper to inject hook
function injectHook(componentName, regexString) {
  const regex = new RegExp(`(export const ${componentName} = \\(\\{[\\s\\S]*?\\}\\) => \\{)`, 'm');
  code = code.replace(regex, `$1\n  const { t } = useTranslation('shared');\n`);
}

// 2. Inject hooks
injectHook('Header');
injectHook('Progress');
injectHook('OverviewCard');
injectHook('VideoSection');
injectHook('ScenarioCard');
injectHook('QuizCard');
injectHook('CompletionScreen');

// 3. Replace text
// Header
code = code.replace(/<span>\+\{points\} Pts<\/span>/, `{t('header.points_earned', { points })}`);

// Progress
code = code.replace(/<span>Lesson Progress<\/span>/, `{t('progress.lesson_progress')}`);
code = code.replace(/<span>\{roundedValue\}% Completed<\/span>/, `{t('progress.completed', { percent: roundedValue })}`);

// OverviewCard
// Wait, title="About this Lesson" is a prop default. We can't use a hook in default prop. We leave the prop, but render `{title || t('overview.default_title')}`? No, the prop is already initialized. Let's change the default inside the body or just wrap the render. Actually, if it's passed from outside, the outside component should translate it. Let's leave props as they are, just translate static strings.
code = code.replace(/<span>\{points\} Points<\/span>/, `{t('overview.points', { points })}`);

// VideoSection
code = code.replace(/<p>Video Lesson • \{duration\}<\/p>/, `<p>{t('video.lesson_duration', { duration })}</p>`);
code = code.replace(/<h4.*?>Streaming Video\.\.\.<\/h4>/, `<h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('video.streaming')}</h4>`);
code = code.replace(/<p.*?>Simulation is playing\. Click reset to watch again\.<\/p>/, `<p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '8px' }}>{t('video.simulation')}</p>`);
code = code.replace(/Reset Video/, `{t('video.reset')}`);

// ScenarioCard
code = code.replace(/<span className="scenario-badge">Client Scenario<\/span>/, `<span className="scenario-badge">{t('scenario.badge')}</span>`);
code = code.replace(/<strong>Outcome: <\/strong>/, `<strong>{t('scenario.outcome')}</strong>`);

// QuizCard
code = code.replace(/MCQ\s*<\/h2>/, `{t('quiz.mcq_title')}\n        </h2>`);
code = code.replace(/>\s*Submit\s*<\/Button>/, `>{t('quiz.submit')}</Button>`);
code = code.replace(/Thank you for your response!/, `{t('quiz.thank_you')}`);
code = code.replace(/Your Score is : \{getScore\(\)\}\/\{questions\.length\}\./, `{t('quiz.score', { score: getScore(), total: questions.length })}`);
code = code.replace(/<strong>Correct Answer : <\/strong>/, `<strong>{t('quiz.correct_answer')}</strong>`);
code = code.replace(/<strong>Your Answer : <\/strong>/, `<strong>{t('quiz.your_answer')}</strong>`);
code = code.replace(/"Not answered"/, `t('quiz.not_answered')`);
code = code.replace(/>\s*Done\s*<\/Button>/g, `>{t('quiz.done')}</Button>`);
code = code.replace(/>\s*Try Again\s*<\/Button>/g, `>{t('quiz.try_again')}</Button>`);
code = code.replace(/<span className="quiz-question-number">Practice Question<\/span>/, `<span className="quiz-question-number">{t('quiz.practice_question')}</span>`);
code = code.replace(/>\s*Submit Answer\s*<\/Button>/, `>{t('quiz.submit_answer')}</Button>`);
code = code.replace(/<strong>Correct! <\/strong>/, `<strong>{t('quiz.correct')}</strong>`);
code = code.replace(/<strong>Incorrect\. <\/strong>/, `<strong>{t('quiz.incorrect')}</strong>`);
code = code.replace(/"Well done\. You've earned points for this lesson\."/, `t('quiz.default_correct_feedback')`);
code = code.replace(/"Review the material and try again\."/, `t('quiz.default_incorrect_feedback')`);
code = code.replace(/'Please watch the lesson video to complete this lesson\.'/, `t('quiz.warning_watch_video')`);

// CompletionScreen
code = code.replace(/"Congratulations!"/, `t('completion.title')`);
code = code.replace(/"You completed the lesson and boosted your provider score\."/, `t('completion.subtitle')`);
code = code.replace(/<span className="completion-reward-label">You Earned:<\/span>/, `<span className="completion-reward-label">{t('completion.earned')}</span>`);
code = code.replace(/<span className="completion-reward-text">\{points\} Provider Points<\/span>/, `<span className="completion-reward-text">{t('completion.points', { points })}</span>`);
code = code.replace(/>\s*Continue to Dashboard\s*<\/Button>/, `>{t('completion.continue')}</Button>`);

fs.writeFileSync('src/components/index.jsx', code);
