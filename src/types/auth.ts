
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
}

export interface LoginResponse {
    message: string;
    requires2FA?: boolean;
    tempToken?: string;
    utilisateur?: ApiUser;
    token?: string;
}

export interface ApiUser {
    id: string;
    email: string;
    prenom: string;
    nom: string;
    role: string;
    statut: string;
    etablissement_id?: string;
    deux_fa_active?: boolean;
    requires2FA?: boolean;
}
