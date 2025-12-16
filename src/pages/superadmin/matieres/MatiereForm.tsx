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
import { CategorieMatiere, TypeCours, MatiereFormData } from "@/types/matieres";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  nom_matiere: z.string().min(1, "Le nom est requis"),
  code_matiere: z.string().min(1, "Le code est requis"),
  categorie: z.nativeEnum(CategorieMatiere),
  coefficient: z.coerce.number().min(0),
  couleur_affichage: z.string().optional().default("#3B82F6"),
  type_cours: z.nativeEnum(TypeCours),
  duree_standard: z.coerce.number().min(1),
  volume_horaire_hebdo: z.coerce.number().min(0),
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
        });
      }
    }
  }, [isEdit, id, matieres]);

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/gestion/matieres')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Modifier la matière' : 'Nouvelle matière'}</h1>
          <p className="text-muted-foreground">{isEdit ? 'Modifiez la matière' : 'Créez une nouvelle matière'}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Établissement */}
          <Card>
            <CardHeader>
              <CardTitle>Établissement</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="etablissement_id" render={({ field }) => (
                <div>
                  <FormLabel>Établissement</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un établissement" />
                    </SelectTrigger>
                    <SelectContent>
                      {etablissements.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="nom_matiere" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la matière *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="code_matiere" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid gap-4 md:grid-cols-2">
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

              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="duree_standard" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée standard (min)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="volume_horaire_hebdo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume horaire / semaine (min)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/gestion/matieres')}>Annuler</Button>
            <Button type="submit"><Save className="mr-2 h-4 w-4" />{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
