import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMatieres, useCreateMatiere, useUpdateMatiere } from "@/hooks/useMatieres";
import { useEtablissements } from "@/hooks/useEtablissements";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategorieMatiere, TypeCours, MatiereFormData } from "@/types/matieres";
// ... (rest similar)
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  nom_matiere: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  code_matiere: z.string()
    .min(1, "Le code est requis")
    .max(20, "Le code ne doit pas dépasser 20 caractères")
    .regex(/^[A-Z0-9]+$/, "Le code ne doit contenir que des majuscules et chiffres (ex: MATH101)"),
  categorie: z.nativeEnum(CategorieMatiere),
  coefficient: z.coerce.number()
    .min(0.1, "Le coefficient doit être d'au moins 0.1")
    .max(10.0, "Le coefficient ne doit pas dépasser 10.0"),
  couleur_affichage: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Format invalide (ex: #3B82F6)")
    .default("#3B82F6"),
  type_cours: z.nativeEnum(TypeCours),
  duree_standard: z.coerce.number()
    .min(30, "La durée minimale est de 30 minutes")
    .max(240, "La durée maximale est de 240 minutes"),
  volume_horaire_hebdo: z.coerce.number()
    .min(30, "Le volume minimal est de 30 minutes")
    .max(600, "Le volume maximal est de 600 minutes"),
  necessite_equipement_special: z.boolean().default(false),
  peut_etre_en_ligne: z.boolean().default(false),
  etablissement_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema> & { etablissement_id?: string };

export default function MatiereForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { matieres } = useMatieres();
  const { etablissements } = useEtablissements();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const filteredEtablissements = isAdmin
    ? etablissements || []
    : (etablissements || []).filter((e: any) => e.id === user?.establishmentId);
  const createMutation = useCreateMatiere();
  const updateMutation = useUpdateMatiere();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      etablissement_id: user?.establishmentId || undefined,
      nom_matiere: "",
      code_matiere: "",
      categorie: CategorieMatiere.FONDAMENTALE,
      coefficient: 1,
      couleur_affichage: "#3B82F6",
      type_cours: TypeCours.COURS_MAGISTRAL,
      duree_standard: 60,
      volume_horaire_hebdo: 180,
      necessite_equipement_special: false,
      peut_etre_en_ligne: false,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const m = matieres.find((x: any) => x.id === id);
      if (m) {
        form.reset({
          etablissement_id: m.etablissement_id,
          nom_matiere: m.nom_matiere,
          code_matiere: m.code_matiere,
          categorie: m.categorie,
          coefficient: m.coefficient || 1,
          couleur_affichage: m.couleur_affichage || "#3B82F6",
          type_cours: m.type_cours,
          duree_standard: m.duree_standard || 60,
          volume_horaire_hebdo: m.volume_horaire_hebdo || 0,
          necessite_equipement_special: m.necessite_equipement_special || false,
          peut_etre_en_ligne: m.peut_etre_en_ligne || false,
        });
      }
    }
  }, [isEdit, id, matieres, form]);

  const onSubmit = (values: FormValues) => {
    // ensure etablissement_id is provided: prefer selected value, fallback to user's establishment
    const etabId = values.etablissement_id || user?.establishmentId;
    if (!etabId) {
      toast.error("Veuillez sélectionner un établissement avant de créer la matière.");
      return;
    }

    const payload: MatiereFormData = {
      nom_matiere: values.nom_matiere,
      code_matiere: values.code_matiere,
      categorie: values.categorie,
      coefficient: values.coefficient,
      couleur_affichage: values.couleur_affichage,
      type_cours: values.type_cours,
      duree_standard: values.duree_standard,
      volume_horaire_hebdo: values.volume_horaire_hebdo,
      necessite_equipement_special: values.necessite_equipement_special,
      peut_etre_en_ligne: values.peut_etre_en_ligne,
      etablissement_id: etabId,
    };

    if (isEdit && id) {
      updateMutation.mutate?.({ id, data: payload });
      navigate(`/gestion/matieres/${id}`);
    } else {
      createMutation.mutate?.(payload as any);
      navigate(`/gestion/matieres`);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gestion/matieres')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEdit ? 'Modifier la matière' : 'Nouvelle matière'}</h1>
            <p className="text-muted-foreground">{isEdit ? 'Modifiez les informations de la matière' : 'Créez une nouvelle matière pour l\'établissement'}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration de la matière</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <FormField control={form.control} name="etablissement_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Établissement *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={!isAdmin}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un établissement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredEtablissements.map((e: any) => (
                            <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="nom_matiere" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la matière *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ex: Mathématiques" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="code_matiere" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code de la matière *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ex: MATH101"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="coefficient" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coefficient *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="couleur_affichage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur d'affichage</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-12 h-10 p-1 cursor-pointer" />
                            <Input {...field} placeholder="#HEXCODE" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="categorie" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value as any}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(CategorieMatiere).map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="type_cours" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de cours</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value as any}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(TypeCours).map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="duree_standard" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée standard (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="volume_horaire_hebdo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume horaire hebdomadaire (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <FormField control={form.control} name="necessite_equipement_special" render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-primary"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">Équipement spécial requis</FormLabel>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="peut_etre_en_ligne" render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-primary"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">Peut être en ligne</FormLabel>
                        </div>
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" size="lg" onClick={() => navigate('/gestion/matieres')}>Annuler</Button>
                <Button type="submit" size="lg"><Save className="mr-2 h-4 w-4" />{isEdit ? 'Mettre à jour' : 'Créer la matière'}</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
