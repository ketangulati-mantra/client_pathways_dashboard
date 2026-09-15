import { sql } from '../db/client.js';

export interface SaveFocusAssessmentInput {
  userId: string;
  assessmentVersion?: string;
  answers: Record<string, any>;
  primaryConcern: string;
  secondaryConcern?: string | null;
  desiredOutcome: string;
  confidence: string;
  assignedPathwayId: string;
  scores?: Record<string, any>;
  metadata?: Record<string, any>;
}

let isFocusSchemaEnsured = false;
async function ensureFocusAssessmentTable() {
  if (isFocusSchemaEnsured) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS personalization_assessments (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        assessment_version VARCHAR(50) DEFAULT '21_day_focus_v1',
        answers JSONB DEFAULT '{}'::jsonb,
        primary_concern VARCHAR(100) NOT NULL,
        secondary_concern VARCHAR(100),
        desired_outcome VARCHAR(255),
        confidence VARCHAR(50) DEFAULT 'moderate',
        assigned_pathway_id VARCHAR(100) NOT NULL,
        scores JSONB DEFAULT '{}'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_personalization_assessments_user_id ON personalization_assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_personalization_assessments_created_at ON personalization_assessments(created_at DESC);`;
    isFocusSchemaEnsured = true;
  } catch (err) {
    console.error('[focusAssessmentService] Table initialization warning:', err);
  }
}

export const focusAssessmentService = {
  async saveFocusAssessment(input: SaveFocusAssessmentInput) {
    await ensureFocusAssessmentTable();

    const {
      userId,
      assessmentVersion = '21_day_focus_v1',
      answers,
      primaryConcern,
      secondaryConcern = null,
      desiredOutcome,
      confidence,
      assignedPathwayId,
      scores = {},
      metadata = {}
    } = input;

    // Check for recent assessment from same user (within last 30 seconds) for idempotency
    const existingRecent = await sql`
      SELECT * FROM personalization_assessments
      WHERE user_id = ${userId}
        AND primary_concern = ${primaryConcern}
        AND created_at >= NOW() - INTERVAL '30 seconds'
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (existingRecent && existingRecent.length > 0) {
      return existingRecent[0];
    }

    const inserted = await sql`
      INSERT INTO personalization_assessments (
        user_id,
        assessment_version,
        answers,
        primary_concern,
        secondary_concern,
        desired_outcome,
        confidence,
        assigned_pathway_id,
        scores,
        metadata,
        created_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${assessmentVersion},
        ${JSON.stringify(answers)}::jsonb,
        ${primaryConcern},
        ${secondaryConcern || null},
        ${desiredOutcome},
        ${confidence},
        ${assignedPathwayId},
        ${JSON.stringify(scores)}::jsonb,
        ${JSON.stringify(metadata)}::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    return inserted[0];
  },

  async getLatestFocusAssessment(userId: string) {
    await ensureFocusAssessmentTable();

    const rows = await sql`
      SELECT * FROM personalization_assessments
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    return rows[0] || null;
  }
};
