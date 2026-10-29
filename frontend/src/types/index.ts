export interface ApplicantFormData {
  applicant_name: string;
  applicant_ref: string;
  // Personal
  age_years: number;
  code_gender: 'M' | 'F' | 'XNA';
  cnt_fam_members: number;
  name_family_status: string;
  name_education_type: string;
  name_income_type: string;
  occupation_type: string;

  // Financial
  amt_income_total: number;
  amt_credit: number;
  amt_annuity: number;
  employment_years: number;
  flag_own_car: 'Y' | 'N';
  flag_own_realty: 'Y' | 'N';

  // Bureau Credit History
  prev_loan_count: number;
  active_loan_count: number;
  total_bureau_credit: number;
  avg_bureau_credit: number;
  total_bureau_debt: number;
  total_overdue_amount: number;
  max_overdue_amount: number;
  avg_credit_day_overdue: number;
}

export interface DerivedIndicators {
  loan_income_ratio: number;
  credit_annuity_ratio: number;
  income_per_person: number;
  debt_to_income_ratio: number;
  overdue_to_income_ratio: number;
  age_years: number;
  employment_years: number;
}

export interface KeyFactorItem {
  feature: string;
  display_name: string;
  value: string | number;
  raw_value?: number;
  impact: 'Elevated Risk' | 'Moderate Risk' | 'Favorable Indicator' | 'Neutral';
  importance_weight: number;
  description: string;
}

export interface RiskAssessmentResponse {
  assessment_id: string;
  applicant_name: string;
  applicant_ref: string;
  risk_probability: number;
  risk_percentage: number;
  risk_category: 'LOWER RISK' | 'MODERATE RISK' | 'HIGHER RISK';
  confidence_level: string;
  assessment: string;
  human_review_required: boolean;
  human_review_notice: string;
  recommendation: string;
  key_factors: KeyFactorItem[];
  derived_indicators: DerivedIndicators;
  timestamp: string;
  model_version: string;
}

export interface ModelMetrics {
  model_name: string;
  model_type: string;
  dataset_source: string;
  is_synthetic: boolean;
  training_timestamp: string;
  train_samples: number;
  test_samples: number;
  total_samples?: number;
  raw_features_count?: number;
  transformed_features_count?: number;
  hyperparameters?: Record<string, any>;
  evaluation: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: {
      true_negatives: number;
      false_positives: number;
      false_negatives: number;
      true_positives: number;
    };
    class_balance: {
      total_test_samples: number;
      non_default_count: number;
      default_count: number;
      default_rate_pct: number;
    };
    imbalance_analysis: string;
  };
}

export interface FeatureImportanceResponse {
  dataset_source: string;
  top_features: Array<{ feature: string; importance: number }>;
  grouped_features: Array<{ feature: string; importance: number }>;
  disclaimer: string;
}

export interface AssessmentHistoryItem {
  id: number;
  assessment_id: string;
  applicant_name?: string;
  applicant_ref: string;
  timestamp: string;
  loan_amount: number;
  annual_income: number;
  risk_probability: number;
  risk_category: string;
  model_version: string;
  key_factors: KeyFactorItem[];
  human_review_status: string;
  review_notes?: string;
}

export interface BatchPredictionItem {
  sk_id_curr?: number;
  applicant_name?: string;
  applicant_ref: string;
  risk_probability: number;
  risk_percentage: number;
  risk_category: string;
  human_review_required: boolean;
  top_factor: string;
}

export interface ModelComparisonItem {
  model_name: string;
  roc_auc: number;
  f1_score: number;
  recall: number;
  precision: number;
  accuracy: number;
  brier_score?: number;
  composite_score: number;
  is_best: boolean;
}

export interface BatchPredictionResponse {
  total_processed: number;
  lower_risk_count: number;
  moderate_risk_count: number;
  higher_risk_count: number;
  results: BatchPredictionItem[];
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  database_connected: boolean;
  dataset_source: string;
  timestamp: string;
}
