export enum CategorieMatiere {
  FONDAMENTALE = "fondamentale",
  COMPLEMENTAIRE = "complementaire",
  OPTION = "option",
  ARTISTIQUE = "artistique",
  SPORTIVE = "sportive",
}

export enum TypeCours {
  COURS_MAGISTRAL = "cours_magistral",
  TD = "td",
  TP = "tp",
  ATELIER = "atelier",
}

export interface Matiere {
  id: string;
  etablissement_id: string;
  nom_matiere: string;
  code_matiere: string;
  categorie: CategorieMatiere;
  coefficient: number;
  couleur_affichage: string;
  type_cours: TypeCours;
  duree_standard: number;
  necessite_equipement_special: boolean;
  peut_etre_en_ligne: boolean;
  volume_horaire_hebdo: number;
  created_at?: string;
  updated_at?: string;
  etablissement?: {
    id: string;
    nom: string;
  };
  enseignants?: any[];
  cours?: any[];
}

export interface MatiereFormData {
  nom_matiere: string;
  code_matiere: string;
  categorie: CategorieMatiere;
  coefficient?: number;
  couleur_affichage?: string;
  type_cours: TypeCours;
  duree_standard: number;
  necessite_equipement_special?: boolean;
  peut_etre_en_ligne?: boolean;
  volume_horaire_hebdo: number;
  etablissement_id?: string;
}

export interface MatiereFilters {
  page?: number;
  limit?: number;
  categorie?: CategorieMatiere;
  type_cours?: TypeCours;
  search?: string;
}

export interface MatiereStats {
  total_cours: number;
  total_classes: number;
  total_enseignants: number;
  total_heures_hebdo: number;
}

