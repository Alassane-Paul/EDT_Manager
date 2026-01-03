import axiosInstance from "../axios_instance";

export interface Bulletin {
    id: string;
    eleve_id: string;
    periode_id: string;
    classe_id: string;
    moyenne_generale: number;
    rang: number;
    appreciation_conseil: string;
    details_matieres: any[];
    statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
    date_generation: string;
    eleve?: {
        id: string;
        matricule: string;
        utilisateur: {
            nom: string;
            prenom: string;
        }
    };
}

export const bulletinsApi = {
    generate: async (eleveId: string, periodeId: string) => {
        const response = await axiosInstance.post<{ bulletin: Bulletin }>("/bulletins/generer", { eleve_id: eleveId, periode_id: periodeId });
        return response.data;
    },

    getByEleveAndPeriode: async (eleveId: string, periodeId: string) => {
        const response = await axiosInstance.get<{ bulletin: Bulletin }>("/bulletins", { params: { eleve_id: eleveId, periode_id: periodeId } });
        return response.data;
    }
};
