import { useState } from 'react';
import { useToast } from '../components';
import { submitActivitySubmission, uploadFileToCloudinary } from '../mantra/api';

/**
 * Reusable React Hook for handling generic activity form submissions.
 * Manages validation, loading state, Cloudinary uploads, backend API persistence,
 * toast notifications, and lesson completion integration.
 */
export function useActivitySubmission({
  lessonId,
  activityTitle,
  submissionType = 'activity_form',
  onSuccess,
  successTitle = 'Submission received successfully.',
  successMessage = 'Our team will review your submission shortly.',
} = {}) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cachedUpload, setCachedUpload] = useState(null);

  const submit = async ({ formData = {}, file = null } = {}) => {
    setIsSubmitting(true);

    let uploadData = cachedUpload;

    // 1. Upload file to Cloudinary if file is attached and not already cached
    if (file && !uploadData) {
      const uploadRes = await uploadFileToCloudinary(file);

      if (!uploadRes.success || !uploadRes.data) {
        setIsSubmitting(false);
        showToast(
          uploadRes.error || 'Failed to upload file to Cloudinary. Please try again.',
          'error'
        );
        return { success: false, error: uploadRes.error };
      }

      uploadData = uploadRes.data;
      setCachedUpload(uploadData);
    }

    // 2. Prepare payload merging form fields and Cloudinary upload data
    const finalFormData = {
      ...formData,
      ...(uploadData
        ? {
            screenshotUrl: uploadData.secure_url,
            publicId: uploadData.public_id,
            fileName: uploadData.originalFilename || file?.name,
            fileSize: uploadData.bytes || file?.size,
            fileType: uploadData.format || file?.type,
            uploadedAt: new Date().toISOString(),
          }
        : {}),
    };

    // 3. Post to backend API
    const response = await submitActivitySubmission({
      lessonId: lessonId || 'generic-activity',
      activityTitle: activityTitle || 'Activity Submission',
      submissionType: submissionType || 'activity_form',
      formData: finalFormData,
    });

    setIsSubmitting(false);

    if (response.success) {
      setIsSuccess(true);
      showToast(successTitle, 'success');
      return { success: true, data: response.data };
    } else {
      showToast(
        response.error || 'Failed to submit form. Please try again.',
        'error'
      );
      return { success: false, error: response.error };
    }
  };

  const reset = () => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setCachedUpload(null);
  };

  return {
    submit,
    isSubmitting,
    isSuccess,
    cachedUpload,
    reset,
  };
}
