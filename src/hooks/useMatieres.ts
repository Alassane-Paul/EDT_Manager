import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matieresApi } from "@/api/matieres/api";
import { MatiereFilters, MatiereFormData } from "@/types/matieres";
import { toast } from "sonner";

export function useMatieres(filters?: MatiereFilters) {
  const query = useQuery({
    queryKey: ["matieres", filters],
    queryFn: () => matieresApi.getAll(filters),
  });

  return {
    matieres: query.data?.matieres ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMatiere(id: string) {
  return useQuery({
    queryKey: ["matiere", id],
    queryFn: () => matieresApi.getById(id),
    enabled: !!id,
  });
}

export function useMatiereStats(id: string) {
  return useQuery({
    queryKey: ["matiere", id, "stats"],
    queryFn: () => matieresApi.getStats(id),
    enabled: !!id,
  });
}

export function useCreateMatiere() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MatiereFormData) => matieresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matieres"] });
      toast.success("Matière créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de la matière");
    },
  });
}

export function useUpdateMatiere() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MatiereFormData> }) =>
      matieresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matieres"] });
      toast.success("Matière mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

export function useAssignEnseignantsToMatiere() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enseignant_ids }: { id: string; enseignant_ids: string[] }) =>
      matieresApi.assignEnseignants(id, enseignant_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matieres"] });
      queryClient.invalidateQueries({ queryKey: ["enseignants"] });
      toast.success("Enseignants assignés avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'assignation");
    },
  });
}

