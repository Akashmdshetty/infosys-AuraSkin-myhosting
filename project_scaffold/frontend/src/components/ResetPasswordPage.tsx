import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export const ResetPasswordPage: React.FC<{ onReturnToLogin: () => void }> = ({ onReturnToLogin }) => {
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Extract token from URL search query (?token=XYZ)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Invalid or missing password reset token in link.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing reset token. Please request a new password reset email.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields match.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({ token: token.trim(), new_password: newPassword });
      setSuccess(true);
      showSuccess('✓ Password has been updated successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to reset password. Token may be expired or invalid.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '460px',
      margin: '4rem auto',
      padding: '2rem',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <Lock size={24} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Reset Your Password</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Create a new secure password for your AuraSkin account
        </p>
      </div>

      {success ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>Password Reset Complete!</h4>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              Your password has been successfully updated and your reset token has been invalidated.
            </p>
          </div>

          <button
            type="button"
            onClick={onReturnToLogin}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            <span>Proceed to Sign In</span>
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div className="field-error-alert" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="reset-new-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              New Password (min. 8 characters) <span className="text-rose">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-new-password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-subtle)' }} />
            </div>
          </div>

          <div>
            <label htmlFor="reset-confirm-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Confirm New Password <span className="text-rose">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-confirm-password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <ShieldCheck size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-subtle)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
