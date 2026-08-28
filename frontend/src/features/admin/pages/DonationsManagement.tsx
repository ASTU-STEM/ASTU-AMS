import React, { useEffect, useState } from 'react';
import { Heart, Plus, Edit3, Trash2, Users, DollarSign, Target, CheckCircle2, Search, Filter, X, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/admin.service';

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
  campaign?: { title: string; category?: string };
  alumni?: { fullName?: string; email?: string; phone?: string };
}

export default function DonationsManagement() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donors'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
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
          toast.success('New campaign created successfully!');
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

  // Metrics calculation
  const totalRaised = campaigns.reduce((acc, c) => acc + (c.raised || 0), 0);
  const totalGoal = campaigns.reduce((acc, c) => acc + (c.goal || 0), 0);
  const totalDonors = campaigns.reduce((acc, c) => acc + (c.donorCount || 0), 0);

  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDonors = donors.filter(d =>
    (d.alumni?.fullName && d.alumni.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.campaign?.title && d.campaign.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.paymentRef && d.paymentRef.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
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
          <p className="text-2xl font-black text-slate-900 mt-2">{campaigns.length}</p>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaign or donor..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Tab 1: Campaigns Management Grid */}
        {activeTab === 'campaigns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredCampaigns.map((c) => {
              const progressPct = Math.min(100, Math.round(((c.raised || 0) / (c.goal || 1)) * 100));
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
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
        )}

        {/* Tab 2: Donor Records Table */}
        {activeTab === 'donors' && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold tracking-wider">
                  <th className="px-4 py-3">Donor Name</th>
                  <th className="px-4 py-3">Campaign Cause</th>
                  <th className="px-4 py-3">Amount Contributed</th>
                  <th className="px-4 py-3">Chapa Reference</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {d.alumni?.fullName || 'Anonymous Donor'}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {d.campaign?.title || 'ASTU Scholarship Fund 2026'}
                    </td>
                    <td className="px-4 py-3.5 font-black text-emerald-700">
                      {d.amount.toLocaleString()} ETB
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                      {d.paymentRef || 'ASTU-DON-CHAPA'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        VERIFIED CHAPA
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredDonors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No donor transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingCampaign ? 'Edit Donation Cause' : 'Create New Donation Campaign'}
              </h3>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCampaign} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ASTU AI Research Lab Equipment 2026"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Scholarship">Scholarship</option>
                    <option value="Research">Research</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Innovation">Innovation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Target Goal (ETB)
                  </label>
                  <input
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="e.g. 5000000"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Description / Purpose
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why alumni should contribute to this cause..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
