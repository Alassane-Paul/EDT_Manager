import axiosInstance from "../axios_instance";

export interface SeanceVirtuelle {
    id: string;
    titre: string;
    cours_id: string;
    date_debut: string;
    date_fin: string;
    lien_visio: string;
    plateforme: string;
    statut: 'PROGRAMMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
}

export const seancesVirtuellesApi = {
    getByCours: async (coursId: string) => {
        const response = await axiosInstance.get<{ seances: SeanceVirtuelle[] }>(`/seances-virtuelles/cours/${coursId}`);
        return response.data;
    },

    create: async (data: Partial<SeanceVirtuelle>) => {
        const response = await axiosInstance.post<{ seance: SeanceVirtuelle }>("/seances-virtuelles", data);
        return response.data;
    },

    delete: async (id: string) => {
        await axiosInstance.delete(`/seances-virtuelles/${id}`);
    }
};
