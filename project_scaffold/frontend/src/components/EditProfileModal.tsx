import React, { useState, useEffect } from 'react';
import { api, User } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Check, Loader2, User as UserIcon, Globe, Calendar } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated: () => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState<string>(user.name || '');
  const [age, setAge] = useState<string>(user.age ? String(user.age) : '');
  const [country, setCountry] = useState<string>(user.country || '');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setAge(user.age ? String(user.age) : '');
      setCountry(user.country || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Please enter a valid display name.');
      return;
    }

    setSaving(true);
    try {
      await api.updateMe({
        name: name.trim(),
        age: age ? Number(age) : undefined,
        country: country.trim() || undefined,
      });

      await onProfileUpdated();
      showSuccess('✓ Profile updated successfully.');
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-card sample-card bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '95%', padding: '1.75rem' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <UserIcon size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 block">
                ACCOUNT SETTINGS
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                EDIT PROFILE
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="text-xs"
            />
          </div>

          {/* Age & Country Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="text-xs"
              />
            </div>
          </div>

          {/* Email Info (Read-only) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-slate-500 font-semibold block text-[11px]">Registered Email:</span>
            <span className="font-bold text-slate-800">{user.email}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
