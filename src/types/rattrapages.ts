export enum TypeRattrapage {
  COURS_ANNULE = "cours_annule",
  SOUTIEN = "soutien",
  PREPARATION_EXAMEN = "preparation_examen",
  TUTORAT = "tutorat",
}

export enum StatutRattrapage {
  DEMANDE = "demande",
  VALIDE = "valide",
  REFUSE = "refuse",
  PLANIFIE = "planifie",
  REALISE = "realise",
  ANNULE = "annule",
}

export interface Rattrapage {
  id: string;
  cours_id: string;
  type_rattrapage: TypeRattrapage;
  date_demande: string;
  duree: number;
  eleves_concernes: string[];
  statut: StatutRattrapage;
  motif?: string;
  periode_souhaitee_debut?: string;
  periode_souhaitee_fin?: string;
  creneau_planifie_id?: string;
  date_planification?: string;
  date_realisation?: string;
  commentaires?: string;
  created_at?: string;
  updated_at?: string;
  cours?: {
    id: string;
    matiere: {
      id: string;
      nom_matiere: string;
      code_matiere: string;
    };
    classe: {
      id: string;
      nom_classe: string;
      niveau: string;
    };
    enseignant: {
      id: string;
      utilisateur: {
        id: string;
        nom: string;
        prenom: string;
      };
    };
  };
}

export interface RattrapageFormData {
  cours_id: string;
  type_rattrapage: TypeRattrapage;
  duree: number;
  eleves_concernes: string[];
  motif?: string;
  periode_souhaitee_debut?: string;
  periode_souhaitee_fin?: string;
  commentaires?: string;
}

export interface RattrapageFilters {
  page?: number;
  limit?: number;
  statut?: StatutRattrapage;
  type_rattrapage?: TypeRattrapage;
  cours_id?: string;
  enseignant_id?: string;
  search?: string;
}

export interface RattrapageStats {
  total: number;
  par_statut: Record<StatutRattrapage, number>;
  urgents: number;
  cette_semaine: number;
}

export interface PlanifierRattrapageData {
  date: string;
  heure_debut: string;
  salle_id: string;
  commentaires?: string;
}

