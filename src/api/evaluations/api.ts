import axiosInstance from "../axios_instance";

export interface Evaluation {
    id: string;
    titre: string;
    type: 'DEVOIR' | 'COMPOSITION' | 'ORAL' | 'TP' | 'AUTRE';
    matiere_id: string;
    classe_id: string;
    periode_id: string;
    coefficient: number;
    note_sur: number;
    date_evaluation: string;
    enseignant_id: string;
    matiere?: { nom_matiere: string };
    classe?: { nom_classe: string };
    periode?: { libelle: string };
}

export const evaluationsApi = {
    create: async (data: any) => {
        const response = await axiosInstance.post<{ evaluation: Evaluation }>("/evaluations", data);
        return response.data;
    },

    getAll: async (params?: any) => {
        const response = await axiosInstance.get<{ evaluations: Evaluation[] }>("/evaluations", { params });
        return response.data;
    },

    delete: async (id: string) => {
        await axiosInstance.delete(`/evaluations/${id}`);
    }
};
