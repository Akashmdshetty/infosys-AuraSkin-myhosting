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
  Sparkles,
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
  HeartHandshake,
  Activity,
  X,
  Droplets,
  Sun,
  Moon,
  ShieldAlert,
  Loader2,
  Filter,
  MessageSquare,
  Smile,
  Compass,
} from 'lucide-react';

interface ConsultantDashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const ConsultantDashboardView: React.FC<ConsultantDashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [clients, setClients] = useState<ClientDetailedSummary[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [concernFilter, setConcernFilter] = useState<string>('ALL');

  // Active Modals & Selected Client
  const [selectedClient, setSelectedClient] = useState<ClientDetailedSummary | null>(null);
  const [routineModalOpen, setRoutineModalOpen] = useState<boolean>(false);
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [ingredientModalOpen, setIngredientModalOpen] = useState<boolean>(false);
  const [dossierModalOpen, setDossierModalOpen] = useState<boolean>(false);
  const [clientDossier, setClientDossier] = useState<any | null>(null);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);

  // Proactive Outreach Modal State
  const [outreachModalOpen, setOutreachModalOpen] = useState<boolean>(false);
  const [outreachSubject, setOutreachSubject] = useState<string>('');
  const [outreachMessage, setOutreachMessage] = useState<string>('');
  const [sendingOutreach, setSendingOutreach] = useState<boolean>(false);

  // Ingredient Recommendation Form State
  const [selectedIngredients, setSelectedIngredients] = useState<
    Array<{ name: string; category: string; concentration: string; frequency: string; target_concern: string; application_notes: string }>
  >([]);
  const [ingredientSearch, setIngredientSearch] = useState<string>('');
  const [ingredientGuidance, setIngredientGuidance] = useState<string>('');
  const [savingIngredients, setSavingIngredients] = useState<boolean>(false);

  // Aesthetic Routine Form State
  const [morningSteps, setMorningSteps] = useState<
    Array<{ step_name: string; product_category: string; instructions: string }>
  >([
    { step_name: 'Gentle Hydrating Cleanser', product_category: 'Cleanser', instructions: 'Cleanse face with lukewarm water for 60 seconds.' },
    { step_name: 'Hydrating Peptide Essence / Toner', product_category: 'Toner', instructions: 'Pat gently onto damp skin to boost moisture absorption.' },
    { step_name: 'Antioxidant Glow Serum (Vitamin C / Niacinamide)', product_category: 'Serum', instructions: 'Apply 3-4 drops evenly across face and neck.' },
    { step_name: 'Barrier Lipid Restorative Cream', product_category: 'Moisturizer', instructions: 'Massage in upward circular motions to lock in moisture.' },
    { step_name: 'Broad Spectrum Dewy SPF 50+', product_category: 'Sunscreen', instructions: 'Apply liberally 15 minutes before UV exposure.' },
  ]);

  const [eveningSteps, setEveningSteps] = useState<
    Array<{ step_name: string; product_category: string; instructions: string }>
  >([
    { step_name: 'Nourishing Oil / Micellar Pre-Cleanse', product_category: 'Cleanser', instructions: 'Dissolve daily SPF, sebum, and pollutants.' },
    { step_name: 'Silky Milk Cleanser', product_category: 'Cleanser', instructions: 'Follow with water-based gentle cleanser.' },
    { step_name: 'Hyaluronic Acid & Centella Soothing Serum', product_category: 'Serum', instructions: 'Replenish moisture balance and calm daytime irritation.' },
    { step_name: 'Nocturnal Barrier Recovery Cream', product_category: 'Moisturizer', instructions: 'Support natural nocturnal barrier regeneration.' },
  ]);

  const [weeklySteps, setWeeklySteps] = useState<
    Array<{ step_name: string; frequency: string; instructions: string }>
  >([
    { step_name: 'Gentle Enzymatic / Papaya Exfoliant', frequency: '2x per week', instructions: 'Slough away dead skin cells without micro-tears.' },
    { step_name: 'Deep Hydration Sheet Mask', frequency: '1x per week', instructions: 'Leave on for 15 minutes, tap excess essence into neck.' },
  ]);

  const [safetyNotes, setSafetyNotes] = useState<string>('');
  const [specialistGuidance, setSpecialistGuidance] = useState<string>('');
  const [savingRoutine, setSavingRoutine] = useState<boolean>(false);

  // Product Recommendation Form State
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productUsageNotes, setProductUsageNotes] = useState<Record<number, string>>({});
  const [generalProductNotes, setGeneralProductNotes] = useState<string>('');
  const [savingProducts, setSavingProducts] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>('');

  // Consultation Reply State
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsData, prodsData, consultsData] = await Promise.allSettled([
        api.getDetailedClients(),
        api.getProducts(),
        api.getMyConsultations(),
      ]);

      if (clientsData.status === 'fulfilled') {
        setClients(clientsData.value || []);
      }
      if (prodsData.status === 'fulfilled') {
        setCatalogProducts(prodsData.value || []);
      }
      if (consultsData.status === 'fulfilled') {
        setConsultations(consultsData.value || []);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load consultant workspace data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Clients with robust null-safety
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const nameStr = (c.name || '').toLowerCase();
      const emailStr = (c.email || '').toLowerCase();
      const skinTypeStr = (c.skin_profile?.skin_type || '').toLowerCase();
      const concernsList = c.skin_profile?.concerns || [];
      const query = (searchQuery || '').toLowerCase();

      const matchesSearch =
        !query ||
        nameStr.includes(query) ||
        emailStr.includes(query) ||
        skinTypeStr.includes(query) ||
        concernsList.some((con) => (con || '').toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (concernFilter === 'ALL') return true;
      if (concernFilter === 'PENDING') return (c.pending_consultations || 0) > 0;
      if (concernFilter === 'LIFESTYLE') {
        return (
          (c.skin_profile?.lifestyle_sleep !== undefined && c.skin_profile.lifestyle_sleep !== null && c.skin_profile.lifestyle_sleep < 7) ||
          (c.skin_profile?.lifestyle_hydration !== undefined && c.skin_profile.lifestyle_hydration !== null && c.skin_profile.lifestyle_hydration < 2)
        );
      }
      if (concernFilter === 'ACNE') {
        return (
          concernsList.some((con) => (con || '').toLowerCase().includes('acne')) ||
          (c.latest_primary_concern || '').toLowerCase().includes('acne')
        );
      }
      if (concernFilter === 'HYPERPIGMENTATION') {
        return (
          concernsList.some((con) => (con || '').toLowerCase().includes('pigment') || (con || '').toLowerCase().includes('dark')) ||
          (c.latest_primary_concern || '').toLowerCase().includes('pigment')
        );
      }
      if (concernFilter === 'BARRIER') {
        return concernsList.some(
          (con) =>
            (con || '').toLowerCase().includes('barrier') ||
            (con || '').toLowerCase().includes('dry') ||
            (con || '').toLowerCase().includes('dehydrat')
        );
      }
      if (concernFilter === 'SENSITIVE') {
        return (
          skinTypeStr === 'sensitive' ||
          (c.skin_profile?.sensitivities && c.skin_profile.sensitivities.length > 0)
        );
      }
      return true;
    });
  }, [clients, searchQuery, concernFilter]);

  // Open Routine Builder
  const handleOpenRoutineBuilder = (client: ClientDetailedSummary) => {
    setSelectedClient(client);
    const sType = client.skin_profile.skin_type.toUpperCase();
    if (sType === 'OILY') {
      setMorningSteps([
        { step_name: 'Clarifying Tea Tree Foam Cleanser', product_category: 'Cleanser', instructions: 'Cleanse face for 60 seconds to balance sebum.' },
        { step_name: 'Pore Refining Niacinamide Essence', product_category: 'Toner', instructions: 'Smooth across T-zone to minimize pore appearance.' },
        { step_name: 'Zinc + Centella Hydrating Gel', product_category: 'Serum', instructions: 'Deliver oil-free hydration with calming botanical extracts.' },
        { step_name: 'Oil-Free Water Gel Moisturizer', product_category: 'Moisturizer', instructions: 'Hydrate without clogging pores.' },
        { step_name: 'Matte Invisible Sunscreen SPF 50', product_category: 'Sunscreen', instructions: 'Shine-free protective finish.' },
      ]);
    } else if (sType === 'DRY') {
      setMorningSteps([
        { step_name: 'Hydrating Ceramide Cleanser', product_category: 'Cleanser', instructions: 'Gentle non-stripping morning cleanse.' },
        { step_name: 'Multi-Molecular Hyaluronic Essence', product_category: 'Toner', instructions: 'Press into skin while damp.' },
        { step_name: 'Vitamin C + Squalane Glow Serum', product_category: 'Serum', instructions: 'Brighten complexion and nourish lipid barrier.' },
        { step_name: 'Rich Barrier Moisture Cream', product_category: 'Moisturizer', instructions: 'Lock in moisture and seal hydration.' },
        { step_name: 'Nourishing Hydrating SPF 50', product_category: 'Sunscreen', instructions: 'Dewy protective finish.' },
      ]);
    }
    setSafetyNotes(`Patch test before introducing new serums. Ensure adequate daily water intake.`);
    setSpecialistGuidance(`Holistic beauty routine tailored for ${client.skin_profile.skin_type} skin to boost radiance and strengthen barrier health.`);
    setRoutineModalOpen(true);
  };

  // Dispatch Routine
  const handleSaveRoutine = async () => {
    if (!selectedClient) return;
    setSavingRoutine(true);
    try {
      const payload: RecommendRoutinePayload = {
        morning_routine: morningSteps.map((s, idx) => ({ ...s, step_number: idx + 1 })),
        evening_routine: eveningSteps.map((s, idx) => ({ ...s, step_number: idx + 1 })),
        weekly_routine: weeklySteps.map((s, idx) => ({ ...s, step_number: idx + 1 })),
        safety_notes: safetyNotes,
        specialist_guidance: specialistGuidance,
      };

      await api.recommendRoutine(selectedClient.id, payload);
      showSuccess(`✓ Custom beauty routine successfully prescribed to ${selectedClient.name}!`);
      setRoutineModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to prescribe routine.');
    } finally {
      setSavingRoutine(false);
    }
  };

  // Open Proactive Outreach Modal
  const handleOpenProactiveOutreach = (client: ClientDetailedSummary) => {
    setSelectedClient(client);
    setOutreachSubject(`Skincare Recommendations & Routine Review for ${client.name}`);
    setOutreachMessage(`Hi ${client.name},\n\nI reviewed your latest skin score (${client.latest_score || 'recent profile'}) and noticed your skin type is ${client.skin_profile.skin_type}. I have some personalized lifestyle recommendations and product suggestions to help you achieve your skin goals.`);
    setOutreachModalOpen(true);
  };

  // Dispatch Proactive Outreach Message
  const handleSendProactiveOutreach = async () => {
    if (!selectedClient) return;
    if (!outreachSubject.trim() || !outreachMessage.trim()) {
      showError('Please provide both a subject and message.');
      return;
    }
    setSendingOutreach(true);
    try {
      await api.initiateClientContact(selectedClient.id, {
        subject: outreachSubject,
        message: outreachMessage,
      });
      showSuccess(`✓ Consultation initiated! Message sent directly to ${selectedClient.name}.`);
      setOutreachModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to initiate client consultation.');
    } finally {
      setSendingOutreach(false);
    }
  };

  // Open Product Recommender
  const handleOpenProductRecommender = (client: ClientDetailedSummary) => {
    setSelectedClient(client);
    setSelectedProductIds([]);
    setProductUsageNotes({});
    setGeneralProductNotes(`Recommended beauty formulations curated for your ${client.skin_profile.skin_type} skin.`);
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
    if (!selectedClient || selectedProductIds.length === 0) {
      showError('Please select at least one product to recommend.');
      return;
    }
    setSavingProducts(true);
    try {
      const usageMap: Record<string, string> = {};
      selectedProductIds.forEach((id) => {
        if (productUsageNotes[id]) {
          usageMap[id.toString()] = productUsageNotes[id];
        }
      });

      const payload: RecommendProductsPayload = {
        product_ids: selectedProductIds,
        notes: generalProductNotes,
        usage_schedule: usageMap,
      };

      await api.recommendProducts(selectedClient.id, payload);
      showSuccess(`✓ ${selectedProductIds.length} beauty products recommended to ${selectedClient.name}!`);
      setProductModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to recommend products.');
    } finally {
      setSavingProducts(false);
    }
  };

  // Open Ingredient Recommender
  const handleOpenIngredientRecommender = (client: ClientDetailedSummary) => {
    setSelectedClient(client);
    const sType = client.skin_profile?.skin_type?.toUpperCase() || 'COMBINATION';
    
    let defaultIngs = [
      {
        name: 'Niacinamide (Vitamin B3)',
        category: 'Pore Refining & Sebum Regulation',
        concentration: '5%',
        frequency: 'Daily (AM/PM)',
        target_concern: client.skin_profile.concerns[0] || 'Skin Clarity',
        application_notes: 'Apply after cleansing to smooth texture and strengthen barrier.'
      },
      {
        name: 'Multi-Molecular Hyaluronic Acid',
        category: 'Humectant & Dermal Hydration',
        concentration: '2%',
        frequency: 'Daily (AM/PM)',
        target_concern: 'Hydration Recovery',
        application_notes: 'Pat gently onto damp skin to maximize trans-epidermal moisture.'
      }
    ];

    if (sType === 'DRY') {
      defaultIngs.push({
        name: 'Triple Ceramide Complex (NP, AP, EOP)',
        category: 'Lipid Barrier Restorative',
        concentration: '3%',
        frequency: 'Nightly',
        target_concern: 'Barrier Lipid Replenishment',
        application_notes: 'Nourish lipid matrix and seal moisture.'
      });
    } else if (sType === 'OILY') {
      defaultIngs.push({
        name: 'Zinc PCA + Salicylic Acid (BHA)',
        category: 'Lipophilic Exfoliation & Sebum Control',
        concentration: '1.5%',
        frequency: 'Alternate Nights',
        target_concern: 'Pore Congestion',
        application_notes: 'Clear follicular debris and minimize shine.'
      });
    }

    setSelectedIngredients(defaultIngs);
    setIngredientGuidance(`Targeted active botanicals and cosmeceutical actives to support ${client.skin_profile.skin_type} skin radiance and cellular health.`);
    setIngredientModalOpen(true);
  };

  // Dispatch Ingredients
  const handleSaveIngredients = async () => {
    if (!selectedClient || selectedIngredients.length === 0) {
      showError('Please select at least one active ingredient.');
      return;
    }
    setSavingIngredients(true);
    try {
      await api.recommendIngredients(selectedClient.id, {
        ingredients: selectedIngredients,
        clinical_guidance: ingredientGuidance,
      });
      showSuccess(`✓ ${selectedIngredients.length} active ingredients successfully recommended to ${selectedClient.name}!`);
      setIngredientModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to recommend ingredients.');
    } finally {
      setSavingIngredients(false);
    }
  };

  // Open Dossier Modal
  const handleOpenDossier = async (client: ClientDetailedSummary) => {
    setSelectedClient(client);
    setDossierModalOpen(true);
    setLoadingDossier(true);
    try {
      const dossier = await api.getClientFullDossier(client.id);
      setClientDossier(dossier);
    } catch (err: any) {
      showError(err.message || 'Failed to load client dossier.');
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
      showSuccess(`✓ Consultation response saved & sent to client!`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to respond to consultation.');
    } finally {
      setReplyingId(null);
    }
  };

  const totalPendingConsultations = consultations.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      {/* 1. Specialist Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2c1a0e] via-[#142820] to-[#0a1813] text-white p-6 sm:p-8 shadow-xl border border-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-extrabold rounded-full border border-amber-400/30 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles size={13} className="text-amber-300" />
                Aesthetic Skincare & Lifestyle Consultant Workspace
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-400/30 flex items-center gap-1">
                <Smile size={13} /> Certified Aesthetician & Beauty Coach
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Consultant {user?.name || 'Practitioner'} • Beauty & Lifestyle Regimen Center
            </h1>
            <p className="text-sm text-amber-100/80 mt-1 max-w-2xl leading-relaxed">
              Holistic skin analysis, daily barrier hydration coaching, 7-step morning/evening glow ritual builder, and direct client aesthetic consultations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('products')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-2"
            >
              <ShoppingBag size={15} /> Cosmeceutical Catalog
            </button>
            <button
              onClick={() => onNavigate('ingredients')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Compass size={15} /> INCI Botanical Codex
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-amber-800/40">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-amber-500/20">
            <div className="flex items-center justify-between text-amber-300 mb-1">
              <span className="text-xs font-semibold">Managed Clients</span>
              <Users size={16} />
            </div>
            <div className="text-2xl font-black text-white">{clients.length}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-amber-500/20">
            <div className="flex items-center justify-between text-amber-300 mb-1">
              <span className="text-xs font-semibold">Pending Inquiries</span>
              <Clock size={16} />
            </div>
            <div className="text-2xl font-black text-white">{totalPendingConsultations}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-cyan-300 mb-1">
              <span className="text-xs font-semibold">Beauty Routines Created</span>
              <Layers size={16} />
            </div>
            <div className="text-2xl font-black text-white">
              {clients.reduce((acc, c) => acc + c.total_routines, 0)}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-emerald-300 mb-1">
              <span className="text-xs font-semibold">Curated Formulations</span>
              <ShoppingBag size={16} />
            </div>
            <div className="text-2xl font-black text-white">{catalogProducts.length}</div>
          </div>
        </div>
      </div>

      {/* 2. Client Management & Skin Concerns Directory */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-teal-700" size={20} />
              Client Skin Profiles, Lifestyle Factors & Regimen Builder
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect user skin concerns, review lifestyle impacts, build custom beauty rituals, and initiate proactive outreach.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search name, concern, skin type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-teal-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 mr-1">
            <Filter size={13} /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Clients' },
            { id: 'PENDING', label: `Pending Inquiries (${totalPendingConsultations})` },
            { id: 'LIFESTYLE', label: 'Lifestyle Deficits (Sleep/Water)' },
            { id: 'ACNE', label: 'Acne & Congestion' },
            { id: 'HYPERPIGMENTATION', label: 'Dullness / Dark Spots' },
            { id: 'BARRIER', label: 'Barrier / Dehydration' },
            { id: 'SENSITIVE', label: 'Sensitive Skin' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setConcernFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                concernFilter === f.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Client Cards Grid */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading client roster and lifestyle intelligence...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
            <Users size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No clients matched your criteria</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or concern filter to inspect client skin intelligence profiles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map((client) => {
              const skinType = client.skin_profile.skin_type || 'NOT_CONFIGURED';
              const concerns = client.skin_profile.concerns;
              const hasPending = client.pending_consultations > 0;
              const sleepHrs = client.skin_profile.lifestyle_sleep;
              const waterLiters = client.skin_profile.lifestyle_hydration;

              return (
                <div
                  key={client.id}
                  className="rounded-2xl border border-slate-200/90 bg-white hover:border-teal-500/60 hover:shadow-md transition p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-teal-800 transition line-clamp-1">
                            {client.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                            {client.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {client.latest_score ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80">
                            <Activity size={12} className="text-teal-600" />
                            {client.latest_score}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            No Scan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skin Type & Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {skinType} Skin
                      </span>
                      {hasPending && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          Inquiry Waiting
                        </span>
                      )}
                    </div>

                    {/* Lifestyle Indicators Bar */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-3 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">Hydration:</span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1">
                          <Droplets size={12} className="text-cyan-600" />
                          {waterLiters ? `${waterLiters} L / day` : 'Not recorded'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">Sleep:</span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1">
                          <Moon size={12} className="text-indigo-600" />
                          {sleepHrs ? `${sleepHrs} hrs / night` : 'Not recorded'}
                        </span>
                      </div>
                    </div>

                    {/* Skin Concerns List */}
                    <div className="space-y-1 mb-4">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Skin Goals & Concerns:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {concerns.length > 0 ? (
                          concerns.map((con, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-teal-50/80 text-teal-900 border border-teal-100"
                            >
                              #{con}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">General maintenance</span>
                        )}
                      </div>
                    </div>

                    {/* Sensitivities */}
                    {(client.skin_profile.allergies.length > 0 || client.skin_profile.sensitivities.length > 0) && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] mb-3 flex items-start gap-1.5">
                        <ShieldAlert size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Avoid: </span>
                          {client.skin_profile.allergies.concat(client.skin_profile.sensitivities).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleOpenRoutineBuilder(client)}
                        className="btn-primary text-[11px] py-1.5 px-1.5 flex items-center justify-center gap-1 font-bold shadow-2xs"
                        title="Prescribe 7-Step AM/PM Routine"
                      >
                        <Layers size={12} /> Routine
                      </button>
                      <button
                        onClick={() => handleOpenProductRecommender(client)}
                        className="btn-secondary text-[11px] py-1.5 px-1.5 flex items-center justify-center gap-1 font-bold"
                        title="Recommend Formulations"
                      >
                        <ShoppingBag size={12} /> Products
                      </button>
                      <button
                        onClick={() => handleOpenIngredientRecommender(client)}
                        className="py-1.5 px-1.5 text-[11px] font-bold text-amber-900 bg-amber-100/70 hover:bg-amber-100 rounded-lg transition border border-amber-300 flex items-center justify-center gap-1"
                        title="Suggest Active Ingredients & Botanicals"
                      >
                        <Compass size={12} /> Actives
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenProactiveOutreach(client)}
                        className="py-1.5 text-center text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition border border-teal-200 flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={13} /> Message Client
                      </button>
                      <button
                        onClick={() => handleOpenDossier(client)}
                        className="py-1.5 text-center text-xs font-bold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200 flex items-center justify-center gap-1"
                      >
                        <Eye size={13} /> Full Dossier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Consultation Inquiries & Direct Messages */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <HeartHandshake className="text-teal-700" size={20} />
              Consultation Inquiries & Direct Client Communications ({consultations.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct discussions with clients seeking aesthetic coaching, routine reviews, and product advice.
            </p>
          </div>
        </div>

        {consultations.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No consultation inquiries received yet. You can also proactively message clients above!
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
                      {consult.client?.name || `Client #${consult.client_id}`}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">{consult.subject}</span>
                    {consult.primary_concern && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
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
                  <div className="text-xs text-teal-900 bg-teal-50/80 p-3 rounded-xl border border-teal-200/80 mb-3">
                    <span className="font-bold">Consultation Guidance: </span>
                    {consult.response_notes}
                  </div>
                )}

                {/* Quick Reply Form */}
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Type aesthetic recommendations or consultation advice to send to client..."
                    value={replyText[consult.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [consult.id]: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-teal-600 font-medium"
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
                      className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 font-bold"
                    >
                      {replyingId === consult.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      Send Advice & Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PROACTIVE CLIENT OUTREACH                                       */}
      {/* ========================================================================= */}
      {outreachModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-teal-700" size={18} />
                <h3 className="text-base font-black text-slate-900">
                  Initiate Consultation with {selectedClient.name}
                </h3>
              </div>
              <button
                onClick={() => setOutreachModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-200 space-y-1">
              <span className="font-bold text-teal-950 block">Target Client: {selectedClient.name}</span>
              <span className="text-teal-800 text-[11px]">
                Skin Type: <strong>{selectedClient.skin_profile.skin_type}</strong> • Concerns: {selectedClient.skin_profile.concerns.join(', ') || 'General'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Message Subject:
                </label>
                <input
                  type="text"
                  value={outreachSubject}
                  onChange={(e) => setOutreachSubject(e.target.value)}
                  placeholder="e.g. Personalized Routine Review & Barrier Guidance"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Aesthetician Advice & Consultation Message:
                </label>
                <textarea
                  rows={4}
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                  placeholder="Share routine tips, lifestyle advice, or invite the client to discuss their skin concerns..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-teal-600 leading-relaxed"
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
                className="btn-primary text-xs px-5 py-2.5 font-extrabold shadow-md flex items-center gap-1.5"
              >
                {sendingOutreach ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Send Direct Message to {selectedClient.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRESCRIBE CUSTOM ROUTINE                                        */}
      {/* ========================================================================= */}
      {routineModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Beauty Regimen Engine
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Prescribe Custom Beauty Routine for {selectedClient.name}
                </h3>
                <p className="text-xs text-teal-100/80 mt-0.5">
                  Skin Type: <strong className="text-white">{selectedClient.skin_profile.skin_type}</strong> • Concerns: {selectedClient.skin_profile.concerns.join(', ') || 'General Health'}
                </p>
              </div>
              <button
                onClick={() => setRoutineModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Morning Routine */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                    <Sun size={16} className="text-amber-500" /> Morning Beauty Steps (AM)
                  </h4>
                  <button
                    onClick={() =>
                      setMorningSteps([
                        ...morningSteps,
                        { step_name: 'Radiance Booster', product_category: 'Serum', instructions: 'Apply 3 drops gently.' },
                      ])
                    }
                    className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Step
                  </button>
                </div>

                <div className="space-y-2.5">
                  {morningSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Step Name"
                          value={step.step_name}
                          onChange={(e) => {
                            const updated = [...morningSteps];
                            updated[idx].step_name = e.target.value;
                            setMorningSteps(updated);
                          }}
                          className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                        />
                        <input
                          type="text"
                          placeholder="Category"
                          value={step.product_category}
                          onChange={(e) => {
                            const updated = [...morningSteps];
                            updated[idx].product_category = e.target.value;
                            setMorningSteps(updated);
                          }}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Application technique & frequency"
                          value={step.instructions}
                          onChange={(e) => {
                            const updated = [...morningSteps];
                            updated[idx].instructions = e.target.value;
                            setMorningSteps(updated);
                          }}
                          className="sm:col-span-2 p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                        />
                      </div>
                      <button
                        onClick={() => setMorningSteps(morningSteps.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evening Routine */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                    <Moon size={16} className="text-indigo-600" /> Evening Restoration Steps (PM)
                  </h4>
                  <button
                    onClick={() =>
                      setEveningSteps([
                        ...eveningSteps,
                        { step_name: 'Barrier Recovery Cream', product_category: 'Moisturizer', instructions: 'Massage before sleep.' },
                      ])
                    }
                    className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Step
                  </button>
                </div>

                <div className="space-y-2.5">
                  {eveningSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Step Name"
                          value={step.step_name}
                          onChange={(e) => {
                            const updated = [...eveningSteps];
                            updated[idx].step_name = e.target.value;
                            setEveningSteps(updated);
                          }}
                          className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                        />
                        <input
                          type="text"
                          placeholder="Category"
                          value={step.product_category}
                          onChange={(e) => {
                            const updated = [...eveningSteps];
                            updated[idx].product_category = e.target.value;
                            setEveningSteps(updated);
                          }}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Application technique"
                          value={step.instructions}
                          onChange={(e) => {
                            const updated = [...eveningSteps];
                            updated[idx].instructions = e.target.value;
                            setEveningSteps(updated);
                          }}
                          className="sm:col-span-2 p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                        />
                      </div>
                      <button
                        onClick={() => setEveningSteps(eveningSteps.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guidance */}
              <div className="space-y-3 pt-2">
                <label className="font-extrabold text-slate-900 block">
                  Consultant Holistic Advice & Lifestyle Tips:
                </label>
                <textarea
                  rows={2}
                  value={specialistGuidance}
                  onChange={(e) => setSpecialistGuidance(e.target.value)}
                  placeholder="Provide personalized tips on hydration, pillowcases, facial massage, or lifestyle..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />

                <label className="font-extrabold text-slate-900 block mt-2">
                  Safety Notes & Patch Testing Instructions:
                </label>
                <textarea
                  rows={2}
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  placeholder="e.g. Always patch test behind the ear. Discontinue use if redness occurs."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setRoutineModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoutine}
                disabled={savingRoutine}
                className="btn-primary text-xs px-6 py-2.5 font-extrabold shadow-md flex items-center gap-2"
              >
                {savingRoutine ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Prescribe & Dispatch Routine to {selectedClient.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECOMMEND PRODUCTS TO CLIENT                                    */}
      {/* ========================================================================= */}
      {productModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Cosmeceutical Recommender
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Curate Beauty Formulations for {selectedClient.name}
                </h3>
                <p className="text-xs text-teal-100/80 mt-0.5">
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
                  placeholder="Filter catalog by brand, product name, or category..."
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
                            ? 'bg-teal-50/80 border-teal-500 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProduct(p.id)}
                          className="mt-1 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
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
                    Application Instructions for Selected Formulations:
                  </h4>
                  {selectedProductIds.map((id) => {
                    const prod = catalogProducts.find((p) => p.id === id);
                    if (!prod) return null;
                    return (
                      <div key={id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{prod.name}</span>
                          <span className="text-[10px] font-bold text-teal-700">{prod.brand}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Apply 2-3 drops after toner every morning"
                          value={productUsageNotes[id] || ''}
                          onChange={(e) => setProductUsageNotes({ ...productUsageNotes, [id]: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="font-extrabold text-slate-900 block">
                  General Cosmeceutical Advice:
                </label>
                <textarea
                  rows={2}
                  value={generalProductNotes}
                  onChange={(e) => setGeneralProductNotes(e.target.value)}
                  placeholder="Explain why these products support their glow and barrier..."
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
                className="btn-primary text-xs px-6 py-2.5 font-extrabold shadow-md flex items-center gap-2"
              >
                {savingProducts ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send {selectedProductIds.length} Recommendations to {selectedClient.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FULL CLIENT DOSSIER & HISTORY                                   */}
      {/* ========================================================================= */}
      {dossierModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Client Skin Intelligence Dossier
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {selectedClient.name} • Full Aesthetic & Lifestyle Profile
                </h3>
                <p className="text-xs text-teal-100/80 mt-0.5">
                  {selectedClient.email} • {selectedClient.country || 'Global'}
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
                  <Loader2 size={28} className="animate-spin text-teal-600" />
                  <p className="text-slate-500 font-medium">Fetching longitudinal data...</p>
                </div>
              ) : clientDossier ? (
                <div className="space-y-6">
                  {clientDossier.latest_score && (
                    <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-teal-900 text-sm">
                          Latest AuraScore: {clientDossier.latest_score.total_score} / 100
                        </span>
                        <span className="text-[11px] text-teal-700 font-medium">
                          Recorded: {new Date(clientDossier.latest_score.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                        <div className="bg-white p-2 rounded-xl border border-teal-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Hydration</span>
                          <span className="text-sm font-black text-slate-800">{clientDossier.latest_score.hydration_score}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-teal-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Barrier</span>
                          <span className="text-sm font-black text-slate-800">{clientDossier.latest_score.barrier_integrity_score}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-teal-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Clarity</span>
                          <span className="text-sm font-black text-slate-800">{clientDossier.latest_score.clarity_score}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-teal-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Resilience</span>
                          <span className="text-sm font-black text-slate-800">{clientDossier.latest_score.resilience_score}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-teal-100">
                          <span className="text-[10px] text-slate-400 block font-bold">Resistance</span>
                          <span className="text-sm font-black text-slate-800">{clientDossier.latest_score.environmental_resistance_score}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {clientDossier.current_routine && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Layers size={16} className="text-teal-700" /> Currently Prescribed Beauty Routine
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-amber-700 block mb-1">Morning AM Steps:</span>
                          <ul className="space-y-1 list-disc list-inside text-slate-600">
                            {clientDossier.current_routine.morning_routine.map((s: any, idx: number) => (
                              <li key={idx}><span className="font-semibold text-slate-800">{s.step_name}</span> ({s.product_category})</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-indigo-700 block mb-1">Evening PM Steps:</span>
                          <ul className="space-y-1 list-disc list-inside text-slate-600">
                            {clientDossier.current_routine.evening_routine.map((s: any, idx: number) => (
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
                    handleOpenRoutineBuilder(selectedClient);
                  }}
                  className="btn-primary text-xs px-3 py-2 font-bold flex items-center gap-1"
                >
                  <Layers size={13} /> Prescribe Routine
                </button>
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    handleOpenProductRecommender(selectedClient);
                  }}
                  className="btn-secondary text-xs px-3 py-2 font-bold flex items-center gap-1"
                >
                  <ShoppingBag size={13} /> Add Products
                </button>
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    handleOpenIngredientRecommender(selectedClient);
                  }}
                  className="px-3 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition border border-amber-300 flex items-center gap-1"
                >
                  <Compass size={13} /> Suggest Actives
                </button>
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    handleOpenProactiveOutreach(selectedClient);
                  }}
                  className="btn-secondary text-xs px-3 py-2 font-bold flex items-center gap-1"
                >
                  <MessageSquare size={13} /> Message
                </button>
              </div>

              <button
                onClick={() => setDossierModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SUGGEST ACTIVE INGREDIENTS & BOTANICALS                          */}
      {/* ========================================================================= */}
      {ingredientModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up text-xs">
            <div className="p-6 bg-gradient-to-r from-amber-950 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Cosmeceutical Active Ingredients Library
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Suggest Active Ingredients for {selectedClient.name}
                </h3>
                <p className="text-xs text-amber-100/80 mt-0.5">
                  Skin Type: <strong className="text-white">{selectedClient.skin_profile.skin_type}</strong> • Concerns: {selectedClient.skin_profile.concerns.join(', ') || 'General Radiance'}
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
              {/* Preset Ingredients Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Compass size={15} className="text-amber-600" /> Prescribed Actives & Cosmeceuticals ({selectedIngredients.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedIngredients([
                        ...selectedIngredients,
                        {
                          name: 'Centella Asiatica (Cica Extract)',
                          category: 'Botanical Soother',
                          concentration: '10%',
                          frequency: 'Daily (AM/PM)',
                          target_concern: 'Redness & Barrier Support',
                          application_notes: 'Calms inflammation and accelerates dermal healing.'
                        }
                      ]);
                    }}
                    className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Custom Active
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedIngredients.map((ing, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => {
                            const updated = [...selectedIngredients];
                            updated[idx].name = e.target.value;
                            setSelectedIngredients(updated);
                          }}
                          placeholder="Ingredient Name (e.g. Niacinamide)"
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
                          <label className="font-bold text-slate-600 block text-[10px]">Concentration:</label>
                          <input
                            type="text"
                            value={ing.concentration}
                            onChange={(e) => {
                              const updated = [...selectedIngredients];
                              updated[idx].concentration = e.target.value;
                              setSelectedIngredients(updated);
                            }}
                            placeholder="e.g. 5% or 200mg"
                            className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 font-medium text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block text-[10px]">Application Time:</label>
                          <select
                            value={ing.frequency}
                            onChange={(e) => {
                              const updated = [...selectedIngredients];
                              updated[idx].frequency = e.target.value;
                              setSelectedIngredients(updated);
                            }}
                            className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 font-medium text-xs"
                          >
                            <option value="Daily (AM/PM)">Daily (AM/PM)</option>
                            <option value="Morning Only (AM)">Morning Only (AM)</option>
                            <option value="Evening Only (PM)">Evening Only (PM)</option>
                            <option value="Alternate Nights (2-3x/week)">Alternate Nights (2-3x/week)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block text-[10px]">Target Goal:</label>
                          <input
                            type="text"
                            value={ing.target_concern}
                            onChange={(e) => {
                              const updated = [...selectedIngredients];
                              updated[idx].target_concern = e.target.value;
                              setSelectedIngredients(updated);
                            }}
                            placeholder="e.g. Barrier repair"
                            className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 font-medium text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 block text-[10px]">Specialist Instructions:</label>
                        <input
                          type="text"
                          value={ing.application_notes}
                          onChange={(e) => {
                            const updated = [...selectedIngredients];
                            updated[idx].application_notes = e.target.value;
                            setSelectedIngredients(updated);
                          }}
                          placeholder="e.g. Apply before heavier moisturizer, avoid mixing with strong acids."
                          className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Add Presets Palette */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Quick Add Verified Cosmeceutical Actives:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Vitamin C (L-Ascorbic 15%)', cat: 'Antioxidant', conc: '15%', freq: 'Morning Only (AM)', goal: 'Radiance & Photoprotection', notes: 'Apply AM under SPF 50.' },
                    { name: 'Matrixyl 3000 & Copper Peptides', cat: 'Peptide Complex', conc: '5%', freq: 'Daily (AM/PM)', goal: 'Dermal Elasticity', notes: 'Smooth over face and neck.' },
                    { name: 'Plant-Derived Squalane', cat: 'Lipid Emollient', conc: '100%', freq: 'Evening Only (PM)', goal: 'Lipid Barrier Recovery', notes: 'Press 2-3 drops over moisturizer.' },
                    { name: 'Azelaic Acid (10%)', cat: 'Dicarboxylic Acid', conc: '10%', freq: 'Daily (AM/PM)', goal: 'Redness & Post-Blemish Marks', notes: 'Smooth over target areas.' },
                    { name: 'Bakuchiol (Retinol Alternative)', cat: 'Botanical Retinoid', conc: '1%', freq: 'Evening Only (PM)', goal: 'Gentle Cell Renewal', notes: 'Ideal for sensitive skin.' },
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
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 hover:text-amber-900 border border-slate-200 text-slate-700 font-bold text-[11px] transition shadow-2xs flex items-center gap-1"
                    >
                      <Plus size={11} className="text-amber-600" /> {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialist Guidance */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-900 block">
                  Aesthetician Advice & Interaction Warnings:
                </label>
                <textarea
                  rows={2}
                  value={ingredientGuidance}
                  onChange={(e) => setIngredientGuidance(e.target.value)}
                  placeholder="e.g. Introduce one active at a time. Patch test for 48 hours before full facial application."
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
                className="btn-primary text-xs px-6 py-2.5 font-extrabold shadow-md flex items-center gap-2"
              >
                {savingIngredients ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Prescribe {selectedIngredients.length} Actives to {selectedClient.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
