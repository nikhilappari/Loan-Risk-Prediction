import {
  ApplicantFormData,
  RiskAssessmentResponse,
  ModelMetrics,
  FeatureImportanceResponse,
  AssessmentHistoryItem,
  BatchPredictionResponse,
  HealthStatus
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getModelInfo(): Promise<any> {
    const res = await fetch(`${API_BASE}/model-info`);
    if (!res.ok) throw new Error(`Failed to fetch model info: ${res.statusText}`);
    return res.json();
  },

  async getMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error(`Failed to fetch metrics: ${res.statusText}`);
    return res.json();
  },

  async getFeatureImportance(): Promise<FeatureImportanceResponse> {
    const res = await fetch(`${API_BASE}/feature-importance`);
    if (!res.ok) throw new Error(`Failed to fetch feature importance: ${res.statusText}`);
    return res.json();
  },

  async predict(data: ApplicantFormData): Promise<RiskAssessmentResponse> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Prediction failed: ${res.statusText}`);
    }
    return res.json();
  },

  async batchPredict(file: File): Promise<BatchPredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/batch-predict`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Batch prediction failed: ${res.statusText}`);
    }
    return res.json();
  },

  async getHistory(filters?: {
    risk_category?: string;
    min_prob?: number;
    max_prob?: number;
    limit?: number;
  }): Promise<{ total: number; items: AssessmentHistoryItem[] }> {
    const params = new URLSearchParams();
    if (filters?.risk_category) params.append('risk_category', filters.risk_category);
    if (filters?.min_prob !== undefined) params.append('min_prob', filters.min_prob.toString());
    if (filters?.max_prob !== undefined) params.append('max_prob', filters.max_prob.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const res = await fetch(`${API_BASE}/history?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch history: ${res.statusText}`);
    return res.json();
  },

  async getHistoryItem(assessmentId: string): Promise<AssessmentHistoryItem> {
    const res = await fetch(`${API_BASE}/history/${assessmentId}`);
    if (!res.ok) throw new Error(`Failed to fetch history record: ${res.statusText}`);
    return res.json();
  },

  async getModelComparison(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/model-comparison`);
    if (!res.ok) return [];
    return res.json();
  }
};
