import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { etablissementsApi } from "@/api/etablissements/api";
import { EtablissementFilters, EtablissementFormData } from "@/types/etablissements";
import { toast } from "sonner";

export function useEtablissements(filters?: EtablissementFilters) {
  const query = useQuery({
    queryKey: ["etablissements", filters],
    queryFn: () => etablissementsApi.getAll(filters),
  });

  return {
    etablissements: query.data?.etablissements ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEtablissement(id: string) {
  return useQuery({
    queryKey: ["etablissement", id],
    queryFn: () => etablissementsApi.getById(id),
    enabled: !!id,
  });
}

export function useEtablissementStats(id: string) {
  return useQuery({
    queryKey: ["etablissement", id, "stats"],
    queryFn: () => etablissementsApi.getStats(id),
    enabled: !!id,
  });
}

export function useCreateEtablissement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EtablissementFormData) => etablissementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["etablissements"] });
      toast.success("Établissement créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'établissement");
    },
  });
}

export function useUpdateEtablissement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EtablissementFormData> }) =>
      etablissementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["etablissements"] });
      toast.success("Établissement mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

export function useGenerateAccessCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => etablissementsApi.generateAccessCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["etablissement"] });
      toast.success("Code d'accès généré avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la génération du code");
    },
  });
}

