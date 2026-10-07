import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationCenterModal } from './NotificationCenterModal';
import { Bell, Sparkles, User as UserIcon, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifModalOpen, setNotifModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const fetchUnreadCount = () => {
    if (isAuthenticated) {
      api.getUnreadNotificationCount()
        .then((res) => setUnreadCount(res.unread_count || 0))
        .catch(() => setUnreadCount(0));
    } else {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    if (isAuthenticated) {
      const interval = setInterval(fetchUnreadCount, 30000); // 30s light poll for notifications
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    ...(isAuthenticated
      ? [
          { id: 'products', label: 'Products' },
          { id: 'ingredients', label: 'Ingredients' },
          { id: 'progress', label: 'Progress' },
          { id: 'data-entry', label: 'Data Entry' },
          { id: 'reports', label: 'Reports' },
          { id: 'portals', label: 'Portals' },
          { id: 'profile', label: 'Profile' },
        ]
      : []),
  ];

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div 
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer font-extrabold text-xl text-[#00685f] tracking-tight group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00685f] to-teal-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span>AuraSkin</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-teal-50 text-teal-700 rounded-md font-bold border border-teal-200">
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Section: Notification Bell & User Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {/* Notification Bell Button */}
                <button
                  onClick={() => setNotifModalOpen(true)}
                  className="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition border border-slate-200/80 bg-white"
                  type="button"
                  title="Notifications & Smart Reminders"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Pill */}
                <div
                  onClick={() => onTabChange('profile')}
                  className="hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 cursor-pointer transition"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">{user.name}</span>
                </div>

                {/* Sign Out */}
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100"
                  type="button"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-primary text-xs px-4 py-2"
                type="button"
              >
                Sign In / Register
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              type="button"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5 animate-fade-in shadow-lg">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === tab.id
                    ? 'bg-[#00685f] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notifModalOpen}
        onClose={() => {
          setNotifModalOpen(false);
          fetchUnreadCount();
        }}
        onNavigate={onTabChange}
        onRefreshBadge={fetchUnreadCount}
      />
    </>
  );
};
