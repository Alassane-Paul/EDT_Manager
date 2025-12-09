import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursApi } from "@/api/cours/api";
import { Cours, CoursFilters } from "@/types/cours";
import { toast } from "sonner";

export function useCours(filters?: CoursFilters) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["cours", filters],
    queryFn: () => coursApi.getAll(filters),
  });

  return {
    cours: data || [],
    isLoading,
    error,
  };
}

export function useMesCours() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mes-cours"],
    queryFn: coursApi.getMesCours,
  });

  return {
    cours: data || [],
    isLoading,
    error,
  };
}

export function useCoursDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cours", id],
    queryFn: () => coursApi.getById(id),
    enabled: !!id,
  });

  return {
    cours: data,
    isLoading,
    error,
  };
}

export function useCoursActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Partial<Cours>) => coursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cours"] });
      toast.success("Cours créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création du cours");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cours> }) =>
      coursApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cours"] });
      toast.success("Cours mis à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coursApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cours"] });
      toast.success("Cours supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    createCours: createMutation.mutate,
    updateCours: updateMutation.mutate,
    deleteCours: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
