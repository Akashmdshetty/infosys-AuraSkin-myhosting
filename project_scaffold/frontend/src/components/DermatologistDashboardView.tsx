import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  ClientDetailedSummary,
  Product,
  ConsultationRequest,
  RecommendRoutinePayload,
  RecommendProductsPayload,
} from '../services/api';
import {
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2,
  Eye,
  FileText,
  ShoppingBag,
  Layers,
  Activity,
  X,
  Sun,
  Moon,
  ShieldAlert,
  Loader2,
  Filter,
  FileSpreadsheet,
  MessageSquare,
  FlaskConical,
  HeartPulse,
} from 'lucide-react';

interface DermatologistDashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DermatologistDashboardView: React.FC<DermatologistDashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [patients, setPatients] = useState<ClientDetailedSummary[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Active Modals & Selected Patient
  const [selectedPatient, setSelectedPatient] = useState<ClientDetailedSummary | null>(null);
  const [protocolModalOpen, setProtocolModalOpen] = useState<boolean>(false);
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [ingredientModalOpen, setIngredientModalOpen] = useState<boolean>(false);
  const [dossierModalOpen, setDossierModalOpen] = useState<boolean>(false);
  const [patientDossier, setPatientDossier] = useState<any | null>(null);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);

  // Proactive Clinical Outreach Modal State
  const [outreachModalOpen, setOutreachModalOpen] = useState<boolean>(false);
  const [outreachSubject, setOutreachSubject] = useState<string>('');
  const [outreachMessage, setOutreachMessage] = useState<string>('');
  const [outreachPriority, setOutreachPriority] = useState<string>('NORMAL');
  const [sendingOutreach, setSendingOutreach] = useState<boolean>(false);

  // Clinical Pharmacological Actives Form State
  const [selectedIngredients, setSelectedIngredients] = useState<
    Array<{ name: string; category: string; concentration: string; frequency: string; target_concern: string; application_notes: string }>
  >([]);
  const [ingredientGuidance, setIngredientGuidance] = useState<string>('');
  const [contraindicationsToAvoid, setContraindicationsToAvoid] = useState<string[]>([]);
  const [savingIngredients, setSavingIngredients] = useState<boolean>(false);

  // Medical Protocol Form State
  const [amSteps, setAmSteps] = useState<
    Array<{ step_name: string; product_category: string; instructions: string }>
  >([
    { step_name: 'Non-Stripping Gentle Cleanser', product_category: 'Cleanser', instructions: 'Cleanse with tepid water without vigorous scrubbing.' },
    { step_name: 'Soothing Barrier Mist / Toner', product_category: 'Toner', instructions: 'Calm erythema and restore pH balance.' },
    { step_name: 'Azelaic Acid 15% Gel / Antioxidant', product_category: 'Treatment', instructions: 'Inhibit micro-comedones and target post-inflammatory erythema (PIE).' },
    { step_name: 'Ceramide-Dominant Physiological Moisturizer', product_category: 'Moisturizer', instructions: 'Restore stratum corneum intercellular lipids (3:1:1 ratio).' },
    { step_name: 'Broad-Spectrum Mineral Physical SPF 50+ (Zinc Oxide)', product_category: 'Sunscreen', instructions: 'Protect against UV-induced pigment escalation.' },
  ]);

  const [pmSteps, setPmSteps] = useState<
    Array<{ step_name: string; product_category: string; instructions: string }>
  >([
    { step_name: 'Lipid Replenishing Cleanser', product_category: 'Cleanser', instructions: 'Gently remove daily residue.' },
    { step_name: 'Tretinoin 0.025% / Micro-Encapsulated Retinoid', product_category: 'Treatment', instructions: 'Apply pea-sized amount using sandwich technique over dry skin 2-3x weekly.' },
    { step_name: 'Intensive Barrier Repair Night Complex', product_category: 'Moisturizer', instructions: 'Occlude to prevent transepidermal water loss (TEWL).' },
  ]);

  const [contraindicationWarnings, setContraindicationWarnings] = useState<string>('');
  const [clinicalGuidance, setClinicalGuidance] = useState<string>('');
  const [followupWeeks, setFollowupWeeks] = useState<number>(4);
  const [savingProtocol, setSavingProtocol] = useState<boolean>(false);

  // Product Selection Form State
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [dosageInstructions, setDosageInstructions] = useState<Record<number, string>>({});
  const [medicalNotes, setMedicalNotes] = useState<string>('');
  const [savingProducts, setSavingProducts] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>('');

  // Consultation Reply
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsData, prodsData, consultsData] = await Promise.allSettled([
        api.getDetailedClients(),
        api.getProducts(),
        api.getMyConsultations(),
      ]);

      if (patientsData.status === 'fulfilled') {
        setPatients(patientsData.value || []);
      }
      if (prodsData.status === 'fulfilled') {
        setCatalogProducts(prodsData.value || []);
      }
      if (consultsData.status === 'fulfilled') {
        setConsultations(consultsData.value || []);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load clinical workspace data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Patients with robust null-safety
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const nameStr = (p.name || '').toLowerCase();
      const emailStr = (p.email || '').toLowerCase();
      const skinTypeStr = (p.skin_profile?.skin_type || '').toLowerCase();
      const concernsList = p.skin_profile?.concerns || [];
      const query = (searchQuery || '').toLowerCase();

      const matchesSearch =
        !query ||
        nameStr.includes(query) ||
        emailStr.includes(query) ||
        skinTypeStr.includes(query) ||
        concernsList.some((c) => (c || '').toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (riskFilter === 'ALL') return true;
      if (riskFilter === 'HIGH') return p.clinical_risk_tier === 'HIGH';
      if (riskFilter === 'MODERATE') return p.clinical_risk_tier === 'MODERATE';
      if (riskFilter === 'LOW') return p.clinical_risk_tier === 'LOW';
      if (riskFilter === 'PENDING') return (p.pending_consultations || 0) > 0;
      return true;
    });
  }, [patients, searchQuery, riskFilter]);

  // Open Protocol Builder
  const handleOpenProtocolBuilder = (patient: ClientDetailedSummary) => {
    setSelectedPatient(patient);
    setContraindicationWarnings(
      `Contraindications: Monitor closely for signs of retinoid dermatitis. Avoid alpha-hydroxy acids concurrently during initial 4-week titration. Discontinue active if acute barrier flare-up occurs.`
    );
    setClinicalGuidance(
      `Clinical treatment protocol addressing ${patient.latest_primary_concern || patient.skin_profile.concerns.join(', ') || 'dermatological diagnosis'}. Re-evaluate clinical tolerance in ${followupWeeks} weeks.`
    );
    setProtocolModalOpen(true);
  };

  // Dispatch Protocol
  const handleSaveProtocol = async () => {
    if (!selectedPatient) return;
    setSavingProtocol(true);
    try {
      const payload: RecommendRoutinePayload = {
        morning_routine: amSteps.map((s, idx) => ({ ...s, step_number: idx + 1 })),
        evening_routine: pmSteps.map((s, idx) => ({ ...s, step_number: idx + 1 })),
        safety_notes: contraindicationWarnings,
        specialist_guidance: clinicalGuidance,
        clinical_followup_weeks: followupWeeks,
      };

      await api.recommendRoutine(selectedPatient.id, payload);
      showSuccess(`✓ Clinical protocol issued to patient ${selectedPatient.name}!`);
      setProtocolModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to issue clinical protocol.');
    } finally {
      setSavingProtocol(false);
    }
  };

  // Open Proactive Clinical Outreach Modal
  const handleOpenProactiveOutreach = (patient: ClientDetailedSummary) => {
    setSelectedPatient(patient);
    setOutreachSubject(`Clinical Diagnostic Notice & Treatment Guidance for ${patient.name}`);
    setOutreachMessage(`Dear ${patient.name},\n\nAfter reviewing your clinical skin assessment (Risk Tier: ${patient.clinical_risk_tier}, Score: ${patient.latest_score || 'N/A'}), I have identified specific contraindication risks and formulated clinical recommendations for your ${patient.latest_primary_concern || 'skin condition'}.`);
    setOutreachPriority(patient.clinical_risk_tier === 'HIGH' ? 'CLINICAL_ALERT' : 'NORMAL');
    setOutreachModalOpen(true);
  };

  // Dispatch Proactive Outreach Message
  const handleSendProactiveOutreach = async () => {
    if (!selectedPatient) return;
    if (!outreachSubject.trim() || !outreachMessage.trim()) {
      showError('Please provide both a subject and clinical directive message.');
      return;
    }
    setSendingOutreach(true);
    try {
      await api.initiateClientContact(selectedPatient.id, {
        subject: outreachSubject,
        message: outreachMessage,
        priority_flag: outreachPriority,
      });
      showSuccess(`✓ Clinical consultation advisory dispatched to ${selectedPatient.name}.`);
      setOutreachModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to dispatch clinical advisory.');
    } finally {
      setSendingOutreach(false);
    }
  };

  // Open Product Recommender
  const handleOpenProductRecommender = (patient: ClientDetailedSummary) => {
    setSelectedPatient(patient);
    setSelectedProductIds([]);
    setDosageInstructions({});
    setMedicalNotes(`Prescribed biocompatible dermatological formulations for patient's clinical diagnosis.`);
    setProductModalOpen(true);
  };

  const handleToggleProduct = (prodId: number) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== prodId));
    } else {
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  // Dispatch Products
  const handleSaveProducts = async () => {
    if (!selectedPatient || selectedProductIds.length === 0) {
      showError('Please select at least one formulation to prescribe.');
      return;
    }
    setSavingProducts(true);
    try {
      const usageMap: Record<string, string> = {};
      selectedProductIds.forEach((id) => {
        if (dosageInstructions[id]) {
          usageMap[id.toString()] = dosageInstructions[id];
        }
      });

      const payload: RecommendProductsPayload = {
        product_ids: selectedProductIds,
        notes: medicalNotes,
        usage_schedule: usageMap,
      };

      await api.recommendProducts(selectedPatient.id, payload);
      showSuccess(`✓ ${selectedProductIds.length} clinical formulations prescribed to ${selectedPatient.name}!`);
      setProductModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to prescribe products.');
    } finally {
      setSavingProducts(false);
    }
  };

  // Open Clinical Actives Recommender
  const handleOpenIngredientRecommender = (patient: ClientDetailedSummary) => {
    setSelectedPatient(patient);
    const diagnosis = patient.latest_primary_concern || patient.skin_profile?.concerns[0] || 'Dermatological Pathology';
    
    let defaultActives = [
      {
        name: 'Tretinoin (Retin-A Micro)',
        category: 'Prescription Retinoid',
        concentration: '0.025%',
        frequency: '2x per week titration to alternate nights',
        target_concern: diagnosis,
        application_notes: 'Pea-sized amount over completely dry skin at night. Buffer with physiological moisturizer.'
      },
      {
        name: 'Azelaic Acid (Therapeutic Grade)',
        category: 'Dicarboxylic Anti-Microbial',
        concentration: '15%',
        frequency: 'Morning (AM)',
        target_concern: 'Post-Inflammatory Erythema & Micro-comedones',
        application_notes: 'Apply thin layer under broad spectrum SPF 50 mineral sunscreen.'
      }
    ];

    if (patient.clinical_risk_tier === 'HIGH' || diagnosis.toLowerCase().includes('acne')) {
      defaultActives.push({
        name: 'Clindamycin Phosphate Topical',
        category: 'Anti-Microbial / Anti-Bacterial',
        concentration: '1%',
        frequency: 'Morning Only (AM)',
        target_concern: 'Follicular C. acnes Colonization',
        application_notes: 'Target active papules and inflammatory lesions.'
      });
    }

    setSelectedIngredients(defaultActives);
    setIngredientGuidance(`Clinical active protocol formulated for ${patient.name}. Monitor for cutaneous xerosis or retinization erythema during first 4 weeks.`);
    setContraindicationsToAvoid(['Alpha-Hydroxy Acids during retinization', 'Mechanical facial scrubs', 'Direct sunlight without SPF 50']);
    setIngredientModalOpen(true);
  };

  // Dispatch Clinical Actives
  const handleSaveIngredients = async () => {
    if (!selectedPatient || selectedIngredients.length === 0) {
      showError('Please select at least one clinical active ingredient.');
      return;
    }
    setSavingIngredients(true);
    try {
      await api.recommendIngredients(selectedPatient.id, {
        ingredients: selectedIngredients,
        clinical_guidance: ingredientGuidance,
        contraindications_to_avoid: contraindicationsToAvoid,
      });
      showSuccess(`✓ ${selectedIngredients.length} clinical pharmacological actives prescribed to ${selectedPatient.name}!`);
      setIngredientModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to prescribe clinical actives.');
    } finally {
      setSavingIngredients(false);
    }
  };

  // Open Dossier Modal
  const handleOpenDossier = async (patient: ClientDetailedSummary) => {
    setSelectedPatient(patient);
    setDossierModalOpen(true);
    setLoadingDossier(true);
    try {
      const dossier = await api.getClientFullDossier(patient.id);
      setPatientDossier(dossier);
    } catch (err: any) {
      showError(err.message || 'Failed to load clinical dossier.');
    } finally {
      setLoadingDossier(false);
    }
  };

  // Respond to Consultation
  const handleConsultationResponse = async (consultId: number, statusChoice: string) => {
    const notes = replyText[consultId] || '';
    setReplyingId(consultId);
    try {
      await api.updateConsultationStatus(consultId, {
        status: statusChoice,
        response_notes: notes,
      });
      showSuccess(`✓ Clinical diagnostic response dispatched to patient!`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to dispatch consultation response.');
    } finally {
      setReplyingId(null);
    }
  };

  const highRiskCount = patients.filter((p) => p.clinical_risk_tier === 'HIGH').length;
  const pendingInquiriesCount = consultations.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      {/* 1. Clinical Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-sky-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-extrabold rounded-full border border-sky-400/30 flex items-center gap-1.5 uppercase tracking-wider">
                <Stethoscope size={13} className="text-sky-300" />
                Dermatology Clinical Board & Pathological Triage
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck size={13} /> Board Certified Dermatologist
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dr. {user?.name || 'Practitioner'} • Clinical Diagnostic Hub
            </h1>
            <p className="text-sm text-sky-100/80 mt-1 max-w-2xl leading-relaxed">
              Clinical patient triage board, medical-grade active ingredient protocols, contraindication screening, and proactive diagnostic outreach.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-2"
            >
              <FileSpreadsheet size={15} /> Clinical Reports
            </button>
            <button
              onClick={() => onNavigate('ingredients')}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-2"
            >
              <FlaskConical size={15} /> Pharmacological Codex
            </button>
          </div>
        </div>

        {/* Clinical KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-sky-800/60">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-sky-300 mb-1">
              <span className="text-xs font-semibold">Total Patients</span>
              <Users size={16} />
            </div>
            <div className="text-2xl font-black text-white">{patients.length}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-rose-300 mb-1">
              <span className="text-xs font-semibold">High-Risk Acute Cases</span>
              <AlertTriangle size={16} />
            </div>
            <div className="text-2xl font-black text-rose-300">{highRiskCount}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-amber-300 mb-1">
              <span className="text-xs font-semibold">Pending Triage</span>
              <Clock size={16} />
            </div>
            <div className="text-2xl font-black text-white">{pendingInquiriesCount}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-emerald-300 mb-1">
              <span className="text-xs font-semibold">Protocols Prescribed</span>
              <Layers size={16} />
            </div>
            <div className="text-2xl font-black text-white">
              {patients.reduce((acc, p) => acc + p.total_routines, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Clinical Patient Triage & Case List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="text-sky-700" size={20} />
              Clinical Patient Triage & Diagnostic Cases
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review diagnostic assessments, verify active contraindications, issue medical protocols, and proactively contact patients.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search patient, diagnosis, skin concern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-sky-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Risk Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 mr-1">
            <Filter size={13} /> Severity Tier:
          </span>
          {[
            { id: 'ALL', label: 'All Patients' },
            { id: 'HIGH', label: `High Risk / Acute (${highRiskCount})` },
            { id: 'MODERATE', label: 'Moderate / Treatment' },
            { id: 'LOW', label: 'Maintenance / Low Risk' },
            { id: 'PENDING', label: `Pending Triage (${pendingInquiriesCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setRiskFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                riskFilter === f.id
                  ? 'bg-sky-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Patient Grid */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading clinical patient caseload...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
            <Users size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No patient records found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No patients match the current clinical filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPatients.map((patient) => {
              const isHighRisk = patient.clinical_risk_tier === 'HIGH';
              const isModRisk = patient.clinical_risk_tier === 'MODERATE';

              return (
                <div
                  key={patient.id}
                  className={`rounded-2xl border transition p-5 flex flex-col justify-between group ${
                    isHighRisk
                      ? 'border-rose-300 bg-rose-50/20 hover:border-rose-500 hover:shadow-md'
                      : isModRisk
                      ? 'border-amber-200/90 bg-white hover:border-amber-400 hover:shadow-md'
                      : 'border-slate-200 bg-white hover:border-sky-500/60 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Patient Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-xs ${
                          isHighRisk ? 'bg-gradient-to-tr from-rose-700 to-rose-500' : 'bg-gradient-to-tr from-sky-800 to-sky-600'
                        }`}>
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-900 transition line-clamp-1">
                            {patient.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                            {patient.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {patient.latest_score ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}>
                            <Activity size={12} /> {patient.latest_score}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Pending Scan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Diagnostic Flags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        isHighRisk
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isModRisk
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        Tier: {patient.clinical_risk_tier} RISK
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {patient.skin_profile.skin_type} Skin
                      </span>
                    </div>

                    {/* Primary Concern & Confidence */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="font-bold">Primary Clinical Pathology:</span>
                        {patient.assessment_confidence && (
                          <span className="font-extrabold text-sky-700">{patient.assessment_confidence}% Conf.</span>
                        )}
                      </div>
                      <p className="font-extrabold text-slate-900">
                        {patient.latest_primary_concern || patient.skin_profile.concerns[0] || 'Dermal Maintenance'}
                      </p>
                    </div>

                    {/* Allergy / Contraindication Alert */}
                    {(patient.skin_profile.allergies.length > 0 || patient.skin_profile.sensitivities.length > 0) && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] mb-4 flex items-start gap-1.5">
                        <ShieldAlert size={14} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Contraindications: </span>
                          {patient.skin_profile.allergies.length > 0 && `Allergies: ${patient.skin_profile.allergies.join(', ')}. `}
                          {patient.skin_profile.sensitivities.length > 0 && `Sensitivities: ${patient.skin_profile.sensitivities.join(', ')}`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleOpenProtocolBuilder(patient)}
                        className="bg-sky-800 hover:bg-sky-700 text-white rounded-xl text-[11px] py-1.5 px-1.5 flex items-center justify-center gap-1 font-bold shadow-2xs transition"
                        title="Prescribe Medical Protocol & Titration"
                      >
                        <Layers size={12} /> Protocol
                      </button>
                      <button
                        onClick={() => handleOpenProductRecommender(patient)}
                        className="btn-secondary text-[11px] py-1.5 px-1.5 flex items-center justify-center gap-1 font-bold"
                        title="Prescribe Pharmacy Formulations"
                      >
                        <ShoppingBag size={12} /> Pharmacy
                      </button>
                      <button
                        onClick={() => handleOpenIngredientRecommender(patient)}
                        className="py-1.5 px-1.5 text-[11px] font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 rounded-lg transition border border-sky-300 flex items-center justify-center gap-1"
                        title="Prescribe Clinical Pharmacological Actives"
                      >
                        <FlaskConical size={12} /> Actives
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenProactiveOutreach(patient)}
                        className="py-1.5 text-center text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg transition border border-sky-200 flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={13} /> Contact Patient
                      </button>
                      <button
                        onClick={() => handleOpenDossier(patient)}
                        className="py-1.5 text-center text-xs font-bold text-slate-700 hover:text-sky-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200 flex items-center justify-center gap-1"
                      >
                        <Eye size={13} /> Clinical Dossier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Clinical Consultation & Triage Inbox */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Clock className="text-sky-700" size={20} />
          Diagnostic Consultations & Clinical Inbox ({consultations.length})
        </h2>

        {consultations.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No patient triage inquiries waiting. You can also proactively message patients above!
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consult) => (
              <div
                key={consult.id}
                className={`p-5 rounded-2xl border transition ${
                  consult.status === 'PENDING'
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      {consult.client?.name || `Patient #${consult.client_id}`}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">{consult.subject}</span>
                    {consult.primary_concern && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                        {consult.primary_concern}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      consult.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {consult.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 mb-3 leading-relaxed">
                  "{consult.message}"
                </p>

                {consult.response_notes && (
                  <div className="text-xs text-sky-900 bg-sky-50/80 p-3 rounded-xl border border-sky-200/80 mb-3">
                    <span className="font-bold">Clinical Directive: </span>
                    {consult.response_notes}
                  </div>
                )}

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Provide dermatological directive and prescription notes..."
                    value={replyText[consult.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [consult.id]: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-sky-600 font-medium"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleConsultationResponse(consult.id, 'REVIEWED')}
                      disabled={replyingId === consult.id}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleConsultationResponse(consult.id, 'COMPLETED')}
                      disabled={replyingId === consult.id}
                      className="bg-sky-800 hover:bg-sky-700 text-white text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow-xs transition"
                    >
                      {replyingId === consult.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      Dispatch Directive & Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PROACTIVE CLINICAL PATIENT OUTREACH                              */}
      {/* ========================================================================= */}
      {outreachModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Stethoscope className="text-sky-700" size={18} />
                <h3 className="text-base font-black text-slate-900">
                  Issue Clinical Advisory to {selectedPatient.name}
                </h3>
              </div>
              <button
                onClick={() => setOutreachModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200 space-y-1">
              <span className="font-bold text-sky-950 block">Patient: {selectedPatient.name} (Risk Tier: {selectedPatient.clinical_risk_tier})</span>
              <span className="text-sky-800 text-[11px]">
                Primary Pathology: <strong>{selectedPatient.latest_primary_concern || selectedPatient.skin_profile.skin_type}</strong>
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Advisory Urgency / Priority:
                </label>
                <select
                  value={outreachPriority}
                  onChange={(e) => setOutreachPriority(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="NORMAL">Standard Clinical Directive</option>
                  <option value="CLINICAL_ALERT">🚨 Urgent Contraindication / Flare-Up Alert</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Advisory Subject:
                </label>
                <input
                  type="text"
                  value={outreachSubject}
                  onChange={(e) => setOutreachSubject(e.target.value)}
                  placeholder="e.g. Clinical Protocol Review & Active Retinoid Precautions"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-sky-600"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Dermatological Advisory / Instructions:
                </label>
                <textarea
                  rows={4}
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                  placeholder="Type the medical instructions, titration guidance, or follow-up schedule..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-sky-600 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setOutreachModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendProactiveOutreach}
                disabled={sendingOutreach}
                className="bg-sky-800 hover:bg-sky-700 text-white text-xs px-5 py-2.5 rounded-xl font-extrabold shadow-md flex items-center gap-1.5 transition"
              >
                {sendingOutreach ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Dispatch Advisory to {selectedPatient.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRESCRIBE CLINICAL MEDICAL PROTOCOL                              */}
      {/* ========================================================================= */}
      {protocolModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Clinical Protocol Prescriber
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Medical Regimen for {selectedPatient.name}
                </h3>
                <p className="text-xs text-sky-100/80 mt-0.5">
                  Diagnosis: <strong className="text-white">{selectedPatient.latest_primary_concern || selectedPatient.skin_profile.skin_type}</strong> • Risk Tier: {selectedPatient.clinical_risk_tier}
                </p>
              </div>
              <button
                onClick={() => setProtocolModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* AM Protocol */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                    <Sun size={16} className="text-amber-500" /> Morning Clinical Protocol (AM)
                  </h4>
                  <button
                    onClick={() =>
                      setAmSteps([
                        ...amSteps,
                        { step_name: 'Medical Formulation', product_category: 'Treatment', instructions: 'Apply as directed.' },
                      ])
                    }
                    className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Step
                  </button>
                </div>

                <div className="space-y-2.5">
                  {amSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-sky-800 text-white font-black text-xs flex items-center justify-center shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Formulation Name"
                          value={step.step_name}
                          onChange={(e) => {
                            const updated = [...amSteps];
                            updated[idx].step_name = e.target.value;
                            setAmSteps(updated);
                          }}
                          className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                        />
                        <input
                          type="text"
                          placeholder="Category"
                          value={step.product_category}
                          onChange={(e) => {
                            const updated = [...amSteps];
                            updated[idx].product_category = e.target.value;
                            setAmSteps(updated);
                          }}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Medical instructions & application sequence"
                          value={step.instructions}
                          onChange={(e) => {
                            const updated = [...amSteps];
                            updated[idx].instructions = e.target.value;
                            setAmSteps(updated);
                          }}
                          className="sm:col-span-2 p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                        />
                      </div>
                      <button
                        onClick={() => setAmSteps(amSteps.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PM Protocol */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                    <Moon size={16} className="text-indigo-600" /> Evening Clinical Protocol (PM)
                  </h4>
                  <button
                    onClick={() =>
                      setPmSteps([
                        ...pmSteps,
                        { step_name: 'Nocturnal Active', product_category: 'Treatment', instructions: 'Apply before sleeping.' },
                      ])
                    }
                    className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Step
                  </button>
                </div>

                <div className="space-y-2.5">
                  {pmSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-800 text-white font-black text-xs flex items-center justify-center shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Formulation Name"
                          value={step.step_name}
                          onChange={(e) => {
                            const updated = [...pmSteps];
                            updated[idx].step_name = e.target.value;
                            setPmSteps(updated);
                          }}
                          className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                        />
                        <input
                          type="text"
                          placeholder="Category"
                          value={step.product_category}
                          onChange={(e) => {
                            const updated = [...pmSteps];
                            updated[idx].product_category = e.target.value;
                            setPmSteps(updated);
                          }}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Titration frequency and clinical application notes"
                          value={step.instructions}
                          onChange={(e) => {
                            const updated = [...pmSteps];
                            updated[idx].instructions = e.target.value;
                            setPmSteps(updated);
                          }}
                          className="sm:col-span-2 p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                        />
                      </div>
                      <button
                        onClick={() => setPmSteps(pmSteps.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety & Follow-up */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-extrabold text-slate-900 block mb-1">
                      Clinical Directives & Medical Notes:
                    </label>
                    <textarea
                      rows={2}
                      value={clinicalGuidance}
                      onChange={(e) => setClinicalGuidance(e.target.value)}
                      placeholder="Doctor's notes on expected downtime, erythema, and active adaptation..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-extrabold text-slate-900 block mb-1">
                      Follow-up Timeline:
                    </label>
                    <select
                      value={followupWeeks}
                      onChange={(e) => setFollowupWeeks(Number(e.target.value))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value={2}>2 Weeks (Acute Review)</option>
                      <option value={4}>4 Weeks (Standard Review)</option>
                      <option value={8}>8 Weeks (Maintenance Review)</option>
                      <option value={12}>12 Weeks (Longitudinal)</option>
                    </select>
                  </div>
                </div>

                <label className="font-extrabold text-slate-900 block mt-2">
                  Contraindication Warnings & Precautions:
                </label>
                <textarea
                  rows={2}
                  value={contraindicationWarnings}
                  onChange={(e) => setContraindicationWarnings(e.target.value)}
                  placeholder="Contraindications, allergens, photo-sensitivity warnings..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setProtocolModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProtocol}
                disabled={savingProtocol}
                className="bg-sky-800 hover:bg-sky-700 text-white text-xs px-6 py-2.5 rounded-xl font-extrabold shadow-md flex items-center gap-2 transition"
              >
                {savingProtocol ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Issue Clinical Protocol to {selectedPatient.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRESCRIBE DERMATOLOGICAL FORMULATIONS                           */}
      {/* ========================================================================= */}
      {productModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Dermatological Formulation Recommender
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Prescribe Formulations for {selectedPatient.name}
                </h3>
                <p className="text-xs text-sky-100/80 mt-0.5">
                  Selected ({selectedProductIds.length} formulations)
                </p>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Filter catalog formulations..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                {catalogProducts
                  .filter((p) =>
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-500 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProduct(p.id)}
                          className="mt-1 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {p.category}
                            </span>
                            <span className="text-xs font-bold text-slate-800">${p.price.toFixed(2)}</span>
                          </div>
                          <h5 className="font-bold text-slate-900 mt-1 truncate">{p.name}</h5>
                          <p className="text-[11px] text-slate-500">{p.brand}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {selectedProductIds.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h4 className="font-extrabold text-slate-900">
                    Clinical Dosage & Schedule for Selected Formulations:
                  </h4>
                  {selectedProductIds.map((id) => {
                    const prod = catalogProducts.find((p) => p.id === id);
                    if (!prod) return null;
                    return (
                      <div key={id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{prod.name}</span>
                          <span className="text-[10px] font-bold text-sky-700">{prod.brand}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Apply 1 pump nightly; avoid orbital eye region"
                          value={dosageInstructions[id] || ''}
                          onChange={(e) => setDosageInstructions({ ...dosageInstructions, [id]: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="font-extrabold text-slate-900 block">
                  Medical Prescription Notes:
                </label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Clinical rationale for prescribed product combination..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setProductModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProducts}
                disabled={savingProducts || selectedProductIds.length === 0}
                className="bg-sky-800 hover:bg-sky-700 text-white text-xs px-6 py-2.5 rounded-xl font-extrabold shadow-md flex items-center gap-2 transition"
              >
                {savingProducts ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Prescribe {selectedProductIds.length} Formulations to {selectedPatient.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PATIENT CLINICAL DOSSIER                                         */}
      {/* ========================================================================= */}
      {dossierModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Patient Medical Dossier
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {selectedPatient.name} • Clinical Assessment Record
                </h3>
                <p className="text-xs text-sky-100/80 mt-0.5">
                  Risk Tier: {selectedPatient.clinical_risk_tier} • {selectedPatient.country || 'Global'}
                </p>
              </div>
              <button
                onClick={() => setDossierModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {loadingDossier ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={28} className="animate-spin text-sky-600" />
                  <p className="text-slate-500 font-medium">Fetching patient medical records...</p>
                </div>
              ) : patientDossier ? (
                <div className="space-y-6">
                  {/* Score */}
                  {patientDossier.latest_score && (
                    <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-sky-900 text-sm">
                          Composite AuraScore: {patientDossier.latest_score.total_score} / 100
                        </span>
                        <span className="text-[11px] text-sky-700 font-medium">
                          Recorded: {new Date(patientDossier.latest_score.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Hydration</span>
                          <span className="text-sm font-black text-slate-800">{patientDossier.latest_score.hydration_score}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Barrier</span>
                          <span className="text-sm font-black text-slate-800">{patientDossier.latest_score.barrier_integrity_score}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Clarity</span>
                          <span className="text-sm font-black text-slate-800">{patientDossier.latest_score.clarity_score}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Resilience</span>
                          <span className="text-sm font-black text-slate-800">{patientDossier.latest_score.resilience_score}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Resistance</span>
                          <span className="text-sm font-black text-slate-800">{patientDossier.latest_score.environmental_resistance_score}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Protocol */}
                  {patientDossier.current_routine && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Layers size={16} className="text-sky-700" /> Active Prescribed Protocol
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-amber-700 block mb-1">Morning AM Steps:</span>
                          <ul className="space-y-1 list-disc list-inside text-slate-600">
                            {patientDossier.current_routine.morning_routine.map((s: any, idx: number) => (
                              <li key={idx}><span className="font-semibold text-slate-800">{s.step_name}</span> ({s.product_category})</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-indigo-700 block mb-1">Evening PM Steps:</span>
                          <ul className="space-y-1 list-disc list-inside text-slate-600">
                            {patientDossier.current_routine.evening_routine.map((s: any, idx: number) => (
                              <li key={idx}><span className="font-semibold text-slate-800">{s.step_name}</span> ({s.product_category})</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    handleOpenProtocolBuilder(selectedPatient);
                  }}
                  className="bg-sky-800 hover:bg-sky-700 text-white rounded-xl text-xs px-3 py-2 font-bold flex items-center gap-1 transition"
                >
                  <Layers size={13} /> Prescribe Protocol
                </button>
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    handleOpenProductRecommender(selectedPatient);
                  }}
                  className="btn-secondary text-xs px-3 py-2 font-bold flex items-center gap-1"
                >
                  <ShoppingBag size={13} /> Pharmacy Formulations
                </button>
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    handleOpenIngredientRecommender(selectedPatient);
                  }}
                  className="px-3 py-2 text-xs font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 rounded-xl transition border border-sky-300 flex items-center gap-1"
                >
                  <FlaskConical size={13} /> Prescribe Actives
                </button>
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    handleOpenProactiveOutreach(selectedPatient);
                  }}
                  className="btn-secondary text-xs px-3 py-2 font-bold flex items-center gap-1"
                >
                  <MessageSquare size={13} /> Contact Patient
                </button>
              </div>

              <button
                onClick={() => setDossierModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs px-5 py-2 rounded-xl font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRESCRIBE CLINICAL PHARMACOLOGICAL ACTIVES                      */}
      {/* ========================================================================= */}
      {ingredientModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up text-xs">
            <div className="p-6 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Dermatological Pharmacological Codex
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Prescribe Clinical Actives for {selectedPatient.name}
                </h3>
                <p className="text-xs text-sky-100/80 mt-0.5">
                  Diagnosis: <strong className="text-white">{selectedPatient.latest_primary_concern || 'Dermatological Pathology'}</strong> • Risk Tier: <strong className="text-sky-300">{selectedPatient.clinical_risk_tier}</strong>
                </p>
              </div>
              <button
                onClick={() => setIngredientModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Prescribed Actives List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm">
                    <FlaskConical size={15} className="text-sky-700" /> Prescribed Clinical Actives & Titration Schedules ({selectedIngredients.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedIngredients([
                        ...selectedIngredients,
                        {
                          name: 'Spironolactone Topical Gel',
                          category: 'Anti-Androgen',
                          concentration: '5%',
                          frequency: 'Twice Daily (AM/PM)',
                          target_concern: 'Hormonal Sebum & Acne',
                          application_notes: 'Apply thin layer to hyper-seborrheic areas.'
                        }
                      ]);
                    }}
                    className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Clinical Active
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedIngredients.map((ing, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => {
                            const updated = [...selectedIngredients];
                            updated[idx].name = e.target.value;
                            setSelectedIngredients(updated);
                          }}
                          placeholder="Active Ingredient Name (e.g. Tretinoin 0.05%)"
                          className="font-bold text-slate-900 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs flex-1"
                        />
                        <button
                          onClick={() => {
                            setSelectedIngredients(selectedIngredients.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="font-bold text-slate-600 block text-[10px]">Titration Concentration:</label>
                          <input
                            type="text"
                            value={ing.concentration}
                            onChange={(e) => {
                              const updated = [...selectedIngredients];
                              updated[idx].concentration = e.target.value;
                              setSelectedIngredients(updated);
                            }}
                            placeholder="e.g. 0.025% -> 0.05%"
                            className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 font-medium text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block text-[10px]">Titration Frequency:</label>
                          <select
                            value={ing.frequency}
                            onChange={(e) => {
                              const updated = [...selectedIngredients];
                              updated[idx].frequency = e.target.value;
                              setSelectedIngredients(updated);
                            }}
                            className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 font-medium text-xs"
                          >
                            <option value="2x per week titration to alternate nights">2x/week titration to alternate nights</option>
                            <option value="Nightly application">Nightly application</option>
                            <option value="Morning Only (AM)">Morning Only (AM)</option>
                            <option value="Short-Contact Therapy (30 min rinse)">Short-Contact Therapy (30 min rinse)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block text-[10px]">Pathological Target:</label>
                          <input
                            type="text"
                            value={ing.target_concern}
                            onChange={(e) => {
                              const updated = [...selectedIngredients];
                              updated[idx].target_concern = e.target.value;
                              setSelectedIngredients(updated);
                            }}
                            placeholder="e.g. Comedolytic / Erythema"
                            className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 font-medium text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 block text-[10px]">Clinical Dispensation & Buffer Instructions:</label>
                        <input
                          type="text"
                          value={ing.application_notes}
                          onChange={(e) => {
                            const updated = [...selectedIngredients];
                            updated[idx].application_notes = e.target.value;
                            setSelectedIngredients(updated);
                          }}
                          placeholder="e.g. Sandwich over ceramide moisturizer. Discontinue if severe peeling occurs."
                          className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Add Clinical Pharmacological Actives */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Quick Add Dermatological Actives:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Adapalene (Differin 0.1% / 0.3%)', cat: '3rd Gen Retinoid', conc: '0.1%', freq: 'Nightly application', goal: 'Comedonal Acne & Keratinization', notes: 'Pea-sized amount on dry skin.' },
                    { name: 'Benzoyl Peroxide Micronized 2.5%', cat: 'Bactericidal Oxidizer', conc: '2.5%', freq: 'Morning Only (AM)', goal: 'Cutibacterium acnes Eradication', notes: 'Contact therapy; wash off after 15 min if dry.' },
                    { name: 'Hydroquinone 4% USP', cat: 'Tyrosinase Inhibitor', conc: '4%', freq: 'Nightly (Cycle: 8-12 weeks max)', goal: 'Melasma & Severe PIH', notes: 'Strict sun avoidance with broad spectrum SPF 50+.' },
                    { name: 'Tacrolimus Ointment 0.1%', cat: 'Calcineurin Inhibitor', conc: '0.1%', freq: 'Morning & Night', goal: 'Atopic Eczema / Facial Dermatitis', notes: 'Steroid-sparing anti-inflammatory agent.' },
                    { name: 'Ketoconazole 2% Cream', cat: 'Anti-Fungal Azole', conc: '2%', freq: 'Daily (AM/PM)', goal: 'Seborrheic Dermatitis / Malassezia', notes: 'Apply to nasolabial and hairline zones.' },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedIngredients([
                          ...selectedIngredients,
                          {
                            name: preset.name,
                            category: preset.cat,
                            concentration: preset.conc,
                            frequency: preset.freq,
                            target_concern: preset.goal,
                            application_notes: preset.notes
                          }
                        ]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 hover:text-sky-900 border border-slate-200 text-slate-700 font-bold text-[11px] transition shadow-2xs flex items-center gap-1"
                    >
                      <Plus size={11} className="text-sky-600" /> {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contraindications Warning Box */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-900 block">
                  Clinical Contraindications & Safety Warnings:
                </label>
                <textarea
                  rows={2}
                  value={ingredientGuidance}
                  onChange={(e) => setIngredientGuidance(e.target.value)}
                  placeholder="e.g. Absolute contraindication in pregnancy (teratogenicity). Avoid concurrent AHA/BHA chemical peels."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIngredientModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIngredients}
                disabled={savingIngredients || selectedIngredients.length === 0}
                className="btn-primary text-xs px-6 py-2.5 font-extrabold bg-sky-800 hover:bg-sky-700 text-white shadow-md flex items-center gap-2"
              >
                {savingIngredients ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Prescribe {selectedIngredients.length} Actives to {selectedPatient.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
