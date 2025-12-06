// Configuration de l'API EDT Generator
const API_BASE_URL = 'http://localhost:5000/api';

// Types pour l'API
export interface ApiError {
  error: string;
  details?: string;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface RegisterRequest {
  email: string;
  mot_de_passe: string;
  prenom: string;
  nom: string;
  role?: string;
  code_acces_etablissement?: string;
}

export interface LoginResponse {
  message: string;
  requires2FA?: boolean;
  tempToken?: string;
  user?: ApiUser;
  token?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: string;
  statut: string;
  etablissement_id?: string;
  two_factor_enabled?: boolean;
}

export interface Verify2FARequest {
  tempToken: string;
  code: string;
}

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

// Headers par défaut
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Service d'authentification
export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },

  async verify2FA(data: Verify2FARequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },

  async getProfile(): Promise<ApiUser> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },

  async updateProfile(data: Partial<ApiUser>): Promise<ApiUser> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        mot_de_passe_actuel: currentPassword,
        nouveau_mot_de_passe: newPassword,
      }),
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
  },

  async setup2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/setup-2fa`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },

  async activate2FA(code: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/activate-2fa`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
  },
};

// Health check
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
