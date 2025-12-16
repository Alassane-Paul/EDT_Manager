import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { useCreateEtablissement, useUpdateEtablissement, useEtablissement } from "@/hooks/useEtablissements";
import { StatutEtablissement, TypeEtablissement } from "@/types/etablissements";
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

const formSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  type: z.nativeEnum(TypeEtablissement),
  adresse: z.string().optional().default(""),
  ville: z.string().optional().default(""),
  code_postal: z.string().optional().default(""),
  telephone: z.string().optional().default(""),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  site_web: z.string().optional().default(""),
  fuseau_horaire: z.string().default("Africa/Lome"),
  langue: z.string().length(2).default("fr"),
  annee_scolaire_courante: z.string().regex(/^\d{4}-\d{4}$/, "Format: 2024-2025"),
  statut: z.nativeEnum(StatutEtablissement).default(StatutEtablissement.ACTIVE),
  logo_url: z.string().optional().default(""),
  code_acces: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EtablissementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: etablissement, isLoading } = useEtablissement(id || "");
  const createMutation = useCreateEtablissement();
  const updateMutation = useUpdateEtablissement();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      type: TypeEtablissement.ECOLE_PRIMAIRE,
      adresse: "",
      ville: "",
      code_postal: "",
      telephone: "",
      email: "",
      site_web: "",
      fuseau_horaire: "Africa/Lome",
      langue: "fr",
      annee_scolaire_courante: "2024-2025",
      logo_url: "",
      code_acces: "",
      statut: StatutEtablissement.ACTIVE,
    },
  });

  useEffect(() => {
    if (etablissement && isEditMode) {
      form.reset({
        nom: etablissement.nom,
        type: etablissement.type,
        adresse: etablissement.adresse || "",
        ville: etablissement.ville || "",
        code_postal: etablissement.code_postal || "",
        telephone: etablissement.telephone || "",
        email: etablissement.email || "",
        site_web: etablissement.site_web || "",
        fuseau_horaire: etablissement.fuseau_horaire || "Africa/Lome",
        langue: etablissement.langue || "fr",
        annee_scolaire_courante: etablissement.annee_scolaire_courante,
        logo_url: etablissement.logo_url || "",
        code_acces: etablissement.code_acces || "",
        statut: etablissement.statut,
      });
    }
  }, [etablissement, isEditMode, form]);

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      updateMutation.mutate({ id: id!, data: values }, { onSuccess: () => navigate(`/gestion/etablissements/${id}`) });
    } else {
      createMutation.mutate(values as any, { onSuccess: (data) => navigate(`/gestion/etablissements/${data.id}`) });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="space-y-6">
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/gestion/etablissements")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditMode ? "Modifier l'établissement" : "Nouvel établissement"}</h1>
          <p className="text-muted-foreground">{isEditMode ? "Modifiez l'établissement" : "Créez un nouvel établissement"}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="nom" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Lycée Exemple" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TypeEtablissement.ECOLE_PRIMAIRE}>École primaire</SelectItem>
                        <SelectItem value={TypeEtablissement.COLLEGE}>Collège</SelectItem>
                        <SelectItem value={TypeEtablissement.LYCEE}>Lycée</SelectItem>
                        <SelectItem value={TypeEtablissement.UNIVERSITE}>Université</SelectItem>
                        <SelectItem value={TypeEtablissement.INSTITUT}>Institut</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="ville" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="statut" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={StatutEtablissement.ACTIVE}>Active</SelectItem>
                        <SelectItem value={StatutEtablissement.SUSPENDU}>Suspendu</SelectItem>
                        <SelectItem value={StatutEtablissement.ARCHIVE}>Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="adresse" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="code_postal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="telephone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="site_web" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fuseau_horaire" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuseau horaire</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Africa/Lome">Africa/Lome</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="langue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="annee_scolaire_courante" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année scolaire *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="2024-2025" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="logo_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL du logo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="code_acces" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code d'accès (généré)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/gestion/etablissements")}>Annuler</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
