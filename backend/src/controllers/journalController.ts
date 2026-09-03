import { Request, Response } from 'express';
import { sql } from '../db/client.js';

export async function createJournalEntry(req: Request, res: Response) {
  try {
    const {
      userId,
      title,
      content,
      entryType = 'free_write',
      emotion,
      emotionZone,
      intensity,
      checkInId,
      checkInDate,
      metadata = {}
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Journal content is required and cannot be empty' });
    }

    // Generate fallback title if not provided
    let finalTitle = (title || '').trim();
    if (!finalTitle) {
      const firstLine = content.trim().split('\n')[0];
      if (firstLine && firstLine.length > 0) {
        finalTitle = firstLine.length > 40 ? `${firstLine.substring(0, 37)}...` : firstLine;
      } else {
        finalTitle = 'Untitled Reflection';
      }
    }

    const trimmedContent = content.trim();

    // Safely parse numeric checkInId or store string UID in metadata
    let safeCheckInId: number | null = null;
    const safeMetadata = { ...(metadata || {}) };

    if (checkInId !== undefined && checkInId !== null && checkInId !== '') {
      const num = Number(checkInId);
      if (!isNaN(num) && Number.isInteger(num)) {
        safeCheckInId = num;
      } else {
        safeMetadata.check_in_uid = String(checkInId);
      }
    }

    let safeIntensity: number | null = null;
    if (intensity !== undefined && intensity !== null && intensity !== '') {
      const num = Number(intensity);
      if (!isNaN(num)) {
        safeIntensity = Math.round(num);
      }
    }

    // Concurrency / double-click deduplication check:
    // If an identical entry for this user was created in the last 4 seconds, return that entry
    const recentDuplicates = await sql`
      SELECT * FROM journal_entries
      WHERE user_id = ${userId}
        AND entry_type = ${entryType}
        AND title = ${finalTitle}
        AND content = ${trimmedContent}
        AND created_at > (CURRENT_TIMESTAMP - INTERVAL '4 seconds')
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (recentDuplicates && recentDuplicates.length > 0) {
      console.log(`[createJournalEntry] Deduplicated concurrent duplicate request for user ${userId}`);
      return res.status(200).json({
        success: true,
        entry: recentDuplicates[0],
        deduplicated: true
      });
    }

    const result = await sql`
      INSERT INTO journal_entries (
        user_id,
        title,
        content,
        entry_type,
        emotion,
        emotion_zone,
        intensity,
        check_in_id,
        check_in_date,
        metadata
      ) VALUES (
        ${userId},
        ${finalTitle},
        ${trimmedContent},
        ${entryType},
        ${emotion || null},
        ${emotionZone || null},
        ${safeIntensity},
        ${safeCheckInId},
        ${checkInDate || new Date().toISOString().split('T')[0]},
        ${JSON.stringify(safeMetadata)}::jsonb
      )
      RETURNING *;
    `;

    return res.status(201).json({
      success: true,
      entry: result[0]
    });
  } catch (err: any) {
    console.error('[createJournalEntry] Error saving journal entry:', err);
    return res.status(500).json({ error: err?.message || 'Failed to create journal entry', details: err });
  }
}

export async function getUserJournalEntries(req: Request, res: Response) {
  try {
    const userId = (req.query.userId || req.params.userId) as string;
    const limit = parseInt((req.query.limit as string) || '20', 10);

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const entries = await sql`
      SELECT *
      FROM journal_entries
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC, created_at DESC
      LIMIT ${limit};
    `;

    return res.json({
      success: true,
      entries
    });
  } catch (err: any) {
    console.error('[getUserJournalEntries] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch journal entries', details: err.message });
  }
}

export async function searchJournalEntries(req: Request, res: Response) {
  try {
    const userId = (req.query.userId || req.params.userId) as string;
    const query = ((req.query.query || '') as string).trim();
    const entryType = (req.query.entryType as string) || '';
    const limit = parseInt((req.query.limit as string) || '30', 10);

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!query) {
      return res.json({ success: true, entries: [] });
    }

    const searchPattern = `%${query}%`;

    let entries;
    if (entryType && entryType !== 'all') {
      entries = await sql`
        SELECT *
        FROM journal_entries
        WHERE user_id = ${userId}
          AND entry_type = ${entryType}
          AND (
            title ILIKE ${searchPattern}
            OR content ILIKE ${searchPattern}
            OR COALESCE(emotion, '') ILIKE ${searchPattern}
            OR COALESCE(metadata->>'prompt', '') ILIKE ${searchPattern}
          )
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
    } else {
      entries = await sql`
        SELECT *
        FROM journal_entries
        WHERE user_id = ${userId}
          AND (
            title ILIKE ${searchPattern}
            OR content ILIKE ${searchPattern}
            OR COALESCE(emotion, '') ILIKE ${searchPattern}
            OR COALESCE(metadata->>'prompt', '') ILIKE ${searchPattern}
          )
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
    }

    return res.json({
      success: true,
      entries
    });
  } catch (err: any) {
    console.error('[searchJournalEntries] Error:', err);
    return res.status(500).json({ error: 'Failed to search journal entries', details: err.message });
  }
}

export async function getJournalEntryById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;

    const query = userId
      ? sql`SELECT * FROM journal_entries WHERE id = ${id} AND user_id = ${userId} LIMIT 1;`
      : sql`SELECT * FROM journal_entries WHERE id = ${id} LIMIT 1;`;

    const result = await query;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    return res.json({
      success: true,
      entry: result[0]
    });
  } catch (err: any) {
    console.error('[getJournalEntryById] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch journal entry', details: err.message });
  }
}

export async function updateJournalEntry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId, title, content, metadata } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Journal content cannot be empty' });
    }

    let finalTitle = (title || '').trim();
    if (!finalTitle) {
      const firstLine = content.trim().split('\n')[0];
      if (firstLine && firstLine.length > 0) {
        finalTitle = firstLine.length > 40 ? `${firstLine.substring(0, 37)}...` : firstLine;
      } else {
        finalTitle = 'Untitled Reflection';
      }
    }

    const trimmedContent = content.trim();

    const query = userId
      ? sql`
          UPDATE journal_entries
          SET 
            title = ${finalTitle},
            content = ${trimmedContent},
            metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}::jsonb, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *;
        `
      : sql`
          UPDATE journal_entries
          SET 
            title = ${finalTitle},
            content = ${trimmedContent},
            metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}::jsonb, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *;
        `;

    const result = await query;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }

    return res.json({
      success: true,
      entry: result[0]
    });
  } catch (err: any) {
    console.error('[updateJournalEntry] Error:', err);
    return res.status(500).json({ error: 'Failed to update journal entry', details: err.message });
  }
}

export async function deleteJournalEntry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body.userId;

    const query = userId
      ? sql`DELETE FROM journal_entries WHERE id = ${id} AND user_id = ${userId} RETURNING id;`
      : sql`DELETE FROM journal_entries WHERE id = ${id} RETURNING id;`;

    const result = await query;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found or already removed' });
    }

    return res.json({
      success: true,
      message: 'Reflection deleted successfully',
      deletedId: id
    });
  } catch (err: any) {
    console.error('[deleteJournalEntry] Error:', err);
    return res.status(500).json({ error: 'Failed to delete journal entry', details: err.message });
  }
}

export async function getJournalEcosystemData(req: Request, res: Response) {
  try {
    const userId = (req.query.userId || req.params.userId) as string;
    const limit = parseInt((req.query.limit as string) || '100', 10);

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const [journals, checkIns] = await Promise.all([
      sql`
        SELECT *
        FROM journal_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit};
      `,
      sql`
        SELECT id, user_id, activity_id, activity_type, primary_emotion, emotion_zone, intensity, contexts, created_at, metadata
        FROM user_activities
        WHERE user_id = ${userId}
          AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
        ORDER BY created_at DESC
        LIMIT ${limit};
      `
    ]);

    return res.json({
      success: true,
      journals: journals || [],
      checkIns: checkIns || []
    });
  } catch (err: any) {
    console.error('[getJournalEcosystemData] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch journal ecosystem data', details: err.message });
  }
}

