import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LandingPage } from './LandingPage';
import { ClientDashboardView } from '../components/ClientDashboardView';
import { ConsultantDashboardView } from '../components/ConsultantDashboardView';
import { DermatologistDashboardView } from '../components/DermatologistDashboardView';
import { AdminDashboardView } from '../components/AdminDashboardView';

interface DashboardPageProps {
  onOpenAuth: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenAuth, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <LandingPage onOpenAuth={onOpenAuth} />;
  }

  // 1. Admin System Governance Hub
  if (user.role === 'ADMIN') {
    return <AdminDashboardView onNavigate={onNavigate} />;
  }

  // 2. Skincare Consultant Workspace
  if (user.role === 'SKINCARE_CONSULTANT') {
    return <ConsultantDashboardView onNavigate={onNavigate} />;
  }

  // 3. Board Dermatologist Clinical Board
  if (user.role === 'DERMATOLOGIST') {
    return <DermatologistDashboardView onNavigate={onNavigate} />;
  }

  // 4. Default Client / End User Personalized Skin Intelligence Dashboard
  return <ClientDashboardView onNavigate={onNavigate} />;
};
