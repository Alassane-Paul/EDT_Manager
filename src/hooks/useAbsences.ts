import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { absencesApi } from "@/api/absences/api";
import { AbsenceDeclaration, AbsenceFilters } from "@/types/absences";
import { toast } from "sonner";

export function useAbsences(filters?: AbsenceFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["absences", filters],
    queryFn: () => absencesApi.getAll(filters),
  });

  return {
    absences: data || [],
    isLoading,
    error,
  };
}

export function useAbsencesSeance(seanceId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["absences", "seance", seanceId],
    queryFn: () => absencesApi.getBySeance(seanceId),
    enabled: !!seanceId,
  });

  return {
    absences: data || [],
    isLoading,
    error,
  };
}

export function useEtudiantsSeance(seanceId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["etudiants", "seance", seanceId],
    queryFn: () => absencesApi.getEtudiantsSeance(seanceId),
    enabled: !!seanceId,
  });

  return {
    etudiants: data || [],
    isLoading,
    error,
  };
}

export function useAbsencesActions() {
  const queryClient = useQueryClient();

  const declarerMutation = useMutation({
    mutationFn: (data: AbsenceDeclaration) => absencesApi.declarer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast.success("Absences déclarées avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la déclaration des absences");
    },
  });

  const justifierMutation = useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      absencesApi.justifier(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast.success("Absence justifiée");
    },
    onError: () => {
      toast.error("Erreur lors de la justification");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: absencesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast.success("Absence supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    declarerAbsences: declarerMutation.mutate,
    justifierAbsence: justifierMutation.mutate,
    deleteAbsence: deleteMutation.mutate,
    isDeclaring: declarerMutation.isPending,
    isJustifying: justifierMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
