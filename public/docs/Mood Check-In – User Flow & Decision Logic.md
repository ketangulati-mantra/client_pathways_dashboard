Product: Mantra Self-Love
Feature: Mood Check-In
Version: V1 UX Specification
Platform: Mobile-first Mini / Responsive Web

1. UX Philosophy

The Mood Check-In should feel like a conversation with yourself, not a form.

The experience must be:

Fast
Focused
One decision at a time
Visually calm
Emotionally intelligent
Easy to complete in under a minute
Core rule

Never make the user feel like they are progressing through a questionnaire.

Avoid:

Question 1 of 5
Long forms
Large blocks of instructional text
Multiple unrelated decisions on one screen

Instead, the user should feel naturally guided from:

What am I feeling?

to:

What might help me next?

2. Overall UX Flow
   OPEN MOOD CHECK-IN
   ↓
   HOW ARE YOU FEELING?
   ↓
   CHOOSE EMOTION
   ↓
   HOW STRONG IS IT?
   ↓
   WHAT'S INFLUENCING IT? (OPTIONAL)
   ↓
   CHECK-IN COMPLETE
   ↓
   PERSONALIZED RESPONSE
   ↓
   RECOMMENDED NEXT STEP
   Target completion time:

30–60 seconds

3. Screen 1 — Emotion Selection
   Purpose

The user should start interacting immediately.

There should be no separate welcome screen.

Header

Small, minimal:

Mood Check-In

No large navigation bar.

Optional close button in the top-right.

Main Prompt
How are you feeling right now?

Supporting text:

Choose what feels closest.

4. Emotion Selection Interaction

Instead of asking users to first choose from abstract emotional zones, we should allow them to see recognizable emotions immediately.

This is faster and more human.

Initial emotion set

Show approximately 8–12 emotions:

Happy
Calm
Excited
Anxious
Stressed
Overwhelmed
Sad
Angry
Tired
Lonely

Then:

Something else
Why this is better

Users don't think:

“Am I high energy + unpleasant?”

They think:

“I'm stressed.”

The product should match how people naturally think.

5. Emotion Selection UI

Recommended interaction:

Large, touch-friendly emotion choices arranged in a visually balanced grid.

Each emotion should have:

A premium visual icon/symbol
Emotion name
Clear selected state

Avoid:

Emojis
Generic checkbox UI
Pill overload
SaaS-style chips

The visual language should feel like an emotional wellness product.

6. Selecting an Emotion

When a user selects an emotion:

Option A — Immediate progression

Tap emotion → move forward automatically.

This is recommended for the fastest flow.

Option B — Confirmation

Allow selection, then:

Continue

This is useful if animations/interaction require confirmation.

Recommendation:

Use Option A.

The experience should feel responsive and fluid.

7. Screen 2 — Specific Emotion

After selecting the broad emotion, Mantra can help the user become more specific.

Example:

User selected:

Stressed

Next screen:

What feels closest?

Show related emotions:

Pressured
Overwhelmed
Tense
Restless
Drained

Also:

Stressed is exactly right

This prevents forcing unnecessary refinement.

Important UX Rule

This screen should not appear for every user interaction if it adds friction unnecessarily.

Recommended:

Allow the initial emotion to act as the final emotion.

Specific refinement should feel optional.

8. Screen 3 — Intensity

Once the emotion is selected:

How strongly are you feeling this right now?

Use a simple, expressive interaction.

Recommended labels:

A little Quite a lot Very strongly

The visual indicator should change smoothly as intensity changes.

Avoid displaying:

1 / 5

Interaction

The user taps one of five positions.

Internally:

1 — Slight
2 — Mild
3 — Moderate
4 — Strong
5 — Very strong 9. Screen 4 — Context

This should be optional and skippable.

Prompt:
What's influencing how you feel?

Supporting copy:

If anything comes to mind.

Context options
Work
Studies
Relationships
Family
Health
Money
The future
Myself

Then:

Something else
Interaction

Users can select:

One context
Multiple contexts

Or:

Skip for now 10. Optional Reflection

After selecting context, offer an optional lightweight reflection.

Prompt:
Want to put it into words?

Input:

What's on your mind?

Important

This is optional.

The user should never feel pressured to journal.

11. Screen 5 — Processing Transition

Avoid a fake:

"Analyzing your emotions..."

This feels artificial and AI-heavy.

Instead, transition directly into the response.

A subtle loading transition is fine if the system genuinely needs to process data.

12. Screen 6 — Personalized Response

This is the emotional payoff.

The response should be short.

Example

For:

Overwhelmed — Strong

That sounds like a lot right now.

You don't have to figure everything out at once.

Then:

Suggested action

Take a 2-minute reset

The user should see:

Recognition
One useful thought
One clear action 13. Personalized Response Structure

Every response should follow:

RECOGNITION
↓
SUPPORTIVE INSIGHT
↓
RECOMMENDED NEXT STEP
Example — Anxious

It sounds like things feel uncertain right now.

You don't need to solve every possibility at once.

Try a quick grounding exercise

Example — Sad

It's okay to have moments that feel heavy.

You don't need to push the feeling away immediately.

Take a moment to reflect

Example — Calm

It's worth noticing moments when you feel settled.

These moments can teach you what helps you feel like yourself.

What feels good about today?

14. Recommendation Logic

The UI only needs to display one recommendation.

Internally, selection can use:

EMOTION

- INTENSITY
- CONTEXT
- PREVIOUS USER HISTORY
- WHAT HAS HELPED BEFORE

The result:

One best next action.

Avoid showing a list of 10 recommendations.

15. Completion State

The user should always be able to stop after checking in.

Bottom action:

I'm done for now

This should feel completely valid.

We should never imply:

"You're not done until you complete another activity."

16. Progress Indicator

Avoid:

Step 1 of 5

Instead use a subtle progress system.

Recommended:

A thin segmented indicator near the top.

Example:

━━━━━━ ○ ○ ○

It communicates movement without feeling like a form.

17. Back Navigation

The user should be able to go back.

If they selected:

Anxious

but realize:

Actually, I'm more frustrated

They should be able to change it.

Use:

Back arrow
Smooth reverse transition

Never trap the user in selections.

18. Close / Exit Behaviour

Top-right:

Close

If the user exits after making selections:

Optionally preserve progress locally.

Do not show annoying:

"Are you sure you want to leave?"

unless significant free-text content would be lost.

19. Daily Check-In Completion

After the primary daily check-in:

Show subtle acknowledgement.

Example:

You checked in today.

Then:

A small pause can make it easier to understand what you need.

20. Streak Placement

The streak should not dominate the Mood Check-In.

Avoid turning emotional awareness into a game.

Instead:

Small indicator:

3-day check-in rhythm

This wording is potentially better than:

🔥 3 DAY STREAK

It feels more aligned with wellness.

21. Viral / Shareable Moment

After completion, optionally offer:

Share your check-in

This should generate a privacy-safe visual card.

Example:

TODAY I MADE SPACE
FOR HOW I FEEL.

Mood Check-In
Mantra

The user chooses what to reveal.

Privacy choices
Keep it private

Default.

Share the moment

Generic card.

Share how I feel

Optional emotion inclusion.

22. Mobile Layout

The entire flow should be designed around:

One-handed use
Thumb-friendly interactions
Large tap targets
Bottom-positioned actions
Minimal scrolling
Important:

Every primary screen should ideally fit within one mobile viewport.

The user should rarely need to scroll.

23. Desktop Adaptation

On desktop:

Do not stretch everything full-width.

Use a focused central experience.

Possible max-width:

480–640px

The emotional experience should remain intimate.

24. Responsive Behaviour
    Mobile
    Full-width experience
    16–24px horizontal padding
    Bottom-fixed primary actions where appropriate
    Tablet
    Centered experience
    More breathing room
    Desktop
    Centered focused canvas
    No excessive empty dashboard UI
25. Motion Principles

Use:

Fade transitions
Gentle horizontal movement
Subtle scale feedback
Smooth progress updates

Avoid:

Bouncing
Confetti
Flashing
Aggressive gamification 26. Screen Summary
Screen User Action Required
Emotion Select feeling Yes
Specific emotion Refine feeling Optional
Intensity Choose strength Yes
Context Add influence Optional
Reflection Write thoughts Optional
Response Receive insight Automatic
Next step Choose action Optional 27. Ideal Completion Times
Fastest check-in

Emotion + intensity:

15–20 seconds

Standard check-in

Emotion + intensity + context:

30–45 seconds

Deep check-in

With reflection:

1–2 minutes

The user controls depth.

28. The Key Experience Principle

A Mood Check-In should scale based on the user's willingness to engage.

JUST CHECKING IN
↓
15 seconds

CURIOUS
↓
45 seconds

WANTS TO REFLECT
↓
2 minutes

This is better than forcing every user through the same five-step flow.

Final UX Definition

The Mood Check-In begins immediately, helps users name what they're feeling with minimal friction, lets them go deeper only when they want to, and ends with one genuinely relevant next step.
