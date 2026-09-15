import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useToast, Button } from '../index';
import { isValidEmail } from '../../mantra/validation';

export default function SalesPartnerApplicationForm({ 
  onSuccess,
  title = "Sales Partner Application",
  description = "Fill out the form below to apply.",
  successTitle = "Application Submitted Successfully",
  successMessage = "Our Business Development team will review your details and contact you.",
  buttonText = "Submit Application",
  successButtonText = "Mark Lesson as Complete"
}) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = () => {
    if (!email) return true;
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'warning');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      showToast(successTitle, 'success');
    }, 1200);
  };

  return (
    <div style={{
      background: '#ffffff', borderRadius: '24px', padding: '40px',
      border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
    }}>
      {!isSuccess ? (
        <>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 8px', color: '#0f172a' }}>{title}</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>{description}</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="academy-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Full Name</label>
                <input type="text" required placeholder="Your Full Name" style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))} onBlur={validateEmail} placeholder="Email Address" style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Do you know organizations that may benefit?</label>
              <select required style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', cursor: 'pointer' }}>
                <option value="">Select an option...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Why would you like to join?</label>
              <textarea 
                required 
                placeholder="Tell us a little bit about your network and why you're interested..." 
                rows={4}
                style={{ 
                  padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', 
                  outline: 'none', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a',
                  resize: 'vertical'
                }} 
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSubmitting}
              style={{ marginTop: '8px', padding: '16px', fontSize: '1.05rem', width: '100%', justifyContent: 'center' }}
            >
              {isSubmitting ? 'Submitting...' : buttonText}
            </Button>
          </form>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }} className="animate-scale-in">
          <div style={{ width: '64px', height: '64px', background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            {successTitle}
          </h3>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: '0 auto 32px', maxWidth: '400px', lineHeight: '1.6' }}>
            {successMessage}
          </p>
          <Button variant="primary" onClick={onSuccess} style={{ padding: '16px 40px', fontSize: '1.05rem' }}>
            {successButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}
