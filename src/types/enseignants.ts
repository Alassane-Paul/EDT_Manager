export enum StatutProfessionnel {
  TITULAIRE = "titulaire",
  CONTRACTUEL = "contractuel",
  VACATAIRE = "vacataire",
  STAGIAIRE = "stagiaire",
}

export enum PreferenceHoraire {
  MATIN = "matin",
  APRES_MIDI = "apres_midi",
  INDIFFERENT = "indifferent",
}

export interface EnseignantUtilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  photo_url?: string;
}

export interface EnseignantMatiere {
  id: string;
  nom_matiere: string;
  code_matiere: string;
  couleur_affichage?: string;
}

export interface EnseignantClasse {
  id: string;
  nom_classe: string;
  niveau?: string;
}

export interface EnseignantCours {
  id: string;
  volume_horaire_hebdo: number;
  matiere: EnseignantMatiere;
  classe: EnseignantClasse;
}

export interface EnseignantDisponibilite {
  id: string;
  jour_semaine: string;
  heure_debut: string;
  heure_fin: string;
  type: "disponible" | "indisponible";
  recurrent?: boolean;
}

export interface Enseignant {
  id: string;
  utilisateur_id: string;
  matricule: string;
  statut: StatutProfessionnel;
  date_embauche?: string;
  heures_contractuelles_hebdo: number;
  heures_max_journalieres: number;
  cours_consecutifs_max: number;
  preference_horaire: PreferenceHoraire;
  multi_sites: boolean;
  utilisateur: EnseignantUtilisateur;
  matieres?: EnseignantMatiere[];
  cours?: EnseignantCours[];
  disponibilites?: EnseignantDisponibilite[];
}

export interface EnseignantStats {
  total_cours: number;
  total_matieres: number;
  total_classes: number;
  total_heures_hebdo: number;
}

export interface EnseignantFilters {
  page?: number;
  limit?: number;
  search?: string;
  statut?: StatutProfessionnel;
  matiere_id?: string;
}

export interface EnseignantFormData {
  utilisateur_id: string;
  matricule: string;
  statut: StatutProfessionnel;
  date_embauche?: string;
  heures_contractuelles_hebdo: number;
  heures_max_journalieres: number;
  cours_consecutifs_max: number;
  preference_horaire: PreferenceHoraire;
  multi_sites: boolean;
}

