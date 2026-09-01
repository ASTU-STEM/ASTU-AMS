import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generic response unwrapper
const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

export const alumniService = {
  // ─── Profile ──────────────────────────────────────────────────────────────
  async getProfile() {
    return unwrap(await apiClient.get('/alumni/me'));
  },

  async updateProfile(data: any | FormData) {
    if (data instanceof FormData) {
      return unwrap(await apiClient.put('/alumni/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }));
    }
    return unwrap(await apiClient.put('/alumni/me', data));
  },

  async uploadCertificate(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('certificateImage', file);
    return unwrap(await apiClient.post('/alumni/upload-certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },

  async addExperience(data: any) {
    return unwrap(await apiClient.post('/alumni/experiences', data));
  },

  async updateExperience(id: string, data: any) {
    return unwrap(await apiClient.put(`/alumni/experiences/${id}`, data));
  },

  async deleteExperience(id: string) {
    return unwrap(await apiClient.delete(`/alumni/experiences/${id}`));
  },

  // ─── Jobs Board ───────────────────────────────────────────────────────────
  async getJobs(params?: { search?: string; type?: string; location?: string; page?: number; limit?: number }) {
    return unwrap(await apiClient.get('/jobs', { params }));
  },

  async getJobDetail(jobId: string) {
    return unwrap(await apiClient.get(`/jobs/detail/${jobId}`));
  },

  async applyToJob(jobId: string, data: { coverLetter?: string }, resumeFile?: File) {
    const formData = new FormData();
    if (data.coverLetter) formData.append('coverLetter', data.coverLetter);
    if (resumeFile) formData.append('resume', resumeFile);
    return unwrap(await apiClient.post(`/jobs/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },

  async withdrawApplication(jobId: string) {
    return unwrap(await apiClient.delete(`/jobs/${jobId}/application`));
  },

  async getMyApplications() {
    return unwrap(await apiClient.get('/jobs/my-applications'));
  },

  async saveJob(jobId: string) {
    return unwrap(await apiClient.post(`/jobs/${jobId}/save`));
  },

  async unsaveJob(jobId: string) {
    return unwrap(await apiClient.delete(`/jobs/${jobId}/save`));
  },

  async getSavedJobs() {
    return unwrap(await apiClient.get('/jobs/saved'));
  },

  async getRecommendedJobs() {
    return unwrap(await apiClient.get('/jobs/recommended'));
  },

  // ─── Events / Career ─────────────────────────────────────────────────────
  async getEvents() {
    return unwrap(await apiClient.get('/events'));
  },

  async rsvpEvent(eventId: string, status: string = 'ATTENDING') {
    return unwrap(await apiClient.post(`/events/${eventId}/rsvp`, { status }));
  },

  // ─── Mentorship ───────────────────────────────────────────────────────────
  async getMyMentors() {
    return unwrap(await apiClient.get('/mentorship/my-mentors'));
  },

  async getMyMentees() {
    return unwrap(await apiClient.get('/mentorship/my-mentees'));
  },

  async requestMentorship(mentorId: string, message?: string) {
    return unwrap(await apiClient.post('/mentorship/request', { mentorId, message }));
  },

  async respondMentorship(requestId: string, status: string) {
    return unwrap(await apiClient.put(`/mentorship/${requestId}/respond`, { status }));
  },

  async getMentorProfiles() {
    return unwrap(await apiClient.get('/alumni/mentors'));
  },

  async getMyMentorStatus() {
    return unwrap(await apiClient.get('/alumni/mentors/my-status'));
  },

  async registerAsMentor(data: { expertise?: string[]; yearsExperience?: number; availability?: string; status?: string }) {
    return unwrap(await apiClient.post('/alumni/mentors/register', data));
  },

  async toggleMentorStatus() {
    return unwrap(await apiClient.post('/alumni/mentors/toggle'));
  },

  async scheduleSession(mentorId: string, data: { date: string; time: string; topic: string }) {
    return unwrap(await apiClient.post('/alumni/mentorship-sessions', { mentorId, ...data }));
  },

  // ─── Documents ────────────────────────────────────────────────────────────
  async uploadDocumentFile(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('documentFile', file);
    return unwrap(await apiClient.post('/alumni/upload-document-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },

  async getMyDocuments() {
    return unwrap(await apiClient.get('/alumni/document-requests'));
  },

  async requestDocument(data: { documentType: string; additionalInstructions?: string; fileUrls?: string[] }) {
    return unwrap(await apiClient.post('/alumni/document-requests', data));
  },

  async initializeChapaDocumentPayment(data: { documentType: string; additionalInstructions?: string; amount: number }) {
    return unwrap(await apiClient.post('/alumni/chapa/initialize-document-payment', data));
  },

  async verifyChapaDocumentPayment(data: { tx_ref: string; documentType: string; additionalInstructions?: string; amount: number }) {
    return unwrap(await apiClient.post('/alumni/chapa/verify-document-payment', data));
  },

  // ─── Forum / Community ────────────────────────────────────────────────────
  async getForumPosts() {
    return unwrap(await apiClient.get('/alumni/forum'));
  },

  async createForumPost(content: string, category: string = 'General') {
    return unwrap(await apiClient.post('/alumni/forum', { content, category }));
  },

  async updateForumPost(postId: string, content: string) {
    return unwrap(await apiClient.put(`/alumni/forum/${postId}`, { content }));
  },

  async deleteForumPost(postId: string) {
    return unwrap(await apiClient.delete(`/alumni/forum/${postId}`));
  },

  async toggleForumLike(postId: string) {
    return unwrap(await apiClient.post(`/alumni/forum/${postId}/like`));
  },

  async addForumComment(postId: string, content: string) {
    return unwrap(await apiClient.post(`/alumni/forum/${postId}/comment`, { content }));
  },

  // ─── Donations / Giving ───────────────────────────────────────────────────
  async getDonationCampaigns() {
    return unwrap(await apiClient.get('/alumni/donations'));
  },

  async makeDonation(campaignId: string, amount: number, paymentRef?: string) {
    return unwrap(await apiClient.post('/alumni/donations', { campaignId, amount, paymentRef }));
  },

  async initializeChapaDonationPayment(data: { campaignId: string; amount: number; donorName?: string }) {
    return unwrap(await apiClient.post('/alumni/chapa/initialize-donation-payment', data));
  },

  async verifyChapaDonationPayment(data: { tx_ref: string; campaignId: string; amount: number; paymentRef?: string }) {
    return unwrap(await apiClient.post('/alumni/chapa/verify-donation-payment', data));
  },

  // ─── Messages ───────────────────────────────────────────────────────────
  async getMessageThreads() {
    return unwrap(await apiClient.get('/alumni/messages'));
  },

  async getThreadMessages(employerId: string) {
    return unwrap(await apiClient.get(`/alumni/messages/${employerId}`));
  },

  async sendMessage(employerId: string, text: string) {
    return unwrap(await apiClient.post(`/alumni/messages/${employerId}`, { text }));
  },

  // ─── Dashboard Stats ─────────────────────────────────────────────────────
  async getDashboardStats() {
    return unwrap(await apiClient.get('/alumni/dashboard-stats'));
  },

  // ─── Settings / Preferences ──────────────────────────────────────────────
  async getPreferences() {
    return unwrap(await apiClient.get('/alumni/preferences'));
  },

  async savePreferences(preferences: any) {
    return unwrap(await apiClient.put('/alumni/preferences', preferences));
  },

  // ─── Documents ────────────────────────────────────────────────────────────
  async getDocumentRequests() {
    return unwrap(await apiClient.get('/alumni/documents'));
  },

  // ─── Change Password ─────────────────────────────────────────────────────
  async changePassword(currentPassword: string, newPassword: string) {
    return unwrap(await apiClient.put('/alumni/change-password', { currentPassword, newPassword }));
  },

  // ─── Security & Account ──────────────────────────────────────────────────
  async getSecurityStatus() {
    return unwrap(await apiClient.get('/alumni/security-status'));
  },

  async exportAccountData() {
    return unwrap(await apiClient.get('/alumni/export-data'));
  },

  async deleteAccount() {
    return unwrap(await apiClient.delete('/alumni/account'));
  },
};
