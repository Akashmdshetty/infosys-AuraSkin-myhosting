import React from 'react';
import { User } from '../services/api';
import { Edit3, Mail, Shield, CheckCircle2, Globe, Calendar } from 'lucide-react';

interface ProfileHeroCardProps {
  user: User;
  onOpenEdit: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({ user, onOpenEdit }) => {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-rose text-xs font-bold">Admin</span>;
      case 'DERMATOLOGIST':
        return <span className="badge badge-sky text-xs font-bold">Dermatologist</span>;
      case 'SKINCARE_CONSULTANT':
        return <span className="badge badge-amber text-xs font-bold">Skincare Consultant</span>;
      default:
        return <span className="badge badge-teal text-xs font-bold">Client Member</span>;
    }
  };

  return (
    <div className="sample-card card-3d-interactive bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
      {/* Left: Avatar & Identity Details */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        {/* Large Gradient Avatar */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-600 via-[#005049] to-teal-900 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-teal-200/60 shadow-teal-900/10 group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-2xs" title="Account Active">
            <CheckCircle2 size={13} />
          </div>
        </div>

        {/* Name, Role, Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {user.name}
            </h2>
            {getRoleBadge(user.role)}
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500 font-medium">
            <Mail size={13} className="text-teal-600 shrink-0" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-400 pt-1">
            {user.country && (
              <span className="flex items-center gap-1">
                <Globe size={11} />
                {user.country}
              </span>
            )}
            {user.age && <span>• Age {user.age}</span>}
            <span>• Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Right: Edit Profile Trigger */}
      <button
        type="button"
        onClick={onOpenEdit}
        className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 shrink-0 self-center sm:self-start shadow-2xs"
      >
        <Edit3 size={14} />
        <span>Edit Profile</span>
      </button>
    </div>
  );
};
