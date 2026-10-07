import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardProvider } from './context/DashboardContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ResetPasswordPage } from './components/ResetPasswordPage';

// Eager load primary landing/dashboard for instant initial paint
import { DashboardPage } from './pages/DashboardPage';

// Lazy load secondary sub-pages for optimal code splitting & bundle reduction
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const IngredientsPage = lazy(() => import('./pages/IngredientsPage').then(m => ({ default: m.IngredientsPage })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then(m => ({ default: m.ProgressPage })));
const DataEntryPage = lazy(() => import('./pages/DataEntryPage').then(m => ({ default: m.DataEntryPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const PortalsPage = lazy(() => import('./pages/PortalsPage').then(m => ({ default: m.PortalsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-400">Loading AuraSkin module...</p>
    </div>
  </div>
);

const AppContent: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  
  // Read active tab from location hash or default to 'dashboard'
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'products', 'ingredients', 'progress', 'data-entry', 'reports', 'portals', 'profile'].includes(hash)) {
      return hash;
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromHash());

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const renderActivePage = () => {
    if (!isAuthenticated && activeTab !== 'dashboard') {
      return <DashboardPage onOpenAuth={onOpenAuth} onNavigate={handleTabChange} />;
    }

    switch (activeTab) {
      case 'products':
        return (
          <Suspense fallback={<PageLoader />}>
            <ProductsPage onNavigate={handleTabChange} />
          </Suspense>
        );
      case 'ingredients':
        return (
          <Suspense fallback={<PageLoader />}>
            <IngredientsPage />
          </Suspense>
        );
      case 'progress':
        return (
          <Suspense fallback={<PageLoader />}>
            <ProgressPage />
          </Suspense>
        );
      case 'data-entry':
        return (
          <Suspense fallback={<PageLoader />}>
            <DataEntryPage />
          </Suspense>
        );
      case 'reports':
        return (
          <Suspense fallback={<PageLoader />}>
            <ReportsPage onNavigate={handleTabChange} />
          </Suspense>
        );
      case 'portals':
        return (
          <Suspense fallback={<PageLoader />}>
            <PortalsPage />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        );
      case 'dashboard':
      default:
        return <DashboardPage onOpenAuth={onOpenAuth} onNavigate={handleTabChange} />;
    }
  };

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAuth={onOpenAuth}
      />
      <main className="main-content" role="main">
        {renderActivePage()}
      </main>
    </>
  );
};

export const App: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const isResetPasswordRoute = window.location.pathname === '/reset-password' || window.location.search.includes('token=');

  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardProvider>
          <div className="app-container">
            {isResetPasswordRoute ? (
              <ResetPasswordPage onReturnToLogin={() => {
                window.history.pushState({}, '', '/');
                setAuthModalOpen(true);
              }} />
            ) : (
              <AppContent onOpenAuth={() => setAuthModalOpen(true)} />
            )}
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
          </div>
        </DashboardProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
