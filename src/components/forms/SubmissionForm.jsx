import React, { useState, useRef } from 'react';
import { Upload, X, ShieldCheck, CheckCircle2, User, Mail, Phone, FileText } from 'lucide-react';
import { useToast, Button } from '../index';
import { useActivitySubmission } from '../../hooks/useActivitySubmission';
import { isValidEmail, isValidPhoneNumber } from '../../mantra/validation';
import { getCurrentUserId } from '../../mantra';
import PhoneInputWithCountry from './PhoneInputWithCountry';

export default function SubmissionForm({
  onSuccess,
  lessonId = "profile-verification",
  activityTitle = "Verify Your Profile",
  submissionType = "profile_verification",
  title = "Submit Your Proof",
  proofInstruction,
  successTitle = "Submission received successfully.",
  successMessage = "Our team will review your proof shortly.",
  buttonText = "Submit Proof",
  successButtonText = "Mark Lesson as Complete",
  isCompleted: isCompletedProp
}) {
  // Check if activity is already completed in localStorage if prop is omitted
  const isAlreadyCompleted = isCompletedProp !== undefined
    ? isCompletedProp
    : (() => {
      try {
        const userId = getCurrentUserId();
        const saved = localStorage.getItem(`lesson_progress_${userId}_${lessonId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return !!parsed.celebrationShown || !!parsed.actionDone;
        }
      } catch (e) { }
      return false;
    })();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { submit, isSubmitting, isSuccess, reset } = useActivitySubmission({
    lessonId,
    activityTitle,
    submissionType,
    successTitle,
    successMessage,
    onSuccess
  });

  const [showFormAnyway, setShowFormAnyway] = useState(false);
  const isCompletedView = (isSuccess || isAlreadyCompleted) && !showFormAnyway;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if ((validTypes.includes(selectedFile.type) || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) && selectedFile.size <= 20 * 1024 * 1024) {
      setFile(selectedFile);
      reset();
    } else {
      showToast("Please upload a valid PNG, JPG, or WEBP image under 20MB.", "warning");
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email && !isValidEmail(email)) {
      setEmailError('Please enter a valid, active email address.');
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (phone && !isValidPhoneNumber(phone, countryCode)) {
      setPhoneError('Invalid phone number for the selected country.');
      showToast('Please enter a valid phone number.', 'warning');
      return;
    }

    if (!file) {
      showToast("Please upload an image screenshot proof before submitting.", "warning");
      return;
    }

    const fullPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : '';

    await submit({
      file,
      formData: {
        fullName: fullName.trim() || 'Provider',
        email: email.trim(),
        phone: fullPhone,
        countryCode: countryCode,
        rawPhone: phone.trim(),
        submittedAt: new Date().toISOString()
      }
    });
  };

  const handleCompleteClick = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      {!isCompletedView && (
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>
          {title}
        </h3>
      )}

      {!isCompletedView ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}>
                <User size={14} color="#0284c7" /> Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}>
                <Mail size={14} color="#0284c7" /> Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your active email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: emailError ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
              {emailError && (
                <div style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '4px', textAlign: 'left', fontWeight: 600 }}>
                  {emailError}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}>
                <Phone size={14} color="#0284c7" /> Phone Number
              </label>
              <PhoneInputWithCountry
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                phoneNumber={phone}
                setPhoneNumber={(val) => {
                  setPhone(val);
                  if (phoneError) setPhoneError('');
                }}
                error={phoneError}
              />
              {phoneError && (
                <div style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '4px', textAlign: 'left', fontWeight: 600 }}>
                  {phoneError}
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} color="#0284c7" /> Upload Proof Screenshot (Image only, PDFs not allowed)
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              style={{
                border: isDragging ? '2px dashed #0284c7' : '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '24px 16px',
                background: isDragging ? '#f0f9ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '110px'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={18} color="#0284c7" />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Click to upload</span> or drag & drop PNG, JPG, WEBP (PDFs not allowed, Max 20MB)
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', flex: 1 }}>
                    <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#065f46', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </span>
                  </div>
                  <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !file}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: (isSubmitting || !file) ? '#cbd5e1' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: (isSubmitting || !file) ? 'not-allowed' : 'pointer',
              boxShadow: (isSubmitting || !file) ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease',
              marginTop: '4px'
            }}
          >
            {isSubmitting ? 'Uploading & Submitting...' : buttonText}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#d1fae5', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} color="#059669" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px', color: '#065f46' }}>
            {isAlreadyCompleted && !isSuccess ? "Activity Already Completed" : successTitle}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#047857', marginBottom: '20px' }}>
            {isAlreadyCompleted && !isSuccess ? "You have already completed this activity. Your proof has been submitted and verified." : successMessage}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={handleCompleteClick} style={{ padding: '10px 24px', fontSize: '0.88rem', background: '#059669' }}>
              {successButtonText}
            </Button>
            {isAlreadyCompleted && !showFormAnyway && (
              <button
                type="button"
                onClick={() => setShowFormAnyway(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid #059669',
                  color: '#059669',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Re-submit Proof
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
