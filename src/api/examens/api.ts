import axiosInstance from "../axios_instance";

export interface ExamenEnLigne {
    id: string;
    titre: string;
    description?: string;
    cours_id: string;
    enseignant_id: string;
    duree_minutes: number;
    date_ouverture: string;
    date_fermeture: string;
    note_totale: number;
    afficher_resultats: boolean;
    melanger_questions: boolean;
    statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
    questions?: Question[];
}

export interface Question {
    id: string;
    examen_id: string;
    type: 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE';
    enonce: string;
    points: number;
    ordre: number;
    options?: { texte: string; correct: boolean }[];
    reponse_correcte?: string;
}

export interface TentativeExamen {
    id: string;
    examen_id: string;
    eleve_id: string;
    date_debut: string;
    date_fin?: string;
    note_obtenue?: number;
    statut: 'EN_COURS' | 'SOUMIS' | 'CORRIGE';
}

export const examensApi = {
    getByCours: async (coursId: string) => {
        const response = await axiosInstance.get<{ examens: ExamenEnLigne[] }>(`/examens/cours/${coursId}`);
        return response.data;
    },

    create: async (data: Partial<ExamenEnLigne>) => {
        const response = await axiosInstance.post<{ examen: ExamenEnLigne }>("/examens", data);
        return response.data;
    },

    addQuestion: async (examenId: string, question: Partial<Question>) => {
        const response = await axiosInstance.post<{ question: Question }>(`/examens/${examenId}/questions`, question);
        return response.data;
    },

    publish: async (examenId: string) => {
        const response = await axiosInstance.put(`/examens/${examenId}/publish`);
        return response.data;
    },

    startTentative: async (examenId: string) => {
        const response = await axiosInstance.post<{ tentative: TentativeExamen; examen: ExamenEnLigne }>(`/examens/${examenId}/start`);
        return response.data;
    },

    submitReponses: async (tentativeId: string, reponses: { question_id: string; reponse: string }[]) => {
        const response = await axiosInstance.post(`/examens/tentatives/${tentativeId}/submit`, { reponses });
        return response.data;
    },

    getResultats: async (tentativeId: string) => {
        const response = await axiosInstance.get(`/examens/tentatives/${tentativeId}/resultats`);
        return response.data;
    }
};
