import axiosInstance from "../axios_instance";

export interface RessourceCours {
    id: string;
    titre: string;
    description?: string;
    type: 'PDF' | 'VIDEO' | 'IMAGE' | 'LIEN' | 'AUTRE';
    url: string;
    cours_id: string;
    enseignant_id: string;
    date_ajout: string;
}

export const ressourcesApi = {
    getByCours: async (coursId: string) => {
        const response = await axiosInstance.get<{ ressources: RessourceCours[] }>(`/ressources/cours/${coursId}`);
        return response.data;
    },

    upload: async (data: FormData) => {
        const response = await axiosInstance.post<{ ressource: RessourceCours }>("/ressources", data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    delete: async (id: string) => {
        await axiosInstance.delete(`/ressources/${id}`);
    }
};
