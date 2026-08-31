Document Purpose

This document defines the shared emotional language used across the Mantra Self-Love ecosystem.

It will power:

Mood Check-In
Understand Feelings
Personalized affirmations
What Helps Me
Reset Now recommendations
Journaling prompts
Emotional insights
Pattern detection
Future provider insights

This taxonomy should be treated as a product data model, not just a list of emotions.

The key principle is:

Users should be able to describe their feelings naturally, while the system maintains enough structure to personalize experiences intelligently.

1. The Core Model

Mantra should not treat mood and emotion as exactly the same thing.

For product purposes, we use this structure:

CURRENT STATE
↓
BROAD EMOTIONAL ZONE
↓
EMOTION FAMILY
↓
SPECIFIC EMOTION
↓
INTENSITY
↓
CONTEXT / POSSIBLE INFLUENCE

Example:

Current state: Feeling uncomfortable
↓
Broad zone: High energy + unpleasant
↓
Emotion family: Anxiety / Fear
↓
Specific emotion: Overwhelmed
↓
Intensity: Strong
↓
Context: Work + deadlines

This allows the experience to start simple and become more specific only when useful.

2. The Four Broad Emotional Zones

For the Mood Check-In, the first layer should be based on two dimensions:

Energy
High energy
Low energy
Emotional pleasantness
Pleasant
Unpleasant

Together:

    Pleasant	Unpleasant

High Energy Energized Activated / Distressed
Low Energy Calm / Content Low / Heavy

These are navigation zones, not diagnoses.

3. Zone A — High Energy + Pleasant
   User experience meaning

“I have energy and generally feel good.”

Emotion families
Joy
Happy
Excited
Thrilled
Delighted
Confidence
Confident
Proud
Capable
Empowered
Engagement
Motivated
Inspired
Curious
Interested
Connection
Loved
Appreciated
Connected
Playful
Positive activation
Energized
Enthusiastic
Hopeful
Optimistic 4. Zone B — Low Energy + Pleasant
User experience meaning

“I feel okay, calm, settled, or at ease.”

Emotion families
Calm
Calm
Peaceful
Relaxed
At ease
Contentment
Content
Satisfied
Comfortable
Fulfilled
Safety
Safe
Secure
Grounded
Settled
Rest
Restful
Sleepy
Quiet
Still 5. Zone C — High Energy + Unpleasant
User experience meaning

“Something feels uncomfortable, intense, or activated.”

Emotion families
Anxiety / Fear
Anxious
Worried
Nervous
Uneasy
Fearful
Panicked
Apprehensive
Overwhelm / Pressure
Overwhelmed
Stressed
Pressured
Overloaded
Restless
Tense
Anger / Frustration
Angry
Frustrated
Irritated
Annoyed
Furious
Resentful
Shame / Social discomfort
Embarrassed
Ashamed
Self-conscious
Insecure 6. Zone D — Low Energy + Unpleasant
User experience meaning

“I feel low, heavy, disconnected, or drained.”

Emotion families
Sadness
Sad
Unhappy
Heartbroken
Disappointed
Hurt
Grieving
Low Energy
Tired
Exhausted
Drained
Burnt out
Unmotivated
Disconnection
Lonely
Isolated
Detached
Empty
Numb
Hopelessness
Discouraged
Defeated
Helpless
Hopeless 7. Mixed and Complex Emotional States

Humans rarely experience one emotion at a time.

The system should support:

Primary emotion

What feels strongest right now?

And optionally:

Additional emotions

Anything else you're feeling?

Example:

Primary: Anxious
Also feeling: Excited

Or:

Primary: Sad
Also feeling: Angry

Product rule

Do not force every user into a single emotion.

Allow mixed states when appropriate.

8. Specific Emotion Data Structure

Every emotion should eventually have structured metadata.

Example:

Emotion ID: anxious

Display Name: Anxious

Zone:
High Energy + Unpleasant

Emotion Family:
Anxiety / Fear

Related Emotions:
Worried
Nervous
Uneasy
Overwhelmed

Opposite / Regulation Direction:
Calm
Grounded
Safe

Recommended Tool Categories:
Breathing
Grounding
Reflection

Affirmation Categories:
Safety
Uncertainty
Self-trust

Potential Journal Themes:
What feels uncertain?
What are you anticipating?
What feels within your control?

This is how the taxonomy becomes useful across the entire product.

9. Intensity System

Emotion alone isn't enough.

Anxious can mean very different things depending on intensity.

Mantra should use a simple 5-level system internally.

Level 1 — Slight

“I can notice it, but it's manageable.”

Level 2 — Mild

“It's present and affecting me a little.”

Level 3 — Moderate

“It's clearly affecting my thoughts or day.”

Level 4 — Strong

“It's difficult to ignore or manage.”

Level 5 — Very Intense

“It feels overwhelming right now.”

User-facing wording can adapt

Instead of showing clinical numbers:

How intense does it feel?

Slight — Noticeable — Strong — Overwhelming

The exact UI can use four or five visual positions while the backend stores normalized values.

10. Context Taxonomy

Emotion without context has limited personalization value.

After identifying a feeling, the user can optionally add context.

Major context areas
Work / Career
Work
Deadlines
Job
Career uncertainty
Education
Studying
Exams
College
Academic pressure
Relationships
Partner
Family
Friends
Conflict
Self
Self-esteem
Appearance
Personal expectations
Identity
Health & Body
Sleep
Physical health
Energy
Hormonal/body changes
Life circumstances
Money
Future
Change
Uncertainty
Other

Free-text or:

Something else

Important rule

Context should always remain optional during a quick daily check-in.

Otherwise, the habit becomes too time-consuming.

11. Possible Influence vs Confirmed Cause

The app should never claim:

“This is why you're anxious.”

Instead, use language such as:

What might be influencing this?
Does anything feel connected to this?
What seems to be contributing?

The user remains the authority on their own experience.

12. Emotion Relationships

The system should understand relationships between emotions.

Example:

ANXIETY
├── Worried
├── Nervous
├── Uneasy
├── Restless
└── Apprehensive

And:

ANGER
├── Irritated
├── Annoyed
├── Frustrated
├── Resentful
└── Furious

This allows Mantra to detect broader patterns.

For example:

A user may rarely select Anxious, but frequently select:

Worried
Nervous
Uneasy

The system can identify a broader:

Anxiety-related emotional pattern

without forcing that language on the user.

13. Emotion Synonyms

Users use different words for similar experiences.

The system should support synonyms and natural language mapping.

Example:

User Language System Emotion
Freaking out Overwhelmed / Anxious
Burnt out Exhausted / Burnout
Feeling weird Uneasy / Uncomfortable
Fed up Frustrated
Dead inside Numb / Empty

This becomes especially useful later for:

Journaling
AI interactions
Free-text reflections 14. Emotion Recommendations Mapping

The taxonomy should connect emotions to potential next actions.

Example: Anxiety
Low intensity

Possible actions:

Understand the feeling
Quick reflection
Short breathing exercise
Moderate intensity

Possible actions:

Grounding
Breathing
Write down worries
High intensity

Possible actions:

Immediate grounding
Slow breathing
Reduce stimulation

The recommendation should always be framed as:

“You could try…”

not:

“This will fix your anxiety.”

15. Emotion → Tool Mapping

Each emotion can connect to relevant areas of the ecosystem.

Example:

Emotion Reset Now Understand Feelings What Helps Me Journal
Anxious Grounding Anxiety exploration Coping toolkit Worry prompt
Angry Body release Explore anger Pause strategies Conflict reflection
Sad Self-soothing Explore sadness Comfort activities Self-compassion
Overwhelmed Breathing Identify pressures Break tasks down Brain dump
Lonely Grounding Explore connection Reach out Connection reflection

This mapping should remain flexible and personalized over time.

16. Positive Emotions Matter Too

Mood tracking should not become a system that only activates when someone feels bad.

Positive emotional data is extremely valuable.

If someone feels:

Proud
Energized
Calm
Connected
Hopeful

Mantra can learn:

What conditions are associated with the user feeling well?

This is essential.

The system should learn both:

What brings users down

and

What helps them thrive. 17. Mood Patterns

Over time, structured emotion data can generate patterns.

Examples:

Time patterns

You often feel low late in the evening.

Context patterns

Work has appeared frequently when you've felt stressed.

Emotional patterns

Anxiety-related emotions have appeared more often recently.

Positive patterns

You often feel calmer after spending time outdoors.

These should only be shown when enough data exists.

18. Confidence in Insights

The system should not generate strong conclusions from one or two check-ins.

Internal confidence levels
Emerging pattern

Small amount of evidence.

Repeated pattern

Appears consistently.

Strong pattern

Repeated over a meaningful period.

User-facing language should adapt:

Emerging

“You may be noticing…”

Repeated

“This has come up a few times recently…”

Strong

“This seems to be a recurring pattern…”

19. The Emotion Taxonomy Is Expandable

The initial taxonomy should not try to include every emotion known to psychology.

That would overwhelm users.

The system should launch with a curated, understandable set of emotions.

Initial target:

Approximately 40–60 specific emotions.

Enough variety for:

“That's exactly how I feel.”

But not so many that choosing becomes exhausting.

20. Recommended Initial Emotion Set
    High Energy + Pleasant

Happy
Excited
Hopeful
Confident
Proud
Motivated
Inspired
Energized
Loved
Playful

Low Energy + Pleasant

Calm
Peaceful
Relaxed
Content
Safe
Comfortable
Grounded
Satisfied
Restful
Grateful

High Energy + Unpleasant

Anxious
Worried
Nervous
Overwhelmed
Stressed
Restless
Tense
Angry
Frustrated
Irritated
Annoyed
Embarrassed
Insecure

Low Energy + Unpleasant

Sad
Lonely
Tired
Exhausted
Drained
Burnt out
Empty
Numb
Disappointed
Hurt
Discouraged
Unmotivated
Helpless
Defeated

21. Taxonomy Design Principles

The emotion system must always follow these principles:

1. Human language first

Use words people actually understand.

2. Progressive complexity

Start broad.

Allow deeper exploration.

3. No forced interpretation

The app helps users explore; it doesn't tell them what they're feeling.

4. Mixed emotions are valid

Users can experience more than one feeling.

5. Context matters

The same emotion can have different meanings in different situations.

6. Positive data matters too

We learn from wellbeing, not only distress.

7. Patterns require evidence

Never overinterpret limited data.

22. The Taxonomy's Role Across Mantra
    EMOTION TAXONOMY
    │
    ┌──────────────────┼──────────────────┐
    ▼ ▼ ▼
    MOOD CHECK-IN AFFIRMATIONS JOURNAL PROMPTS
    │ │ │
    ├──────────────────┼──────────────────┤
    ▼ ▼ ▼
    UNDERSTAND FEELINGS WHAT HELPS ME RESET NOW
    │
    ▼
    PERSONALIZATION
    │
    ▼
    USER INSIGHTS
    Final Principle

The purpose of the taxonomy is not to categorize people perfectly.

Its purpose is to give users better language for their experiences and give Mantra enough structure to provide increasingly relevant support.

The user describes their experience.
Mantra learns the patterns.
The experience becomes more personal over time.
