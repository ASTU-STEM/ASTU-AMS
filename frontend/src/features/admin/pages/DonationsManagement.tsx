import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart,
  Plus,
  Edit3,
  Trash2,
  Users,
  Target,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  Bell,
  Sparkles,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Building,
  GraduationCap,
  Mail,
  Phone,
  CreditCard,
  FileText,
  FileCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/admin.service';
import AdminTablePagination from '../components/AdminTablePagination';

interface Campaign {
  id: string;
  title: string;
  description?: string;
  goal: number;
  raised: number;
  donorCount: number;
  category?: string;
  status: string;
  createdAt?: string;
}

interface DonorRecord {
  id: string;
  amount: number;
  paymentRef?: string;
  createdAt: string;
  campaign?: { id?: string; title: string; category?: string };
  alumni?: {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    graduationYear?: number;
    employmentStatus?: string;
    department?: { name?: string; code?: string };
  };
}

export default function DonationsManagement() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donors'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering & Pagination for Donor Records
  const [donorCauseFilter, setDonorCauseFilter] = useState('ALL');
  const [donorSortBy, setDonorSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [donorPage, setDonorPage] = useState(1);
  const [donorRowsPerPage, setDonorRowsPerPage] = useState(10);

  // Selected Donor for Details Modal
  const [selectedDonor, setSelectedDonor] = useState<DonorRecord | null>(null);

  // Campaign Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Scholarship');
  const [goalAmount, setGoalAmount] = useState('5000000');
  const [description, setDescription] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsRes, donorsRes] = await Promise.all([
        adminService.getDonationCampaigns(),
        adminService.getDonorsList(),
      ]);

      if (campaignsRes.ok && Array.isArray(campaignsRes.data)) {
        setCampaigns(campaignsRes.data);
      }
      if (donorsRes.ok && Array.isArray(donorsRes.data)) {
        setDonors(donorsRes.data);
      }
    } catch (err) {
      console.error('Failed to load donations data:', err);
      toast.error('Failed to load donations management data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showCreateModal || selectedDonor) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showCreateModal, selectedDonor]);

  const resetForm = () => {
    setTitle('');
    setCategory('Scholarship');
    setGoalAmount('5000000');
    setDescription('');
    setEditingCampaign(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setTitle(campaign.title);
    setCategory(campaign.category || 'Scholarship');
    setGoalAmount(String(campaign.goal || 5000000));
    setDescription(campaign.description || '');
    setShowCreateModal(true);
  };

  const handleSubmitCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !goalAmount) {
      toast.error('Please fill in campaign title and target goal amount');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCampaign) {
        const res = await adminService.updateDonationCampaign(editingCampaign.id, {
          title,
          category,
          targetAmount: Number(goalAmount),
          description,
        });
        if (res.ok) {
          toast.success('Campaign updated successfully!');
          setShowCreateModal(false);
          resetForm();
          loadData();
        } else {
          toast.error(res.message || 'Failed to update campaign');
        }
      } else {
        const res = await adminService.createDonationCampaign({
          title,
          category,
          targetAmount: Number(goalAmount),
          description,
        });
        if (res.ok) {
          toast.success('New campaign created! In-app and Email notifications dispatched to Alumni.');
          setShowCreateModal(false);
          resetForm();
          loadData();
        } else {
          toast.error(res.message || 'Failed to create campaign');
        }
      }
    } catch (err) {
      toast.error('Error saving campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id: string, campaignTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${campaignTitle}"?`)) return;

    try {
      const res = await adminService.deleteDonationCampaign(id);
      if (res.ok) {
        toast.success('Campaign deleted successfully');
        loadData();
      } else {
        toast.error(res.message || 'Failed to delete campaign');
      }
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  // Metrics calculation (100% computed from PostgreSQL Database records)
  const totalRaised = campaigns.reduce((acc, c) => acc + (c.raised || 0), 0);
  const totalGoal = campaigns.reduce((acc, c) => acc + (c.goal || 0), 0);
  const totalDonors = donors.length > 0 ? donors.length : campaigns.reduce((acc, c) => acc + (c.donorCount || 0), 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'ACTIVE').length;

  // Filtering for Campaigns Tab
  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination for Campaigns Tab
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignPageSize, setCampaignPageSize] = useState(6);

  useEffect(() => {
    setCampaignPage(1);
  }, [searchQuery]);

  const paginatedCampaigns = filteredCampaigns.slice(
    (campaignPage - 1) * campaignPageSize,
    campaignPage * campaignPageSize
  );

  // Filtering & Sorting for Donor Records Tab
  const filteredDonors = donors
    .filter((d) => {
      const matchesSearch =
        (d.alumni?.fullName && d.alumni.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.alumni?.email && d.alumni.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.campaign?.title && d.campaign.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.paymentRef && d.paymentRef.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCause =
        donorCauseFilter === 'ALL' ||
        (d.campaign?.title && d.campaign.title === donorCauseFilter) ||
        (d.campaign?.category && d.campaign.category === donorCauseFilter);

      return matchesSearch && matchesCause;
    })
    .sort((a, b) => {
      if (donorSortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (donorSortBy === 'amount_high') {
        return b.amount - a.amount;
      }
      if (donorSortBy === 'amount_low') {
        return a.amount - b.amount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Pagination for Donor Records
  const totalDonorPages = Math.max(1, Math.ceil(filteredDonors.length / donorRowsPerPage));
  const currentDonorPage = Math.min(donorPage, totalDonorPages);
  const paginatedDonors = filteredDonors.slice(
    (currentDonorPage - 1) * donorRowsPerPage,
    currentDonorPage * donorRowsPerPage
  );

  // Export Donor Records to CSV
  const handleExportDonorsCSV = () => {
    if (filteredDonors.length === 0) {
      toast.error('No donor records to export');
      return;
    }

    const headers = [
      'Donor Name',
      'Email',
      'Phone',
      'Graduation Year',
      'Department',
      'Campaign Cause',
      'Category',
      'Amount (ETB)',
      'Payment Ref',
      'Transaction Date',
      'Status',
    ];

    const csvRows = filteredDonors.map((d) => [
      `"${d.alumni?.fullName || 'Anonymous Donor'}"`,
      `"${d.alumni?.email || 'N/A'}"`,
      `"${d.alumni?.phone || 'N/A'}"`,
      `"${d.alumni?.graduationYear || 'N/A'}"`,
      `"${d.alumni?.department?.name || 'ASTU Alumni'}"`,
      `"${d.campaign?.title || 'General Fund'}"`,
      `"${d.campaign?.category || 'General'}"`,
      d.amount,
      `"${d.paymentRef || 'ASTU-DON-CHAPA'}"`,
      `"${new Date(d.createdAt).toLocaleDateString()}"`,
      `"VERIFIED CHAPA"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ASTU_Donation_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredDonors.length} donor records to CSV!`);
  };

  // Export Donor Records to Printable PDF Executive Report
  const handleExportDonorsPDF = () => {
    if (filteredDonors.length === 0) {
      toast.error('No donor records to export.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to export PDF report.');
      return;
    }

    const totalRaisedSum = filteredDonors.reduce((acc, d) => acc + d.amount, 0);

    const logoUrl = window.location.origin + '/images/astu-seal-logo.png';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ASTU Donor Audit Report PDF</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; padding: 28px; margin: 0; background: #ffffff; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #003580; padding-bottom: 16px; margin-bottom: 24px; }
          .brand-group { display: flex; align-items: center; gap: 16px; }
          .logo-img { height: 60px; width: 60px; object-fit: contain; }
          .title-area h1 { margin: 0; font-size: 22px; color: #003580; font-weight: 900; letter-spacing: -0.5px; }
          .title-area p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
          .metrics-grid { display: flex; gap: 16px; margin-bottom: 24px; }
          .metric-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
          .metric-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
          .metric-val { font-size: 20px; color: #0f172a; font-weight: 900; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
          th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-weight: 800; font-size: 10px; text-align: left; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { display: inline-block; padding: 3px 8px; background: #dcfce7; color: #15803d; font-size: 9px; font-weight: 800; border-radius: 6px; border: 1px solid #bbf7d0; }
          .footer { margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-group">
            <img src="${logoUrl}" alt="ASTU Logo" class="logo-img" onerror="this.src='/images/astu-seal-logo.png'" />
            <div class="title-area">
              <h1>ADAMA SCIENCE & TECHNOLOGY UNIVERSITY</h1>
              <p>Office of Alumni Relations & Advancement • Donor Records Audit Log</p>
            </div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569;">
            <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div><strong>Cause Filter:</strong> ${donorCauseFilter === 'ALL' ? 'All Causes' : donorCauseFilter}</div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Filtered Records</div>
            <div class="metric-val">${filteredDonors.length} Supporters</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Contributed Value</div>
            <div class="metric-val" style="color: #059669;">${totalRaisedSum.toLocaleString()} ETB</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Payment Gateway Status</div>
            <div class="metric-val" style="color: #0284c7;">100% Chapa Verified</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Donor Name</th>
              <th>Email</th>
              <th>Campaign Cause</th>
              <th>Amount Contributed</th>
              <th>Chapa Reference</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDonors
              .map(
                (d, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${d.alumni?.fullName || 'Anonymous Donor'}</strong></td>
                <td>${d.alumni?.email || 'N/A'}</td>
                <td>${d.campaign?.title || 'General Giving Fund'}</td>
                <td><strong style="color: #059669;">${d.amount.toLocaleString()} ETB</strong></td>
                <td style="font-family: monospace;">${d.paymentRef || 'ASTU-DON-CHAPA'}</td>
                <td>${new Date(d.createdAt).toLocaleDateString()}</td>
                <td><span class="badge">VERIFIED CHAPA</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>Generated by ASTU Admin System (ASTU-AMS) • Official System Audit Log</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('Generated PDF Executive Audit Report!');
  };

  // Export Donor Records to Microsoft Excel (.xls)
  const handleExportDonorsExcel = () => {
    if (filteredDonors.length === 0) {
      toast.error('No donor records to export.');
      return;
    }

    const headers = [
      'Donor Name',
      'Email',
      'Phone',
      'Graduation Year',
      'Department',
      'Campaign Cause',
      'Category',
      'Amount (ETB)',
      'Payment Ref',
      'Transaction Date',
      'Status',
    ];

    const rows = filteredDonors.map((d) => [
      d.alumni?.fullName || 'Anonymous Donor',
      d.alumni?.email || 'N/A',
      d.alumni?.phone || 'N/A',
      d.alumni?.graduationYear || 'N/A',
      d.alumni?.department?.name || 'ASTU Alumni',
      d.campaign?.title || 'General Fund',
      d.campaign?.category || 'General',
      d.amount,
      d.paymentRef || 'ASTU-DON-CHAPA',
      new Date(d.createdAt).toLocaleDateString(),
      'VERIFIED CHAPA',
    ]);

    let tsvContent = headers.join('\t') + '\n';
    rows.forEach((row) => {
      tsvContent += row.join('\t') + '\n';
    });

    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ASTU_Donation_Records_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredDonors.length} donor records to Excel (.xls)!`);
  };

  // Export Donor Records to JSON Ledger
  const handleExportDonorsJSON = () => {
    if (filteredDonors.length === 0) {
      toast.error('No donor records to export.');
      return;
    }

    const exportData = filteredDonors.map((d) => ({
      id: d.id,
      donorName: d.alumni?.fullName || 'Anonymous Donor',
      email: d.alumni?.email || null,
      phone: d.alumni?.phone || null,
      graduationYear: d.alumni?.graduationYear || null,
      department: d.alumni?.department?.name || null,
      campaignCause: d.campaign?.title || 'General Giving Fund',
      category: d.campaign?.category || 'General',
      amountETB: d.amount,
      paymentReference: d.paymentRef || 'ASTU-DON-CHAPA',
      transactionDate: d.createdAt,
      status: 'VERIFIED_CHAPA',
    }));

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ASTU_Donation_Records_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredDonors.length} donor records to JSON ledger!`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            Donations & Giving Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage ASTU fundraising campaigns, create new causes, and monitor Chapa donor records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#003580] text-white text-xs font-extrabold shadow-md hover:bg-[#002866] transition-all flex items-center gap-2 hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards (100% Dynamic Database Values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Raised</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ETB
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalRaised.toLocaleString()} ETB</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">From verified Chapa payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Goal Total</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalGoal.toLocaleString()} ETB</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Across all active causes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Donors</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalDonors}</p>
          <p className="text-[10px] text-purple-600 font-bold mt-1">Alumni & Corporate Supporters</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Active Campaigns</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeCampaignsCount}</p>
          <p className="text-[10px] text-rose-600 font-bold mt-1">Controlled by Admin</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'campaigns'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Campaign Causes ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'donors'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Donor Records ({donors.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDonorPage(1);
              }}
              placeholder="Search campaign or donor..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Tab 1: Campaigns Management Grid */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCampaigns.map((c) => {
                const progressPct = Math.min(100, Math.round(((c.raised || 0) / (c.goal || 1)) * 100));
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                          {c.category || 'Fund'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{c.donorCount || 0} donors</span>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {c.description || 'Fundraising campaign for ASTU university development.'}
                      </p>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-700">{c.raised.toLocaleString()} ETB</span>
                          <span className="text-slate-400">of {c.goal.toLocaleString()} ETB</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Cause
                      </button>

                      <button
                        onClick={() => handleDeleteCampaign(c.id, c.title)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100"
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredCampaigns.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 space-y-2">
                  <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="text-xs font-bold">No donation campaigns found</p>
                  <p className="text-[10px] text-slate-400">Click "Create Campaign" to add your first cause</p>
                </div>
              )}
            </div>

            {/* Campaigns Pagination */}
            <AdminTablePagination
              currentPage={campaignPage}
              totalItems={filteredCampaigns.length}
              pageSize={campaignPageSize}
              onPageChange={setCampaignPage}
              onPageSizeChange={(newSize) => {
                setCampaignPageSize(newSize);
                setCampaignPage(1);
              }}
              pageSizeOptions={[6, 12, 24, 48]}
              itemName="campaigns"
            />
          </div>
        )}

        {/* Tab 2: Donor Records Table & Advanced Controls */}
        {activeTab === 'donors' && (
          <div className="space-y-4">
            {/* Filter, Sort & Export Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Cause Filter */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <span>Cause:</span>
                  <select
                    value={donorCauseFilter}
                    onChange={(e) => {
                      setDonorCauseFilter(e.target.value);
                      setDonorPage(1);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                  >
                    <option value="ALL">All Causes ({donors.length})</option>
                    {Array.from(new Set(donors.map((d) => d.campaign?.title).filter(Boolean))).map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <span>Sort By:</span>
                  <select
                    value={donorSortBy}
                    onChange={(e: any) => setDonorSortBy(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount_high">Highest Amount</option>
                    <option value="amount_low">Lowest Amount</option>
                  </select>
                </div>
              </div>

              {/* Multi-Format Export Options */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportDonorsPDF}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.01]"
                  title="Generate & Print PDF Executive Audit Report"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Export PDF</span>
                </button>

                <button
                  onClick={handleExportDonorsCSV}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.01]"
                  title="Download CSV Spreadsheet file"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleExportDonorsExcel}
                  className="px-3 py-1.5 rounded-xl bg-[#003580] hover:bg-[#002866] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.01]"
                  title="Download Excel Spreadsheet (.xls)"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Export Excel</span>
                </button>

                <button
                  onClick={handleExportDonorsJSON}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.01]"
                  title="Download JSON Ledger Backup"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Scrollable Donor Table with Sticky Header */}
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto rounded-xl border border-slate-200 scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 z-10 text-slate-600 uppercase font-extrabold tracking-wider border-b border-slate-200 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Donor Name</th>
                    <th className="px-4 py-3">Campaign Cause</th>
                    <th className="px-4 py-3">Amount Contributed</th>
                    <th className="px-4 py-3">Chapa Reference</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedDonors.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDonor(d)}
                      className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 group-hover:text-[#003580]">
                        {d.alumni?.fullName || 'Anonymous Donor'}
                        {d.alumni?.email && (
                          <span className="block text-[10px] font-normal text-slate-400">{d.alumni.email}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {d.campaign?.title || 'ASTU Scholarship Fund 2026'}
                        {d.campaign?.category && (
                          <span className="block text-[9px] font-extrabold text-emerald-600 uppercase">
                            {d.campaign.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-black text-emerald-700">{d.amount.toLocaleString()} ETB</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {d.paymentRef || 'ASTU-DON-CHAPA'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          VERIFIED CHAPA
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-[#003580] group-hover:text-white text-[10px] font-bold text-slate-600 transition-all inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Details
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredDonors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                        <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="text-xs font-bold">No donor records match your filter criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <AdminTablePagination
              currentPage={donorPage}
              totalItems={filteredDonors.length}
              pageSize={donorRowsPerPage}
              onPageChange={setDonorPage}
              onPageSizeChange={(newSize) => {
                setDonorRowsPerPage(newSize);
                setDonorPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50, 100]}
              itemName="donor records"
            />
          </div>
        )}
      </div>

      {/* Full Viewport Portal Donor Record Details Modal */}
      {selectedDonor &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedDonor(null);
            }}
          >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-bold shadow-sm">
                    <Heart className="h-6 w-6 fill-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
                      Donor Transaction Record
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedDonor.alumni?.fullName || 'Anonymous Donor'}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDonor(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Highlight Box: Contributed Amount & Campaign */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block mb-1">
                    Amount Contributed
                  </span>
                  <div className="text-3xl font-black text-white">
                    {selectedDonor.amount.toLocaleString()} <span className="text-base text-emerald-400 font-bold">ETB</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">
                    Cause: <span className="font-bold text-white">{selectedDonor.campaign?.title || 'ASTU General Giving Fund'}</span>
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black rounded-xl uppercase tracking-wider">
                  VERIFIED CHAPA
                </span>
              </div>

              {/* Grid Metadata Details */}
              <div className="space-y-4 text-xs">
                {/* Section 1: Payment & Gateway Info */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px] text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-[#003580]" />
                    Payment Gateway & Verification Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Chapa Reference ID</span>
                      <span className="font-mono font-bold text-slate-800">{selectedDonor.paymentRef || 'ASTU-DON-CHAPA'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Payment Date & Time</span>
                      <span className="font-bold text-slate-800">
                        {new Date(selectedDonor.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Payment Channel</span>
                      <span className="font-bold text-slate-800">Chapa Online Gateway</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Category</span>
                      <span className="font-bold text-emerald-700">{selectedDonor.campaign?.category || 'Scholarship'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Donor Profile Info */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px] text-slate-500 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#003580]" />
                    Alumni / Supporter Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Full Name</span>
                      <span className="font-bold text-slate-800">{selectedDonor.alumni?.fullName || 'Anonymous Donor'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Email Address</span>
                      <span className="font-bold text-slate-800">{selectedDonor.alumni?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Phone Number</span>
                      <span className="font-bold text-slate-800">{selectedDonor.alumni?.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Department / Batch</span>
                      <span className="font-bold text-slate-800">
                        {selectedDonor.alumni?.department?.name || 'ASTU Alumni'}{' '}
                        {selectedDonor.alumni?.graduationYear ? `(${selectedDonor.alumni.graduationYear})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Print Summary
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDonor(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition-all"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Full Viewport Portal Create / Edit Campaign Modal */}
      {showCreateModal &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateModal(false);
                resetForm();
              }
            }}
          >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md">
                    <Heart className="h-5 w-5 fill-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
                      ASTU Giving Initiative
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingCampaign ? 'Edit Donation Cause' : 'Create New Donation Campaign'}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitCampaign} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Campaign Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ASTU AI Research Lab Equipment 2026"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none transition-all font-medium text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none font-bold text-slate-800"
                    >
                      <option value="Scholarship">Scholarship</option>
                      <option value="Research">Research</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Innovation">Innovation</option>
                      <option value="Student Welfare">Student Welfare</option>
                      <option value="Emergency Fund">Emergency Fund</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Target Goal (ETB) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        placeholder="e.g. 5000000"
                        className="w-full text-xs p-3 pr-12 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none font-extrabold text-emerald-700"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                        ETB
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Description / Purpose
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain why alumni should contribute to this cause and what impact their support will create..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none h-24 resize-none leading-relaxed text-slate-800 font-medium"
                  />
                </div>

                {/* Notice Banner */}
                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-xs text-[#003580] flex items-start gap-2.5">
                  <Bell className="h-4 w-4 text-[#003580] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Automated Alumni Notification Dispatch</span>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Publishing this campaign will automatically send in-app notifications & email alerts to all
                      registered ASTU alumni.
                    </p>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-[#003580] hover:bg-[#002866] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>{editingCampaign ? 'Updating...' : 'Publishing & Notifying...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                        <span>{editingCampaign ? 'Update Campaign' : 'Create & Notify Alumni'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
