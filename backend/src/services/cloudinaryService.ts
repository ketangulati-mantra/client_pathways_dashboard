import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { config } from '../config/index.js';

// Configure Cloudinary SDK securely from backend environment variables
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  originalFilename: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export const cloudinaryService = {
  /**
   * Reusable service method to upload file buffer streams to Cloudinary
   */
  async uploadFileBuffer(
    fileBuffer: Buffer,
    originalFilename: string,
    folder: string = 'provider_pathways'
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error('❌ Cloudinary Upload Error:', error);
            return reject(error || new Error('Cloudinary upload returned undefined result'));
          }

          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            originalFilename,
            format: result.format || result.resource_type,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  },
};
