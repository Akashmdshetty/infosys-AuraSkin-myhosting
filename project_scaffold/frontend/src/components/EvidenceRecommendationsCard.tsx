import React, { useState, useEffect } from 'react';
import { api, Recommendation } from '../services/api';
import { ContactProfessionalModal } from './ContactProfessionalModal';

export const EvidenceRecommendationsCard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  if (loading) {
    return (
      <div className="sample-card text-center text-gray-500">
        Matching recommendations...
      </div>
    );
  }

  return (
    <div className="sample-card">
      <h2 className="sample-card-title">Skincare Recommendations</h2>
      <p className="sample-card-subtitle">Active ingredients matched to your profile</p>

      <div className="space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-gray-800">{rec.ingredient_or_category}</span>
                <span className="sample-badge">Recommended</span>
              </div>
              <p className="text-xs text-gray-600">{rec.reason}</p>
            </div>
          ))
        ) : (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <div className="font-semibold text-sm text-gray-800">2% Niacinamide</div>
            <p className="text-xs text-gray-600">Enhances barrier hydration and calms inflammation.</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setContactModalOpen(true)}
          className="sample-btn-secondary w-full"
          type="button"
        >
          Consult Dermatologist
        </button>
      </div>

      <ContactProfessionalModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </div>
  );
};


