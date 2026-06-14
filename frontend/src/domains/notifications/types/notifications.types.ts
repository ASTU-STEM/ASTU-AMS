export interface NotificationTemplate {
  id: string;
  type: 'SURVEY' | 'JOB' | 'EVENT' | 'MESSAGE' | 'MENTORSHIP' | 'DOCUMENT' | 'SYSTEM' | 'DONATION';
  title: string;
  body: string;
  channel: 'EMAIL' | 'IN_APP' | 'BOTH';
  audience: 'ALL' | 'ALUMNI' | 'EMPLOYER' | 'DEPARTMENT' | 'REGISTRAR' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  templateId: string;
  userId: string;
  channel: 'EMAIL' | 'IN_APP';
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'PENDING';
  sentAt: string;
  deliveredAt?: string;
  error?: string;
}
