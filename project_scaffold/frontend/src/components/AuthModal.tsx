import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Role, api } from '../services/api';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight, AlertCircle, Key, Loader2, Award, Briefcase } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Basic Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<Role>('USER');
  const [age, setAge] = useState<string>('');
  const [country, setCountry] = useState<string>('');

  // Professional Fields State
  const [professionalTitle, setProfessionalTitle] = useState<string>('');
  const [qualifications, setQualifications] = useState<string>('');
  const [certifications, setCertifications] = useState<string>('');
  const [yearsExperience, setYearsExperience] = useState<string>('');
  const [areaOfExpertise, setAreaOfExpertise] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');

  // Forgot Password State
  const [forgotSubmitted, setForgotSubmitted] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === 'REGISTER' && !name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (authMode !== 'FORGOT' && password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'REGISTER') {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          age: age ? parseInt(age, 10) : undefined,
          country: country.trim() || undefined,
          professional_title: professionalTitle.trim() || undefined,
          qualifications: qualifications.trim() || undefined,
          certifications: certifications.trim() || undefined,
          years_experience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
          area_of_expertise: areaOfExpertise.trim() || undefined,
          organization: organization.trim() || undefined,
          registration_number: registrationNumber.trim() || undefined,
        });

        if (role === 'SKINCARE_CONSULTANT' || role === 'DERMATOLOGIST') {
          showSuccess(`✓ Registration submitted! Account pending Administrator verification.`);
        } else {
          showSuccess(`✓ Welcome to AuraSkin, ${name.trim()}!`);
        }
        window.location.hash = 'dashboard';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onClose();
      } else if (authMode === 'LOGIN') {
        await login(email.trim(), password);
        window.location.hash = 'dashboard';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showSuccess('✓ Successfully signed in.');
        onClose();
      } else if (authMode === 'FORGOT') {
        const res = await api.forgotPassword(email.trim());
        setForgotSubmitted(true);
        showSuccess(res.message);
      }
    } catch (err: any) {
      const msg = err.message || 'An error occurred during authentication';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            color: 'var(--text-muted)',
            padding: '0.25rem'
          }}
        >
          <X size={20} />
        </button>

        {/* Header Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-subtle)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('LOGIN'); setError(null); }}
            style={{
              fontSize: '1.05rem',
              fontWeight: authMode === 'LOGIN' ? 700 : 500,
              color: authMode === 'LOGIN' ? 'var(--color-primary)' : 'var(--text-muted)',
              background: 'none',
              borderBottom: authMode === 'LOGIN' ? '2px solid var(--color-primary)' : 'none',
              paddingBottom: '0.5rem',
              marginBottom: '-0.6rem'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('REGISTER'); setError(null); }}
            style={{
              fontSize: '1.05rem',
              fontWeight: authMode === 'REGISTER' ? 700 : 500,
              color: authMode === 'REGISTER' ? 'var(--color-primary)' : 'var(--text-muted)',
              background: 'none',
              borderBottom: authMode === 'REGISTER' ? '2px solid var(--color-primary)' : 'none',
              paddingBottom: '0.5rem',
              marginBottom: '-0.6rem'
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('FORGOT'); setError(null); }}
            style={{
              fontSize: '0.95rem',
              fontWeight: authMode === 'FORGOT' ? 700 : 500,
              color: authMode === 'FORGOT' ? 'var(--color-primary)' : 'var(--text-muted)',
              background: 'none',
              borderBottom: authMode === 'FORGOT' ? '2px solid var(--color-primary)' : 'none',
              paddingBottom: '0.5rem',
              marginBottom: '-0.6rem'
            }}
          >
            Forgot Password?
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="field-error-alert" role="alert" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {authMode === 'REGISTER' && (
            <>
              <div>
                <label htmlFor="auth-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Full Name <span className="text-rose">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-subtle)' }} />
                </div>
              </div>

              <div>
                <label htmlFor="auth-role" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  How will you use Skin Intelligence? <span className="text-rose">*</span>
                </label>
                <select
                  id="auth-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  style={{ background: 'var(--bg-input)' }}
                >
                  <option value="USER">1. Client / Individual User</option>
                  <option value="SKINCARE_CONSULTANT">2. Skincare Consultant</option>
                  <option value="DERMATOLOGIST">3. Dermatologist (Medical Professional)</option>
                </select>
              </div>
            </>
          )}

          {authMode !== 'FORGOT' && (
            <div>
              <label htmlFor="auth-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Email Address <span className="text-rose">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-subtle)' }} />
              </div>
            </div>
          )}

          {authMode !== 'FORGOT' && (
            <div>
              <label htmlFor="auth-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Password (min. 8 chars) <span className="text-rose">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-subtle)' }} />
              </div>
            </div>
          )}

          {/* Professional Intake Fields */}
          {authMode === 'REGISTER' && (role === 'SKINCARE_CONSULTANT' || role === 'DERMATOLOGIST') && (
            <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                <Briefcase size={16} />
                <span>Professional Credentials Intake</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>Professional Title / Specialization</label>
                <input type="text" placeholder={role === 'DERMATOLOGIST' ? 'e.g. Board Certified Dermatologist' : 'e.g. Certified Aesthetician'} value={professionalTitle} onChange={e => setProfessionalTitle(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>Qualifications</label>
                  <input type="text" placeholder="e.g. MD / MBBS / BS" value={qualifications} onChange={e => setQualifications(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>Years Practice</label>
                  <input type="number" placeholder="e.g. 8" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>Registration / License Number</label>
                <input type="text" placeholder="e.g. MED-REG-109283" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>Clinic / Organization</label>
                <input type="text" placeholder="e.g. City Dermatology Clinic" value={organization} onChange={e => setOrganization(e.target.value)} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#b45309', background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                <ShieldCheck size={14} />
                <span>Account requires Administrator approval before professional access is unlocked.</span>
              </div>
            </div>
          )}

          {/* Forgot Password View */}
          {authMode === 'FORGOT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {forgotSubmitted ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    If an account exists for this email, we've sent a password reset link. Please check your inbox.
                  </p>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-subtle)' }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    We'll email you a secure link to reset your password. The link will expire in 15 minutes.
                  </p>
                </div>
              )}
            </div>
          )}

          {!(authMode === 'FORGOT' && forgotSubmitted) && (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', padding: '0.75rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'REGISTER'
                      ? 'Create Account'
                      : authMode === 'LOGIN'
                      ? 'Sign In'
                      : 'Send Password Reset Link'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}

        </form>
      </div>
    </div>
  );
};


