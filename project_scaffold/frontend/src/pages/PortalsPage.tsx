import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  api,
  User,
  ConsultationRequest,
  SkinHealthScore,
  SkinAssessment,
} from '../services/api';
import { AdminPortal } from '../components/AdminPortal';
import { ConsultantDashboardView } from '../components/ConsultantDashboardView';
import { DermatologistDashboardView } from '../components/DermatologistDashboardView';
import { ContactProfessionalModal } from '../components/ContactProfessionalModal';
import { PortalHeader } from '../components/PortalHeader';
import { PortalSummaryCards } from '../components/PortalSummaryCards';
import { PortalAssessmentCard } from '../components/PortalAssessmentCard';
import { PortalSpecialistDirectory } from '../components/PortalSpecialistDirectory';
import { PortalConsultationList } from '../components/PortalConsultationList';
import { Lock, AlertTriangle, RefreshCw } from 'lucide-react';

export const PortalsPage: React.FC = () => {
  const { user } = useAuth();
  const directorySectionRef = useRef<HTMLDivElement | null>(null);

  const [directory, setDirectory] = useState<User[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [score, setScore] = useState<SkinHealthScore | null>(null);
  const [assessment, setAssessment] = useState<SkinAssessment | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [selectedProfId, setSelectedProfId] = useState<number | null>(null);

  const loadClientPortalData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profs, requests, scoreData, assessmentData] = await Promise.allSettled([
        api.getProfessionalDirectory(),
        api.getMyConsultations(),
        api.getSkinScore(),
        api.getLatestAssessment(),
      ]);

      if (profs.status === 'fulfilled') {
        setDirectory(profs.value);
      }
      if (requests.status === 'fulfilled') {
        setConsultations(requests.value);
      }
      if (scoreData.status === 'fulfilled') {
        setScore(scoreData.value);
      }
      if (assessmentData.status === 'fulfilled') {
        setAssessment(assessmentData.value);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load specialist information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'USER') {
      loadClientPortalData();
    }
  }, [user, loadClientPortalData]);

  const handleOpenContact = (profId?: number) => {
    setSelectedProfId(profId || null);
    setContactModalOpen(true);
  };

  const handleScrollToDirectory = () => {
    if (directorySectionRef.current) {
      directorySectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!user) {
    return (
      <div className="sample-card card-3d-interactive bg-white/95 max-w-lg mx-auto my-12 p-8 text-center rounded-2xl border border-slate-200 shadow-lg animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200/60 shadow-2xs">
          <Lock size={28} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Please log in or create an account to access clinical specialist consultations and practitioner portals.
        </p>
      </div>
    );
  }

  // Calculated Stats
  const pendingCount = consultations.filter((c) => c.status === 'PENDING').length;
  const completedCount = consultations.filter(
    (c) => c.status === 'COMPLETED' || c.status === 'REVIEWED' || c.status === 'ACTIVE'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. Portal Hero Header with Particle Background & Dermal Care Orb */}
      <PortalHeader
        onOpenContact={() => handleOpenContact()}
        isUser={user.role === 'USER'}
      />

      {/* Admin Role Portal View */}
      {user.role === 'ADMIN' && <AdminPortal />}

      {/* Skincare Consultant Workspace */}
      {user.role === 'SKINCARE_CONSULTANT' && (
        <ConsultantDashboardView onNavigate={() => {}} />
      )}

      {/* Board Certified Dermatologist Clinical Board */}
      {user.role === 'DERMATOLOGIST' && (
        <DermatologistDashboardView onNavigate={() => {}} />
      )}

      {/* Client / User Experience */}
      {user.role === 'USER' && (
        <div className="space-y-6">
          {/* Error Banner if API error occurred */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadClientPortalData}
                className="btn-secondary text-xs px-3 py-1 flex items-center gap-1 shrink-0"
              >
                <RefreshCw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* 2. Summary Statistics Cards */}
          <PortalSummaryCards
            specialistCount={directory.length}
            pendingCount={pendingCount}
            completedCount={completedCount}
          />

          {/* 3. AI Assessment Bridge Card */}
          <PortalAssessmentCard
            score={score}
            assessment={assessment}
            onOpenContact={() => handleOpenContact()}
          />

          {/* 4. Verified Specialist Directory */}
          <div ref={directorySectionRef}>
            <PortalSpecialistDirectory
              specialists={directory}
              loading={loading}
              onRefresh={loadClientPortalData}
              onSelectSpecialist={(profId) => handleOpenContact(profId)}
            />
          </div>

          {/* 5. My Consultations Tracker */}
          <PortalConsultationList
            consultations={consultations}
            onScrollToDirectory={handleScrollToDirectory}
          />
        </div>
      )}

      {/* Contact & Consultation Request Modal */}
      <ContactProfessionalModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        selectedProfessionalId={selectedProfId}
        initialPrimaryConcern={assessment?.primary_concern || undefined}
        onSuccess={loadClientPortalData}
      />
    </div>
  );
};
