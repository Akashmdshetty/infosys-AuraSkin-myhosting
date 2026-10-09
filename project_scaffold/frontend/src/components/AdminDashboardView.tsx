import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  User,
  Role,
  VerificationStatus,
  PlatformAnalytics,
} from '../services/api';
import {
  Shield,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  UserCheck,
  Stethoscope,
  Sparkles,
  Activity,
  Layers,
  ShoppingBag,
  Clock,
  Briefcase,
  X,
  Loader2,
  Filter,
  CheckCircle,
  ShieldCheck,
  Settings,
  Server,
  Eye,
  MessageSquare,
  Send,
  Mail,
} from 'lucide-react';

interface AdminDashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleTab, setRoleTab] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [actionId, setActionId] = useState<number | null>(null);
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<Role>('USER');
  const [targetStatus, setTargetStatus] = useState<VerificationStatus>('VERIFIED');
  const [savingRole, setSavingRole] = useState<boolean>(false);

  // Contact Modal State
  const [contactUser, setContactUser] = useState<User | null>(null);
  const [advisoryType, setAdvisoryType] = useState<string>('ADMINISTRATIVE_NOTICE');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [sendingNotice, setSendingNotice] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, pending, stats] = await Promise.allSettled([
        api.getAdminUsers(),
        api.getPendingProfessionals(),
        api.getPlatformAnalytics(),
      ]);

      if (allUsers.status === 'fulfilled') {
        setUsers(allUsers.value);
      }
      if (pending.status === 'fulfilled') {
        setPendingUsers(pending.value);
      }
      if (stats.status === 'fulfilled') {
        setAnalytics(stats.value);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered User list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.country && u.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.professional_profile?.professional_title &&
          u.professional_profile.professional_title.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (roleTab === 'ALL') {
        // ok
      } else if (roleTab === 'CONSULTANTS') {
        if (u.role !== 'SKINCARE_CONSULTANT') return false;
      } else if (roleTab === 'DERMATOLOGISTS') {
        if (u.role !== 'DERMATOLOGIST') return false;
      } else if (roleTab === 'CLIENTS') {
        if (u.role !== 'USER') return false;
      } else if (roleTab === 'ADMINS') {
        if (u.role !== 'ADMIN') return false;
      }

      if (statusFilter !== 'ALL') {
        if (u.verification_status !== statusFilter) return false;
      }

      return true;
    });
  }, [users, searchQuery, roleTab, statusFilter]);

  // Verify Professional Account
  const handleVerifyProfessional = async (userId: number, choice: VerificationStatus) => {
    setActionId(userId);
    try {
      await api.verifyProfessional(userId, choice);
      showSuccess(`✓ Account #${userId} marked as ${choice}.`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to verify account.');
    } finally {
      setActionId(null);
    }
  };

  // Open Change Role Modal
  const handleOpenRoleModal = (targetU: User) => {
    setRoleModalUser(targetU);
    setTargetRole(targetU.role);
    setTargetStatus(targetU.verification_status);
  };

  // Save Role Change
  const handleSaveRoleChange = async () => {
    if (!roleModalUser) return;
    setSavingRole(true);
    try {
      await api.updateAdminUserRole(roleModalUser.id, targetRole, targetStatus);
      showSuccess(`✓ User #${roleModalUser.id} role updated to ${targetRole}.`);
      setRoleModalUser(null);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to update user role.');
    } finally {
      setSavingRole(false);
    }
  };

  // Open Contact Modal
  const handleOpenContact = (targetU: User) => {
    setContactUser(targetU);
    setAdvisoryType('ADMINISTRATIVE_NOTICE');
    setContactSubject(`Administrative Directive regarding ${targetU.role}`);
    setContactMessage(`Dear ${targetU.name},\n\nPlease review this official administrative communication regarding your account on AuraSkin.`);
  };

  // Send Direct Admin Notice
  const handleSendAdminNotice = async () => {
    if (!contactUser) return;
    if (!contactSubject.trim() || !contactMessage.trim()) {
      showError('Please provide both a subject and message.');
      return;
    }
    setSendingNotice(true);
    try {
      await api.adminContactUser({
        target_user_id: contactUser.id,
        subject: contactSubject,
        message: contactMessage,
        advisory_type: advisoryType,
      });
      showSuccess(`✓ Official administrative advisory dispatched to ${contactUser.name}!`);
      setContactUser(null);
    } catch (err: any) {
      showError(err.message || 'Failed to dispatch notice.');
    } finally {
      setSendingNotice(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}" (ID #${userId})? All associated records, routines, and assessments will be purged.`)) {
      return;
    }
    setActionId(userId);
    try {
      await api.deleteAdminUser(userId);
      showSuccess(`✓ User "${name}" (ID #${userId}) deleted successfully.`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete user.');
    } finally {
      setActionId(null);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">Admin</span>;
      case 'DERMATOLOGIST':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1"><Stethoscope size={10} /> Dermatologist</span>;
      case 'SKINCARE_CONSULTANT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Sparkles size={10} /> Consultant</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">Client</span>;
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle size={10} /> Verified</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse flex items-center gap-1"><Clock size={10} /> Pending</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><XCircle size={10} /> Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const consultantCount = users.filter((u) => u.role === 'SKINCARE_CONSULTANT').length;
  const dermCount = users.filter((u) => u.role === 'DERMATOLOGIST').length;
  const clientCount = users.filter((u) => u.role === 'USER').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      {/* 1. Admin Executive Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-rose-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-extrabold rounded-full border border-rose-400/30 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield size={13} className="text-rose-300" />
                Administrator Governance Center
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-slate-200 text-xs font-bold rounded-full border border-white/20 flex items-center gap-1">
                <Server size={12} className="text-emerald-400" /> System Operational (v4.0)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Maintenance & Tenancy Hub
            </h1>
            <p className="text-sm text-rose-100/80 mt-1 max-w-2xl leading-relaxed">
              Maintain platform users, verify skincare consultants & board dermatologists, dispatch administrative directives, manage account permissions, and supervise platform health.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Platform KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-rose-900/60">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-300 font-semibold block">Total Accounts</span>
            <span className="text-2xl font-black text-white">{users.length}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-300 font-semibold block">Client Users</span>
            <span className="text-2xl font-black text-white">{clientCount}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-amber-300 font-semibold block">Skincare Consultants</span>
            <span className="text-2xl font-black text-white">{consultantCount}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-sky-300 font-semibold block">Dermatologists</span>
            <span className="text-2xl font-black text-white">{dermCount}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-rose-300 font-semibold block">Pending Approvals</span>
            <span className="text-2xl font-black text-rose-300">{pendingUsers.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Prominent Pending Professional Applications Queue */}
      {pendingUsers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl p-6 border border-amber-300 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-900 font-black text-base">
              <AlertTriangle className="text-amber-600" size={22} />
              <span>
                {pendingUsers.length} Pending Specialist {pendingUsers.length === 1 ? 'Application' : 'Applications'} Awaiting Approval
              </span>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((p) => {
              const reqRole = p.requested_role || p.role;
              const isDerm = reqRole === 'DERMATOLOGIST';

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                        <p className="text-xs text-slate-500">{p.email}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        isDerm ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isDerm ? 'Dermatologist' : 'Consultant'}
                      </span>
                    </div>

                    {p.professional_profile && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                        <div>
                          <strong className="text-slate-800">Title: </strong>
                          {p.professional_profile.professional_title || 'Not specified'}
                        </div>
                        {p.professional_profile.organization && (
                          <div>
                            <strong className="text-slate-800">Org: </strong>
                            {p.professional_profile.organization}
                          </div>
                        )}
                        {p.professional_profile.registration_number && (
                          <div>
                            <strong className="text-slate-800">Reg #: </strong>
                            {p.professional_profile.registration_number}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenContact(p)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <MessageSquare size={13} /> Inquire
                    </button>
                    <button
                      onClick={() => handleVerifyProfessional(p.id, 'REJECTED')}
                      disabled={actionId === p.id}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                    <button
                      onClick={() => handleVerifyProfessional(p.id, 'VERIFIED')}
                      disabled={actionId === p.id}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
                    >
                      {actionId === p.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                      Approve & Verify Account
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. User, Consultant & Dermatologist Maintenance Center */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="text-rose-700" size={20} />
              User, Consultant & Dermatologist Maintenance Console
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect user metadata, adjust platform access roles, dispatch administrative notices, and purge accounts.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, title, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-rose-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Role Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {[
              { id: 'ALL', label: `All Accounts (${users.length})` },
              { id: 'CLIENTS', label: `Clients (${clientCount})` },
              { id: 'CONSULTANTS', label: `Consultants (${consultantCount})` },
              { id: 'DERMATOLOGISTS', label: `Dermatologists (${dermCount})` },
              { id: 'ADMINS', label: `Admins (${adminCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  roleTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading platform tenancy records...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium">
            No user accounts found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3 px-3">Account / User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Title / Credentials</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">Registered</th>
                  <th className="py-3 px-3 text-right">Maintenance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{u.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">{getRoleBadge(u.role)}</td>
                    <td className="py-3 px-3">{getStatusBadge(u.verification_status)}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {u.professional_profile?.professional_title || (
                        <span className="text-slate-400 italic">Standard Client</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{u.country || 'Global'}</td>
                    <td className="py-3 px-3 text-slate-400 font-medium">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Direct Contact Button */}
                        <button
                          onClick={() => handleOpenContact(u)}
                          title={`Send official message / notice to ${u.name}`}
                          className="px-2 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                        >
                          <MessageSquare size={12} /> Notice
                        </button>

                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          title="Change Role & Permissions"
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                        >
                          <Settings size={12} /> Role
                        </button>
                        <button
                          onClick={() => setInspectUser(u)}
                          title="Inspect User Details"
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                        >
                          <Eye size={14} />
                        </button>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={actionId === u.id}
                            title="Purge / Delete User"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DIRECT ADMIN CONTACT / ADVISORY                                  */}
      {/* ========================================================================= */}
      {contactUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Mail className="text-rose-700" size={18} />
                <h3 className="text-base font-black text-slate-900">
                  Dispatch Administrative Notice
                </h3>
              </div>
              <button
                onClick={() => setContactUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Recipient: {contactUser.name}</span>
              <span className="text-slate-500">{contactUser.email} • Role: <strong>{contactUser.role}</strong></span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-extrabold text-slate-800 block mb-1.5">
                  Advisory Classification:
                </label>
                <select
                  value={advisoryType}
                  onChange={(e) => setAdvisoryType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-rose-600"
                >
                  <option value="ADMINISTRATIVE_NOTICE">Administrative Notice (Standard)</option>
                  <option value="VERIFICATION_INQUIRY">Professional Verification Inquiry</option>
                  <option value="COMPLIANCE_DIRECTIVE">Clinical / Quality Compliance Directive</option>
                  <option value="PLATFORM_ALERT">Platform Tenancy Update</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1.5">
                  Directive Subject:
                </label>
                <input
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="e.g. Incomplete certification documents / Consultation standard advisory"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-rose-600"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1.5">
                  Official Message / Directive Content:
                </label>
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type the administrative instructions or feedback..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-rose-600 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setContactUser(null)}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAdminNotice}
                disabled={sendingNotice}
                className="bg-rose-700 hover:bg-rose-600 text-white text-xs px-5 py-2.5 rounded-xl font-extrabold shadow-md flex items-center gap-1.5 transition"
              >
                {sendingNotice ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Send Official Notice to {contactUser.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHANGE ROLE & PERMISSIONS                                       */}
      {/* ========================================================================= */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Settings className="text-rose-700" size={18} />
                <h3 className="text-base font-black text-slate-900">
                  Modify Role & Permissions
                </h3>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">{roleModalUser.name}</span>
              <span className="text-slate-500">{roleModalUser.email} (ID #{roleModalUser.id})</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-extrabold text-slate-800 block mb-1.5">
                  Assigned Platform Role:
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as Role)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-rose-600"
                >
                  <option value="USER">Client / End User (USER)</option>
                  <option value="SKINCARE_CONSULTANT">Skincare Consultant (SKINCARE_CONSULTANT)</option>
                  <option value="DERMATOLOGIST">Board Certified Dermatologist (DERMATOLOGIST)</option>
                  <option value="ADMIN">System Administrator (ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1.5">
                  Verification Status:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as VerificationStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-rose-600"
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setRoleModalUser(null)}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoleChange}
                disabled={savingRole}
                className="bg-rose-700 hover:bg-rose-600 text-white text-xs px-5 py-2 rounded-xl font-extrabold shadow-md flex items-center gap-1.5 transition"
              >
                {savingRole ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                Update Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INSPECT USER ACCOUNT METADATA                                   */}
      {/* ========================================================================= */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Eye className="text-teal-700" size={18} />
                User Account Dossier
              </h3>
              <button
                onClick={() => setInspectUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">User ID</span>
                  <span className="font-extrabold text-slate-900">#{inspectUser.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Full Name</span>
                  <span className="font-extrabold text-slate-900">{inspectUser.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                  <span className="font-medium text-slate-700">{inspectUser.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Role</span>
                  <span className="font-extrabold text-teal-800">{inspectUser.role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="font-extrabold">{inspectUser.verification_status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Joined Date</span>
                  <span className="font-medium text-slate-700">
                    {new Date(inspectUser.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {inspectUser.professional_profile && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <span className="font-extrabold text-amber-900 block">Professional Profile Credentials:</span>
                  <div><strong>Title:</strong> {inspectUser.professional_profile.professional_title || 'N/A'}</div>
                  <div><strong>Organization:</strong> {inspectUser.professional_profile.organization || 'N/A'}</div>
                  <div><strong>Registration #:</strong> {inspectUser.professional_profile.registration_number || 'N/A'}</div>
                  <div><strong>Experience:</strong> {inspectUser.professional_profile.years_experience ? `${inspectUser.professional_profile.years_experience} years` : 'N/A'}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  const target = inspectUser;
                  setInspectUser(null);
                  handleOpenContact(target);
                }}
                className="btn-secondary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
              >
                <MessageSquare size={13} /> Dispatch Notice
              </button>
              <button
                onClick={() => setInspectUser(null)}
                className="btn-primary text-xs px-5 py-2 font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
