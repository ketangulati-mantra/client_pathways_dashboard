import { sql } from '../db/client.js';

export async function setupDb() {
  console.log('⚡ Running Neon DB migrations/schema setup...');

  try {
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = CURRENT_TIMESTAMP;
         RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        service VARCHAR(50),
        promotion_toolkit_data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS promotion_toolkit_data JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS allowed_pages JSONB DEFAULT '["submissions", "corporate_admin", "campus_admin", "lessons"]'::jsonb;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lesson_completions (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        service VARCHAR(50) NOT NULL,
        lesson_id VARCHAR(100) NOT NULL,
        reward_points INT DEFAULT 0,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        lesson_id VARCHAR(100) NOT NULL,
        progress_percent INT DEFAULT 0,
        video_watched BOOLEAN DEFAULT FALSE,
        quiz_done BOOLEAN DEFAULT FALSE,
        checklist_done BOOLEAN DEFAULT FALSE,
        scenario_attempted BOOLEAN DEFAULT FALSE,
        action_done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_progress UNIQUE (user_id, lesson_id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS campus_ambassador_applications (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        college_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'interested',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS certificate_logs (
        id BIGSERIAL PRIMARY KEY,
        certificate_id VARCHAR(100) UNIQUE NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        pathway_name VARCHAR(255) NOT NULL,
        certificate_url TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS activity_submissions (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        service VARCHAR(50),
        lesson_id VARCHAR(100) NOT NULL,
        activity_title VARCHAR(255) NOT NULL,
        submission_type VARCHAR(100) NOT NULL,
        form_data JSONB DEFAULT '{}'::jsonb,
        submission_data JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'pending',
        reviewed_by VARCHAR(255) DEFAULT 'Unassigned',
        review_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      ALTER TABLE activity_submissions 
      ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255) DEFAULT 'Unassigned';
    `;

    await sql`
      ALTER TABLE activity_submissions 
      DROP CONSTRAINT IF EXISTS activity_submissions_status_check;
    `;

    // 8. Ambassador Profiles Table
    await sql`
      CREATE TABLE IF NOT EXISTS ambassador_profiles (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        current_stage VARCHAR(50) DEFAULT 'NOT_JOINED',
        current_step INT DEFAULT 0,
        approval_status VARCHAR(50) DEFAULT 'none',
        credits INT DEFAULT 0,
        level INT DEFAULT 1,
        referral_code VARCHAR(50) UNIQUE,
        college_name VARCHAR(255),
        joined_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 9. Program Learning Progress Table
    await sql`
      CREATE TABLE IF NOT EXISTS program_learning_progress (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        program_id VARCHAR(100) DEFAULT 'campus_awareness',
        module_id VARCHAR(100) NOT NULL,
        completion_status VARCHAR(50) DEFAULT 'in_progress',
        completed_at TIMESTAMP WITH TIME ZONE,
        quiz_data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_program_module UNIQUE (user_id, program_id, module_id)
      );
    `;

    // 10. Credit Ledger Table
    await sql`
      CREATE TABLE IF NOT EXISTS credit_ledger (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        program_id VARCHAR(100) DEFAULT 'campus_awareness',
        amount INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        reference_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 11. Program Missions Table
    await sql`
      CREATE TABLE IF NOT EXISTS program_missions (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        program_id VARCHAR(100) DEFAULT 'campus_awareness',
        mission_key VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'assigned',
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        proof_data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_program_mission UNIQUE (user_id, program_id, mission_key)
      );
    `;

    // 12. Program Notifications Table
    await sql`
      CREATE TABLE IF NOT EXISTS program_notifications (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 13. Program Certificates Table
    await sql`
      CREATE TABLE IF NOT EXISTS program_certificates (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        program_id VARCHAR(100) DEFAULT 'campus_awareness',
        certificate_code VARCHAR(100) UNIQUE NOT NULL,
        certificate_url TEXT,
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 14. Campus Program Applications Table
    await sql`
      CREATE TABLE IF NOT EXISTS campus_program_applications (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        program_id VARCHAR(100) DEFAULT 'campus_awareness',
        full_name VARCHAR(255),
        email VARCHAR(255),
        country_code VARCHAR(20) DEFAULT '+1',
        phone VARCHAR(50),
        college VARCHAR(255) NOT NULL,
        course VARCHAR(255) NOT NULL,
        year VARCHAR(50) NOT NULL,
        city VARCHAR(255) NOT NULL,
        motivation TEXT NOT NULL,
        availability VARCHAR(100) NOT NULL,
        linkedin_url TEXT,
        instagram_url TEXT,
        previous_experience TEXT,
        terms_accepted BOOLEAN DEFAULT TRUE,
        community_guidelines_accepted BOOLEAN DEFAULT TRUE,
        application_status VARCHAR(50) DEFAULT 'submitted',
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by VARCHAR(255),
        admin_notes TEXT,
        CONSTRAINT unique_user_program_app UNIQUE (user_id, program_id)
      );
    `;

    // Ensure country_code column exists if table was previously created
    await sql`
      ALTER TABLE campus_program_applications 
      ADD COLUMN IF NOT EXISTS country_code VARCHAR(20) DEFAULT '+1';
    `;

    // 15. Corporate Growth Partner Applications Table
    await sql`
      CREATE TABLE IF NOT EXISTS corporate_partner_applications (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255),
        country_code VARCHAR(20) DEFAULT '+1',
        phone VARCHAR(50),
        city VARCHAR(255) NOT NULL,
        company_connections TEXT,
        industries TEXT,
        linkedin_url TEXT,
        previous_experience TEXT,
        motivation TEXT NOT NULL,
        availability VARCHAR(100) NOT NULL,
        terms_accepted BOOLEAN DEFAULT TRUE,
        application_status VARCHAR(50) DEFAULT 'submitted',
        review_status VARCHAR(50) DEFAULT 'pending',
        version INT DEFAULT 1,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by VARCHAR(255) DEFAULT 'Unassigned',
        admin_notes TEXT,
        audit_history JSONB DEFAULT '[]'::jsonb,
        CONSTRAINT unique_user_corporate_app UNIQUE (user_id)
      );
    `;

    // 16. Corporate Learning Progress Table
    await sql`
      CREATE TABLE IF NOT EXISTS corporate_learning_progress (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        program_id VARCHAR(100) DEFAULT 'corporate_growth_partner',
        current_module_id VARCHAR(100) DEFAULT 'corp_mod_1',
        completed_module_ids JSONB DEFAULT '[]'::jsonb,
        progress_percent INT DEFAULT 0,
        time_spent_seconds INT DEFAULT 0,
        last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_corporate_learning UNIQUE (user_id, program_id)
      );
    `;

    // 17. Admins Table for Secure Admin Authentication with PostgreSQL ENUM
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_type') THEN 
          CREATE TYPE admin_role_type AS ENUM ('admin', 'super_admin'); 
        END IF; 
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role admin_role_type DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Migration helper: If role column is currently VARCHAR, convert it safely to ENUM type
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'admins' AND column_name = 'role' AND data_type LIKE '%char%'
        ) THEN
          UPDATE admins SET role = 'super_admin' WHERE role IN ('Super Admin', 'super_admin');
          UPDATE admins SET role = 'admin' WHERE role NOT IN ('super_admin') OR role IS NULL;

          ALTER TABLE admins ALTER COLUMN role DROP DEFAULT;
          ALTER TABLE admins ALTER COLUMN role TYPE admin_role_type USING role::admin_role_type;
          ALTER TABLE admins ALTER COLUMN role SET DEFAULT 'admin'::admin_role_type;
        ELSE
          UPDATE admins SET role = 'super_admin'::admin_role_type WHERE role::text IN ('Super Admin', 'super_admin');
          UPDATE admins SET role = 'admin'::admin_role_type WHERE role::text NOT IN ('super_admin') OR role IS NULL;
        END IF;
      END $$;
    `;

    // Seed default Super Admin if no admins exist
    const existingAdmins = await sql`SELECT id FROM admins LIMIT 1`;
    if (existingAdmins.length === 0) {
      await sql`
        INSERT INTO admins (name, email, password_hash, role, is_active)
        VALUES ('Super Admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin'::admin_role_type, TRUE)
        ON CONFLICT (email) DO NOTHING;
      `;
      console.log('🔑 Default Super Admin seeded: admin@example.com / Admin@123');
    }

    console.log('✅ Neon DB migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up DB tables:', error);
    throw error;
  }
}
