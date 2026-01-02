export interface Seance {
  id: string;
  cours_id: string;
  matiere_nom: string;
  enseignant_id: string;
  enseignant_nom: string;
  classe_id: string;
  classe_nom: string;
  salle_id: string;
  salle_nom: string;
  jour: "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi";
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: "cours" | "td" | "tp" | "examen";
  statut: "planifie" | "en_cours" | "termine" | "annule";
  couleur?: string;
}

export interface EmploiTemps {
  semaine: string;
  date_debut: string;
  date_fin: string;
  seances: {
    lundi: Seance[];
    mardi: Seance[];
    mercredi: Seance[];
    jeudi: Seance[];
    vendredi: Seance[];
    samedi?: Seance[];
  };
  statistiques: {
    heures_total: number;
    nombre_seances: number;
    matieres_count: number;
  };
  classe?: {
    id: string;
    nom_classe: string;
    niveau: string;
  };
  creneaux?: any[];
}

export interface GenerationParams {
  classe_id: string;
  nom_version: string;
  periode_debut: string;
  periode_fin: string;
  mode_generation: "rapide" | "equilibre" | "optimal";
  parametres_generation: {
    pause_dejeuner_debut: string;
    pause_dejeuner_fin: string;
    jours_ouvrables: string[];
    duree_creneau_minutes: number;
    max_cours_journalier: number;
  };
  commentaires?: string;
}

export interface EmploiTempsListItem {
  id: string;
  nom_version: string;
  statut: "brouillon" | "valide" | "publie" | "archive";
  periode_debut: string;
  periode_fin: string;
  classe: {
    id: string;
    nom_classe: string;
    niveau: string;
  };
  generateur?: {
    id: string;
    nom: string;
    prenom: string;
  };
  created_at: string;
  score_qualite?: number;
}

export interface EmploiTempsFilters {
  id?: string;
  classe_id?: string;
  enseignant_id?: string;
  statut?: string;
  semaine?: string;
  search?: string;
  page?: number;
  limit?: number;
}
