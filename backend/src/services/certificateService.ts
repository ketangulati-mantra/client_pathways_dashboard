import { sql } from '../db/client.js';
import crypto from 'crypto';

export interface GenerateCertificateInput {
  userId: string;
  userName: string;
  pathwayName: string;
  service?: string;
  certificateUrl?: string;
  metadata?: Record<string, any>;
}

export const certificateService = {
  /**
   * Generates a certificate record and stores metadata in certificate_logs table in Neon DB.
   */
  async generateCertificate(input: GenerateCertificateInput) {
    const { userId, userName, pathwayName, service, certificateUrl, metadata = {} } = input;

    // Generate unique, collision-resistant certificate ID
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const certificateId = `CERT-2026-${randomCode}`;

    const defaultUrl = certificateUrl || `/api/certificates/${certificateId}/download`;
    const jsonMetadata = typeof metadata === 'string' ? metadata : JSON.stringify({
      service: service || 'general',
      issuedTimestamp: new Date().toISOString(),
      ...metadata,
    });

    const rows = await sql`
      INSERT INTO certificate_logs (
        certificate_id,
        user_id,
        user_name,
        pathway_name,
        certificate_url,
        metadata,
        issued_at,
        created_at,
        updated_at
      )
      VALUES (
        ${certificateId},
        ${userId},
        ${userName},
        ${pathwayName},
        ${defaultUrl},
        ${jsonMetadata}::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    return rows[0];
  },

  /**
   * Checks if user is eligible for a certificate based on lesson_completions or explicit request,
   * then generates and logs certificate if eligible.
   */
  async checkEligibilityAndGenerate(input: {
    userId: string;
    userName: string;
    pathwayName: string;
    service?: string;
    force?: boolean;
  }) {
    const { userId, userName, pathwayName, service = 'general', force = false } = input;

    // Query user's lesson completions count in Neon DB
    const completions = await sql`
      SELECT COUNT(*) as count FROM lesson_completions
      WHERE user_id = ${userId};
    `;

    const completedCount = Number(completions[0]?.count || 0);

    // If user has completions or force=true, mark eligible
    if (completedCount > 0 || force) {
      // Check if certificate was already issued
      const existing = await sql`
        SELECT * FROM certificate_logs
        WHERE user_id = ${userId} AND pathway_name = ${pathwayName};
      `;

      if (existing.length > 0) {
        return {
          eligible: true,
          alreadyIssued: true,
          certificate: existing[0],
        };
      }

      const certificate = await this.generateCertificate({
        userId,
        userName,
        pathwayName,
        service,
        metadata: {
          completionsCount: completedCount,
          issuedAt: new Date().toISOString(),
        },
      });

      return {
        eligible: true,
        alreadyIssued: false,
        certificate,
      };
    }

    return {
      eligible: false,
      alreadyIssued: false,
      message: 'Pathway requirements not yet completed. Complete all required lessons to earn your certificate.',
      completedCount,
    };
  },

  async getCertificateById(certificateId: string) {
    const rows = await sql`
      SELECT * FROM certificate_logs
      WHERE certificate_id = ${certificateId} OR id::text = ${certificateId};
    `;
    return rows[0] || null;
  },

  async getCertificatesByUser(userId: string) {
    return await sql`
      SELECT * FROM certificate_logs
      WHERE user_id = ${userId}
      ORDER BY issued_at DESC;
    `;
  },
};
