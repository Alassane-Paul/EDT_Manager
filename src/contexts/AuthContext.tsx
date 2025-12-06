import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAuthToken, clearAuthToken, ApiUser } from '@/lib/api';

// Types pour les rôles - alignés avec ton API
export type UserRole = 'admin' | 'directeur' | 'responsable_pedagogique' | 'enseignant' | 'etudiant' | 'personnel';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: string;
  establishmentId?: string;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  requires2FA: boolean;
  tempToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  verify2FA: (code: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string, role: UserRole, accessCode?: string) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mapper les données de l'API vers notre format User
const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  firstName: apiUser.prenom,
  lastName: apiUser.nom,
  role: apiUser.role as UserRole,
  status: apiUser.statut,
  establishmentId: apiUser.etablissement_id,
  twoFactorEnabled: apiUser.two_factor_enabled,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Valider le token en récupérant le profil
          const profile = await authApi.getProfile();
          const mappedUser = mapApiUserToUser(profile);
          setUser(mappedUser);
          localStorage.setItem('user', JSON.stringify(mappedUser));
        } catch (error) {
          // Token invalide ou expiré
          console.error('Token validation failed:', error);
          clearAuthToken();
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean }> => {
    try {
      const response = await authApi.login({
        email,
        mot_de_passe: password,
      });

      // Si 2FA est requis
      if (response.requires2FA && response.tempToken) {
        setRequires2FA(true);
        setTempToken(response.tempToken);
        return { success: true, requires2FA: true };
      }

      // Connexion réussie sans 2FA
      if (response.token && response.user) {
        setAuthToken(response.token);
        const mappedUser = mapApiUserToUser(response.user);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        setRequires2FA(false);
        setTempToken(null);
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    if (!tempToken) {
      throw new Error('Aucun token temporaire disponible');
    }

    try {
      const response = await authApi.verify2FA({
        tempToken,
        code,
      });

      if (response.token && response.user) {
        setAuthToken(response.token);
        const mappedUser = mapApiUserToUser(response.user);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        setRequires2FA(false);
        setTempToken(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    accessCode?: string
  ): Promise<boolean> => {
    try {
      const response = await authApi.register({
        email,
        mot_de_passe: password,
        prenom: firstName,
        nom: lastName,
        role,
        code_acces_etablissement: accessCode,
      });

      if (response.token && response.user) {
        setAuthToken(response.token);
        const mappedUser = mapApiUserToUser(response.user);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setRequires2FA(false);
    setTempToken(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await authApi.getProfile();
      const mappedUser = mapApiUserToUser(profile);
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
    } catch (error) {
      console.error('Profile refresh error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        requires2FA,
        tempToken,
        login,
        verify2FA,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
