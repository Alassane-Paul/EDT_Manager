export enum RoleUtilisateur {
  ADMIN = "admin",
  DIRECTEUR = "directeur",
  RESPONSABLE_PEDAGOGIQUE = "responsable_pedagogique",
  ENSEIGNANT = "enseignant",
  ETUDIANT = "etudiant",
  PERSONNEL = "personnel",
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  photo_url?: string;
  role: RoleUtilisateur;
  actif: boolean;
  etablissement_id?: string;
  date_derniere_connexion?: string;
  created_at?: string;
  updated_at?: string;
  etablissement?: {
    id: string;
    nom: string;
    type?: string;
  };
  enseignant?: any;
  eleve?: any;
  directeur?: any;
  responsablePedagogique?: any;
  deux_fa_active?: boolean;
}

export interface UserFormData {
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: RoleUtilisateur;
  actif?: boolean;
  etablissement_id?: string;
  mot_de_passe?: string;
  photo_url?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: RoleUtilisateur;
  actif?: boolean;
  search?: string;
}

export interface UserStats {
  total: number;
  par_role: Record<RoleUtilisateur, number>;
  actifs: number;
  inactifs: number;
}

