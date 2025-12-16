// Types et énums pour les salles

export enum TypeSalle {
  STANDARD = "standard",
  LABORATOIRE = "laboratoire",
  GYMNASE = "gymnase",
  AMPHITHEATRE = "amphitheatre",
  ATELIER = "atelier",
  INFORMATIQUE = "informatique",
  MUSIQUE = "musique",
  ARTS = "arts",
}

export enum StatutSalle {
  DISPONIBLE = "disponible",
  OCCUPE = "occupe",
  MAINTENANCE = "maintenance",
  FERMEE = "fermee",
}

export interface Salle {
  id: string;
  nom_salle: string;
  capacite: number;
  type_salle: TypeSalle;
  etablissement_id: string;
  batiment?: string;
  etage?: string;
  statut: StatutSalle;
  surface?: number;
  accessibilite_pmr?: boolean;
  created_at?: string;
  updated_at?: string;
  equipements?: string[];
}

export interface SalleFilters {
  page?: number;
  limit?: number;
  type_salle?: TypeSalle;
  statut?: StatutSalle;
  search?: string;
  capacite_min?: number;
  date?: string;
  heure_debut?: string;
  heure_fin?: string;
}

export interface SalleFormData {
  nom_salle: string;
  capacite: number;
  type_salle: TypeSalle;
  batiment?: string;
  etage?: string;
  statut?: StatutSalle;
  surface?: number;
  accessibilite_pmr?: boolean;
  etablissement_id?: string;
}

export interface SalleDisponibilite {
  salle: Salle;
  creneaux_disponibles: CreneauDisponible[];
  creneaux_occupes: CreneauOccupe[];
}

export interface CreneauDisponible {
  date: string;
  heure_debut: string;
  heure_fin: string;
}

export interface CreneauOccupe {
  date: string;
  heure_debut: string;
  heure_fin: string;
  cours_id: string;
  matiere_nom: string;
  enseignant_nom: string;
}

export interface SalleStats {
  total_cours: number;
  total_creneaux: number;
  taux_occupation: number;
}
