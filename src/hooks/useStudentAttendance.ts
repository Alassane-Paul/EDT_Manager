import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios_instance";
import { toast } from "sonner";

export interface StudentAbsence {
    eleve_id: string;
    motif?: string;
    statut?: string; // 'declaree', 'validee', etc.
}

export interface BulkAbsencePayload {
    cours_id: string;
    date: string; // YYYY-MM-DD
    absences: StudentAbsence[];
}

const api = {
    // Récupérer les élèves d'une classe (utile pour l'appel)
    getEtudiantsClasse: async (classeId: string) => {
        const response = await axiosInstance.get(`/classes/${classeId}`);
        return response.data.classe.eleves || [];
    },

    // Récupérer les absences déjà déclarées pour une séance (cours + date)
    getAbsencesSeance: async (coursId: string, date: string) => {
        // On utilise le filtre existant de get all absences
        const response = await axiosInstance.get('/absences', {
            params: {
                cours_id: coursId,
                date_debut: date,
                date_fin: date
            }
        });
        return response.data.absences || [];
    },

    // Soumettre l'appel (bulk absences)
    declarerAppel: async (payload: BulkAbsencePayload) => {
        const response = await axiosInstance.post('/absences/bulk', payload);
        return response.data;
    }
};

export function useEtudiantsClasse(classeId: string) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['classe-etudiants', classeId],
        queryFn: () => api.getEtudiantsClasse(classeId),
        enabled: !!classeId
    });

    return {
        etudiants: data || [],
        isLoading,
        error
    };
}

export function useAbsencesSeance(coursId: string, date: string) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['seance-absences', coursId, date],
        queryFn: () => api.getAbsencesSeance(coursId, date),
        enabled: !!coursId && !!date
    });

    return {
        absences: data || [],
        isLoading,
        error
    };
}

export function useAppelAction() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: api.declarerAppel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seance-absences'] });
            // On pourrait aussi invalider les stats globales
            toast.success("Appel enregistré avec succès");
        },
        onError: (err: any) => {
            console.error("Erreur enregistrement appel:", err);
            toast.error("Erreur lors de l'enregistrement de l'appel");
        },
    });

    return {
        saveAppel: mutation.mutate,
        isSaving: mutation.isPending
    };
}
