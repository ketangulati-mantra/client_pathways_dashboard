Product: Mantra Self-Love
Feature: Mood Check-In
Platform: Mobile-first web experience / Mantra Mini
Status: Product Definition
Priority: High

1. Product Overview
   What is Mood Check-In?

Mood Check-In is a short, daily experience that helps users pause and answer a simple question:

How am I feeling right now?

The purpose is not to diagnose the user or make them complete a lengthy assessment.

It is a lightweight daily ritual that helps users:

Notice their emotional state
Put words to what they are feeling
Understand the intensity of that feeling
Optionally reflect on what may be influencing it
Receive a relevant, personalized next step

For Mantra, it also becomes the primary source of ongoing emotional context that powers personalization across the Self-Love ecosystem.

2. Product Vision

Mood Check-In should become:

The daily doorway into a user's relationship with Mantra.

A user may initially open Mantra because they are feeling something.

Over time, the habit becomes:

“Let me check in with myself.”

The feature should feel:

Effortless
Personal
Calm
Premium
Emotionally intelligent
Fast enough to do daily

It must not feel like:

A survey
A clinical assessment
A therapy questionnaire
A boring mood tracker
A generic AI wellness form 3. Primary User Problem

Many users experience emotions without stopping to identify them.

They may say:

"I don't know what's wrong."
"I'm just feeling weird."
"I'm stressed."
"I feel bad."
"Something feels off."

The first step toward emotional awareness is often simply:

Pause → Notice → Name

Mood Check-In gives users a simple structure for doing exactly that.

4. Primary Product Goals
   Goal 1 — Create a Daily Habit

Users should want to return regularly.

The ideal behavior:

Open Mantra
↓
Mood Check-In
↓
Receive something relevant
↓
Continue with the day
Goal 2 — Build Emotional Awareness

Help users move from vague states such as:

“I feel bad.”

toward:

“I feel overwhelmed.”

or:

“I'm actually anxious and worried about something specific.”

Goal 3 — Power Personalization

Every check-in should provide useful signals for future experiences.

Examples:

Emotion
Emotion family
Intensity
Context
Recurring patterns
Goal 4 — Deliver Immediate Value

The user should get something useful immediately after checking in.

They should not feel:

“I just gave the app information.”

They should feel:

“That helped me pause and understand where I am.”

5. Success Definition

Mood Check-In is successful when users:

Return

They check in repeatedly.

Build awareness

They become increasingly specific about their emotions.

Trust personalization

Recommendations feel relevant.

Continue their journey

Check-ins lead naturally into other Mantra activities.

6. Target User

The feature should work for:

New users

Who know nothing about Mantra yet.

Returning users

Who have emotional history and personalization data.

Users feeling good

Mood Check-In is not only for difficult emotions.

Users feeling distressed

The experience should quickly direct them toward useful support.

7. Core Product Principle
   One check-in should be useful.

The user should not need to complete:

Ten questions
Multiple forms
Long reflections

The core experience should ideally take:

30–90 seconds

Additional exploration can remain optional.

8. Entry Points

Mood Check-In can be opened from:

Primary Quick Tool

Mood Check-In

Home/Dashboard

When the user has not checked in today.

Example:

How are you feeling today?

Personalized prompt

Based on appropriate context.

Example:

Take a moment to check in with yourself.

Future reminder/notification

Potentially:

How are you feeling today?

This depends on app-level notification capabilities.

9. Daily Frequency Rules

The primary experience is designed around:

One meaningful check-in per day

However, users should not be blocked from checking in again.

If a user wants another check-in later:

Check in again

This allows emotional changes to be recorded.

First Check-In of the Day

This is the primary daily check-in.

It contributes to:

Daily activity completion
Streak logic
Daily emotional record
Additional Check-Ins

Additional check-ins:

Should be allowed
Should contribute to emotional history
Can show how the user's state changes

But should not artificially inflate streaks.

10. Core User Flow

The recommended baseline flow:

OPEN MOOD CHECK-IN
↓
HOW ARE YOU FEELING?
↓
CHOOSE BROAD EMOTIONAL STATE
↓
CHOOSE SPECIFIC EMOTION
↓
HOW INTENSE IS IT?
↓
WHAT MIGHT BE INFLUENCING THIS? (OPTIONAL)
↓
PERSONALIZED CHECK-IN RESPONSE
↓
OPTIONAL NEXT ACTION
↓
COMPLETE 11. Screen 1 — Welcome / Entry

This screen should be extremely lightweight.

It should not feel like an onboarding screen.

Example direction
Heading:
How are you feeling?

Supporting copy:

Take a moment to check in with yourself.

Primary action:

Begin Check-In

Returning user personalization

Where appropriate:

Good morning, Ketan. How are you feeling today?

However, personalization should remain subtle.

The user's name should not be forced into every interaction.

12. Screen 2 — Broad Emotional State

The user first chooses a broad state.

The goal is to avoid immediately overwhelming them with 50 emotions.

Recommended structure
Prompt:
How are you feeling right now?

Broad choices should represent emotional zones.

For example:

Feeling Good

Positive and energized.

Calm & Settled

Peaceful or comfortable.

Not Feeling Great

Low, tired, or heavy.

Feeling Intense

Stressed, anxious, frustrated, or overwhelmed.

The exact labels should eventually be refined during UX design to feel natural.

Important

Do not force the user to understand psychological terminology.

They should simply choose what feels closest.

13. Screen 3 — Specific Emotion

Once the user chooses a broad area, show a curated set of relevant emotions.

Example:

If user chooses high-energy unpleasant:
Anxious
Overwhelmed
Stressed
Worried
Frustrated
Angry
Restless
Prompt:
Which feels closest?

Optional secondary question:

You can choose more than one.

The system should support:

Primary emotion

One main emotion.

Additional emotions

Optional.

14. Screen 4 — Emotion Intensity

After selecting the primary emotion:

Prompt:
How strongly are you feeling this?

Recommended interaction:

A simple visual slider or stepped scale.

Example:

A little ───────── A lot

Or:

● ○ ○ ○ ○

The final UI should be visually expressive rather than clinical.

Internal values

Store:

1 = Slight
2 = Mild
3 = Moderate
4 = Strong
5 = Very intense
Important UX Principle

The user should understand intensity without thinking about scoring.

Do not show:

Anxiety Severity: 4/5

Instead:

How strong does this feel right now?

15. Screen 5 — Context (Optional)

This step should never feel mandatory.

Prompt:
What's been influencing this?

Supporting text:

Only share what feels comfortable.

Possible categories:

Work
Studies
Relationships
Family
Health
Money
The future
Myself
Something else
Optional Free Text

The user may optionally add:

Want to say more?

This should remain entirely optional.

16. Progressive Disclosure

This is extremely important.

The Mood Check-In should not show everything at once.

The user journey should feel like:

One simple thought at a time.

Not:

Select mood
Select emotion
Rate intensity
Choose cause
Write explanation

all on one giant form.

17. Personalized Response Screen

After completion, the user should receive a brief, warm response.

This is one of the most important screens.

Example

If:

Emotion: Overwhelmed
Intensity: Strong

The response could be:

That sounds like a lot to carry right now.

Supporting insight:

You've taken the first step by noticing it.

Then:

Suggested next action:

Take a quick reset

Another example

If:

Emotion: Calm

It's good to notice the moments when you feel settled too.

Then:

What's helping you feel this way today?

Optional reflection.

18. Response Personalization Levels
    New User

Personalization based primarily on current answers.

Returning User

Use relevant history.

Example:

"You've mentioned work pressure recently. Does that feel connected today?"

Only where appropriate.

Experienced User

Use patterns carefully.

Example:

"Feeling overwhelmed has come up a few times recently."

Never:

"You have an overwhelm problem."

19. Recommended Next Action

The Check-In should naturally connect to the ecosystem.

The user should never feel forced to continue.

After the result, recommend one relevant next step.

Examples
Anxious + High intensity

→ Reset Now

Suggested activity:

2-minute grounding

Sad + Moderate intensity

→ What Helps Me

Explore something that might help.

Angry

→ Understand Feelings

Explore what's underneath this feeling.

Calm / Positive

→ Reflection

Notice what's contributing to this moment.

20. Primary CTA Rules

The response screen should have:

One clear primary CTA

Example:

Try a 2-minute reset

And one secondary option:

I'm done for now

Never overwhelm the user with:

Five activities
Multiple cards
Huge content sections 21. Completion Experience

Once the user completes the check-in, they should receive a satisfying sense of closure.

Example:

Check-in complete

You made space for how you're feeling today.

Then show a subtle daily progress/streak element.

22. Daily Streak System

Mood Check-In can become a major habit loop.

Example:
1 day

You've started.

3 days

You're building a habit.

7 days

One week of checking in with yourself.

30 days

A month of making space for yourself.

Important Product Principle

Mental wellness should not punish users for missing days.

Bad:

Your streak is gone.

Better:

Welcome back. It's good to see you again.

The streak system should motivate without creating guilt.

23. Shareability Layer

Mood Check-In should create optional shareable moments.

Potential shareable outputs
Emotional Snapshot

A beautifully designed card such as:

Today I checked in with myself.

or:

Making space for how I feel today.

The user should control what information appears.

Privacy Levels

Before sharing:

Option 1 — Private

Nothing shared.

Option 2 — General

Share:

"I checked in with myself today."

Option 3 — Personal

Allow user to share their emotion voluntarily.

Never automatically expose:
Journal text
Context
Personal explanations
Sensitive emotional details 24. Streak + Shareability

Potential milestone cards:

7 days of checking in with myself.

30 moments of choosing to pause.

These should look genuinely beautiful enough for:

Instagram Stories
WhatsApp Status
Social sharing

But sharing should never be required for progress.

25. Personalization Data Captured

Each completed check-in should ideally produce structured data.

Required
activity_type
completion_status
timestamp
primary_emotion
emotion_family
intensity
Optional
additional_emotions
context_categories
free_text_context
Derived

Potential future calculations:

emotional_zone
daily_primary_checkin
pattern_contribution
wellness_priority_contribution 26. Minimum Webhook Payload Concept

The exact API contract will be created separately.

Conceptually:

{
"activity": "mood_check_in",
"completed": true,
"timestamp": "ISO_TIMESTAMP",
"primaryEmotion": "anxious",
"additionalEmotions": ["overwhelmed"],
"emotionFamily": "anxiety_fear",
"intensity": 4,
"contexts": ["studies"],
"notes": ""
}

This is only the conceptual data structure.

The final implementation must match the webhook/API requirements provided by the Mantra platform.

27. What Happens When the User Abandons?

Users may leave mid-check-in.

The system should not punish this.

Potential behavior:

If enough data was selected

The UI may preserve local session progress where technically possible.

If incomplete

Do not mark:

Check-In completed.

28. Mood History

Mood Check-In should eventually contribute to a history view.

However:

Do not make this part of Version 1 unless necessary.

V1 should prioritize:

Fast check-in → meaningful response → personalization.

History and analytics can evolve later.

29. Weekly Insights — Future Feature

Once enough data exists, users could receive:

Your Week in Feelings

Examples:

You checked in 5 times this week.

Calm moments appeared more often than last week.

Work-related stress came up several times.

Again, insights must be:

Evidence-based
Non-diagnostic
Carefully worded 30. Functional Requirements

The feature must:

FR-1

Allow a user to start a Mood Check-In.

FR-2

Allow selection of a broad emotional state.

FR-3

Allow selection of a primary emotion.

FR-4

Support optional additional emotions.

FR-5

Capture emotion intensity.

FR-6

Allow optional context.

FR-7

Generate a personalized completion response.

FR-8

Recommend a relevant next action.

FR-9

Allow the user to finish without taking another activity.

FR-10

Record completion data.

FR-11

Support one primary daily check-in and additional optional check-ins.

FR-12

Work smoothly on mobile and desktop.

31. Non-Functional Requirements
    Performance

The experience should feel instant.

Avoid:

Heavy loading
Large media
Slow transitions
Mobile First

Primary target:

Mobile devices.

The UI should work beautifully from approximately:

320px and above.

Desktop

Desktop should adapt naturally.

Do not simply stretch mobile cards across the entire screen.

Accessibility

Consider:

Readable typography
Good contrast
Large touch targets
Screen reader labels
Motion reduction preferences 32. Visual Design Direction

The experience should feel:

Calm
Premium
Human
Emotionally warm
Modern
Primary palette
Mantra blue
White
Soft blue shades
Subtle neutrals
Avoid
Random 3D blobs
AI-generated decorative imagery
Generic SaaS dashboards
Excessive cards
Excessive gradients
Emoji-heavy UI
Cartoonish wellness illustrations 33. Motion & Interaction Direction

Motion should communicate progress and emotional flow.

Possible interactions:

Smooth transitions between emotional choices
Gentle selection feedback
Fluid progress transitions
Subtle completion animation

Avoid:

Excessive bouncing
Flashy animations
Gamified casino-style effects

The user should feel:

Calmly guided.

34. V1 Scope
    Build Now
    Entry
    Broad emotional selection
    Specific emotion selection
    Intensity
    Optional context
    Personalized response
    Recommended next action
    Completion state
    Mobile responsiveness
    Build Later
    Advanced mood history
    Weekly reports
    Complex pattern detection
    Full streak infrastructure
    Notifications
    Provider integration
    Advanced AI analysis

This prevents V1 from becoming too large.

35. Key Product Decision
    Mood Check-In is not a questionnaire.

This needs to guide every UX decision.

If the experience starts feeling like:

Question 1 of 5

we are doing it wrong.

The user should feel like they are naturally answering:

How am I doing right now?

Final Product Statement

Mood Check-In is a fast, daily ritual that helps users pause, recognize what they are feeling, and take one meaningful next step—while gradually building a more personalized understanding of their emotional journey.
