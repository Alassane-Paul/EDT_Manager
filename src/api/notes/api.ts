import axiosInstance from "../axios_instance";

export interface Note {
    id: string;
    evaluation_id: string;
    eleve_id: string;
    valeur: number;
    appreciation?: string;
    absent: boolean;
    eleve?: {
        id: string;
        utilisateur: {
            nom: string;
            prenom: string;
        }
    };
}

export interface BulkNoteUpdateDto {
    notes: {
        eleve_id: string;
        valeur: number;
        appreciation?: string;
        absent?: boolean;
    }[];
}

export const notesApi = {
    getByEvaluation: async (evaluationId: string) => {
        const response = await axiosInstance.get<{ notes: Note[] }>(`/notes/evaluation/${evaluationId}`);
        return response.data;
    },

    bulkUpdate: async (evaluationId: string, data: BulkNoteUpdateDto) => {
        const response = await axiosInstance.post(`/notes/bulk/${evaluationId}`, data);
        return response.data;
    }
};
