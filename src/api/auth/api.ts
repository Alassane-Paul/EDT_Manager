import { ApiUser, LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth";
import axiosInstance from "../axios_instance";
import { Verify2FARequest } from "@/types/api";



// Utilitaire pour gérer les erreurs API
const handleApiError = async (response: Response): Promise<never> => {
  const data = await response.json().catch(() => ({ error: 'Erreur serveur' }));
  throw new Error(data.error || data.message || 'Une erreur est survenue');
};

// Récupérer le token depuis le localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Sauvegarder le token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Supprimer le token
export const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

// Service d'authentification
export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post(`/auth/login`, credentials);
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
    
    return response.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post(`/auth/register`, data);
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
    
    return response.data;
  },

  async verify2FA(data: Verify2FARequest): Promise<LoginResponse> {
    const response = await axiosInstance.post(`/auth/verify-2fa`, data);
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
    
    return response.data;
  },

  async getProfile(): Promise<ApiUser> {
    const response = await axiosInstance.get(`/auth/profile`);
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
    
    // L'API renvoie { utilisateur, code } — retourner l'objet utilisateur directement
    return response.data.utilisateur || response.data;
  },

  async updateProfile(data: Partial<ApiUser>): Promise<ApiUser> {
    const response = await axiosInstance.put(`/auth/profile`, data);
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
    return response.data.utilisateur || response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await axiosInstance.post(`/auth/change-password`, {
      mot_de_passe_actuel: currentPassword,
      nouveau_mot_de_passe: newPassword,
      });
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
  },

  async setup2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await axiosInstance.post(`/auth/setup-2fa`);
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
    
    return response.data;
  },
  async refreshToken(): Promise<{ qrCode: string; secret: string }> {
    const response = await axiosInstance.post(`/auth/refresh-token`);
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
    
    return response.data;
  },

  async activate2FA(code: string): Promise<void> {
    const response = await axiosInstance.post(`/auth/activate-2fa`, { code });
    
    if (!response.status.toString().startsWith('2')) {
      await handleApiError(response.data);
    }
  },
};

// Health check
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`/health`);
    return response.data;
  } catch {
    return false;
  }
};
