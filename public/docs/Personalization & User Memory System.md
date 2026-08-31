Document Purpose

This document defines how Mantra should remember, connect, and use information shared by users across different activities.

The goal is simple:

The more a user interacts with Mantra, the more personal and useful the experience should become.

A user should not feel like they are repeatedly filling out disconnected activities.

Instead:

Every meaningful interaction should help build a better understanding of the user's journey.

1. The Core Principle
   Ask once. Use intelligently.

If a user has already shared something meaningful, Mantra should use that information where relevant instead of asking the same thing repeatedly.

Example

During a Mood Check-In:

Feeling: Overwhelmed
Context: College
Possible reason: Exams

Later, the Journal could say:

"You've mentioned exam pressure recently. What's feeling most overwhelming today?"

And What Helps Me could prioritize:

Breaking tasks into smaller steps
Managing overwhelm
Taking structured breaks

The user should experience continuity.

2. What User Memory Means

"Memory" does not mean storing everything forever and constantly mentioning it.

User memory should mean:

Remembering meaningful information when it improves the experience.

There are four main categories.

3. Memory Layer 1 — Current Session Context

This is temporary information from what the user is doing right now.

Example

Current Mood Check-In:

Feeling anxious
Intensity: high
Context: work

This should immediately influence the current experience.

For example:

"Let's focus on what might help right now."

Lifetime

Current session or short-term context.

4. Memory Layer 2 — Historical Activity Memory

This records meaningful past interactions.

Examples:

Previous moods
Activities completed
Coping tools tried
What the user marked as helpful
Journal prompts completed
Self-exploration responses
Example

User previously tried:

Box breathing → Marked helpful

Later:

"Last time you felt overwhelmed, box breathing seemed to help."

5. Memory Layer 3 — Personal Profile Memory

This represents relatively stable things the user has shared about themselves.

Examples:

Important values
Personal goals
Preferred coping methods
Things they enjoy
Important life areas
Wellness priorities
Example

User has repeatedly expressed that:

Spending time outdoors helps them feel better.

This can become a stronger personalized preference.

6. Memory Layer 4 — Patterns & Insights

This is the highest level.

Mantra should not simply remember raw answers.

It should gradually identify patterns.

Example

Raw memories:

Monday: stressed about work
Wednesday: stressed about deadlines
Friday: overwhelmed by work

↓

Potential pattern:

"Work-related pressure has come up several times recently."

This distinction is important:

Raw data ≠ Insight

An insight should only be generated when enough evidence exists.

7. The Personalization Loop

Every activity should participate in this loop:

USER INTERACTION
↓
COLLECT MEANINGFUL SIGNAL
↓
STORE STRUCTURED MEMORY
↓
UPDATE USER UNDERSTANDING
↓
PERSONALIZE NEXT EXPERIENCE
↓
USER PROVIDES MORE SIGNAL
↓
THE LOOP IMPROVES

This is the core intelligence system behind Mantra.

8. What Information Should Be Remembered?

Not every interaction deserves long-term memory.

We should categorize data.

A. Emotional Signals

Store:

Emotion
Emotion family
Intensity
Date/time
Optional context

Example:

Anxious
High intensity
Work-related
31 August 2026
B. Context Signals

Store recurring contexts such as:

Work
Studies
Relationships
Family
Future
Money
Health
Self-esteem

These become useful for pattern detection.

C. Helpful Actions

One of the most valuable forms of memory.

Store:

Activity tried
Situation/emotion
Whether it helped
User rating if collected

Example:

Emotion: Overwhelmed
Activity: Grounding exercise
Outcome: Helpful

This powers:

My Coping Toolkit
D. User Preferences

Examples:

Prefers breathing exercises
Likes writing
Doesn't enjoy long meditations
Prefers short activities

This helps personalize future recommendations.

E. Self-Discovery Insights

From Know Myself and guided activities.

Examples:

Values independence
Wants better relationships
Finds meaning in creativity

These should be handled carefully and ideally with user visibility/control.

9. Memory Confidence Levels

Not every piece of information should be treated equally.

Mantra should assign confidence based on repetition and confirmation.

Level 1 — Single Signal

User said something once.

Example:

"Walking helped today."

Do not assume it is a permanent preference.

Level 2 — Repeated Signal

The same thing appears multiple times.

Example:

Walking was marked helpful three times.

Possible insight:

"Walking seems to help you reset."

Level 3 — Strong Pattern

The signal appears repeatedly over meaningful time.

Example:

Walking repeatedly helps during stress.

This can become:

A strong personalized recommendation.

10. User Confirmation Matters

Where possible, the system should validate assumptions.

Instead of permanently deciding:

"Walking is your favorite coping strategy."

Ask occasionally:

"You've found walking helpful a few times. Does it usually help you feel better?"

Possible answers:

Yes, definitely
Sometimes
Not really

This keeps personalization accurate.

11. Cross-Activity Personalization

This is where Mantra becomes different from a collection of tools.

Mood Check-In → Reset Now

User:

Anxious + High intensity

↓

Reset Now prioritizes:

Breathing
Grounding
Calming
Mood Check-In → Journal

User:

Feeling lonely

↓

Journal might offer:

"What's been making you feel disconnected lately?"

What Helps Me → Future Recommendations

User:

Grounding helped with anxiety.

↓

Next anxious moment:

"Want to try grounding again?"

Know Myself → Affirmations

User has explored:

Fear of failure and self-worth.

↓

Affirmations can become more relevant to those themes.

12. Personalization Hierarchy

When deciding what to show a user, Mantra should prioritize information in this order:

Priority 1 — Current state

What does the user need right now?

Priority 2 — Recent history

What has happened recently?

Priority 3 — Personal preferences

What do we know generally helps this person?

Priority 4 — Long-term patterns

What recurring insights are relevant?

Example

A user normally likes journaling.

But right now they report:

Very intense anxiety.

The system should prioritize immediate support, not say:

"Here's your usual journal prompt."

Current need comes first.

13. Recommendation Engine Logic

Every recommendation should ideally consider:

CURRENT EMOTION

- INTENSITY
- RECENT HISTORY
- PAST EFFECTIVENESS
- USER PREFERENCES
- # KNOWN PATTERNS
  BEST NEXT EXPERIENCE
  Example
  User:
  Currently overwhelmed
  Intensity: strong
  Grounding helped before
  Long activities are often abandoned
  Recommendation:

Try a 2-minute grounding exercise

Instead of:

Start a 20-minute meditation

This is meaningful personalization.

14. The "Don't Be Creepy" Rule

Personalization can easily become uncomfortable.

Bad:

"You mentioned your father 17 days ago. Are you still upset about that?"

Better:

"Family-related stress has come up a few times recently. Does that feel relevant today?"

The product should never feel like:

"The app is watching everything I say."

It should feel like:

"The app remembers what matters."

15. Memory Visibility

Eventually, users should have visibility and control over their personalization.

Possible future section:

What Mantra Knows About Me

Examples:

Things that help you
Walking
Writing
Breathing
Things that often affect you
Work pressure
Uncertainty
Current priorities
Managing stress
Better rest

Users should eventually be able to:

Edit
Remove
Correct

important memories.

16. Negative Feedback Is Also Memory

The system must learn what doesn't work.

Example:

User repeatedly skips:

Long meditation
Body scan

But consistently completes:

2-minute breathing
Quick journaling

The system should adapt.

Don't repeatedly push ignored activities.

This is just as important as learning positive preferences.

17. Activity Effectiveness Model

Every meaningful activity should have an optional feedback loop.

After an activity:

How do you feel now?

or:

Did this help?

Possible simple responses:

Helped a lot
Helped a little
Not really

This allows Mantra to learn:

ACTIVITY

- CONTEXT
- EMOTION
- # OUTCOME
  PERSONAL EFFECTIVENESS

18. Personalization Should Improve Over Time
    New User

Limited knowledge.

Experience should rely on:

Current input
Broadly useful activities
Simple exploration
Returning User

Some history.

Experience can use:

Recent moods
Previous activity outcomes
Engaged User

Rich history.

Experience becomes increasingly personal:

Pattern-based insights
Personalized coping toolkit
Relevant prompts
Wellness priorities

The user should notice:

"Mantra is becoming more useful the more I use it."

19. Personalization Across the Six Quick Tools
    Tool Information Collected Personalization Output
    Mood Check-In Emotion, intensity, context Next action
    Reset Now Immediate need, activity use Better quick recommendations
    Understand Feelings Emotional insights Better understanding prompts
    What Helps Me Coping effectiveness Personal toolkit
    My Journal Reflections/themes Relevant prompts
    Know Myself Values, goals, identity Deep personalization

All feed into:

Shared User Understanding 20. User Memory Architecture

Conceptually:

                        USER
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      EMOTIONS       ACTIVITIES      REFLECTIONS
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 SHARED MEMORY LAYER
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    PREFERENCES       PATTERNS         INSIGHTS
        │                │                │
        └────────────────┼────────────────┘
                         ▼
               PERSONALIZATION ENGINE
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼

RECOMMENDATIONS PROMPTS WELLNESS PLAN 21. Wellness Priority System

The system can maintain internal priority areas.

For example:

Area Priority
Stress High
Anxiety Medium-High
Sleep Medium
Self-esteem Low

Priority can be influenced by:

Frequency
Recency
Intensity
User interest
Repeated activity selection
Important:

This is an internal personalization mechanism, not a diagnosis.

Do not tell users:

"Your anxiety severity score is 82."

Instead, use natural language:

"Stress seems to be taking up more space for you recently."

22. Recency Matters

Old information should not dominate forever.

Example:

A user was highly stressed during exams three months ago but hasn't mentioned it since.

The system should gradually reduce the importance of that context.

A simple conceptual model:

Recent + frequent + intense

= High relevance

Old + isolated

= Low relevance

23. Pattern Detection Rules

Before showing an insight, consider:

Frequency

How often has this appeared?

Recency

Has it appeared recently?

Consistency

Does the pattern repeat?

Confidence

Do we have enough evidence?

Only then surface it.

24. Example User Journey
    Week 1

User checks in:

Anxious

Tries:

Breathing

Marks:

Helped a little

System learns:

First signal.

Week 2

User checks in:

Overwhelmed

Context:

Studies

Tries:

Writing

Marks:

Helped a lot

System learns:

Writing may be useful.

Week 3

User again feels:

Overwhelmed

Mantra can say:

"Writing things down helped you previously. Want to try a quick brain dump?"

Now the experience feels connected.

25. Privacy Principles

Because this is an emotional wellness product, personalization must be built responsibly.

Core principles:

Consent

Users should understand when information is being used.

Relevance

Only use information when it improves the experience.

Control

Users should eventually be able to edit/remove meaningful stored information.

Sensitivity

Don't surface personal information unexpectedly.

No false certainty

Patterns are observations, not diagnoses.

26. Future Provider Integration

The same underlying memory system can eventually support provider journeys.

However:

Provider data access must be separate from user memory.

The fact that Mantra stores something for personalization does not automatically mean a provider should see it.

The system should eventually support separate permissions:

USER MEMORY
│
├── Private to user
│
├── Used for Mantra personalization
│
└── Explicitly shared with provider

This distinction is essential.

27. Implementation Reality for Mantra Minis

Because activities will initially be built as independently deployed Minis/web experiences, we need a consistent shared structure.

Every Mini should ideally:

Receive context

If available:

User identifier
Relevant previous context
Activity context
Collect structured outputs

Examples:

Emotion selected
Activity completed
Feedback
Reflection category
Send data back

To a shared system/webhook where possible.

This ensures the Minis don't become disconnected.

28. Minimum Data Contract for Every Activity

Every future activity should answer:

1. What context does this activity need?

Input.

2. What does this activity learn?

Output.

3. What can future activities use?

Shared memory.

Example:

Mood Check-In

Input:
Recent mood history if available.

Output:
Emotion, intensity, context.

Future use:
Recommendations, insights, affirmations.

What Helps Me

Input:
Current emotion.

Output:
Activities tried + effectiveness.

Future use:
Coping Toolkit.

29. The Golden Rule for New Activities

Before building any activity, answer:

What does the user gain?
What does Mantra learn?
How does this improve the next experience?

If an activity cannot answer these questions, it risks becoming another disconnected feature.

30. Final Product Definition

The Mantra personalization system should behave like an evolving understanding—not a static user profile.

It should continuously answer:

What is this person experiencing right now?

What have they experienced recently?

What have we learned helps them?

What patterns are emerging?

What would be most useful next?

Final Principle

Every meaningful interaction should make the next interaction better.

That is the foundation of the Mantra ecosystem.

With these four foundation documents complete, we now have enough product structure to move into the Mood Check-In PRD and detailed UX flow properly.
