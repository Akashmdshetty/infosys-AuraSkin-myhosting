import React from 'react';
import { User } from '../services/api';
import { ShieldCheck, Mail, Calendar, Key, Lock, CheckCircle2 } from 'lucide-react';

interface ProfileAccountCardProps {
  user: User;
}

export const ProfileAccountCard: React.FC<ProfileAccountCardProps> = ({ user }) => {
  const createdDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="sample-card card-3d-interactive bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/70">
            <Lock size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-teal-700 block">
              SECURITY & CREDENTIALS
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              ACCOUNT INFORMATION & SECURITY
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={11} className="text-emerald-600" />
          Active Account
        </span>
      </div>

      {/* Account Info Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Email */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <Mail size={16} className="text-teal-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {user.email}
            </span>
          </div>
        </div>

        {/* Role */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Account Role
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {user.role}
            </span>
          </div>
        </div>

        {/* Created Date */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <Calendar size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Account Created
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {createdDate}
            </span>
          </div>
        </div>

        {/* Security Password Status */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <Key size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Password Security
            </span>
            <span className="text-xs font-bold text-emerald-700 block flex items-center gap-1">
              <span>Protected</span>
              <CheckCircle2 size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
