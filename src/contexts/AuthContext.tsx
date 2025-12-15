import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAuthToken, clearAuthToken,  } from '@/api/auth/api';
import { ApiUser } from '@/types/auth';

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
  requires2FASetup: boolean;
  setup2FAData: { qrCode: string; secret: string } | null;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  verify2FA: (code: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string, role: UserRole, accessCode?: string) => Promise<{ success: boolean; requires2FASetup?: boolean; setup2FAData?: { qrCode: string; secret: string } }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  clear2FASetup: () => void;
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
  twoFactorEnabled: apiUser.deux_fa_active,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [requires2FASetup, setRequires2FASetup] = useState(false);
  const [setup2FAData, setSetup2FAData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [pending2FAEmail, setPending2FAEmail] = useState<string | null>(null);

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
        password: password,
      });
      console.log('Login response:', response);
      
      // Si 2FA est requis
      if (response.requires2FA) {
        setRequires2FA(true);
        setPending2FAEmail(email);
        return { success: true, requires2FA: true };
      }

      // Connexion réussie sans 2FA
      if (response.token && response.utilisateur) {
        setAuthToken(response.token);
        const mappedUser = mapApiUserToUser(response.utilisateur);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        setRequires2FA(false);
        setPending2FAEmail(null);
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    if (!pending2FAEmail) {
      throw new Error('Aucun email en attente de vérification 2FA');
    }

    try {
      const response = await authApi.verify2FA({
        email: pending2FAEmail,
        twoFAToken: code,
      });

      if (response.token) {
        setAuthToken(response.token);
        // Récupérer le profil utilisateur pour avoir les informations complètes
        const profile = await authApi.getProfile();
        const mappedUser = mapApiUserToUser(profile);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        setRequires2FA(false);
        setPending2FAEmail(null);
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
  ): Promise<{ success: boolean; requires2FASetup?: boolean; setup2FAData?: { qrCode: string; secret: string } }> => {
    try {
      const response = await authApi.register({
        email,
        password: password,
        prenom: firstName,
        nom: lastName,
        role,
        code_acces_etablissement: accessCode,
      });

      if (response.token && response.utilisateur) {
        setAuthToken(response.token);
        const mappedUser = mapApiUserToUser(response.utilisateur);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        
        // Si 2FA setup est requis, retourner les données
        if (response.utilisateur.deux_fa_setup_required && response.utilisateur.qr_code_url && response.utilisateur.secret) {
          setRequires2FASetup(true);
          const setupData = {
            qrCode: response.utilisateur.qr_code_url,
            secret: response.utilisateur.secret
          };
          setSetup2FAData(setupData);
          return { success: true, requires2FASetup: true, setup2FAData: setupData };
        }
        
        return { success: true };
      }

      console.log(response);
      return { success: false };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const clear2FASetup = () => {
    setRequires2FASetup(false);
    setSetup2FAData(null);
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setRequires2FA(false);
    setRequires2FASetup(false);
    setSetup2FAData(null);
    setPending2FAEmail(null);
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
        requires2FASetup,
        setup2FAData,
        login,
        verify2FA,
        signup,
        logout,
        refreshProfile,
        clear2FASetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
