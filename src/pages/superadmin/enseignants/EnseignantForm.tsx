// src/pages/superadmin/enseignants/EnseignantForm.tsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save } from "lucide-react";
import {
  useCreateEnseignant,
  useUpdateEnseignant,
  useEnseignant,
} from "@/hooks/useEnseignants";
import { useEtablissements } from "@/hooks/useEtablissements";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatutProfessionnel, PreferenceHoraire } from "@/types/enseignants";
import { RoleUtilisateur } from "@/types/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  utilisateur_id: z.string().uuid("Sélectionnez un utilisateur valide"),
  matricule: z.string().min(1, "Le matricule est requis"),
  statut: z.nativeEnum(StatutProfessionnel),
  date_embauche: z.string().optional(),
  heures_contractuelles_hebdo: z.coerce
    .number()
    .min(300, "Minimum 5 heures (300 minutes)")
    .max(2400, "Maximum 40 heures (2400 minutes)"),
  heures_max_journalieres: z.coerce
    .number()
    .min(180, "Minimum 3 heures")
    .max(600, "Maximum 10 heures")
    .default(480),
  cours_consecutifs_max: z.coerce
    .number()
    .min(1)
    .max(8)
    .default(4),
  preference_horaire: z.nativeEnum(PreferenceHoraire).default(PreferenceHoraire.INDIFFERENT),
  multi_sites: z.boolean().default(false),
  etablissement_id: z.string().min(1, "L'établissement est requis"),
});

type FormValues = z.infer<typeof formSchema>;
type EnseignantFormData = FormValues;

export default function EnseignantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { user } = useAuth();
  const { etablissements, isLoading: etablissementsLoading } = useEtablissements();
  const isAdmin = user?.role === RoleUtilisateur.ADMIN;
  const filteredEtablissements = isAdmin
    ? etablissements || []
    : (etablissements || []).filter((e: any) => e.id === user?.establishmentId);

  const { data: enseignant, isLoading } = useEnseignant(id || "");
  const createMutation = useCreateEnseignant();
  const updateMutation = useUpdateEnseignant();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      utilisateur_id: "",
      matricule: "",
      statut: StatutProfessionnel.CONTRACTUEL,
      heures_contractuelles_hebdo: 1200, // 20h par défaut
      heures_max_journalieres: 480, // 8h
      cours_consecutifs_max: 4,
      preference_horaire: PreferenceHoraire.INDIFFERENT,
      multi_sites: false,
      etablissement_id: user?.establishmentId || "",
    },
  });

  useEffect(() => {
    if (enseignant && isEditMode) {
      form.reset({
        utilisateur_id: enseignant.utilisateur_id,
        matricule: enseignant.matricule,
        statut: enseignant.statut,
        date_embauche: enseignant.date_embauche,
        heures_contractuelles_hebdo: enseignant.heures_contractuelles_hebdo,
        heures_max_journalieres: enseignant.heures_max_journalieres,
        cours_consecutifs_max: enseignant.cours_consecutifs_max,
        preference_horaire: enseignant.preference_horaire,
        multi_sites: enseignant.multi_sites,
        etablissement_id: enseignant.etablissement_id || user?.establishmentId || "",
      });
    } else if (!isEditMode && user?.establishmentId) {
      form.setValue("etablissement_id", user.establishmentId);
    }
  }, [enseignant, isEditMode, form, user?.establishmentId]);

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      updateMutation.mutate(
        { id: id!, data: values },
        {
          onSuccess: () => navigate(`/gestion/teachers/${id}`),
        }
      );
    } else {
      createMutation.mutate(values as any, {
        onSuccess: (data) => navigate(`/gestion/teachers/${data.id}`),
      });
    }
  };

  const convertMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins : ""}`;
  };

  if (isEditMode && isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 md:p-8">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/gestion/teachers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Modifier l'enseignant" : "Nouvel enseignant"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Modifiez les informations de l'enseignant"
                : "Ajoutez un nouvel enseignant à l'établissement"}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Formulaire */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="etablissement_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Établissement *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!isAdmin || isEditMode}
                        >
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
                        {!isAdmin && (
                          <FormDescription>
                            L'enseignant sera automatiquement rattaché à votre établissement.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="utilisateur_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Utilisateur *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ID de l'utilisateur"
                            disabled={isEditMode}
                          />
                        </FormControl>
                        <FormDescription>
                          L'utilisateur doit déjà exister dans le système
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="matricule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Matricule *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ENS2024001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="statut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut professionnel *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={StatutProfessionnel.TITULAIRE}>
                                Titulaire
                              </SelectItem>
                              <SelectItem value={StatutProfessionnel.CONTRACTUEL}>
                                Contractuel
                              </SelectItem>
                              <SelectItem value={StatutProfessionnel.VACATAIRE}>
                                Vacataire
                              </SelectItem>
                              <SelectItem value={StatutProfessionnel.STAGIAIRE}>
                                Stagiaire
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="date_embauche"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'embauche</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuration horaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="heures_contractuelles_hebdo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heures hebdomadaires (minutes) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Valeur: {convertMinutesToHours(field.value || 0)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="heures_max_journalieres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max journalières (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Valeur: {convertMinutesToHours(field.value || 0)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cours_consecutifs_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cours consécutifs max</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preference_horaire"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Préférence horaire</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={PreferenceHoraire.MATIN}>Matin</SelectItem>
                              <SelectItem value={PreferenceHoraire.APRES_MIDI}>
                                Après-midi
                              </SelectItem>
                              <SelectItem value={PreferenceHoraire.INDIFFERENT}>
                                Indifférent
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="multi_sites"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-card-foreground">Multi-sites</FormLabel>
                          <FormDescription>
                            L'enseignant peut enseigner sur plusieurs sites
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/gestion/teachers")}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
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
