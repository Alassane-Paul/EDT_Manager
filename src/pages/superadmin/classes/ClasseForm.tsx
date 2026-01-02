import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { useCreateClasse, useUpdateClasse, useClasse } from "@/hooks/useClasses";
import { useEtablissements } from "@/hooks/useEtablissements";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatutClasse } from "@/types/classes";
// ... (rest similar)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  nom_classe: z.string().min(1, "Le nom de la classe est requis"),
  niveau: z.string().min(1, "Le niveau est requis"),
  filiere: z.string().optional().default(""),
  effectif: z.coerce.number().min(1, "L'effectif doit être au moins 1").max(500).default(30),
  annee_scolaire: z.string().regex(/^\d{4}-\d{4}$/, "Format: 2024-2025"),
  salle_principale: z.string().optional().default(""),
  statut: z.nativeEnum(StatutClasse).default(StatutClasse.ACTIVE),
  etablissement_id: z.string().min(1, "L'établissement est requis"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ClasseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { user } = useAuth();
  const { etablissements, isLoading: etablissementsLoading } = useEtablissements();
  const isAdmin = user?.role === "admin";
  const filteredEtablissements = isAdmin
    ? etablissements
    : etablissements.filter(etab => etab.id === user?.establishmentId);

  const { data: classe, isLoading } = useClasse(id || "");
  const createMutation = useCreateClasse();
  const updateMutation = useUpdateClasse();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_classe: "",
      niveau: "",
      filiere: "",
      effectif: 30,
      annee_scolaire: "2024-2025",
      salle_principale: "",
      statut: StatutClasse.ACTIVE,
      etablissement_id: user?.establishmentId || "",
    },
  });

  useEffect(() => {
    if (classe && isEditMode) {
      form.reset({
        nom_classe: classe.nom_classe,
        niveau: classe.niveau,
        filiere: classe.filiere || "",
        effectif: classe.effectif,
        annee_scolaire: classe.annee_scolaire,
        salle_principale: classe.salle_principale || "",
        statut: classe.statut,
        etablissement_id: classe.etablissement_id || user?.establishmentId || "",
      });
    } else if (!isEditMode) {
      // Pour la création, mettre à jour juste l'établissement_id depuis le contexte utilisateur
      form.setValue("etablissement_id", user?.establishmentId || "");
    }
  }, [classe, isEditMode, form, user?.establishmentId]);

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      updateMutation.mutate(
        { id: id!, data: values },
        {
          onSuccess: () => navigate(`/gestion/classes/${id}`),
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: (data) => navigate(`/gestion/classes/${data.id}`),
      });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 md:p-8">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/gestion/classes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Modifier la classe" : "Nouvelle classe"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Modifiez les informations de la classe"
                : "Ajoutez une nouvelle classe à l'établissement"}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la classe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="etablissement_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Établissement *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!isAdmin}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un établissement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {etablissementsLoading ? (
                              <SelectItem value="loading" disabled>
                                Chargement...
                              </SelectItem>
                            ) : (
                              filteredEtablissements.map((etab) => (
                                <SelectItem key={etab.id} value={etab.id}>
                                  {etab.nom} ({etab.ville})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nom_classe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la classe *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ex: L3 Informatique" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="niveau"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un niveau" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="L1">L1</SelectItem>
                              <SelectItem value="L2">L2</SelectItem>
                              <SelectItem value="L3">L3</SelectItem>
                              <SelectItem value="M1">M1</SelectItem>
                              <SelectItem value="M2">M2</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="annee_scolaire"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Année scolaire *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="2024-2025" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="filiere"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filière</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ex: Informatique" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="effectif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Effectif *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min="1" max="500" placeholder="30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salle_principale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salle principale</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ex: Salle A101" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="statut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut de la classe</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={StatutClasse.ACTIVE}>Active</SelectItem>
                            <SelectItem value={StatutClasse.ARCHIVEE}>Archivée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/gestion/classes")}
                >
                  Annuler
                </Button>
                <Button type="submit" size="lg" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}

