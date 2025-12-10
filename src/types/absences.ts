export interface Absence {
  id: string;
  etudiant_id: string;
  etudiant_nom: string;
  etudiant_prenom: string;
  cours_id: string;
  cours_nom: string;
  seance_id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  justifiee: boolean;
  motif?: string;
  created_at: string;
}

export interface AbsenceDeclaration {
  seance_id: string;
  etudiants_absents: string[];
  motif?: string;
}

export interface AbsenceFilters {
  cours_id?: string;
  etudiant_id?: string;
  date_debut?: string;
  date_fin?: string;
  justifiee?: boolean;
}

export interface EtudiantPresence {
  id: string;
  nom: string;
  prenom: string;
  present: boolean;
}
