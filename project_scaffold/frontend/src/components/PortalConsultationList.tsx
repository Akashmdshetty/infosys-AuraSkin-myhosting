import React, { useState } from 'react';
import { ConsultationRequest } from '../services/api';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Send,
  XCircle,
} from 'lucide-react';

interface PortalConsultationListProps {
  consultations: ConsultationRequest[];
  onScrollToDirectory: () => void;
}

export const PortalConsultationList: React.FC<PortalConsultationListProps> = ({
  consultations,
  onScrollToDirectory,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const pendingCount = consultations.filter((c) => c.status === 'PENDING').length;
  const activeCount = consultations.filter((c) => c.status === 'REVIEWED' || c.status === 'ACTIVE').length;
  const completedCount = consultations.filter((c) => c.status === 'COMPLETED').length;

  const filteredConsultations = consultations.filter((c) => {
    if (activeTab === 'PENDING') return c.status === 'PENDING';
    if (activeTab === 'ACTIVE') return c.status === 'REVIEWED' || c.status === 'ACTIVE';
    if (activeTab === 'COMPLETED') return c.status === 'COMPLETED';
    return true;
  });

  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return {
          label: 'Completed',
          icon: <CheckCircle2 size={13} className="text-emerald-600" />,
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          cardClass: 'consultation-card-completed',
        };
      case 'REVIEWED':
      case 'ACTIVE':
        return {
          label: 'In Review / Active',
          icon: <Sparkles size={13} className="text-sky-600" />,
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
          cardClass: 'consultation-card-active',
        };
      case 'DECLINED':
      case 'REJECTED':
        return {
          label: 'Declined',
          icon: <XCircle size={13} className="text-rose-600" />,
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          cardClass: 'consultation-card-declined',
        };
      default:
        return {
          label: 'Pending Review',
          icon: <Clock size={13} className="text-amber-600" />,
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          cardClass: 'consultation-card-pending',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#00685f] uppercase tracking-wider">
            <MessageSquare size={14} />
            <span>Consultation Inbox</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            MY CONSULTATIONS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track inquiries, direct specialist communication, and clinical diagnosis responses.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`portal-tab-btn text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeTab === 'ALL'
                ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({consultations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`portal-tab-btn text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeTab === 'PENDING'
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`portal-tab-btn text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`portal-tab-btn text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Consultations List / Cards */}
      {consultations.length === 0 ? (
        /* Overall Empty State */
        <div className="sample-card text-center py-14 px-4 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3.5 border border-teal-200/70 shadow-2xs">
            <MessageSquare size={30} />
          </div>
          <span className="text-xs font-black tracking-wider uppercase text-teal-700">
            CLINICAL TELEHEALTH
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1">
            NO CONSULTATIONS YET
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Connect with a verified skincare specialist to discuss your AuraSkin assessment, ingredient sensitivities, or routine optimizations.
          </p>
          <button
            type="button"
            onClick={onScrollToDirectory}
            className="btn-primary text-xs px-5 py-2.5 mt-5 inline-flex items-center gap-2 shadow-sm"
          >
            <span>Find a Specialist</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      ) : filteredConsultations.length === 0 ? (
        /* Tab Filter Empty State */
        <div className="sample-card text-center py-10 px-4 bg-white/90 rounded-2xl border border-slate-200/70">
          <p className="text-xs text-slate-500">
            No consultations currently matching the selected <strong>{activeTab}</strong> filter.
          </p>
        </div>
      ) : (
        /* Filtered Consultations */
        <div className="space-y-4">
          {filteredConsultations.map((c) => {
            const statusInfo = getStatusDisplay(c.status);
            const dateStr = new Date(c.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const profName = c.professional ? c.professional.name : `Specialist #${c.professional_id}`;
            const profRole = c.professional?.role === 'DERMATOLOGIST' ? 'Dermatologist' : 'Skincare Consultant';

            return (
              <div
                key={c.id}
                className={`consultation-card sample-card bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 ${statusInfo.cardClass}`}
              >
                {/* Header Row: Subject, Specialist, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-extrabold text-slate-900">
                        {c.subject}
                      </h4>
                      {c.primary_concern && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {c.primary_concern}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Stethoscope size={13} className="text-teal-600" />
                        {profName} ({profRole})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar size={12} className="text-slate-400" />
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start sm:self-auto">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full border ${statusInfo.badgeClass}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>
                </div>

                {/* Inquiry Message Body */}
                <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">
                    Your Consultation Inquiry:
                  </span>
                  <p className="whitespace-pre-line m-0">{c.message}</p>
                </div>

                {/* Specialist Clinical Response Notes */}
                {c.response_notes ? (
                  <div className="bg-gradient-to-br from-teal-50/70 to-emerald-50/50 rounded-xl p-4 border border-teal-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                      <Sparkles size={14} className="text-teal-700" />
                      <span>Specialist Clinical Guidance & Response:</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium m-0 whitespace-pre-line">
                      {c.response_notes}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50">
                    <Clock size={13} className="shrink-0" />
                    <span>
                      Inquiry received. The specialist will review your skin biometrics and provide diagnosis notes here.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
