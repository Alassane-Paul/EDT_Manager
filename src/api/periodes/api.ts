import axiosInstance from "../axios_instance";

export interface Periode {
    id: string;
    libelle: string;
    date_debut: string;
    date_fin: string;
    etablissement_id: string;
    actif: boolean;
    annee_scolaire: string;
}

export interface CreatePeriodeDto {
    libelle: string;
    date_debut: string;
    date_fin: string;
    annee_scolaire: string;
}

export interface UpdatePeriodeDto {
    libelle?: string;
    date_debut?: string;
    date_fin?: string;
    actif?: boolean;
    annee_scolaire?: string;
}

export const periodesApi = {
    getAll: async () => {
        const response = await axiosInstance.get<{ periodes: Periode[] }>("/periodes");
        return response.data;
    },

    create: async (data: CreatePeriodeDto) => {
        const response = await axiosInstance.post<{ periode: Periode }>("/periodes", data);
        return response.data;
    },

    update: async (id: string, data: UpdatePeriodeDto) => {
        const response = await axiosInstance.put<{ periode: Periode }>(`/periodes/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await axiosInstance.delete(`/periodes/${id}`);
    }
};
