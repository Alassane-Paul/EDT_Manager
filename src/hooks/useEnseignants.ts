import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enseignantsApi } from "@/api/enseignants/api";
import {
  Enseignant,
  EnseignantFilters,
  EnseignantFormData,
  EnseignantStats,
} from "@/types/enseignants";
import { toast } from "sonner";

export function useEnseignants(filters?: EnseignantFilters) {
  const query = useQuery({
    queryKey: ["enseignants", filters],
    queryFn: () => enseignantsApi.getAll(filters),
  });

  return {
    enseignants: query.data?.enseignants ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEnseignant(id: string) {
  return useQuery<Enseignant>({
    queryKey: ["enseignant", id],
    queryFn: () => enseignantsApi.getById(id),
    enabled: !!id,
  });
}

export function useEnseignantStats(id: string) {
  return useQuery<EnseignantStats>({
    queryKey: ["enseignant", id, "stats"],
    queryFn: () => enseignantsApi.getStats(id),
    enabled: !!id,
  });
}

export function useCreateEnseignant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnseignantFormData) => enseignantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enseignants"] });
      toast.success("Enseignant créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'enseignant");
    },
  });
}

export function useUpdateEnseignant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EnseignantFormData> }) =>
      enseignantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enseignants"] });
      toast.success("Enseignant mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}


