import { get, post, put, upload, remove } from './client';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  department: string;
  joinDate: string;
  bio: string;
  photo?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    return get<UserProfile>('/admin/profile');
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return put<UserProfile>('/admin/profile', data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return post<void>('/admin/profile/change-password', data);
  },

  async updateNotificationSettings(settings: NotificationSettings): Promise<void> {
    return put<void>('/admin/profile/notifications', settings);
  },

  async uploadPhoto(file: File): Promise<{ photoUrl: string }> {
    return upload<{ photoUrl: string }>('/admin/profile/photo', file);
  },

  async deletePhoto(): Promise<void> {
    return remove<void>('/admin/profile/photo');
  },
};
