import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classesApi } from "@/api/classes/api";
import { ClasseFilters, ClasseFormData } from "@/types/classes";
import { toast } from "sonner";

export function useClasses(filters?: ClasseFilters) {
  const query = useQuery({
    queryKey: ["classes", filters],
    queryFn: () => classesApi.getAll(filters),
  });

  return {
    classes: query.data?.classes ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useClasse(id: string) {
  return useQuery({
    queryKey: ["classe", id],
    queryFn: () => classesApi.getById(id),
    enabled: !!id,
  });
}

export function useClasseStats(id: string) {
  return useQuery({
    queryKey: ["classe", id, "stats"],
    queryFn: () => classesApi.getStats(id),
    enabled: !!id,
  });
}

export function useCreateClasse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClasseFormData) => classesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classe créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de la classe");
    },
  });
}

export function useUpdateClasse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClasseFormData> }) =>
      classesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classe mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

export function useArchiveClasse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classesApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classe archivée");
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage");
    },
  });
}

export function useActivateClasse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classe activée");
    },
    onError: () => {
      toast.error("Erreur lors de l'activation");
    },
  });
}

export function useClassesActions() {
  const queryClient = useQueryClient();

  const assignStudent = useMutation({
    mutationFn: ({ classeId, data }: { classeId: string, data: { utilisateur_id: string, matricule?: string } }) =>
      classesApi.assignStudent(classeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classe", variables.classeId] }); // Invalidate details used by useClasse
      toast.success("Étudiant assigné avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'assignation");
    }
  });

  const removeStudent = useMutation({
    mutationFn: ({ classeId, studentId }: { classeId: string, studentId: string }) =>
      classesApi.removeStudent(classeId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classe", variables.classeId] });
      toast.success("Étudiant retiré avec succès");
    },
    onError: () => {
      toast.error("Erreur lors du retrait");
    }
  });

  return {
    assignStudent,
    removeStudent
  };
}

