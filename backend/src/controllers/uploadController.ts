import { Request, Response, NextFunction } from 'express';
import { cloudinaryService } from '../services/cloudinaryService.js';

export const uploadController = {
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded. Please attach a file field named "file".',
        });
      }

      const folder = (req.body.folder as string) || 'provider_pathways';
      const originalFilename = req.file.originalname || 'uploaded_file';

      const result = await cloudinaryService.uploadFileBuffer(
        req.file.buffer,
        originalFilename,
        folder
      );

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully to Cloudinary',
        data: result,
      });
    } catch (error) {
      console.error('❌ Upload Controller Error:', error);
      next(error);
    }
  },
};
