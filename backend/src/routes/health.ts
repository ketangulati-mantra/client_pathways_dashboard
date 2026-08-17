import { Router } from 'express';
import { sql } from '../db/client.js';

const router = Router();

// Basic server health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
  });
});

// Database read connection health check
router.get('/health/db', async (req, res) => {
  try {
    const result = await sql`SELECT NOW() AS current_time`;

    res.status(200).json({
      success: true,
      message: 'Database connected successfully',
      databaseTime: result[0].current_time,
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);

    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Database write permission test
router.post('/health/db-write', async (req, res) => {
  try {
    const testUserId = `test-user-${Date.now()}`;
    const result = await sql`
      INSERT INTO lesson_completions (user_id, service, lesson_id, reward_points)
      VALUES (${testUserId}, 'health_check', 'db_write_test', 0)
      RETURNING *;
    `;

    res.status(200).json({
      success: true,
      message: 'Database write test passed successfully',
      insertedRow: result[0],
    });
  } catch (error) {
    console.error('❌ Database write test error:', error);

    res.status(500).json({
      success: false,
      message: 'Database write test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;