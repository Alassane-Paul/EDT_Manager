export interface PersonnelUtilisateur {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    photo_url?: string;
}

export interface Directeur {
    id: string;
    utilisateur_id: string;
    etablissement_id: string;
    matricule: string;
    date_nomination: string;
    utilisateur: PersonnelUtilisateur;
    created_at: string;
    updated_at: string;
}

export interface ResponsablePedagogique {
    id: string;
    utilisateur_id: string;
    etablissement_id: string;
    matricule: string;
    date_prise_fonction: string;
    utilisateur: PersonnelUtilisateur;
    created_at: string;
    updated_at: string;
}

export interface DirecteurFormData {
    utilisateur_id: string;
    matricule: string;
    date_nomination: string;
    etablissement_id?: string;
}

export interface ResponsablePedagogiqueFormData {
    utilisateur_id: string;
    matricule: string;
    date_prise_fonction: string;
    etablissement_id?: string;
}
