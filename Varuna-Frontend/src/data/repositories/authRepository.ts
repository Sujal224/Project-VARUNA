/**
 * VARUNA Auth Repository
 */

import { authApi, RegisterRequest } from '../api/auth';
import { UserProfile, UserSession } from '../../domain/models/types';
import { ENV } from '../config/environment';

const MOCK_USER: UserProfile = {
  uid: 'vsl-captain-varuna-01',
  email: 'captain.ramesh@varunamarine.in',
  displayName: 'Captain Ramesh V.',
  phoneNumber: '+91 98480 22334',
  photoURL: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
  role: 'captain',
  harborHomePort: 'Visakhapatnam Harbor Pier 4',
  licenseNumber: 'IND-DG-MAR-2024-8842',
  createdAt: new Date().toISOString(),
};

class AuthRepository {
  private currentSession: UserSession = {
    user: MOCK_USER,
    idToken: 'mock-dev-token',
    isAuthenticated: true,
  };

  public async getSession(): Promise<UserSession> {
    return this.currentSession;
  }

  public async getCurrentUser(): Promise<UserProfile | null> {
    if (!ENV.USE_MOCK_DATA_FALLBACK) {
      try {
        const user = await authApi.getCurrentProfile();
        this.currentSession.user = user;
        return user;
      } catch (err) {
        console.warn('[AuthRepository] Failed fetching remote profile, using session user:', err);
      }
    }
    return this.currentSession.user;
  }

  public async loginWithToken(idToken: string): Promise<UserSession> {
    try {
      const session = await authApi.authenticateWithToken(idToken);
      this.currentSession = session;
      return session;
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        this.currentSession = {
          user: MOCK_USER,
          idToken,
          isAuthenticated: true,
        };
        return this.currentSession;
      }
      throw err;
    }
  }

  public async register(req: RegisterRequest): Promise<UserProfile> {
    try {
      const profile = await authApi.registerUser(req);
      this.currentSession.user = profile;
      return profile;
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        const profile: UserProfile = {
          uid: 'uid_' + Date.now(),
          email: 'user@varunamarine.in',
          displayName: req.displayName,
          phoneNumber: null,
          photoURL: null,
          role: req.role,
          harborHomePort: req.harborHomePort,
          licenseNumber: req.licenseNumber,
        };
        this.currentSession.user = profile;
        return profile;
      }
      throw err;
    }
  }

  public async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('[AuthRepository] Remote logout failed, clearing local session:', err);
    }
    this.currentSession = {
      user: null,
      idToken: null,
      isAuthenticated: false,
    };
  }
}

export const authRepository = new AuthRepository();
