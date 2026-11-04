import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { alumniService } from '../services/alumni.service';
import { AlumniProfile, JobMatch, DocumentRequest } from '../types/alumni.types';
import { AlumniDashboardTab } from '../types/alumniDashboard.types';

export function useAlumniDashboard(defaultTab?: string) {
  const [activeTab, setActiveTab] = useState<AlumniDashboardTab>(() => {
    if (defaultTab) return defaultTab as AlumniDashboardTab;
    if (typeof window !== 'undefined') {
      if (window.location.pathname.endsWith('/tools')) return 'tools';
      if (window.location.pathname.endsWith('/jobs')) return 'jobs';
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AlumniDashboardTab;
      if (tabParam) return tabParam;
    }
    return 'overview';
  });

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [stats, setStats] = useState<any>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes, jobsRes, docsRes] = await Promise.allSettled([
        alumniService.getProfile(),
        alumniService.getDashboardStats(),
        alumniService.getJobs(),
        alumniService.getDocumentRequests(),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value || []);
      if (docsRes.status === 'fulfilled') setDocuments(docsRes.value || []);
    } catch (err: any) {
      console.error('Alumni dashboard load error:', err);
      toast.error('Could not load some dashboard sections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleApplyJob = useCallback(async (jobId: string | number) => {
    try {
      await alumniService.applyForJob(jobId);
      toast.success('Application submitted with verified ASTU profile & resume!');
      setJobs((prev) =>
        prev.map((j) => (String(j.id) === String(jobId) ? { ...j, applied: true } : j))
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit application.');
    }
  }, []);

  const handleToggleSaveJob = useCallback(async (jobId: string | number) => {
    try {
      setJobs((prev) =>
        prev.map((j) => (String(j.id) === String(jobId) ? { ...j, saved: !j.saved } : j))
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    loading,
    profile,
    jobs,
    documents,
    stats,
    handleApplyJob,
    handleToggleSaveJob,
    reload: loadDashboardData,
  };
}
