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
}

export interface EmploiTempsFilters {
  classe_id?: string;
  enseignant_id?: string;
  semaine?: string;
  date_debut?: string;
  date_fin?: string;
}
