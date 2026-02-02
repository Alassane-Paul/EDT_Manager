export enum StatutClasse {
  ACTIVE = "active",
  ARCHIVEE = "archivee",
}

export interface Classe {
  id: string;
  etablissement_id: string;
  nom_classe: string;
  niveau: string;
  filiere?: string;
  effectif: number;
  annee_scolaire: string;
  salle_principale?: string;
  statut: StatutClasse;
  created_at?: string;
  updated_at?: string;
  etablissement?: {
    id: string;
    nom: string;
    ville?: string;
  };
  cours?: any[];
  emplois_temps?: any[];
  eleves?: any[];
}

export interface ClasseFormData {
  nom_classe?: string;
  niveau?: string;
  filiere?: string;
  effectif?: number;
  annee_scolaire?: string;
  salle_principale?: string;
  statut?: StatutClasse;
  etablissement_id?: string;
}

export interface ClasseFilters {
  page?: number;
  limit?: number;
  niveau?: string;
  statut?: StatutClasse;
  search?: string;
  etablissement_id?: string;
  filiere?: string;
}

export interface ClasseStats {
  total_cours: number;
  total_etudiants: number;
  total_heures_hebdo: number;
  enseignants_count: number;
}

