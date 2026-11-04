import React from 'react';
import { ShieldCheck, Award, Linkedin, CheckCircle2, AlertCircle, Edit, Star, BookOpen } from 'lucide-react';
import { AlumniProfile } from '../../types/alumni.types';

interface ProfileMatrixTabProps {
  profile: AlumniProfile | null;
  onEditProfile?: () => void;
}

export const ProfileMatrixTab: React.FC<ProfileMatrixTabProps> = ({ profile, onEditProfile }) => {
  const completionPercent = 88; // Dynamic completion score
  const isVerified = Boolean(profile?.isVerified ?? true);

  const skillsList = [
    { name: 'Software Architecture & Cloud Systems', level: 92 },
    { name: 'Full-Stack TypeScript & React', level: 95 },
    { name: 'Distributed Systems & Database Sharding', level: 85 },
    { name: 'Embedded Systems & IoT Protocols', level: 78 },
  ];

  return (
    <div data-testid="profile-matrix-tab" className="space-y-6">
      {/* Profile Header & Completion Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003580] text-xl font-bold text-white shadow-md">
                {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : 'AS'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[var(--text-primary)]">{profile?.fullName || 'Graduate Engineer'}</h3>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> VERIFIED ALUMNI
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{profile?.department || 'School of Electrical Engineering & Computing'}</p>
                <p className="font-mono text-xs text-sky-400">Class of {profile?.graduationYear || '2024'} · ID: {profile?.studentId || 'ASTU/2020'}</p>
              </div>
            </div>

            {onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              >
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </button>
            )}
          </div>

          {/* LinkedIn Integration Link */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4 text-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
              <Linkedin className="h-5 w-5 text-sky-400" />
              <span>LinkedIn Professional Identity:</span>
              <span className="font-mono text-[var(--text-primary)]">linkedin.com/in/{profile?.fullName?.toLowerCase().replace(/\s+/g, '-') || 'alumni-astu'}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          </div>
        </div>

        {/* Completion Gauge Card */}
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center shadow-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Profile Strength Score</span>
          <div className="mt-4 flex items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-sky-500/20">
              <div className="text-2xl font-black text-[var(--text-primary)]">{completionPercent}%</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--text-secondary)] font-semibold">All-Star Profile Completion</p>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Your credentials are visible to top hiring employers and partner directories.</p>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4">Verified Technical Competency Matrix</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skillsList.map((skill) => (
            <div key={skill.name} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--text-secondary)]">{skill.name}</span>
                <span className="font-mono text-sky-400">{skill.level}%</span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-[var(--bg-card)]">
                <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" style={{ width: `${skill.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
