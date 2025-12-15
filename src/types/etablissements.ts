export enum TypeEtablissement {
  ECOLE_PRIMAIRE = "ecole_primaire",
  COLLEGE = "college",
  LYCEE = "lycee",
  UNIVERSITE = "universite",
  INSTITUT = "institut",
}

export enum StatutEtablissement {
  ACTIVE = "active",
  SUSPENDU = "suspendu",
  ARCHIVE = "archive",
}

export interface Etablissement {
  id: string;
  nom: string;
  type: TypeEtablissement;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  logo_url?: string;
  code_acces?: string;
  fuseau_horaire: string;
  langue: string;
  annee_scolaire_courante: string;
  statut: StatutEtablissement;
  created_at?: string;
  updated_at?: string;
}

export interface EtablissementFormData {
  nom: string;
  type: TypeEtablissement;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  logo_url?: string;
  fuseau_horaire?: string;
  langue?: string;
  annee_scolaire_courante: string;
  statut?: StatutEtablissement;
}

export interface EtablissementFilters {
  page?: number;
  limit?: number;
  type?: TypeEtablissement;
  statut?: StatutEtablissement;
  search?: string;
}

export interface EtablissementStats {
  total_classes: number;
  total_enseignants: number;
  total_etudiants: number;
  total_cours: number;
  total_salles: number;
  total_emplois_temps: number;
}

