
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    prenom: string;
    nom: string;
    role?: string;
    code_acces_etablissement?: string;
    classe_id?: string;
}

export interface LoginResponse {
    message: string;
    requires2FA?: boolean;
    utilisateur?: ApiUser;
    token?: string;
}

export interface RegisterResponse extends LoginResponse {
    code?: string;
}

export interface ApiUser {
    id: string;
    email: string;
    prenom: string;
    nom: string;
    role: string;
    statut: string;
    etablissement_id?: string;
    etablissement?: {
        id: string;
        nom: string;
        type: string;
        ville?: string;
        statut: string;
        code_acces?: string;
    };
    deux_fa_active?: boolean;
    requires2FA?: boolean;
    deux_fa_setup_required?: boolean;
    qr_code_url?: string;
    secret?: string;
    photo_url?: string;
    telephone?: string;
}
