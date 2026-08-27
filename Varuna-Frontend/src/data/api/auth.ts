/**
 * VARUNA Authentication API
 */

import { apiClient } from './client';
import { UserProfile, UserSession } from '../../domain/models/types';

export interface LoginRequest {
  idToken: string;
}

export interface RegisterRequest {
  idToken: string;
  displayName: string;
  role: 'captain' | 'crew' | 'fleet_manager' | 'researcher';
  harborHomePort?: string;
  licenseNumber?: string;
}

export const authApi = {
  async authenticateWithToken(idToken: string): Promise<UserSession> {
    apiClient.setAuthToken(idToken);
    return apiClient.post<UserSession>('/auth/verify', { idToken });
  },

  async registerUser(data: RegisterRequest): Promise<UserProfile> {
    apiClient.setAuthToken(data.idToken);
    return apiClient.post<UserProfile>('/auth/register', data);
  },

  async getCurrentProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/me');
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/auth/me', updates);
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await apiClient.post<{ success: boolean }>('/auth/logout');
    apiClient.setAuthToken(null);
    return res;
  },
};
