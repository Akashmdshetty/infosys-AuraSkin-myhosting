// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const HEALTH_URL = import.meta.env.VITE_HEALTH_URL || '/health';

export type Role = 'USER' | 'SKINCARE_CONSULTANT' | 'DERMATOLOGIST' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type SkinType = 'NORMAL' | 'DRY' | 'OILY' | 'COMBINATION' | 'SENSITIVE';
export type StressLevel = 'LOW' | 'MODERATE' | 'HIGH';
export type SleepQuality = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface ProfessionalProfile {
  id: number;
  professional_title?: string | null;
  qualifications?: string | null;
  certifications?: string | null;
  years_experience?: number | null;
  area_of_expertise?: string | null;
  organization?: string | null;
  registration_number?: string | null;
  country?: string | null;
  verification_docs_notes?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  requested_role?: Role;
  verification_status: VerificationStatus;
  email_verified: boolean;
  age?: number | null;
  country?: string | null;
  created_at: string;
  updated_at: string;
  professional_profile?: ProfessionalProfile | null;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface SkinProfile {
  id: number;
  user_id: number;
  skin_type: SkinType;
  skin_concerns: string[];
  allergies?: string | null;
  sensitivities?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LifestyleProfile {
  id: number;
  user_id: number;
  lifestyle_habits?: string | null;
  stress_level: StressLevel;
  created_at: string;
  updated_at: string;
}

export interface SleepRecord {
  id: number;
  user_id: number;
  sleep_hours: number;
  sleep_quality: SleepQuality;
  recorded_at: string;
}

export interface HydrationRecord {
  id: number;
  user_id: number;
  water_consumed: number;
  humidity?: number | null;
  recorded_at: string;
}

export interface EnvironmentalExposure {
  id: number;
  user_id: number;
  sun_exposure_hours: number;
  recorded_at: string;
}

// Milestone 2 Intelligence Interfaces
export interface SkinAssessment {
  id: number;
  user_id: number;
  primary_concern: string;
  secondary_concerns: string[];
  risk_factors: string[];
  supporting_factors: string[];
  data_completeness: number;
  confidence_score: number;
  raw_payload?: any;
  created_at: string;
}

export interface ScoreComponentDetail {
  earned: number;
  max_possible: number;
  label: string;
  explanation: string;
  normalized_score?: number;
  weight?: number;
}

export interface SkinHealthScore {
  id: number;
  user_id: number;
  assessment_id?: number | null;
  total_score: number;
  skin_condition_score: number;
  lifestyle_score: number;
  sleep_score: number;
  routine_consistency_score: number;
  hydration_score: number;
  breakdown_components: ScoreComponentDetail[];
  top_impact_factors: string[];
  created_at: string;
}

export interface RoutineStep {
  step_number: number;
  category: string;
  product_type: string;
  key_ingredients: string[];
  instructions: string;
  frequency: string;
  safety_notes?: string | null;
}

export interface SkincareRoutine {
  id: number;
  user_id: number;
  assessment_id?: number | null;
  morning_routine: RoutineStep[];
  evening_routine: RoutineStep[];
  weekly_routine: RoutineStep[];
  seasonal_notes?: string | null;
  safety_notes?: string | null;
  created_at: string;
}

export interface Recommendation {
  id: number;
  user_id: number;
  assessment_id?: number | null;
  recommendation_type: string;
  ingredient_or_category: string;
  reason: string;
  user_factor_trigger?: string | null;
  target_concern?: string | null;
  precautions?: string | null;
  evidence_reference?: string | null;
  created_at: string;
}

export interface SkinIntelligenceReport {
  user_summary: Record<string, any>;
  skin_profile: Record<string, any>;
  overall_skin_health_score: number;
  score_breakdown: ScoreComponentDetail[];
  primary_concern: string;
  secondary_concerns: string[];
  risk_factors: string[];
  positive_factors: string[];
  morning_routine: RoutineStep[];
  evening_routine: RoutineStep[];
  weekly_routine: RoutineStep[];
  ingredient_recommendations: Recommendation[];
  product_category_recommendations: Recommendation[];
  why_these_recommendations: Array<{ recommendation: string; reason: string; trigger: string }>;
  safety_notes: string[];
  evidence_references: Array<{ recommendation: string; evidence: string }>;
  assessment_confidence: number;
  data_completeness: number;
  confidence_explanation: string;
  recommended_next_steps: string[];
  generated_at: string;
}

export interface PlatformAnalytics {
  total_users: number;
  clients_count: number;
  consultants_count: number;
  dermatologists_count: number;
  verified_professionals_count?: number;
  pending_verifications: number;
  total_assessments_run: number;
  average_skin_health_score: number;
  total_catalog_products?: number;
  total_recommendations_computed?: number;
  total_progress_snapshots?: number;
  total_adherence_logs?: number;
  average_adherence_rate_pct?: number;
  total_notifications_dispatched?: number;
  system_status?: string;
  database_health?: string;
  version?: string;
}

// Milestone 4 Notifications & Reminders Types
export type NotificationType = 'AM_ROUTINE' | 'PM_ROUTINE' | 'HYDRATION' | 'SLEEP' | 'REPLENISHMENT' | 'MILESTONE' | 'SYSTEM';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  read_at?: string | null;
  action_url?: string | null;
  metadata_json?: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  unread_count: number;
}

export interface NotificationPreferences {
  user_id: number;
  email_enabled: boolean;
  in_app_enabled: boolean;
  am_routine_reminder: boolean;
  pm_routine_reminder: boolean;
  hydration_reminder: boolean;
  sleep_reminder: boolean;
  replenishment_reminder: boolean;
  milestone_alerts: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  updated_at?: string | null;
}

export interface SystemHealthResponse {
  status: string;
  database: string;
  version: string;
  timestamp?: string;
  services?: Record<string, string>;
}

export interface ClientOverviewResponse {
  client: {
    id: number;
    name: string;
    email: string;
    age?: number | null;
    country?: string | null;
  };
  skin_profile: {
    skin_type: string;
    concerns: string;
    allergies: string;
    sensitivities: string;
  };
  latest_aurascore?: number | null;
  primary_concern?: string | null;
  assessment_confidence?: number | null;
  total_progress_snapshots: number;
  average_adherence_pct: number;
}

export interface ClientSkinProfileDetail {
  skin_type: string;
  concerns: string[];
  allergies: string[];
  sensitivities: string[];
  lifestyle_sleep?: number | null;
  lifestyle_hydration?: number | null;
  lifestyle_stress?: string | null;
  lifestyle_sun_exposure?: string | null;
}

export interface ClientDetailedSummary {
  id: number;
  name: string;
  email: string;
  age?: number | null;
  country?: string | null;
  created_at: string;
  skin_profile: ClientSkinProfileDetail;
  latest_score?: number | null;
  latest_primary_concern?: string | null;
  assessment_confidence?: number | null;
  total_progress_snapshots: number;
  total_routines: number;
  total_consultations: number;
  pending_consultations: number;
  clinical_risk_tier: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface RecommendRoutinePayload {
  morning_routine: Array<{
    step_number?: number;
    step_name: string;
    product_category?: string;
    instructions?: string;
    key_active_ingredients?: string[];
  }>;
  evening_routine: Array<{
    step_number?: number;
    step_name: string;
    product_category?: string;
    instructions?: string;
    key_active_ingredients?: string[];
  }>;
  weekly_routine?: Array<{
    step_number?: number;
    step_name: string;
    frequency?: string;
    instructions?: string;
  }>;
  safety_notes?: string;
  seasonal_notes?: string;
  specialist_guidance?: string;
  clinical_followup_weeks?: number;
}

export interface RecommendProductsPayload {
  product_ids: number[];
  notes?: string;
  usage_schedule?: Record<string, string>;
}

export interface IngredientRecommendationItem {
  name: string;
  category?: string;
  concentration?: string;
  frequency?: string;
  target_concern: string;
  application_notes?: string;
}

export interface RecommendIngredientsPayload {
  ingredients: IngredientRecommendationItem[];
  clinical_guidance?: string;
  contraindications_to_avoid?: string[];
}



export interface ConsultationRequest {
  id: number;
  client_id: number;
  professional_id: number;
  subject: string;
  message: string;
  primary_concern?: string | null;
  status: string;
  response_notes?: string | null;
  created_at: string;
  client?: User | null;
  professional?: User | null;
}

// Milestone 3 Interfaces
export interface IngredientInteractionDetail {
  with_ingredient: string;
  interaction_type: 'CONFLICT' | 'CAUTION' | 'SYNERGISTIC' | 'NEUTRAL';
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  explanation: string;
}

export interface IngredientDetail {
  name: string;
  category: string;
  primary_benefits: string;
  suitable_skin_types: string[];
  target_concerns: string[];
  conflicting_ingredients: string[];
  sensitivity_warnings: string;
  evidence_level: string;
  source_reference: string;
  review_date?: string;
  common_uses?: string;
  precautions?: string;
  interactions?: IngredientInteractionDetail[];
}

export interface IngredientAnalysisResult {
  ingredient: string;
  suitable: boolean;
  reason: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' | 'CAUTION' | 'UNKNOWN' | 'CONFLICT';
  category?: string;
  benefits?: string;
  precautions?: string;
  evidence_reference?: string;
}

export interface IngredientSuitabilityResponse {
  user_skin_type: string;
  has_compromised_barrier: boolean;
  total_analyzed: number;
  suitable_count: number;
  conflict_count: number;
  results: IngredientAnalysisResult[];
  overall_safety_summary: string;
  general_precautions: string[];
}

export interface IngredientInteractionCheckResponse {
  has_conflicts: boolean;
  conflict_count: number;
  interactions: IngredientInteractionDetail[];
  recommendation: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  ingredients: string;
  active_ingredients: string;
  skin_types: string[];
  skin_concerns: string[];
  fragrance_free: boolean;
  alcohol_free: boolean;
  cruelty_free: boolean;
  status: string;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductScoreBreakdown {
  skin_type_points: number;
  concern_match_points: number;
  ingredient_compatibility_points: number;
  barrier_support_points: number;
  routine_compatibility_points: number;
  total_score: number;
}

export interface ProductSuitabilityDetail {
  product: Product;
  suitability_score: number;
  recommended: boolean;
  reasons: string[];
  matching_concerns: string[];
  compatible_ingredients: string[];
  potential_conflicts: string[];
  price: number;
  budget_fit: string;
  score_breakdown?: ProductScoreBreakdown;
}

export interface ProductRecommendationResponse {
  user_skin_type: string;
  primary_concern: string;
  total_matches: number;
  recommendations: ProductSuitabilityDetail[];
  budget_filter_applied?: number | null;
  top_recommended_category?: string | null;
}

export interface ProductComparisonItem {
  product: Product;
  suitability_score: number;
  is_safe_for_user: boolean;
  reasons: string[];
  allergen_conflicts: string[];
  sensitivity_conflicts: string[];
  key_actives: string[];
  target_concerns_addressed: string[];
  barrier_support: boolean;
  fragrance_free: boolean;
  price: number;
}

export interface ProductComparisonResponse {
  compared_products: ProductComparisonItem[];
  best_match_id?: number | null;
  best_value_id?: number | null;
  summary_verdict: string;
}

export interface AlternativeProductsResponse {
  unsuitable_product: Product;
  unsuitability_reason: string;
  alternatives: ProductSuitabilityDetail[];
}

export interface ProgressRecord {
  id: number;
  user_id: number;
  assessment_id?: number | null;
  total_score: number;
  skin_condition_score: number;
  lifestyle_score: number;
  sleep_score: number;
  routine_consistency_score: number;
  hydration_score: number;
  concern_levels?: Record<string, number> | null;
  barrier_status?: string | null;
  notes?: string | null;
  recorded_at: string;
}

export interface RoutineAdherenceRecord {
  id: number;
  user_id: number;
  date: string;
  morning_completed: boolean;
  evening_completed: boolean;
  completed_steps: string[];
  missed_steps: string[];
  adherence_rate: number;
  notes?: string | null;
  created_at: string;
}

export interface ScoreTrendPoint {
  date: string;
  total_score: number;
  skin_condition_score: number;
  lifestyle_score: number;
  sleep_score: number;
  hydration_score: number;
  routine_consistency_score: number;
}

export interface ConcernTrendItem {
  concern: string;
  initial_severity: number;
  current_severity: number;
  status: 'IMPROVED' | 'STABLE' | 'WORSENED';
}

export interface ProgressTrendsResponse {
  overall_change: string;
  trend: 'improving' | 'stable' | 'declining';
  routine_adherence_change: string;
  hydration_change: string;
  sleep_change: string;
  lifestyle_change: string;
  major_improvements: string[];
  historical_points: ScoreTrendPoint[];
  recent_adherence_rate: number;
  concern_trends: ConcernTrendItem[];
}

export interface MetricComparisonDetail {
  metric_name: string;
  baseline_value: number;
  current_value: number;
  change_value: number;
  change_percentage: string;
  status: 'IMPROVED' | 'STABLE' | 'DECLINED';
  interpretation: string;
}

export interface BeforeAfterComparisonResponse {
  baseline_date: string;
  current_date: string;
  baseline_score: number;
  current_score: number;
  overall_status: 'IMPROVED' | 'STABLE' | 'DECLINED';
  metrics: MetricComparisonDetail[];
  concern_comparisons: ConcernTrendItem[];
  clinical_summary: string;
}

// Token helper
export const getToken = (): string | null => localStorage.getItem('auraskin_token');
export const setToken = (token: string) => localStorage.setItem('auraskin_token', token);
export const removeToken = () => localStorage.removeItem('auraskin_token');

let onUnauthorizedCallback: (() => void) | null = null;
export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Formats error messages into human-friendly strings for UI display
function formatErrorDetail(status: number, errorJson: any): string {
  if (status === 401) {
    return errorJson?.detail || 'Invalid email or password. Please check your credentials and try again.';
  }
  if (status === 403) {
    return errorJson?.detail || 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return errorJson?.detail || 'Requested record was not found.';
  }
  if (status === 409) {
    return errorJson?.detail || 'A record with this information already exists.';
  }
  if (status === 422) {
    if (errorJson?.detail) {
      if (Array.isArray(errorJson.detail)) {
        const messages = errorJson.detail.map((err: any) => {
          const field = err.loc ? err.loc[err.loc.length - 1] : 'Field';
          return `${field}: ${err.msg}`;
        });
        return `Validation error: ${messages.join('; ')}`;
      }
      return typeof errorJson.detail === 'string' ? errorJson.detail : 'Invalid input provided.';
    }
    return 'Validation failed. Please verify your input values.';
  }
  if (status >= 500) {
    return 'The server encountered an issue. Please try again in a moment.';
  }

  if (errorJson && errorJson.detail) {
    if (typeof errorJson.detail === 'string') {
      return errorJson.detail;
    }
    if (Array.isArray(errorJson.detail)) {
      return errorJson.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
    }
  }

  return `Request failed with status code ${status}`;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error('Unable to connect to the backend server. Please check your network or server status.');
  }

  if (!response.ok) {
    let errorJson: any = null;
    try {
      errorJson = await response.json();
    } catch {
      // Body wasn't JSON
    }

    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    const message = formatErrorDetail(response.status, errorJson);
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: async (): Promise<{ status: string }> => {
    try {
      const res = await fetch(HEALTH_URL);
      if (!res.ok) throw new Error('Health check failed');
      return res.json();
    } catch (e) {
      throw new Error('Backend health check unreachable');
    }
  },

  // Auth
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    age?: number;
    country?: string;
    professional_title?: string;
    qualifications?: string;
    certifications?: string;
    years_experience?: number;
    area_of_expertise?: string;
    organization?: string;
    registration_number?: string;
  }) =>
    request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<Token>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { token: string; new_password: string }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyEmail: (token: string) =>
    request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  getMe: () => request<User>('/users/me'),

  updateMe: (data: { name?: string; email?: string; age?: number; country?: string }) =>
    request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Skin Profile
  getSkinProfile: () => request<SkinProfile>('/skin-profile/'),

  createSkinProfile: (data: {
    skin_type: SkinType;
    skin_concerns?: string[];
    allergies?: string;
    sensitivities?: string;
  }) =>
    request<SkinProfile>('/skin-profile/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSkinProfile: (data: {
    skin_type?: SkinType;
    skin_concerns?: string[];
    allergies?: string;
    sensitivities?: string;
  }) =>
    request<SkinProfile>('/skin-profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Lifestyle
  getLifestyle: () => request<LifestyleProfile>('/lifestyle/'),

  createLifestyle: (data: { stress_level: StressLevel; lifestyle_habits?: string }) =>
    request<LifestyleProfile>('/lifestyle/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLifestyle: (data: { stress_level?: StressLevel; lifestyle_habits?: string }) =>
    request<LifestyleProfile>('/lifestyle/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Sleep
  getSleepRecords: () => request<SleepRecord[]>('/sleep/'),

  createSleepRecord: (data: { sleep_hours: number; sleep_quality: SleepQuality }) =>
    request<SleepRecord>('/sleep/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Hydration
  getHydrationRecords: () => request<HydrationRecord[]>('/hydration/'),

  createHydrationRecord: (data: { water_consumed: number; humidity?: number | null }) =>
    request<HydrationRecord>('/hydration/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Environmental Exposure
  getEnvironmentalRecords: () => request<EnvironmentalExposure[]>('/environmental-exposure/'),

  createEnvironmentalRecord: (data: { sun_exposure_hours: number }) =>
    request<EnvironmentalExposure>('/environmental-exposure/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Milestone 2 Skin Intelligence APIs
  triggerAssessment: () => request<SkinAssessment>('/skin-intelligence/skin-assessment', { method: 'POST' }),
  getLatestAssessment: () => request<SkinAssessment>('/skin-intelligence/skin-assessment/latest'),
  getSkinScore: () => request<SkinHealthScore>('/skin-intelligence/skin-score'),
  getCurrentRoutine: () => request<SkincareRoutine>('/skin-intelligence/routine/current'),
  generateRoutine: () => request<SkincareRoutine>('/skin-intelligence/routine/generate', { method: 'POST' }),
  getRecommendations: () => request<Recommendation[]>('/skin-intelligence/recommendations'),
  getSkinReport: () => request<SkinIntelligenceReport>('/skin-intelligence/reports/skin-intelligence'),

  // Milestone 3 Ingredient Intelligence APIs
  getIngredients: () => request<IngredientDetail[]>('/ingredients'),
  getIngredient: (name: string) => request<IngredientDetail>(`/ingredients/${encodeURIComponent(name)}`),
  analyzeIngredients: (data: { ingredient_name?: string; ingredients_list?: string[]; custom_formula_text?: string }) =>
    request<IngredientSuitabilityResponse>('/ingredients/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  checkIngredientInteractions: (ingredients: string[]) =>
    request<IngredientInteractionCheckResponse>('/ingredients/interactions', {
      method: 'POST',
      body: JSON.stringify({ ingredients }),
    }),

  // Milestone 3 Product Intelligence APIs
  getProducts: (params?: { category?: string; skin_type?: string; search?: string; budget_max?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.skin_type) query.append('skin_type', params.skin_type);
    if (params?.search) query.append('search', params.search);
    if (params?.budget_max) query.append('budget_max', params.budget_max.toString());
    const qs = query.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id: number) => request<ProductSuitabilityDetail>(`/products/${id}`),
  getProductRecommendations: (data: { category?: string; budget_max?: number; target_concern?: string; limit?: number }) =>
    request<ProductRecommendationResponse>('/products/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  compareProducts: (productIds: number[]) =>
    request<ProductComparisonResponse>('/products/compare', {
      method: 'POST',
      body: JSON.stringify({ product_ids: productIds }),
    }),
  getProductAlternatives: (id: number) => request<AlternativeProductsResponse>(`/products/${id}/alternatives`),
  addProductToRoutine: (productId: number, data: { time_of_day: string; notes?: string }) =>
    request<{ message: string; product_id: number; product_name: string; time_of_day: string; routine_id: number }>(
      `/products/${productId}/add-to-routine`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  // Milestone 3 Progress & Longitudinal Analytics APIs
  getProgressHistory: () => request<ProgressRecord[]>('/progress/history'),
  createProgressSnapshot: (data: { notes?: string; concern_levels?: Record<string, number> }) =>
    request<ProgressRecord>('/progress/snapshot', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logRoutineAdherence: (data: {
    date?: string;
    morning_completed: boolean;
    evening_completed: boolean;
    completed_steps?: string[];
    missed_steps?: string[];
    notes?: string;
  }) =>
    request<RoutineAdherenceRecord>('/progress/adherence', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getRoutineAdherence: (days: number = 14) => request<RoutineAdherenceRecord[]>(`/progress/adherence?days=${days}`),
  getProgressTrends: () => request<ProgressTrendsResponse>('/progress/trends'),
  getBeforeAfterComparison: (params?: { baseline_id?: number; current_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.baseline_id) query.append('baseline_id', params.baseline_id.toString());
    if (params?.current_id) query.append('current_id', params.current_id.toString());
    const qs = query.toString();
    return request<BeforeAfterComparisonResponse>(`/progress/comparison${qs ? `?${qs}` : ''}`);
  },

  // Professional APIs
  getProfessionalDirectory: () => request<User[]>('/professional/directory'),
  getProfessionalClients: () => request<User[]>('/professional/clients'),
  getDetailedClients: () => request<ClientDetailedSummary[]>('/professional/clients-detailed'),
  getClientFullDossier: (clientId: number) => request<any>(`/professional/clients/${clientId}/full-dossier`),
  recommendRoutine: (clientId: number, payload: RecommendRoutinePayload) =>
    request<{ success: boolean; routine_id: number; message: string }>(`/professional/clients/${clientId}/recommend-routine`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  recommendProducts: (clientId: number, payload: RecommendProductsPayload) =>
    request<{ success: boolean; recommended_count: number; message: string }>(`/professional/clients/${clientId}/recommend-products`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  recommendIngredients: (clientId: number, payload: RecommendIngredientsPayload) =>
    request<{ success: boolean; ingredient_count: number; message: string }>(`/professional/clients/${clientId}/recommend-ingredients`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getClientReport: (clientId: number) => request<SkinIntelligenceReport>(`/professional/client-report/${clientId}`),
  initiateClientContact: (clientId: number, data: { subject: string; message: string; priority_flag?: string }) =>
    request<ConsultationRequest>(`/professional/clients/${clientId}/initiate-contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createConsultationRequest: (data: { professional_id: number; subject: string; message: string; primary_concern?: string }) =>
    request<ConsultationRequest>('/professional/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyConsultations: () => request<ConsultationRequest[]>('/professional/consultations'),
  updateConsultationStatus: (consultationId: number, data: { status?: string; response_notes?: string }) =>
    request<ConsultationRequest>(`/professional/consultations/${consultationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Admin APIs
  getAdminUsers: () => request<User[]>('/admin/users'),

  adminContactUser: (data: { target_user_id: number; subject: string; message: string; advisory_type?: string }) =>
    request<ConsultationRequest>('/admin/contact-user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteAdminUser: (userId: number) =>
    request<{ detail: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  updateAdminUserRole: (userId: number, role: Role, statusChoice?: VerificationStatus) =>
    request<User>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, verification_status: statusChoice }),
    }),

  updateAdminUserStatus: (userId: number, statusChoice: VerificationStatus) =>
    request<User>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: statusChoice }),
    }),

  getPendingProfessionals: () => request<User[]>('/admin/pending-professionals'),

  verifyProfessional: (userId: number, statusChoice: VerificationStatus) =>
    request<User>(`/admin/verify-professional/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ status: statusChoice }),
    }),

  getPlatformAnalytics: () => request<PlatformAnalytics>('/admin/analytics'),


  // Milestone 4 Notifications & Reminders APIs
  getNotifications: (params?: { unread_only?: boolean; notification_type?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.unread_only !== undefined) query.append('unread_only', params.unread_only.toString());
    if (params?.notification_type) query.append('notification_type', params.notification_type);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    const qs = query.toString();
    return request<NotificationListResponse>(`/notifications${qs ? `?${qs}` : ''}`);
  },
  getUnreadNotificationCount: () => request<{ unread_count: number }>('/notifications/unread-count'),
  markNotificationAsRead: (notificationId: number) =>
    request<NotificationItem>(`/notifications/${notificationId}/read`, { method: 'PATCH' }),
  markAllNotificationsAsRead: () =>
    request<{ message: string; updated_count: number }>('/notifications/mark-all-read', { method: 'POST' }),
  deleteNotification: (notificationId: number) =>
    request<void>(`/notifications/${notificationId}`, { method: 'DELETE' }),
  getNotificationPreferences: () => request<NotificationPreferences>('/notifications/preferences'),
  saveNotificationPreferences: (data: Partial<NotificationPreferences>) =>
    request<NotificationPreferences>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  triggerSmartReminders: () => request<NotificationItem[]>('/notifications/check-reminders', { method: 'POST' }),

  // Milestone 4 Comprehensive Reports & Subreports APIs
  getComprehensiveReport: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<SkinIntelligenceReport>(`/reports/comprehensive${qs}`);
  },
  getAssessmentSubreport: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any>(`/reports/assessment${qs}`);
  },
  getAurascoreSubreport: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any>(`/reports/aurascore${qs}`);
  },
  getRoutineSubreport: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any>(`/reports/routine${qs}`);
  },
  getProductSubreport: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any>(`/reports/products${qs}`);
  },
  getSafetySubreport: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any>(`/reports/safety${qs}`);
  },
  getProgressSubreport: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any>(`/reports/progress${qs}`);
  },
  getBeforeAfterSubreport: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any>(`/reports/before-after${qs}`);
  },
  exportReportPdf: async (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return downloadBlob(`/reports/export/pdf${qs}`, 'auraskin_dermal_report.pdf');
  },
  exportReportExcel: async (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return downloadBlob(`/reports/export/excel${qs}`, 'auraskin_dermal_data.xlsx');
  },

  // Milestone 4 Enhanced Professional Portal APIs
  getClientOverview: (clientId: number) => request<ClientOverviewResponse>(`/professional/clients/${clientId}/overview`),
  getClientAssessments: (clientId: number) => request<SkinAssessment[]>(`/professional/clients/${clientId}/assessments`),
  getClientProgress: (clientId: number) => request<{ client_id: number; snapshots: any[]; adherence_logs: any[] }>(`/professional/clients/${clientId}/progress`),

  // System Health & Observability APIs
  getSystemHealth: () => request<SystemHealthResponse>('/health'),
  getOperationalHealth: () => request<SystemHealthResponse>('/health'),
};

// Helper function to download binary files with auth
async function downloadBlob(endpoint: string, defaultFilename: string) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error(`Export failed with status: ${response.status}`);
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const disposition = response.headers.get('content-disposition');
  let filename = defaultFilename;
  if (disposition && disposition.includes('filename=')) {
    const parts = disposition.split('filename=');
    if (parts.length > 1) {
      filename = parts[1].replace(/["';]/g, '').trim();
    }
  }
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

