import { Request, Response, NextFunction } from 'express';
import { certificateService } from '../services/certificateService.js';

export const certificateController = {
  async generateCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        userId,
        user_id,
        userName,
        user_name,
        name,
        pathwayName,
        pathway_name,
        service,
        certificateUrl,
        certificate_url,
        metadata,
      } = req.body;

      const finalUserId = String(userId || user_id || '').trim();
      const finalUserName = String(userName || user_name || name || '').trim();
      const finalPathwayName = String(pathwayName || pathway_name || '').trim();

      const missingFields: string[] = [];
      if (!finalUserId) missingFields.push('userId');
      if (!finalUserName) missingFields.push('userName');
      if (!finalPathwayName) missingFields.push('pathwayName');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required field(s): ${missingFields.join(', ')}`,
        });
      }

      const certificate = await certificateService.generateCertificate({
        userId: finalUserId,
        userName: finalUserName,
        pathwayName: finalPathwayName,
        service,
        certificateUrl: certificateUrl || certificate_url,
        metadata,
      });

      return res.status(201).json({
        success: true,
        message: 'Certificate generated and metadata logged successfully',
        data: certificate,
      });
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      next(error);
    }
  },

  async checkEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        userId,
        user_id,
        userName,
        user_name,
        name,
        pathwayName,
        pathway_name,
        service,
        force,
      } = req.body;

      const finalUserId = String(userId || user_id || '').trim();
      const finalUserName = String(userName || user_name || name || 'Provider').trim();
      const finalPathwayName = String(pathwayName || pathway_name || 'Provider Pathway Certification').trim();

      if (!finalUserId) {
        return res.status(400).json({
          success: false,
          error: 'userId parameter is required',
        });
      }

      const result = await certificateService.checkEligibilityAndGenerate({
        userId: finalUserId,
        userName: finalUserName,
        pathwayName: finalPathwayName,
        service,
        force: Boolean(force),
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('❌ Error checking certificate eligibility:', error);
      next(error);
    }
  },

  async getCertificateById(req: Request, res: Response, next: NextFunction) {
    try {
      const { certificateId } = req.params;
      if (!certificateId) {
        return res.status(400).json({
          success: false,
          error: 'certificateId parameter is required',
        });
      }

      const certificate = await certificateService.getCertificateById(certificateId);
      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: `Certificate '${certificateId}' not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: certificate,
      });
    } catch (error) {
      console.error('❌ Error getting certificate:', error);
      next(error);
    }
  },

  async getCertificatesByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId parameter is required',
        });
      }

      const certificates = await certificateService.getCertificatesByUser(userId);
      return res.status(200).json({
        success: true,
        data: certificates,
      });
    } catch (error) {
      console.error('❌ Error getting certificates for user:', error);
      next(error);
    }
  },

  async downloadCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { certificateId } = req.params;
      if (!certificateId) {
        return res.status(400).json({
          success: false,
          error: 'certificateId parameter is required',
        });
      }

      const certificate = await certificateService.getCertificateById(certificateId);
      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: `Certificate '${certificateId}' not found for download`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Certificate ready for download',
        downloadUrl: certificate.certificate_url,
        data: certificate,
      });
    } catch (error) {
      console.error('❌ Error downloading certificate:', error);
      next(error);
    }
  },
};
