import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios_instance";
import { toast } from "sonner";

export interface TeacherAbsence {
    id: string;
    cours_id: string;
    date_debut: string;
    date_fin: string;
    motif: string;
    code?: string;
    statut: string;
    cours?: {
        id: string;
        nom: string;
    };
}

export interface TeacherAbsenceDeclaration {
    cours_id: string;
    date_debut: string;
    date_fin: string;
    motif: string;
    code?: string;
}

const api = {
    getMyAbsences: async (): Promise<TeacherAbsence[]> => {
        const response = await axiosInstance.get("/teacher/absences");
        return response.data.absences || response.data.data || [];
    },

    declareMyAbsence: async (data: TeacherAbsenceDeclaration): Promise<TeacherAbsence> => {
        const response = await axiosInstance.post("/teacher/absences", data);
        return response.data.absence;
    },
};

export function useTeacherAbsences() {
    const queryClient = useQueryClient();

    const { data: absences, isLoading, error } = useQuery({
        queryKey: ["teacher-absences"],
        queryFn: api.getMyAbsences,
    });

    const declareMutation = useMutation({
        mutationFn: api.declareMyAbsence,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacher-absences"] });
            toast.success("Absence déclarée avec succès");
        },
        onError: (err: any) => {
            console.error("Erreur déclaration absence:", err);
            toast.error(err.response?.data?.error || "Erreur lors de la déclaration de l'absence");
        },
    });

    return {
        absences: absences || [],
        isLoading,
        error,
        declareAbsence: declareMutation.mutate,
        isDeclaring: declareMutation.isPending,
    };
}
