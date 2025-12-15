export enum StatutUtilisateur {
  ACTIVE = "active",
  INACTIF = "inactif",
  EN_ATTENTE = "en_attente",
  SUSPENDU = "suspendu",
}

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
  statut: StatutUtilisateur;
  etablissement_id?: string;
  deux_fa_active?: boolean;
  created_at?: string;
  updated_at?: string;
  etablissement?: {
    id: string;
    nom: string;
  };
}

export interface UserFormData {
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: RoleUtilisateur;
  statut?: StatutUtilisateur;
  etablissement_id?: string;
  mot_de_passe?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: RoleUtilisateur;
  statut?: StatutUtilisateur;
  search?: string;
}

export interface UserStats {
  total: number;
  par_role: Record<RoleUtilisateur, number>;
  par_statut: Record<StatutUtilisateur, number>;
  actifs: number;
  inactifs: number;
}

