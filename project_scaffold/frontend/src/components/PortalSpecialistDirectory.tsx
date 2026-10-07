import React, { useState } from 'react';
import { User } from '../services/api';
import {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Building2,
  Award,
  Briefcase,
  Search,
  RefreshCw,
  MessageSquare,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

interface PortalSpecialistDirectoryProps {
  specialists: User[];
  loading: boolean;
  onRefresh: () => void;
  onSelectSpecialist: (specialistId: number) => void;
}

export const PortalSpecialistDirectory: React.FC<PortalSpecialistDirectoryProps> = ({
  specialists,
  loading,
  onRefresh,
  onSelectSpecialist,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'DERMATOLOGIST' | 'SKINCARE_CONSULTANT'>('ALL');

  const filteredSpecialists = specialists.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.professional_profile?.professional_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.professional_profile?.area_of_expertise || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.professional_profile?.organization || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#00685f] uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Clinical Directory</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            VERIFIED SKINCARE SPECIALISTS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clinical professionals available for consultation, assessment reviews, and custom regimen tuning.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="btn-secondary text-xs px-3.5 py-2 self-start sm:self-auto flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, specialization, clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.25rem', fontSize: '0.825rem' }}
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setRoleFilter('ALL')}
            className={`portal-tab-btn text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              roleFilter === 'ALL'
                ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            All Specialists ({specialists.length})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('DERMATOLOGIST')}
            className={`portal-tab-btn text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              roleFilter === 'DERMATOLOGIST'
                ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Dermatologists ({specialists.filter((s) => s.role === 'DERMATOLOGIST').length})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('SKINCARE_CONSULTANT')}
            className={`portal-tab-btn text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              roleFilter === 'SKINCARE_CONSULTANT'
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Consultants ({specialists.filter((s) => s.role === 'SKINCARE_CONSULTANT').length})
          </button>
        </div>
      </div>

      {/* Specialist Cards Grid */}
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="sample-card bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 skeleton-pulse rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 skeleton-pulse w-3/4" />
                  <div className="h-3 skeleton-pulse w-1/2" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 skeleton-pulse w-full" />
                <div className="h-3 skeleton-pulse w-5/6" />
                <div className="h-3 skeleton-pulse w-2/3" />
              </div>
              <div className="h-9 skeleton-pulse w-full rounded-xl pt-2" />
            </div>
          ))}
        </div>
      ) : filteredSpecialists.length === 0 ? (
        /* Empty State */
        <div className="sample-card text-center py-12 px-4 bg-white/95 rounded-2xl border border-slate-200/80">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200/60 shadow-2xs">
            <UserCheck size={28} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {searchTerm ? 'No Matching Specialists Found' : 'No Verified Specialists Currently Listed'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            {searchTerm
              ? 'Try modifying your search keywords or clear filters to see all available practitioners.'
              : 'Registered specialist accounts are currently undergoing verification by administrator review. Please check back shortly.'}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
              }}
              className="btn-secondary text-xs px-4 py-2 mt-4 inline-flex"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* Active Specialist Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpecialists.map((spec) => {
            const isDerm = spec.role === 'DERMATOLOGIST';
            const isVerified = spec.verification_status === 'VERIFIED';
            const profile = spec.professional_profile;
            const initials = spec.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);

            return (
              <div
                key={spec.id}
                className="specialist-card sample-card bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Name, Badges */}
                  <div className="flex items-start gap-3.5 mb-4">
                    {/* Medical Avatar */}
                    <div
                      className={`specialist-avatar shrink-0 w-13 h-13 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner border ${
                        isDerm
                          ? 'bg-gradient-to-br from-sky-500 to-sky-700 text-white border-sky-400/50'
                          : 'bg-gradient-to-br from-teal-600 to-[#005049] text-white border-teal-400/50'
                      }`}
                    >
                      {initials || <Stethoscope size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-base font-extrabold text-slate-900 truncate">
                          {spec.name}
                        </h4>
                        {isVerified && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                            title="AuraSkin Verified Practitioner"
                          >
                            <CheckCircle size={10} className="text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`badge text-[10px] font-bold ${
                            isDerm ? 'badge-sky' : 'badge-amber'
                          }`}
                        >
                          {isDerm ? 'Dermatologist' : 'Skincare Consultant'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specialist Credentials & Profile Details */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 text-xs mb-4">
                    <div className="flex items-start gap-2 text-slate-700">
                      <Award size={14} className="text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {profile?.professional_title || (isDerm ? 'Board Certified Dermatologist' : 'Skincare Consultant')}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {profile?.qualifications || 'MD / Aesthetic Practitioner'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <Briefcase size={13} className="text-slate-400 shrink-0" />
                      <span>
                        {profile?.years_experience
                          ? `${profile.years_experience} Years Clinical Practice`
                          : 'Experienced Clinical Practitioner'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <Building2 size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {profile?.organization || 'AuraSkin Telehealth Partner'}
                      </span>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  {profile?.area_of_expertise && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {profile.area_of_expertise
                        .split(',')
                        .map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Book Consultation Button */}
                <button
                  type="button"
                  onClick={() => onSelectSpecialist(spec.id)}
                  className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-2xs group"
                >
                  <MessageSquare size={14} className="group-hover:scale-110 transition-transform" />
                  <span>Contact & Book Consultation</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
