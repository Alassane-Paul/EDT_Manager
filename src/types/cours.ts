export interface Cours {
  id: string;
  matiere_id: string;
  matiere_nom: string;
  enseignant_id: string;
  enseignant_nom: string;
  classe_id: string;
  classe_nom: string;
  heures_total: number;
  heures_effectuees: number;
  couleur?: string;
}

export interface CoursDetail extends Cours {
  prochains_cours: SeanceCours[];
  statistiques: {
    progression: number;
    heures_restantes: number;
  };
}

export interface SeanceCours {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  salle_id: string;
  salle_nom: string;
  statut: "planifie" | "en_cours" | "termine" | "annule";
}

export interface CoursFilters {
  classe_id?: string;
  enseignant_id?: string;
  matiere_id?: string;
}
