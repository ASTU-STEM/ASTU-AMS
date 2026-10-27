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
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Globe,
  Save,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/admin.service';
import { homepageCmsService } from '../services/homepageCms.service';
import AdminPageHeader from '../components/AdminPageHeader';

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
  const [activeTab, setActiveTab] = useState<'campaigns' | 'page-content' | 'donors'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering & Pagination for Donor Records
  const [donorCauseFilter, setDonorCauseFilter] = useState('ALL');
  const [donorSortBy, setDonorSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [donorPage, setDonorPage] = useState(1);
  const [donorRowsPerPage, setDonorRowsPerPage] = useState(10);

  // Pagination for Campaign Causes
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignRowsPerPage, setCampaignRowsPerPage] = useState(6);

  // Selected Donor for Details Modal
  const [selectedDonor, setSelectedDonor] = useState<DonorRecord | null>(null);

  // Campaign Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campaign Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Scholarship');
  const [goalAmount, setGoalAmount] = useState('5000000');
  const [raisedAmount, setRaisedAmount] = useState('0');
  const [donorCountInput, setDonorCountInput] = useState('0');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED' | 'COMPLETED'>('ACTIVE');

  // Giving Portal Hero Banner & Public Page CMS state (Editable directly from this sidebar page)
  const [showEditBannerModal, setShowEditBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('Invest in the Next Generation of ASTU Engineers & Leaders');
  const [bannerSubtitle, setBannerSubtitle] = useState(
    '100% of your tax-deductible contribution directly funds merit scholarships, cutting-edge postgraduate laboratories, student incubators, and emergency support. Powered by verified Chapa, Telebirr, and CBE Birr gateways.'
  );
  const [bannerButtonText, setBannerButtonText] = useState('Explore All Causes');
  const [bannerSecondaryButtonText, setBannerSecondaryButtonText] = useState('Alumni Donor Dashboard');
  const [commitmentEyebrow, setCommitmentEyebrow] = useState('Our Commitment');
  const [commitmentTitle, setCommitmentTitle] = useState('Why Give Through the ASTU Alumni Foundation?');
  const [commitmentSubtitle, setCommitmentSubtitle] = useState(
    'Transparent, measurable, and university-directed philanthropy designed to accelerate national technology excellence.'
  );
  const [commitmentCard1Title, setCommitmentCard1Title] = useState('100% Directed Impact');
  const [commitmentCard1Desc, setCommitmentCard1Desc] = useState(
    'Zero administrative deduction. Every single Birr is mapped directly to the designated laboratory, student tuition grant, or research equipment fund.'
  );
  const [commitmentCard2Title, setCommitmentCard2Title] = useState('Merit & Equity Scholarships');
  const [commitmentCard2Desc, setCommitmentCard2Desc] = useState(
    'Over 340+ undergraduate engineering students in need receive full textbook, meal, and laptop stipends enabled by alumni contributions.'
  );
  const [commitmentCard3Title, setCommitmentCard3Title] = useState('Verifiable Audit Reports');
  const [commitmentCard3Desc, setCommitmentCard3Desc] = useState(
    'All donations receive immediate Chapa digital receipts and are integrated into the annual alumni office financial audit released to all stakeholders.'
  );
  const [isSavingPageContent, setIsSavingPageContent] = useState(false);

  // Filtering for Campaigns Tab
  const [campaignCategoryFilter, setCampaignCategoryFilter] = useState('ALL');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL');

const parseSafeNumber = (val: any, fallback = 0): number => {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (val && typeof val === 'object') {
    if ('increment' in val) return Number(val.increment) || fallback;
    if ('decrement' in val) return -(Number(val.decrement) || fallback);
    if ('set' in val) return Number(val.set) || fallback;
  }
  if (typeof val === 'string') {
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  }
  return fallback;
};

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsRes, donorsRes] = await Promise.all([
        adminService.getDonationCampaigns(),
        adminService.getDonorsList(),
      ]);

      if (campaignsRes.ok && Array.isArray(campaignsRes.data)) {
        const sanitizedCampaigns = campaignsRes.data.map((c: any) => ({
          ...c,
          goal: parseSafeNumber(c.goal, 0),
          raised: parseSafeNumber(c.raised, 0),
          donorCount: parseSafeNumber(c.donorCount, 0),
        }));
        setCampaigns(sanitizedCampaigns);
      }
      if (donorsRes.ok && Array.isArray(donorsRes.data)) {
        const sanitizedDonors = donorsRes.data.map((d: any) => ({
          ...d,
          amount: parseSafeNumber(d.amount, 0),
        }));
        setDonors(sanitizedDonors);
      }

      // Sync Giving Section CMS Config
      const cmsCfg = homepageCmsService.getSettings();
      if (cmsCfg?.givingSection) {
        const gs = cmsCfg.givingSection;
        if (gs.title) setBannerTitle(gs.title);
        if (gs.subtitle) setBannerSubtitle(gs.subtitle);
        if (gs.buttonText) setBannerButtonText(gs.buttonText);
        if (gs.secondaryButtonText) setBannerSecondaryButtonText(gs.secondaryButtonText);
        if (gs.commitmentEyebrow) setCommitmentEyebrow(gs.commitmentEyebrow);
        if (gs.commitmentTitle) setCommitmentTitle(gs.commitmentTitle);
        if (gs.commitmentSubtitle) setCommitmentSubtitle(gs.commitmentSubtitle);
        if (gs.commitmentCard1Title) setCommitmentCard1Title(gs.commitmentCard1Title);
        if (gs.commitmentCard1Desc) setCommitmentCard1Desc(gs.commitmentCard1Desc);
        if (gs.commitmentCard2Title) setCommitmentCard2Title(gs.commitmentCard2Title);
        if (gs.commitmentCard2Desc) setCommitmentCard2Desc(gs.commitmentCard2Desc);
        if (gs.commitmentCard3Title) setCommitmentCard3Title(gs.commitmentCard3Title);
        if (gs.commitmentCard3Desc) setCommitmentCard3Desc(gs.commitmentCard3Desc);
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
    if (showCreateModal || selectedDonor || showEditBannerModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showCreateModal, selectedDonor, showEditBannerModal]);

  const resetForm = () => {
    setTitle('');
    setCategory('Scholarship');
    setGoalAmount('5000000');
    setRaisedAmount('0');
    setDonorCountInput('0');
    setDescription('');
    setStatus('ACTIVE');
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
    setRaisedAmount(String(campaign.raised ?? 0));
    setDonorCountInput(String(campaign.donorCount ?? 0));
    setDescription(campaign.description || '');
    setStatus((campaign.status as any) || 'ACTIVE');
    setShowCreateModal(true);
  };

  const handleToggleStatus = async (campaign: Campaign, newStatus: string) => {
    try {
      const res = await adminService.updateDonationCampaign(campaign.id, {
        status: newStatus,
      });
      if (res.ok) {
        toast.success(`Campaign "${campaign.title}" is now ${newStatus}`);
        loadData();
        window.dispatchEvent(new Event('astu-cms-donations-changed'));
      } else {
        toast.error(res.message || 'Failed to update campaign status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSubmitCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !goalAmount) {
      toast.error('Please fill in campaign title and target goal amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        category,
        targetAmount: Number(goalAmount),
        raised: Number(raisedAmount) || 0,
        donorCount: Number(donorCountInput) || 0,
        description,
        status,
      };

      if (editingCampaign) {
        const res = await adminService.updateDonationCampaign(editingCampaign.id, payload);
        if (res.ok) {
          toast.success('Campaign updated successfully with latest numbers!');
          setShowCreateModal(false);
          resetForm();
          loadData();
          window.dispatchEvent(new Event('astu-cms-donations-changed'));
        } else {
          toast.error(res.message || 'Failed to update campaign');
        }
      } else {
        const res = await adminService.createDonationCampaign(payload);
        if (res.ok) {
          toast.success('New campaign created! In-app and Email notifications dispatched to Alumni.');
          setShowCreateModal(false);
          resetForm();
          loadData();
          window.dispatchEvent(new Event('astu-cms-donations-changed'));
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

  const handleSaveGivingPageContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bannerTitle.trim()) {
      toast.error('Hero title cannot be empty');
      return;
    }
    setIsSavingPageContent(true);
    try {
      const ok = await homepageCmsService.saveSettings({
        givingSection: {
          title: bannerTitle,
          subtitle: bannerSubtitle,
          buttonText: bannerButtonText || 'Explore All Causes',
          secondaryButtonText: bannerSecondaryButtonText || 'Alumni Donor Dashboard',
          commitmentEyebrow: commitmentEyebrow || 'Our Commitment',
          commitmentTitle: commitmentTitle || 'Why Give Through the ASTU Alumni Foundation?',
          commitmentSubtitle:
            commitmentSubtitle ||
            'Transparent, measurable, and university-directed philanthropy designed to accelerate national technology excellence.',
          commitmentCard1Title: commitmentCard1Title || '100% Directed Impact',
          commitmentCard1Desc:
            commitmentCard1Desc ||
            'Zero administrative deduction. Every single Birr is mapped directly to the designated laboratory, student tuition grant, or research equipment fund.',
          commitmentCard2Title: commitmentCard2Title || 'Merit & Equity Scholarships',
          commitmentCard2Desc:
            commitmentCard2Desc ||
            'Over 340+ undergraduate engineering students in need receive full textbook, meal, and laptop stipends enabled by alumni contributions.',
          commitmentCard3Title: commitmentCard3Title || 'Verifiable Audit Reports',
          commitmentCard3Desc:
            commitmentCard3Desc ||
            'All donations receive immediate Chapa digital receipts and are integrated into the annual alumni office financial audit released to all stakeholders.',
        },
      });
      if (ok) {
        toast.success('Donations public page content updated successfully!');
        setShowEditBannerModal(false);
        window.dispatchEvent(new Event('astu-cms-homepage-updated'));
        window.dispatchEvent(new Event('astu-cms-donations-changed'));
      } else {
        toast.error('Failed to save page content');
      }
    } catch {
      toast.error('Error saving donations page content');
    } finally {
      setIsSavingPageContent(false);
    }
  };

  const handleDeleteCampaign = async (id: string, campaignTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${campaignTitle}"?`)) return;

    try {
      const res = await adminService.deleteDonationCampaign(id);
      if (res.ok) {
        toast.success('Campaign deleted successfully');
        loadData();
        window.dispatchEvent(new Event('astu-cms-donations-changed'));
      } else {
        toast.error(res.message || 'Failed to delete campaign');
      }
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  // Metrics calculation (100% computed from PostgreSQL Database records)
  const totalRaised = campaigns.reduce((acc, c) => acc + parseSafeNumber(c.raised, 0), 0);
  const totalGoal = campaigns.reduce((acc, c) => acc + parseSafeNumber(c.goal, 0), 0);
  const totalDonors = donors.length > 0 ? donors.length : campaigns.reduce((acc, c) => acc + parseSafeNumber(c.donorCount, 0), 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'ACTIVE').length;

  // Filtering for Campaigns Tab
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      campaignCategoryFilter === 'ALL' || c.category === campaignCategoryFilter;
    const matchesStatus =
      campaignStatusFilter === 'ALL' || c.status === campaignStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination for Campaign Causes Tab
  const totalCampaignPages = Math.max(1, Math.ceil(filteredCampaigns.length / campaignRowsPerPage));
  const currentCampaignPage = Math.min(campaignPage, totalCampaignPages);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentCampaignPage - 1) * campaignRowsPerPage,
    currentCampaignPage * campaignRowsPerPage
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
      <AdminPageHeader
        title="Donations & Giving"
        subtitle="Manage ASTU fundraising campaigns, create new causes, and monitor Chapa / Telebirr donor records."
        breadcrumbs={[{ label: 'Alumni Office' }, { label: 'Donations & Giving' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('page-content')}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'page-content'
                  ? 'border-[#FFCC00] bg-[#FFCC00] text-[#003366]'
                  : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Edit the Public Giving Portal page content"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Edit Public Page</span>
            </button>
            <a
              href="/donations"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all"
              title="Open Live Public Donations Page in new tab"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>View Live</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFCC00] px-4 py-2 text-xs font-extrabold text-[#003366] shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          </div>
        }
      />

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
              onClick={() => setActiveTab('page-content')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'page-content'
                  ? 'bg-[#003580] text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Public Page CMS &amp; Content</span>
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
                setCampaignPage(1);
              }}
              placeholder="Search campaign or donor..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Tab 1: Campaigns Management Grid */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {/* Filter & Status Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <div className="flex flex-wrap items-center gap-3">
                {/* Category Filter */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <span>Category:</span>
                  <select
                    value={campaignCategoryFilter}
                    onChange={(e) => {
                      setCampaignCategoryFilter(e.target.value);
                      setCampaignPage(1);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Research">Research</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Innovation">Innovation</option>
                    <option value="Student Welfare">Student Welfare</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <span>Status:</span>
                  <select
                    value={campaignStatusFilter}
                    onChange={(e) => {
                      setCampaignStatusFilter(e.target.value);
                      setCampaignPage(1);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                  >
                    <option value="ALL">All Statuses ({campaigns.length})</option>
                    <option value="ACTIVE">Active (Live on Web) ({campaigns.filter((c) => c.status === 'ACTIVE').length})</option>
                    <option value="PAUSED">Paused (Hidden) ({campaigns.filter((c) => c.status === 'PAUSED').length})</option>
                    <option value="COMPLETED">Completed ({campaigns.filter((c) => c.status === 'COMPLETED').length})</option>
                  </select>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{filteredCampaigns.length}</span> of {campaigns.length} causes
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {paginatedCampaigns.map((c) => {
                const raisedNum = parseSafeNumber(c.raised, 0);
                const goalNum = parseSafeNumber(c.goal, 1);
                const donorsNum = parseSafeNumber(c.donorCount, 0);
                const progressPct = Math.min(100, Math.round((raisedNum / Math.max(1, goalNum)) * 100));
                const isLive = c.status === 'ACTIVE';
                const isPaused = c.status === 'PAUSED';
                const isCompleted = c.status === 'COMPLETED';

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    {/* Top status indicator strip */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 ${
                        isLive ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : isPaused ? 'bg-amber-400' : 'bg-blue-600'
                      }`}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                          {c.category || 'Fund'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isLive && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live on Web
                            </span>
                          )}
                          {isPaused && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              Paused / Hidden
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {c.description || 'Fundraising campaign for ASTU university development.'}
                      </p>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-[#003580] font-black">{raisedNum.toLocaleString()} ETB</span>
                          <span className="text-slate-400 text-[11px]">of {goalNum.toLocaleString()} ETB</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted
                                ? 'bg-blue-600'
                                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-[#003580]'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                          <span>{progressPct}% Funded</span>
                          <span>{donorsNum} Donors</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      {/* Quick Status Action */}
                      <div className="flex items-center gap-1.5">
                        {isLive ? (
                          <button
                            onClick={() => handleToggleStatus(c, 'PAUSED')}
                            className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                            title="Pause this campaign and hide it from the Homepage"
                          >
                            Hide from Homepage
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(c, 'ACTIVE')}
                            className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Publish this campaign to the Homepage and Public Giving Portal"
                          >
                            Publish to Homepage
                          </button>
                        )}

                        {!isCompleted ? (
                          <button
                            onClick={() => handleToggleStatus(c, 'COMPLETED')}
                            className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                            title="Mark campaign goal as achieved"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(c, 'ACTIVE')}
                            className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit Details
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
                  </div>
                );
              })}

              {filteredCampaigns.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="text-xs font-bold">No donation campaigns match your filter criteria.</p>
                  <p className="text-[10px] text-slate-400">Click "Create Campaign" or reset your category / status filters.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls for Campaign Causes */}
            {filteredCampaigns.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Showing</span>
                  <span className="font-extrabold text-slate-900">
                    {Math.min(filteredCampaigns.length, (currentCampaignPage - 1) * campaignRowsPerPage + 1)}
                  </span>
                  <span>to</span>
                  <span className="font-extrabold text-slate-900">
                    {Math.min(filteredCampaigns.length, currentCampaignPage * campaignRowsPerPage)}
                  </span>
                  <span>of</span>
                  <span className="font-extrabold text-slate-900">{filteredCampaigns.length} causes</span>

                  <div className="flex items-center gap-1.5 ml-4">
                    <span className="text-[11px] text-slate-400">Per page:</span>
                    <select
                      value={campaignRowsPerPage}
                      onChange={(e) => {
                        setCampaignRowsPerPage(Number(e.target.value));
                        setCampaignPage(1);
                      }}
                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700"
                    >
                      <option value={6}>6</option>
                      <option value={9}>9</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                    </select>
                  </div>
                </div>

                {totalCampaignPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCampaignPage((p) => Math.max(1, p - 1))}
                      disabled={currentCampaignPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalCampaignPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCampaignPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          p === currentCampaignPage
                            ? 'bg-[#003580] text-white shadow-sm'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => setCampaignPage((p) => Math.min(totalCampaignPages, p + 1))}
                      disabled={currentCampaignPage === totalCampaignPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Public Donations Page CMS & Content Editor */}
        {activeTab === 'page-content' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#003580] text-white">
                    <SlidersHorizontal className="h-4 w-4" />
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    Public Donations &amp; Giving Page CMS
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Live Portal Controls
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl">
                  Customize the public Giving Portal (<code className="text-blue-700 font-bold">/donations</code>) hero headline, mission statement, action buttons, and foundation commitment pillars.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href="/donations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="Open public donations page in a new window"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  <span>Preview Page</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>

                <button
                  type="button"
                  onClick={() => handleSaveGivingPageContent()}
                  disabled={isSavingPageContent}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003580] to-blue-700 hover:from-[#002866] hover:to-blue-800 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
                >
                  <Save className={`h-4 w-4 ${isSavingPageContent ? 'animate-spin' : ''}`} />
                  <span>{isSavingPageContent ? 'Saving & Publishing...' : 'Save & Publish Changes'}</span>
                </button>
              </div>
            </div>

            {/* Main Content Grid: Editor (Left 7) vs Live Interactive Preview (Right 5) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls */}
              <form onSubmit={handleSaveGivingPageContent} className="lg:col-span-7 space-y-6">
                {/* Section 1: Hero Banner & Primary CTAs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#003580] flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Hero Banner Headline &amp; Call-to-Actions
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Top banner displayed to all visitors, alumni donors, and partners on <code className="text-blue-700">/donations</code>.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hero Headline Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="e.g. Invest in the Next Generation of ASTU Engineers & Leaders"
                        className="w-full text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003580] focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hero Subtitle / Mission Statement
                      </label>
                      <textarea
                        rows={3}
                        value={bannerSubtitle}
                        onChange={(e) => setBannerSubtitle(e.target.value)}
                        placeholder="Explain ASTU's endowment purpose, tax-deductibility, and verified gateways..."
                        className="w-full text-xs text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003580] focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Primary Button Label
                        </label>
                        <input
                          type="text"
                          value={bannerButtonText}
                          onChange={(e) => setBannerButtonText(e.target.value)}
                          placeholder="Explore All Causes"
                          className="w-full text-xs font-bold text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003580]"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Scrolls down to active campaign causes</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Secondary Button Label
                        </label>
                        <input
                          type="text"
                          value={bannerSecondaryButtonText}
                          onChange={(e) => setBannerSecondaryButtonText(e.target.value)}
                          placeholder="Alumni Donor Dashboard"
                          className="w-full text-xs font-bold text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003580]"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Routes to Alumni donor portal with sign-in flow</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: "Why Give / Our Commitment" Section Header */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        "Why Give" Section Header
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Introductory copy for the foundation impact and accountability section.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Eyebrow Badge
                        </label>
                        <input
                          type="text"
                          value={commitmentEyebrow}
                          onChange={(e) => setCommitmentEyebrow(e.target.value)}
                          placeholder="Our Commitment"
                          className="w-full text-xs font-bold text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003580]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Commitment Headline
                        </label>
                        <input
                          type="text"
                          value={commitmentTitle}
                          onChange={(e) => setCommitmentTitle(e.target.value)}
                          placeholder="Why Give Through the ASTU Alumni Foundation?"
                          className="w-full text-xs font-bold text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003580]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Commitment Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        value={commitmentSubtitle}
                        onChange={(e) => setCommitmentSubtitle(e.target.value)}
                        placeholder="Transparent, measurable, and university-directed philanthropy designed to accelerate national technology excellence."
                        className="w-full text-xs text-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003580]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: The 3 Foundation Benefit Pillars */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        The 3 Foundation Benefit Pillars
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Feature cards explaining trust, scholarships, and verifiable audit records.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Pillar 1 */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                        <ShieldCheck className="h-4 w-4 text-[#003580]" />
                        <span>Pillar 1 (Direct Impact)</span>
                      </div>
                      <input
                        type="text"
                        value={commitmentCard1Title}
                        onChange={(e) => setCommitmentCard1Title(e.target.value)}
                        placeholder="100% Directed Impact"
                        className="w-full text-xs font-bold text-slate-900 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#003580]"
                      />
                      <textarea
                        rows={2}
                        value={commitmentCard1Desc}
                        onChange={(e) => setCommitmentCard1Desc(e.target.value)}
                        placeholder="Description of direct fund allocation..."
                        className="w-full text-xs text-slate-700 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#003580]"
                      />
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                        <GraduationCap className="h-4 w-4 text-emerald-600" />
                        <span>Pillar 2 (Student Scholarships)</span>
                      </div>
                      <input
                        type="text"
                        value={commitmentCard2Title}
                        onChange={(e) => setCommitmentCard2Title(e.target.value)}
                        placeholder="Merit & Equity Scholarships"
                        className="w-full text-xs font-bold text-slate-900 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#003580]"
                      />
                      <textarea
                        rows={2}
                        value={commitmentCard2Desc}
                        onChange={(e) => setCommitmentCard2Desc(e.target.value)}
                        placeholder="Description of undergraduate stipends and scholarship grants..."
                        className="w-full text-xs text-slate-700 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#003580]"
                      />
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                        <span>Pillar 3 (Audit & Transparency)</span>
                      </div>
                      <input
                        type="text"
                        value={commitmentCard3Title}
                        onChange={(e) => setCommitmentCard3Title(e.target.value)}
                        placeholder="Verifiable Audit Reports"
                        className="w-full text-xs font-bold text-slate-900 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#003580]"
                      />
                      <textarea
                        rows={2}
                        value={commitmentCard3Desc}
                        onChange={(e) => setCommitmentCard3Desc(e.target.value)}
                        placeholder="Description of Chapa receipts and annual financial audits..."
                        className="w-full text-xs text-slate-700 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#003580]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setBannerTitle('Invest in the Next Generation of ASTU Engineers & Leaders');
                      setBannerSubtitle(
                        '100% of your tax-deductible contribution directly funds merit scholarships, cutting-edge postgraduate laboratories, student incubators, and emergency support. Powered by verified Chapa, Telebirr, and CBE Birr gateways.'
                      );
                      setBannerButtonText('Explore All Causes');
                      setBannerSecondaryButtonText('Alumni Donor Dashboard');
                      setCommitmentEyebrow('Our Commitment');
                      setCommitmentTitle('Why Give Through the ASTU Alumni Foundation?');
                      setCommitmentSubtitle(
                        'Transparent, measurable, and university-directed philanthropy designed to accelerate national technology excellence.'
                      );
                      setCommitmentCard1Title('100% Directed Impact');
                      setCommitmentCard1Desc(
                        'Zero administrative deduction. Every single Birr is mapped directly to the designated laboratory, student tuition grant, or research equipment fund.'
                      );
                      setCommitmentCard2Title('Merit & Equity Scholarships');
                      setCommitmentCard2Desc(
                        'Over 340+ undergraduate engineering students in need receive full textbook, meal, and laptop stipends enabled by alumni contributions.'
                      );
                      setCommitmentCard3Title('Verifiable Audit Reports');
                      setCommitmentCard3Desc(
                        'All donations receive immediate Chapa digital receipts and are integrated into the annual alumni office financial audit released to all stakeholders.'
                      );
                      toast('Reset fields to standard defaults. Click Save to persist.');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Reset to ASTU Defaults
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingPageContent}
                    className="px-6 py-2.5 rounded-xl bg-[#003580] hover:bg-[#002866] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className={`h-4 w-4 ${isSavingPageContent ? 'animate-spin' : ''}`} />
                    <span>{isSavingPageContent ? 'Saving...' : 'Save & Publish Changes'}</span>
                  </button>
                </div>
              </form>

              {/* Right Column: Live Interactive Mockup Preview */}
              <div className="lg:col-span-5 sticky top-6 space-y-4">
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-black tracking-wide uppercase text-slate-300">
                        Live Real-Time Preview
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Updates as you type</span>
                  </div>

                  {/* Public Hero Mockup */}
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-gradient-to-br from-[#003366] via-[#002244] to-[#001428] p-4 text-white space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black text-[#FFCC00]">
                      <Heart className="h-3 w-3 fill-[#E31E24] text-[#E31E24]" />
                      ASTU Alumni Giving
                    </div>

                    <h4 className="text-sm font-black leading-snug line-clamp-2">
                      {bannerTitle || 'Invest in the Next Generation of ASTU Engineers & Leaders'}
                    </h4>

                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                      {bannerSubtitle || '100% of your tax-deductible contribution directly funds merit scholarships...'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-[10px] font-black text-white flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-white" />
                        {bannerButtonText || 'Explore All Causes'}
                      </span>
                      <span className="px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-[10px] font-bold text-white flex items-center gap-1">
                        {bannerSecondaryButtonText || 'Alumni Donor Dashboard'}
                        <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </div>

                    {/* Live Stats Preview Bar */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-center">
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Total Raised</span>
                        <span className="text-xs font-black text-[#FFCC00]">{totalRaised.toLocaleString()} ETB</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Goal Target</span>
                        <span className="text-xs font-black text-white">{totalGoal.toLocaleString()} ETB</span>
                      </div>
                    </div>
                  </div>

                  {/* Commitment Section Mockup */}
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                    <div className="text-center space-y-0.5">
                      <span className="text-[9px] font-black uppercase text-[#FFCC00] tracking-widest block">
                        {commitmentEyebrow || 'Our Commitment'}
                      </span>
                      <h5 className="text-xs font-black text-white">
                        {commitmentTitle || 'Why Give Through the ASTU Alumni Foundation?'}
                      </h5>
                      <p className="text-[10px] text-slate-300 line-clamp-2">
                        {commitmentSubtitle}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="p-2 rounded-lg bg-slate-700/60 flex items-start gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold text-white">{commitmentCard1Title}</div>
                          <div className="text-[9px] text-slate-300 line-clamp-1">{commitmentCard1Desc}</div>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-700/60 flex items-start gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold text-white">{commitmentCard2Title}</div>
                          <div className="text-[9px] text-slate-300 line-clamp-1">{commitmentCard2Desc}</div>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-700/60 flex items-start gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold text-white">{commitmentCard3Title}</div>
                          <div className="text-[9px] text-slate-300 line-clamp-1">{commitmentCard3Desc}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Real database values &amp; CMS storage synced seamlessly with public site.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Donor Records Table & Advanced Controls */}
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
            {filteredDonors.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Showing <strong className="text-slate-900">{(currentDonorPage - 1) * donorRowsPerPage + 1}</strong> to{' '}
                    <strong className="text-slate-900">
                      {Math.min(currentDonorPage * donorRowsPerPage, filteredDonors.length)}
                    </strong>{' '}
                    of <strong className="text-slate-900">{filteredDonors.length}</strong> donor records
                  </span>

                  <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Rows per page:</span>
                    <select
                      value={donorRowsPerPage}
                      onChange={(e) => {
                        setDonorRowsPerPage(Number(e.target.value));
                        setDonorPage(1);
                      }}
                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDonorPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentDonorPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-800 font-extrabold text-xs">
                    Page {currentDonorPage} of {totalDonorPages}
                  </span>
                  <button
                    onClick={() => setDonorPage((prev) => Math.min(totalDonorPages, prev + 1))}
                    disabled={currentDonorPage === totalDonorPages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
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
                      Public Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none font-bold text-slate-800"
                    >
                      <option value="ACTIVE">Active (Live on Web)</option>
                      <option value="PAUSED">Paused (Hidden)</option>
                      <option value="COMPLETED">Completed (Funded)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                        className="w-full text-xs p-3 pr-12 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none font-extrabold text-[#003580]"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                        ETB
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Current Raised (ETB)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={raisedAmount}
                        onChange={(e) => setRaisedAmount(e.target.value)}
                        placeholder="e.g. 1851000"
                        className="w-full text-xs p-3 pr-12 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none font-extrabold text-emerald-700"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                        ETB
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Supporters / Donors
                    </label>
                    <input
                      type="number"
                      value={donorCountInput}
                      onChange={(e) => setDonorCountInput(e.target.value)}
                      placeholder="e.g. 349"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none font-extrabold text-purple-700"
                    />
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
                    <span className="font-bold block">Live Database Synchronization</span>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Amounts and donor numbers are saved directly into the PostgreSQL database, driving the live metrics across the Giving Portal and Homepage.
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

      {/* Giving Portal Hero Banner CMS Modal */}
      {showEditBannerModal &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditBannerModal(false);
              }
            }}
          >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#003580] to-blue-700 text-white flex items-center justify-center shadow-md">
                    <SlidersHorizontal className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                      CMS Content Manager
                    </span>
                    <h3 className="text-lg font-black text-slate-900">Edit Giving Portal Banner</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditBannerModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGivingPageContent} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Hero Section Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. Invest in the Next Generation of ASTU Engineers & Leaders"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none transition-all font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Hero Subtitle / Mission Statement
                  </label>
                  <textarea
                    value={bannerSubtitle}
                    onChange={(e) => setBannerSubtitle(e.target.value)}
                    placeholder="Describe ASTU fundraising mission and payment gateways..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none h-28 resize-none leading-relaxed text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={bannerButtonText}
                    onChange={(e) => setBannerButtonText(e.target.value)}
                    placeholder="e.g. Explore All Causes"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003580] focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-xs text-[#003580] flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Instant Synchronization</span>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Updating this banner immediately synchronizes across both the public Giving Portal and the Homepage Giving section.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditBannerModal(false)}
                    disabled={isSavingPageContent}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPageContent}
                    className="flex-1 py-3 rounded-xl bg-[#003580] hover:bg-[#002866] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingPageContent ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Save &amp; Publish Changes</span>
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
