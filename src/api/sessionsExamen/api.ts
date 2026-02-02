import axiosInstance from "../axios_instance";

export interface SessionExamen {
    id: string;
    titre: string;
    matiere_id: string;
    classe_id: string;
    date_examen: string;
    heure_debut: string;
    heure_fin: string;
    duree_minutes: number;
    type: 'DEVOIR_SURVEILLE' | 'COMPOSITION' | 'EXAMEN_BLANC' | 'CONTROLE_CONTINU';
    coefficient: number;
    instructions?: string;
    statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
    matiere?: { nom_matiere: string };
    classe?: { nom_classe: string };
    repartitions?: any[];
}

export interface RepartitionSalle {
    id: string;
    session_examen_id: string;
    salle_id: string;
    surveillant_id?: string;
    eleves_assignes: string[];
    nombre_places_utilisees: number;
    salle?: { nom_salle: string; capacite: number };
    surveillant?: any;
}

export const sessionsExamenApi = {
    getByClasse: async (classeId: string) => {
        const response = await axiosInstance.get<{ sessions: SessionExamen[] }>(`/sessions-examen/classe/${classeId}`);
        return response.data;
    },

    getCalendrier: async (params?: { date_debut?: string; date_fin?: string; etablissement_id?: string }) => {
        const response = await axiosInstance.get<{ sessions: SessionExamen[] }>("/sessions-examen/calendrier", { params });
        return response.data;
    },

    create: async (data: Partial<SessionExamen>) => {
        const response = await axiosInstance.post<{ session: SessionExamen }>("/sessions-examen", data);
        return response.data;
    },

    update: async (id: string, data: Partial<SessionExamen>) => {
        const response = await axiosInstance.put<{ session: SessionExamen }>(`/sessions-examen/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await axiosInstance.delete(`/sessions-examen/${id}`);
    },

    suggestSlot: async (params: { classe_id: string; date_examen: string; duree_minutes: number }) => {
        const response = await axiosInstance.get<{ heure_debut: string; heure_fin: string }>("/sessions-examen/suggest-slot", { params });
        return response.data;
    },

    bulkGenerate: async (data: {
        etablissement_id: string;
        classe_ids: string[];
        date_debut: string;
        date_fin: string;
        type_examen: string;
        max_examens_par_jour?: number;
    }) => {
        const response = await axiosInstance.post<{ total_created: number; warnings: string[] }>("/sessions-examen/bulk-generate", data);
        return response.data;
    }
};

export const repartitionsApi = {
    autoAssign: async (sessionId: string) => {
        const response = await axiosInstance.post(`/repartitions/auto-assign/${sessionId}`);
        return response.data;
    },

    getRepartition: async (sessionId: string) => {
        const response = await axiosInstance.get<{ repartitions: RepartitionSalle[] }>(`/repartitions/session/${sessionId}`);
        return response.data;
    },

    update: async (id: string, data: { surveillant_id?: string; eleves_assignes?: string[] }) => {
        const response = await axiosInstance.put(`/repartitions/${id}`, data);
        return response.data;
    }
};
