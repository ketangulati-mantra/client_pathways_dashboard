# Mantra 21 Activity & Personalization Architecture Contract

## Overview
Every activity in the Mantra 21 Pathways platform (Depression, Anxiety, Self-Esteem, etc.) adheres to this strict, non-clinical data pipeline:

```
[User Interactions / Answers]
            │
            ▼
[Raw Protected Response Data]  ──(Persisted in user_activities.result_summary & user_progress)
            │
            ▼
[Deterministic Personalization Engine]  ──(Maps options & weights to explainable focus areas)
            │
            ▼
[Idempotent Signals Logging]  ──(Saved to user_personalization_signals with source_type & source_id)
            │
            ▼
[Aggregated Personalization Profile]  ──(Dynamically computed over Day 1 + Daily Check-Ins + Lessons)
            │
            ▼
[Future Pathway & Activity Recommendations]
```

---

## 1. Permanent Raw Response Storage
- **Requirement**: Raw answers (`familiar_experiences`, `reason_for_joining`, `ten_percent_lighter`, video watch analytics) must **NEVER** be overwritten or replaced by derived tags.
- **Why**: As recommendation algorithms evolve, the platform must retain the ability to recalculate or re-score historical responses from raw baseline data.
- **Storage Target**:
  - `user_activities.result_summary.response_data` (Primary immutable activity log)
  - `user_progress.response_data` (Active in-progress step state for re-entry/resume)

---

## 2. Deterministic Signal Generation & Idempotency
- **Requirement**: Signal generation is 100% deterministic (rule-based scoring, zero AI/LLM hallucinations).
- **Idempotency Rule**:
  - Uniquely constrained in database:
    `CONSTRAINT unique_user_pathway_source_signal UNIQUE (user_id, pathway_id, source_type, source_id, signal)`
  - Retries, network replays, or refreshing the completion screen **cannot duplicate or artificially inflate signal strength**. Duplicate submissions perform an idempotent `UPSERT`.

---

## 3. `current_focus` is a Derived Output, NOT an Immutable State
- **Requirement**: A user's `current_focus` is a recommendation output calculated dynamically across all accumulated evidence:
  $$\text{Current Focus} = \arg\max \sum (\text{Day 1 Signals} + \text{Daily Check-In Signals} + \text{Activity Signals})$$
- Day 1 does not permanently lock the user's 21-day experience; subsequent days continuously modulate the profile.

---

## 4. Source Traceability (`source_type` + `source_id`)
Every record in `user_personalization_signals` explicitly identifies its origin:
- `source_type`: `'activity' | 'daily_check_in' | 'journal' | 'assessment'`
- `source_id`: The specific `activity_submission_id`, `check_in_date`, or `activity_id` (e.g. `depression_what_is_depression`)

---

## 5. Privacy & Analytics Boundaries
- **Protected DB Data**: Full user selections and interaction timestamps reside securely in Postgres tables (`user_activities`, `user_personalization_signals`).
- **Analytics Events**:
  - Track lifecycle events only: `activity_started`, `video_started`, `video_progress`, `video_completed`, `question_answered`, `activity_completed`.
  - Payloads contain event IDs and selected option IDs (`question_id`, `selected_option_ids`).
  - **No sensitive free-text mental health responses** are broadcast in analytics.

---

## 6. Standard Table Reuse (No Redundant Tables)
All future Mantra 21 activities must utilize the same unified table suite:
1. `user_activities` (Activity logging & streak integration)
2. `user_progress` (Step-by-step resumption state)
3. `user_activity_completions` (Completion timestamps & unlocks)
4. `user_personalization_signals` (Accumulated evidence for personalization)
