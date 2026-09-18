import React from 'react';
import LessonTemplate from './LessonTemplate';
import DeveloperLessonsPage from './DeveloperLessonsPage';
import IntroductionLessonPage from './IntroductionLessonPage';
import GettingStartedActivity from './GettingStartedActivity';
import FirstTherapySessionActivity from './FirstTherapySessionActivity';
import EmotionalWellbeingAssessmentPage from './EmotionalWellbeingAssessmentPage';
import PersonalizedFocusAssessmentPage from './PersonalizedFocusAssessmentPage';
import HowCanTherapyHelpLessonPage from './HowCanTherapyHelpLessonPage';
import EarnWhileYouImproveLessonPage from './EarnWhileYouImproveLessonPage';
import DailyCheckInPage from './DailyCheckInPage';
import JournalPage from './JournalPage';
import EmotionWheelPage from './EmotionWheelPage';
import DepressionDay1Activity from './DepressionDay1Activity';
import DepressionWhereAmIRightNowActivity from './DepressionWhereAmIRightNowActivity';
import DepressionHowIsItShowingUpActivity from './DepressionHowIsItShowingUpActivity';
import DepressionOneTinyStepActivity from './DepressionOneTinyStepActivity';
import Mantra21Day1TransitionView from './Mantra21Day1TransitionView';
import Mantra21RevealExperience from './Mantra21RevealExperience';
import Mantra21JoinLandingPage from './Mantra21JoinLandingPage';
import ChallengeHubPage from './ChallengeHubPage';
import Mantra21DailyActivityView from './Mantra21DailyActivityView';
import MythsWeTellOurselvesActivity from './MythsWeTellOurselvesActivity';
import MySupportCircleActivity from './MySupportCircleActivity';
import OcdAssessmentPage from './OcdAssessmentPage';
import WhatIsOcdActivity from './WhatIsOcdActivity';
import InsideOcdLoopActivity from './InsideOcdLoopActivity';
import IsItOcdOrHabitActivity from './IsItOcdOrHabitActivity';
import FearLadderActivity from './FearLadderActivity';
import TheAlarmIsNotTheDangerActivity from './TheAlarmIsNotTheDangerActivity';
import The60SecondPauseActivity from './The60SecondPauseActivity';
import FourSevenEightBreathingActivity from './FourSevenEightBreathingActivity';
import HowErpWorksActivity from './HowErpWorksActivity';
import OcdMoodTrackerActivity from './OcdMoodTrackerActivity';
import AdminLoginPage from './AdminLoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';

/**
 * Route-to-Component registry for User Pathways.
 * Maps route paths to user pathway component implementations.
 */
const ROUTE_VIEW_REGISTRY = {
  '/': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/user_pathways': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/task/my-support-circle': { default: MySupportCircleActivity },
  '/task/my_support_circle': { default: MySupportCircleActivity },
  '/my-support-circle': { default: MySupportCircleActivity },
  '/task/support-circle': { default: MySupportCircleActivity },
  '/task/mantra21-support-circle': { default: MySupportCircleActivity },
  '/task/myths-we-tell-ourselves': { default: MythsWeTellOurselvesActivity },
  '/task/myths_we_tell_ourselves': { default: MythsWeTellOurselvesActivity },
  '/myths-we-tell-ourselves': { default: MythsWeTellOurselvesActivity },
  '/task/mantra21-myths-we-tell-ourselves': { default: MythsWeTellOurselvesActivity },
  '/task/mantra21_myths_we_tell_ourselves': { default: MythsWeTellOurselvesActivity },
  '/task/mantra-21-daily': { default: (props) => <Mantra21DailyActivityView dayNumber={1} {...props} /> },
  '/task/mantra21-daily': { default: (props) => <Mantra21DailyActivityView dayNumber={1} {...props} /> },
  '/task/challenge-practice': { default: (props) => <Mantra21DailyActivityView dayNumber={1} {...props} /> },
  '/challenge-practice': { default: (props) => <Mantra21DailyActivityView dayNumber={1} {...props} /> },
  '/task/depression-what-is-depression': { default: DepressionDay1Activity },
  '/task/depression_what_is_depression': { default: DepressionDay1Activity },
  '/task/what-is-depression': { default: DepressionDay1Activity },
  '/task/what_is_depression': { default: DepressionDay1Activity },
  '/depression-what-is-depression': { default: DepressionDay1Activity },
  '/task/depression-how-is-it-showing-up': { default: DepressionHowIsItShowingUpActivity },
  '/task/depression_how_is_it_showing_up': { default: DepressionHowIsItShowingUpActivity },
  '/task/how-is-it-showing-up': { default: DepressionHowIsItShowingUpActivity },
  '/task/how_is_it_showing_up': { default: DepressionHowIsItShowingUpActivity },
  '/depression-how-is-it-showing-up': { default: DepressionHowIsItShowingUpActivity },
  '/task/depression-one-tiny-step': { default: DepressionOneTinyStepActivity },
  '/task/depression_one_tiny_step': { default: DepressionOneTinyStepActivity },
  '/task/depression-one-tiny-win': { default: DepressionOneTinyStepActivity },
  '/task/one-tiny-step': { default: DepressionOneTinyStepActivity },
  '/task/one_tiny_step': { default: DepressionOneTinyStepActivity },
  '/depression-one-tiny-step': { default: DepressionOneTinyStepActivity },
  '/task/depression-where-am-i-right-now': { default: DepressionWhereAmIRightNowActivity },
  '/task/depression_where_am_i_right_now': { default: DepressionWhereAmIRightNowActivity },
  '/task/where-am-i-right-now': { default: DepressionWhereAmIRightNowActivity },
  '/task/where_am_i_right_now': { default: DepressionWhereAmIRightNowActivity },
  '/depression-where-am-i-right-now': { default: DepressionWhereAmIRightNowActivity },
  '/task/depression-mantra21-invitation': { default: Mantra21RevealExperience },
  '/task/depression_mantra21_invitation': { default: Mantra21RevealExperience },
  '/task/mantra21-invitation': { default: Mantra21RevealExperience },
  '/task/mantra-21': { default: Mantra21RevealExperience },
  '/task/mantra21-reveal': { default: Mantra21RevealExperience },
  '/task/mantra-21-reveal': { default: Mantra21RevealExperience },
  '/mantra21-reveal': { default: Mantra21RevealExperience },
  '/mantra21-invitation': { default: Mantra21RevealExperience },
  '/task/mantra21-join': { default: Mantra21JoinLandingPage },
  '/task/mantra-21-join': { default: Mantra21JoinLandingPage },
  '/mantra21-join': { default: Mantra21JoinLandingPage },
  '/mantra-21-join': { default: Mantra21JoinLandingPage },
  '/challenges': { default: ChallengeHubPage },
  '/task/challenges': { default: ChallengeHubPage },
  '/challenge-hub': { default: ChallengeHubPage },
  '/task/challenge-hub': { default: ChallengeHubPage },
  '/task/getting-started': { default: GettingStartedActivity },
  '/task/getting_started': { default: GettingStartedActivity },
  '/task/first-therapy-session': { default: FirstTherapySessionActivity },
  '/task/first_therapy_session': { default: FirstTherapySessionActivity },
  '/task/activity-02': { default: FirstTherapySessionActivity },
  '/task/emotional-wellbeing-assessment': { default: EmotionalWellbeingAssessmentPage },
  '/task/emotional_wellbeing_assessment': { default: EmotionalWellbeingAssessmentPage },
  '/emotional-wellbeing-assessment': { default: EmotionalWellbeingAssessmentPage },
  '/task/ocd-assessment': { default: OcdAssessmentPage },
  '/task/ocd_assessment': { default: OcdAssessmentPage },
  '/ocd-assessment': { default: OcdAssessmentPage },
  '/task/mantra21-ocd-assessment': { default: OcdAssessmentPage },
  '/task/what-is-ocd': { default: WhatIsOcdActivity },
  '/task/what_is_ocd': { default: WhatIsOcdActivity },
  '/what-is-ocd': { default: WhatIsOcdActivity },
  '/task/ocd_what_is_ocd': { default: WhatIsOcdActivity },
  '/task/ocd-what-is-ocd': { default: WhatIsOcdActivity },
  '/task/activity/400': { default: WhatIsOcdActivity },
  '/task/activity-400': { default: WhatIsOcdActivity },
  '/task/400': { default: WhatIsOcdActivity },
  '/task/inside-an-ocd-loop': { default: InsideOcdLoopActivity },
  '/task/inside-ocd-loop': { default: InsideOcdLoopActivity },
  '/task/inside_an_ocd_loop': { default: InsideOcdLoopActivity },
  '/task/inside_ocd_loop': { default: InsideOcdLoopActivity },
  '/task/ocd-cycle': { default: InsideOcdLoopActivity },
  '/task/ocd_cycle': { default: InsideOcdLoopActivity },
  '/ocd-cycle': { default: InsideOcdLoopActivity },
  '/inside-an-ocd-loop': { default: InsideOcdLoopActivity },
  '/task/activity/401': { default: InsideOcdLoopActivity },
  '/task/activity-401': { default: InsideOcdLoopActivity },
  '/task/is-it-ocd-or-just-a-habit': { default: IsItOcdOrHabitActivity },
  '/task/is-it-ocd-or-habit': { default: IsItOcdOrHabitActivity },
  '/task/ocd-or-habit': { default: IsItOcdOrHabitActivity },
  '/task/ocd_habit': { default: IsItOcdOrHabitActivity },
  '/task/ocd-habit': { default: IsItOcdOrHabitActivity },
  '/task/activity/402': { default: IsItOcdOrHabitActivity },
  '/task/activity-402': { default: IsItOcdOrHabitActivity },
  '/task/402': { default: IsItOcdOrHabitActivity },
  '/is-it-ocd-or-habit': { default: IsItOcdOrHabitActivity },
  '/ocd-or-habit': { default: IsItOcdOrHabitActivity },
  '/task/fear-ladder': { default: FearLadderActivity },
  '/task/fear_ladder': { default: FearLadderActivity },
  '/fear-ladder': { default: FearLadderActivity },
  '/fear_ladder': { default: FearLadderActivity },
  '/task/activity/404': { default: FearLadderActivity },
  '/task/activity-404': { default: FearLadderActivity },
  '/task/404': { default: FearLadderActivity },
  '/task/the-alarm-is-not-the-danger': { default: TheAlarmIsNotTheDangerActivity },
  '/task/alarm-is-not-the-danger': { default: TheAlarmIsNotTheDangerActivity },
  '/task/alarm-is-not-danger': { default: TheAlarmIsNotTheDangerActivity },
  '/task/alarm_is_not_danger': { default: TheAlarmIsNotTheDangerActivity },
  '/task/ocd_alarm_danger': { default: TheAlarmIsNotTheDangerActivity },
  '/the-alarm-is-not-the-danger': { default: TheAlarmIsNotTheDangerActivity },
  '/alarm-is-not-the-danger': { default: TheAlarmIsNotTheDangerActivity },
  '/task/activity/403': { default: TheAlarmIsNotTheDangerActivity },
  '/task/activity-403': { default: TheAlarmIsNotTheDangerActivity },
  '/task/403': { default: TheAlarmIsNotTheDangerActivity },
  '/task/the-60-second-pause': { default: The60SecondPauseActivity },
  '/task/60-second-pause': { default: The60SecondPauseActivity },
  '/task/the-delay-tactic': { default: The60SecondPauseActivity },
  '/task/delay-tactic': { default: The60SecondPauseActivity },
  '/task/ocd_delay_tactic': { default: The60SecondPauseActivity },
  '/task/ocd_delay': { default: The60SecondPauseActivity },
  '/the-60-second-pause': { default: The60SecondPauseActivity },
  '/60-second-pause': { default: The60SecondPauseActivity },
  '/task/activity/405': { default: The60SecondPauseActivity },
  '/task/activity-405': { default: The60SecondPauseActivity },
  '/task/405': { default: The60SecondPauseActivity },
  '/task/4-7-8-breathing': { default: FourSevenEightBreathingActivity },
  '/task/4-7-8': { default: FourSevenEightBreathingActivity },
  '/task/four-seven-eight-breathing': { default: FourSevenEightBreathingActivity },
  '/task/ocd_478_breathing': { default: FourSevenEightBreathingActivity },
  '/task/478-breathing': { default: FourSevenEightBreathingActivity },
  '/4-7-8-breathing': { default: FourSevenEightBreathingActivity },
  '/task/activity/406': { default: FourSevenEightBreathingActivity },
  '/task/activity-406': { default: FourSevenEightBreathingActivity },
  '/task/406': { default: FourSevenEightBreathingActivity },
  '/task/how-erp-works': { default: HowErpWorksActivity },
  '/task/how_erp_works': { default: HowErpWorksActivity },
  '/task/erp': { default: HowErpWorksActivity },
  '/task/ocd_how_erp_works': { default: HowErpWorksActivity },
  '/task/ocd-erp': { default: HowErpWorksActivity },
  '/how-erp-works': { default: HowErpWorksActivity },
  '/task/activity/407': { default: HowErpWorksActivity },
  '/task/activity-407': { default: HowErpWorksActivity },
  '/task/407': { default: HowErpWorksActivity },
  '/task/ocd-mood-check-in': { default: OcdMoodTrackerActivity },
  '/task/ocd_mood_check_in': { default: OcdMoodTrackerActivity },
  '/task/ocd-mood-tracker': { default: OcdMoodTrackerActivity },
  '/task/ocd_mood_tracker': { default: OcdMoodTrackerActivity },
  '/ocd-mood-check-in': { default: OcdMoodTrackerActivity },
  '/ocd-mood-tracker': { default: OcdMoodTrackerActivity },
  '/task/activity/408': { default: OcdMoodTrackerActivity },
  '/task/activity-408': { default: OcdMoodTrackerActivity },
  '/task/408': { default: OcdMoodTrackerActivity },
  '/task/personalized-focus-assessment': { default: PersonalizedFocusAssessmentPage },
  '/task/personalized_focus_assessment': { default: PersonalizedFocusAssessmentPage },
  '/personalized-focus-assessment': { default: PersonalizedFocusAssessmentPage },
  '/task/how-can-therapy-help': { default: HowCanTherapyHelpLessonPage },
  '/task/how_can_therapy_help': { default: HowCanTherapyHelpLessonPage },
  '/how-can-therapy-help': { default: HowCanTherapyHelpLessonPage },
  '/task/earn-while-you-improve-your-wellbeing': { default: EarnWhileYouImproveLessonPage },
  '/task/earn_while_you_improve_your_wellbeing': { default: EarnWhileYouImproveLessonPage },
  '/earn-while-you-improve-your-wellbeing': { default: EarnWhileYouImproveLessonPage },
  '/task/earn-while-you-improve': { default: EarnWhileYouImproveLessonPage },
  '/task/earn_while_you_improve': { default: EarnWhileYouImproveLessonPage },
  '/earn-while-you-improve': { default: EarnWhileYouImproveLessonPage },
  '/task/daily-check-in': { default: DailyCheckInPage },
  '/task/daily_check_in': { default: DailyCheckInPage },
  '/daily-check-in': { default: DailyCheckInPage },
  '/daily_check_in': { default: DailyCheckInPage },
  '/task/check-in': { default: DailyCheckInPage },
  '/task/check_in': { default: DailyCheckInPage },
  '/check-in': { default: DailyCheckInPage },
  '/task/mood-check-in': { default: DailyCheckInPage },
  '/task/mood_check_in': { default: DailyCheckInPage },
  '/mood-check-in': { default: DailyCheckInPage },
  '/task/journal': { default: JournalPage },
  '/task/journal-home': { default: JournalPage },
  '/task/journal_home': { default: JournalPage },
  '/journal': { default: JournalPage },
  '/task/emotion-wheel': { default: EmotionWheelPage },
  '/task/emotion_wheel': { default: EmotionWheelPage },
  '/emotion-wheel': { default: EmotionWheelPage },
  '/task/feelings-wheel': { default: EmotionWheelPage },
  '/task/feelings_wheel': { default: EmotionWheelPage },
  '/task/introduction': { default: IntroductionLessonPage },
  '/admin/login': { default: AdminLoginPage },
  '/admin/dashboard': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/admin/pathways': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/admin/users': { default: (props) => <ProtectedRoute requireSuperAdmin><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/admin': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> }
};

/**
 * Resolves appropriate React view component for a given path and service context.
 */
export function resolveLessonView({ currentPath, currentService, onBack, onNavigate, activities = [] }) {
  if (!currentPath) return null;

  // Clean path format
  const normalizedPath = currentPath.toLowerCase().trim();

  // 1. Direct registry lookup
  const registered = ROUTE_VIEW_REGISTRY[normalizedPath];
  if (registered) {
    const Component = registered[currentService] || registered.default;
    if (Component) {
      return <Component onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }
  }

  // 2. Dynamic Mantra 21 Day Resolver (e.g. /task/mantra21-day-4 or /task/mantra-21-day-4)
  const dayMatch = normalizedPath.match(/mantra-?21-?day-?(\d+)/i) || normalizedPath.match(/day-?(\d+)/i);
  if (dayMatch && dayMatch[1]) {
    const dayNum = parseInt(dayMatch[1], 10);
    if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 21) {
      return <Mantra21DailyActivityView dayNumber={dayNum} onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }
  }

  // 3. Activity catalog matching
  const matchingActivity = activities.find((act) => {
    if (!act) return false;
    const actRoute = (act.route || '').toLowerCase().trim();
    const actLessonId = (act.lessonId || '').toLowerCase().trim();
    
    return (
      normalizedPath === actRoute ||
      normalizedPath === `/task/${actLessonId}` ||
      normalizedPath === `/${actLessonId}`
    );
  });

  if (matchingActivity) {
    if (matchingActivity.lessonId === 'getting-started') {
      return <GettingStartedActivity onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'first-therapy-session' || matchingActivity.lessonId === 'first_therapy_session') {
      return <FirstTherapySessionActivity onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'emotional-wellbeing-assessment' || matchingActivity.lessonId === 'emotional_wellbeing_assessment') {
      return <EmotionalWellbeingAssessmentPage onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'personalized-focus-assessment' || matchingActivity.lessonId === 'personalized_focus_assessment') {
      return <PersonalizedFocusAssessmentPage onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'how-can-therapy-help' || matchingActivity.lessonId === 'how_can_therapy_help') {
      return <HowCanTherapyHelpLessonPage onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'ocd_mood_check_in' || matchingActivity.lessonId === 'ocd-mood-check-in' || matchingActivity.activityId === '408') {
      return <OcdMoodTrackerActivity onBack={onBack} onNavigate={onNavigate} />;
    }

    if (matchingActivity.lessonId === 'daily-check-in' || matchingActivity.lessonId === 'daily_check_in' || matchingActivity.lessonId === 'check-in') {
      return <DailyCheckInPage onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'mantra21_my_support_circle' || matchingActivity.lessonId === 'my-support-circle' || matchingActivity.lessonId === 'my_support_circle') {
      return <MySupportCircleActivity onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'mantra21_myths_we_tell_ourselves' || matchingActivity.lessonId === 'myths-we-tell-ourselves') {
      return <MythsWeTellOurselvesActivity onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'depression_what_is_depression') {
      return <DepressionDay1Activity onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'depression_where_am_i_right_now') {
      return <DepressionWhereAmIRightNowActivity onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'emotion-wheel' || matchingActivity.lessonId === 'emotion_wheel' || matchingActivity.lessonId === 'feelings-wheel') {
      return <EmotionWheelPage onBack={onBack} onNavigate={onNavigate} service={currentService} />;
    }

    return (
      <LessonTemplate
        onBack={onBack}
        service={currentService}
        activity={matchingActivity}
      />
    );
  }

  return null;
}
