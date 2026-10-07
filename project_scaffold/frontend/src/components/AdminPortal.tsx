import React, { useState, useEffect } from 'react';
import { api, User, Role, PlatformAnalytics } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Shield, Trash2, Search, RefreshCw, CheckCircle, XCircle, BarChart3, Users, Clock, Loader2, AlertTriangle, Briefcase } from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'PENDING' | 'ANALYTICS'>('USERS');
  
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionId, setActionId] = useState<number | null>(null);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const allUsers = await api.getAdminUsers();
      setUsers(allUsers);

      const pending = await api.getPendingProfessionals();
      setPendingUsers(pending);

      const stats = await api.getPlatformAnalytics();
      setAnalytics(stats);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user? All their profiles and tracking records will be removed.')) {
      return;
    }

    try {
      setActionId(id);
      await api.deleteAdminUser(id);
      showSuccess(`✓ User ID #${id} deleted successfully`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete user');
    } finally {
      setActionId(null);
    }
  };

  const handleVerifyProfessional = async (id: number, choice: 'VERIFIED' | 'REJECTED') => {
    try {
      setActionId(id);
      await api.verifyProfessional(id, choice);
      showSuccess(`✓ Professional account #${id} has been successfully marked as ${choice}.`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to update verification status.');
    } finally {
      setActionId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.verification_status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-rose">Admin</span>;
      case 'DERMATOLOGIST':
        return <span className="badge badge-sky">Dermatologist</span>;
      case 'SKINCARE_CONSULTANT':
        return <span className="badge badge-amber">Consultant</span>;
      default:
        return <span className="badge badge-teal">Client</span>;
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'var(--color-rose-light)',
            color: 'var(--color-rose)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Administrator System Management Portal</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Professional account verification, tenancy oversight, and platform intelligence analytics
            </p>
          </div>
        </div>

        <button onClick={loadData} disabled={loading} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Prominent Banner for Pending Professional Applications */}
      {pendingUsers.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.12))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={20} />
            <span>{pendingUsers.length} Pending Professional Verification {pendingUsers.length === 1 ? 'Application' : 'Applications'} Awaiting Approval</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingUsers.map((p) => (
              <div key={p.id} style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{p.name}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({p.email})</span>
                    <span className="badge badge-amber">Requested: {p.requested_role || p.role}</span>
                  </div>
                  {p.professional_profile && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span><strong>Title:</strong> {p.professional_profile.professional_title || 'N/A'}</span>
                      <span><strong>Qualifications:</strong> {p.professional_profile.qualifications || 'N/A'}</span>
                      <span><strong>License #:</strong> {p.professional_profile.registration_number || 'N/A'}</span>
                      <span><strong>Clinic:</strong> {p.professional_profile.organization || 'N/A'}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleVerifyProfessional(p.id, 'VERIFIED')}
                    disabled={actionId === p.id}
                    className="btn-primary"
                    style={{ background: '#10b981', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                  >
                    {actionId === p.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    <span>Approve Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyProfessional(p.id, 'REJECTED')}
                    disabled={actionId === p.id}
                    className="btn-danger"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                  >
                    {actionId === p.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portal Mode Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'USERS' ? 700 : 500,
            color: activeTab === 'USERS' ? 'var(--color-primary)' : 'var(--text-muted)',
            background: activeTab === 'USERS' ? 'var(--color-primary-subtle)' : 'transparent',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Users size={16} />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'PENDING' ? 700 : 500,
            color: activeTab === 'PENDING' ? '#f59e0b' : 'var(--text-muted)',
            background: activeTab === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Clock size={16} />
          <span>Pending Applications ({pendingUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ANALYTICS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'ANALYTICS' ? 700 : 500,
            color: activeTab === 'ANALYTICS' ? '#10b981' : 'var(--text-muted)',
            background: activeTab === 'ANALYTICS' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <BarChart3 size={16} />
          <span>Platform Analytics</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'USERS' && (
        <>
          {/* Filter and Search Bar */}
          <div className="admin-filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 2, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-subtle)' }} />
            </div>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="ALL">All Roles ({users.length})</option>
                <option value="USER">Clients / Users</option>
                <option value="SKINCARE_CONSULTANT">Skincare Consultants</option>
                <option value="DERMATOLOGIST">Dermatologists</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Verification Statuses</option>
                <option value="PENDING">Pending Approval Only ({pendingUsers.length})</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>User / Name</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loading ? 'Loading users directory...' : 'No users found matching your criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', background: u.verification_status === 'PENDING' ? 'rgba(245, 158, 11, 0.04)' : 'transparent' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{u.id}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{u.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{getRoleBadge(u.role)}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '4px', background: u.verification_status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.12)' : u.verification_status === 'REJECTED' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(245, 158, 11, 0.15)', color: u.verification_status === 'VERIFIED' ? '#10b981' : u.verification_status === 'REJECTED' ? '#e11d48' : '#d97706' }}>
                          {u.verification_status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {/* Approve and Reject Action Buttons in Table Row */}
                          {u.verification_status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleVerifyProfessional(u.id, 'VERIFIED')}
                                disabled={actionId === u.id}
                                className="btn-primary"
                                style={{ background: '#10b981', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                title="Approve Application"
                              >
                                {actionId === u.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleVerifyProfessional(u.id, 'REJECTED')}
                                disabled={actionId === u.id}
                                className="btn-danger"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                title="Reject Application"
                              >
                                {actionId === u.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={actionId === u.id}
                              className="btn-secondary"
                              style={{ color: 'var(--color-rose)', borderColor: 'var(--color-rose-light)', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                              title="Delete user"
                            >
                              {actionId === u.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'PENDING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Pending Skincare Consultant & Dermatologist Applications
          </h4>

          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--bg-glass-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              <CheckCircle size={32} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
              <p>No pending professional verification applications at this time.</p>
            </div>
          ) : (
            pendingUsers.map((p) => (
              <div key={p.id} style={{ background: 'var(--bg-glass-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h5 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{p.name}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({p.email})</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-primary-hover)', fontWeight: 600, margin: '0.25rem 0' }}>
                    Requested Role: {p.requested_role || p.role}
                  </p>
                  {p.professional_profile && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '6px', marginTop: '0.4rem' }}>
                      <p style={{ margin: '0.1rem 0' }}><strong>Title:</strong> {p.professional_profile.professional_title || 'N/A'}</p>
                      <p style={{ margin: '0.1rem 0' }}><strong>Qualifications:</strong> {p.professional_profile.qualifications || 'N/A'}</p>
                      <p style={{ margin: '0.1rem 0' }}><strong>License No:</strong> {p.professional_profile.registration_number || 'N/A'}</p>
                      <p style={{ margin: '0.1rem 0' }}><strong>Clinic / Org:</strong> {p.professional_profile.organization || 'N/A'}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleVerifyProfessional(p.id, 'VERIFIED')}
                    disabled={actionId === p.id}
                    className="btn-primary"
                    style={{ background: '#10b981', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                  >
                    <CheckCircle size={14} />
                    <span>Approve Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyProfessional(p.id, 'REJECTED')}
                    disabled={actionId === p.id}
                    className="btn-danger"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'ANALYTICS' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Total Registered Users</h5>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
              {analytics.total_users}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Clients / Individual Accounts</h5>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#6366f1', marginTop: '0.25rem' }}>
              {analytics.clients_count}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Verified Professionals</h5>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
              {analytics.consultants_count + analytics.dermatologists_count}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Average Skin Health Score</h5>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
              {analytics.average_skin_health_score} <span style={{ fontSize: '0.9rem' }}>/ 100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
