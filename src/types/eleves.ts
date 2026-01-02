export interface EleveUtilisateur {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    photo_url?: string;
}

export interface EleveClasse {
    id: string;
    nom_classe: string;
    niveau?: string;
}

export interface Eleve {
    id: string;
    utilisateur_id: string;
    etablissement_id: string;
    classe_id?: string;
    matricule: string;
    date_naissance?: string;
    adresse?: string;
    utilisateur: EleveUtilisateur;
    classe?: EleveClasse;
    created_at: string;
    updated_at: string;
}

export interface EleveFormData {
    utilisateur_id: string;
    matricule: string;
    classe_id?: string;
    date_naissance?: string;
    adresse?: string;
    etablissement_id?: string;
}

export interface EleveFilters {
    page?: number;
    limit?: number;
    search?: string;
    classe_id?: string;
}
