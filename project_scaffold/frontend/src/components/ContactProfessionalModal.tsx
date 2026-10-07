import React, { useState, useEffect } from 'react';
import { api, User } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  X,
  Send,
  UserCheck,
  MessageSquare,
  Award,
  Loader2,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Share2,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface ContactProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProfessionalId?: number | null;
  onSuccess?: () => void;
  initialPrimaryConcern?: string;
}

export const ContactProfessionalModal: React.FC<ContactProfessionalModalProps> = ({
  isOpen,
  onClose,
  selectedProfessionalId,
  onSuccess,
  initialPrimaryConcern,
}) => {
  const { showSuccess, showError } = useToast();

  const [professionals, setProfessionals] = useState<User[]>([]);
  const [loadingProfs, setLoadingProfs] = useState<boolean>(true);

  const [profId, setProfId] = useState<number | ''>('');
  const [consultationType, setConsultationType] = useState<string>('Assessment & Score Review');
  const [primaryConcern, setPrimaryConcern] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [shareAssessment, setShareAssessment] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingProfs(true);
      setSubmittedSuccess(false);
      if (initialPrimaryConcern) {
        setPrimaryConcern(initialPrimaryConcern);
      }

      api
        .getProfessionalDirectory()
        .then((list) => {
          setProfessionals(list);
          if (selectedProfessionalId) {
            setProfId(selectedProfessionalId);
          } else if (list.length > 0) {
            setProfId(list[0].id);
          }
        })
        .catch(() => setProfessionals([]))
        .finally(() => setLoadingProfs(false));
    }
  }, [isOpen, selectedProfessionalId, initialPrimaryConcern]);

  if (!isOpen) return null;

  const selectedProfObj = professionals.find((p) => p.id === profId);

  const handleTypeChange = (type: string) => {
    setConsultationType(type);
    if (!subject || subject.includes('Consultation:') || subject.includes('Inquiry:')) {
      setSubject(`${type} — Clinical Inquiry`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profId) {
      showError('Please select a verified specialist to contact.');
      return;
    }
    if (!subject.trim()) {
      showError('Please enter a subject line for your request.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      showError('Please enter a message of at least 10 characters detailing your skin inquiry.');
      return;
    }

    setSending(true);
    try {
      const formattedMessage = shareAssessment
        ? `${message.trim()}\n\n[Attached Telemetry: Consultation Type: ${consultationType} | Share AI Assessment: Yes]`
        : message.trim();

      await api.createConsultationRequest({
        professional_id: Number(profId),
        subject: subject.trim(),
        message: formattedMessage,
        primary_concern: primaryConcern.trim() || consultationType,
      });

      setSubmittedSuccess(true);
      showSuccess(`✓ Consultation request submitted to ${selectedProfObj ? selectedProfObj.name : 'Specialist'}!`);
      
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setSubject('');
        setMessage('');
        onClose();
      }, 1500);
    } catch (err: any) {
      showError(err.message || 'Failed to send consultation request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-card sample-card bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '95%', padding: '1.75rem' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 block">
                TELEHEALTH CONSULTATION
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                REQUEST CONSULTATION
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

        {loadingProfs ? (
          <div className="text-center py-10 space-y-2">
            <Loader2 size={24} className="animate-spin text-teal-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading specialist directory...</p>
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-xl space-y-2">
            <UserCheck size={32} className="text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Specialists Currently Available</h4>
            <p className="text-xs text-slate-500">
              Specialist accounts are pending administrator verification. Please check back shortly.
            </p>
          </div>
        ) : submittedSuccess ? (
          <div className="text-center py-10 px-4 space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-lg font-black text-slate-900">Consultation Request Sent!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your inquiry has been delivered to <strong>{selectedProfObj?.name}</strong>. You will receive clinical response notes directly in your consultation inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Specialist Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Specialist / Dermatologist <span className="text-rose-500">*</span>
              </label>
              <select
                value={profId}
                onChange={(e) => setProfId(Number(e.target.value))}
                required
                className="w-full text-xs font-medium"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.role === 'DERMATOLOGIST' ? 'Board Certified Dermatologist' : 'Skincare Consultant'}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Specialist Info Card */}
            {selectedProfObj && (
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900">
                    <ShieldCheck size={14} className="text-teal-600" />
                    <span>{selectedProfObj.name}</span>
                  </div>
                  <span
                    className={`badge text-[10px] ${
                      selectedProfObj.role === 'DERMATOLOGIST' ? 'badge-sky' : 'badge-amber'
                    }`}
                  >
                    {selectedProfObj.role === 'DERMATOLOGIST' ? 'Dermatologist' : 'Consultant'}
                  </span>
                </div>
                {selectedProfObj.professional_profile && (
                  <div className="text-[11px] text-slate-600 flex items-center gap-3 pt-0.5">
                    <span>{selectedProfObj.professional_profile.qualifications || 'MD / Practitioner'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 size={11} className="text-slate-400" />
                      {selectedProfObj.professional_profile.organization || 'AuraSkin Partner'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Consultation Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consultation Reason / Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  'Skin Concern Review',
                  'Assessment & Score',
                  'Routine Formulation',
                  'Ingredient Safety',
                  'Product Allergy',
                  'General Guidance',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`text-[11px] font-bold py-1.5 px-2 rounded-lg border text-center transition-all ${
                      consultationType === type
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Concern Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Skin Concern
              </label>
              <input
                type="text"
                value={primaryConcern}
                onChange={(e) => setPrimaryConcern(e.target.value)}
                placeholder="e.g. Barrier repair, acne flare-ups, dehydration, sensitivity"
                className="text-xs"
              />
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject Line <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of what you would like to discuss..."
                className="text-xs"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consultation Message & Symptoms <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your current symptoms, daily routine questions, or questions about your AuraSkin assessment..."
                className="text-xs w-full"
              />
            </div>

            {/* Share Assessment Checkbox */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="shareAssessmentCheck"
                checked={shareAssessment}
                onChange={(e) => setShareAssessment(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="shareAssessmentCheck" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <Share2 size={12} className="text-teal-600" />
                  Share my AuraSkin assessment with this specialist
                </span>
                <span className="text-[11px] text-slate-500">
                  Securely attaches your 18-part dermal health score, risk factors, and routine biometrics to assist the specialist's diagnosis.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
              >
                {sending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Consultation Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
