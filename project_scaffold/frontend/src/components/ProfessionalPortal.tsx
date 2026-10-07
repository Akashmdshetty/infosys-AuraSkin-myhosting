import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, User, ConsultationRequest } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SkinReportModal } from './SkinReportModal';
import { Stethoscope, Sparkles, FileText, CheckCircle, Users, Eye, Clock, MessageSquare, Send, Loader2 } from 'lucide-react';

export const ProfessionalPortal: React.FC = () => {
  const { user } = useAuth();
  const isDerm = user?.role === 'DERMATOLOGIST';
  const isPending = user?.verification_status === 'PENDING';

  const [activeTab, setActiveTab] = useState<'ROSTER' | 'CONSULTATIONS'>('ROSTER');
  const [clients, setClients] = useState<User[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  const [responseTexts, setResponseTexts] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const { showSuccess, showError } = useToast();

  const fetchPortalData = async () => {
    if (isPending) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rosterData = await api.getProfessionalClients();
      setClients(rosterData);

      const consultData = await api.getMyConsultations();
      setConsultations(consultData);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch professional workspace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [user]);

  const handleOpenReport = (clientId: number) => {
    setSelectedClientId(clientId);
    setReportModalOpen(true);
  };

  const handleRespondConsultation = async (consultationId: number, statusChoice: string) => {
    const notes = responseTexts[consultationId] || '';
    setSubmittingId(consultationId);
    try {
      await api.updateConsultationStatus(consultationId, {
        status: statusChoice,
        response_notes: notes,
      });
      showSuccess(`✓ Consultation response saved & sent to client!`);
      fetchPortalData();
    } catch (err: any) {
      showError(err.message || 'Failed to respond to consultation.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (isPending) {
    return (
      <div className="glass-card animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#b45309' }}>
          <Clock size={24} />
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Professional Account Pending Approval</h4>
            <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Your {user?.requested_role === 'DERMATOLOGIST' ? 'Dermatologist' : 'Skincare Consultant'} registration is currently undergoing verification by an Administrator. Professional patient management tools will unlock once approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          background: isDerm ? 'var(--color-accent-light)' : 'var(--color-amber-light)',
          color: isDerm ? 'var(--color-accent)' : 'var(--color-amber)',
          padding: '0.6rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isDerm ? <Stethoscope size={24} /> : <Sparkles size={24} />}
        </div>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {isDerm ? 'Dermatology Clinical Portal' : 'Skincare Consultant Workspace'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isDerm
              ? 'Medical-grade skin assessment overview, patient consultation inbox, and clinical validation board'
              : 'Client routine planning, lifestyle impact assessment, and consultation notes'}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('ROSTER')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'ROSTER' ? 700 : 500,
            color: activeTab === 'ROSTER' ? 'var(--color-primary)' : 'var(--text-muted)',
            background: activeTab === 'ROSTER' ? 'var(--color-primary-subtle)' : 'transparent',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Users size={16} />
          <span>Active Client Roster ({clients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CONSULTATIONS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'CONSULTATIONS' ? 700 : 500,
            color: activeTab === 'CONSULTATIONS' ? 'var(--color-accent)' : 'var(--text-muted)',
            background: activeTab === 'CONSULTATIONS' ? 'var(--color-accent-light)' : 'transparent',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <MessageSquare size={16} />
          <span>Incoming Consultation Inquiries ({consultations.length})</span>
        </button>
      </div>

      {activeTab === 'ROSTER' && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Active Client Roster</h4>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Client Name</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Registration Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loading ? 'Loading client roster...' : 'No active clients registered yet.'}
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{c.id}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{c.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{c.email}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReport(c.id)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <Eye size={14} />
                          <span>View Clinical Report</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CONSULTATIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Incoming Client Consultation Requests</h4>

          {consultations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              <MessageSquare size={32} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
              <p>No client consultation inquiries received yet.</p>
            </div>
          ) : (
            consultations.map((item) => (
              <div key={item.id} style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{item.subject}</h5>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      From Client: <strong>{item.client ? item.client.name : `User #${item.client_id}`}</strong> ({item.client?.email}) • {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${item.status === 'COMPLETED' ? 'badge-emerald' : item.status === 'REVIEWED' ? 'badge-sky' : 'badge-amber'}`}>
                      Status: {item.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenReport(item.client_id)}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                    >
                      <Eye size={13} />
                      <span>View Skin Report</span>
                    </button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                  <strong>Client Inquiry Message:</strong>
                  <p style={{ marginTop: '0.35rem', margin: 0 }}>{item.message}</p>
                </div>

                {/* Response Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    Specialist Response / Clinical Guidance Notes:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type your clinical assessment response, product advice, or follow-up instructions..."
                    value={responseTexts[item.id] !== undefined ? responseTexts[item.id] : (item.response_notes || '')}
                    onChange={(e) => setResponseTexts({ ...responseTexts, [item.id]: e.target.value })}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      disabled={submittingId === item.id}
                      onClick={() => handleRespondConsultation(item.id, 'REVIEWED')}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <span>Save as In Review</span>
                    </button>

                    <button
                      type="button"
                      disabled={submittingId === item.id}
                      onClick={() => handleRespondConsultation(item.id, 'COMPLETED')}
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      {submittingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      <span>Send Complete Response</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <SkinReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        clientId={selectedClientId || undefined}
      />
    </div>
  );
};
