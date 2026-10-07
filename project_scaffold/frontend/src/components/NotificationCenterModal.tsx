import React, { useState, useEffect } from 'react';
import {
  api, NotificationItem, NotificationPreferences, NotificationType
} from '../services/api';
import {
  X, Bell, CheckCircle2, Clock, Trash2, Settings, Sparkles,
  Droplets, Moon, Sun, AlertTriangle, ShieldCheck, RefreshCw, CheckCheck
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
  onRefreshBadge?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRefreshBadge
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingReminders, setCheckingReminders] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);
  const [prefSuccess, setPrefSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadPreferences();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications({ limit: 50 });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
      if (onRefreshBadge) onRefreshBadge();
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await api.getNotificationPreferences();
      setPreferences(prefs);
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  };

  const handleTriggerReminders = async () => {
    setCheckingReminders(true);
    try {
      await api.triggerSmartReminders();
      await loadNotifications();
    } catch (e) {
      console.error('Failed to check reminders:', e);
    } finally {
      setCheckingReminders(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (onRefreshBadge) onRefreshBadge();
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      if (onRefreshBadge) onRefreshBadge();
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (onRefreshBadge) onRefreshBadge();
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    setSavingPrefs(true);
    setPrefSuccess(false);
    try {
      const updated = await api.saveNotificationPreferences(preferences);
      setPreferences(updated);
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save preferences:', e);
    } finally {
      setSavingPrefs(false);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'AM_ROUTINE':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'PM_ROUTINE':
        return <Moon className="w-5 h-5 text-indigo-500" />;
      case 'HYDRATION':
        return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'SLEEP':
        return <Moon className="w-5 h-5 text-purple-500" />;
      case 'MILESTONE':
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
      case 'REPLENISHMENT':
        return <Clock className="w-5 h-5 text-teal-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.is_read;
    return n.notification_type === filterType;
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">Notifications & Reminders</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal-600 text-white rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Intelligent dermal regimen alerts & clinical milestones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'notifications' ? 'preferences' : 'notifications')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'preferences'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              type="button"
              title="Notification Settings"
            >
              <Settings size={15} />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'notifications' ? (
          <div className="p-5 flex-1 overflow-y-auto flex flex-col">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'UNREAD', 'AM_ROUTINE', 'PM_ROUTINE', 'HYDRATION', 'MILESTONE'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterType(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      filterType === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    type="button"
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerReminders}
                  disabled={checkingReminders}
                  className="px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50 rounded-lg border border-teal-200 flex items-center gap-1.5 disabled:opacity-50"
                  type="button"
                >
                  <RefreshCw size={12} className={checkingReminders ? 'animate-spin' : ''} />
                  <span>{checkingReminders ? 'Checking...' : 'Check Reminders'}</span>
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1"
                    type="button"
                  >
                    <CheckCheck size={13} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-700">All caught up!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  No notifications matching your filter. Click "Check Reminders" to evaluate your today's regimen.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                      notif.is_read
                        ? 'bg-slate-50/60 border-slate-200/70 text-slate-700'
                        : 'bg-white border-teal-200/90 shadow-sm text-slate-900 ring-1 ring-teal-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 shrink-0 mt-0.5">
                        {getNotificationIcon(notif.notification_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {notif.title}
                          </h4>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                          <span>
                            {new Date(notif.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {notif.action_url && onNavigate && (
                            <button
                              onClick={() => {
                                onClose();
                                const target = notif.action_url?.replace('/', '') || 'dashboard';
                                onNavigate(target);
                              }}
                              className="text-teal-700 font-bold hover:underline"
                              type="button"
                            >
                              Open Action →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition"
                          type="button"
                          title="Mark as read"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition"
                        type="button"
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Preferences Tab */
          <form onSubmit={handleSavePreferences} className="p-5 flex-1 overflow-y-auto space-y-4">
            {prefSuccess && (
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span>Notification preferences saved successfully!</span>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Delivery Channels
              </h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-900">In-App Notifications</span>
                    <p className="text-[11px] text-slate-500">Receive interactive banners and badges inside AuraSkin</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.in_app_enabled ?? true}
                    onChange={(e) =>
                      setPreferences((prev) => prev ? { ...prev, in_app_enabled: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-900">Email Notifications</span>
                    <p className="text-[11px] text-slate-500">Receive critical milestone and routine summaries via SMTP</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.email_enabled ?? true}
                    onChange={(e) =>
                      setPreferences((prev) => prev ? { ...prev, email_enabled: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Reminder Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-900">🌅 AM Routine</span>
                    <p className="text-[10px] text-slate-500">Morning SPF & active serum</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.am_routine_reminder ?? true}
                    onChange={(e) =>
                      setPreferences((prev) => prev ? { ...prev, am_routine_reminder: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-900">🌙 PM Regimen</span>
                    <p className="text-[10px] text-slate-500">Night cellular repair</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.pm_routine_reminder ?? true}
                    onChange={(e) =>
                      setPreferences((prev) => prev ? { ...prev, pm_routine_reminder: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-900">💧 Hydration Target</span>
                    <p className="text-[10px] text-slate-500">Daily moisture alerts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.hydration_reminder ?? true}
                    onChange={(e) =>
                      setPreferences((prev) => prev ? { ...prev, hydration_reminder: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-900">😴 Sleep Recovery</span>
                    <p className="text-[10px] text-slate-500">Barrier sleep advisory</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.sleep_reminder ?? true}
                    onChange={(e) =>
                      setPreferences((prev) => prev ? { ...prev, sleep_reminder: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-900">🏆 Milestone Badges</span>
                    <p className="text-[10px] text-slate-500">Adherence streak alerts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.milestone_alerts ?? true}
                    onChange={(e) =>
                      setPreferences((prev) => prev ? { ...prev, milestone_alerts: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-900">📦 Replenishment</span>
                    <p className="text-[10px] text-slate-500">Product 30-day refill</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.replenishment_reminder ?? true}
                    onChange={(e) =>
                      setPreferences((prev) => prev ? { ...prev, replenishment_reminder: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPrefs}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
              >
                <span>{savingPrefs ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
