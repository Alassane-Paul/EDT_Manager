import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCours } from "@/hooks/useCours";
import { useCreateRattrapage } from "@/hooks/useRattrapages";
import { TypeRattrapage, RattrapageFormData } from "@/types/rattrapages";
import { Save, ArrowLeft } from "lucide-react";

const schema = z.object({
  cours_id: z.string().min(1, "Le cours est requis"),
  type_rattrapage: z.nativeEnum(TypeRattrapage),
  duree: z.coerce.number().min(1),
  eleves_concernes: z.string().optional(),
  motif: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RattrapageForm() {
  const navigate = useNavigate();
  const { cours } = useCours();
  const createRattrapage = useCreateRattrapage();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cours_id: "",
      type_rattrapage: TypeRattrapage.COURS_ANNULE,
      duree: 60,
      eleves_concernes: "",
      motif: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: RattrapageFormData = {
      cours_id: values.cours_id,
      type_rattrapage: values.type_rattrapage,
      duree: values.duree,
      eleves_concernes: values.eleves_concernes ? values.eleves_concernes.split(',').map(s=>s.trim()) : [],
      motif: values.motif,
    };
    createRattrapage.mutate?.(payload as any);
    navigate('/gestion/rattrapages');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/gestion/rattrapages')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle demande de rattrapage</h1>
          <p className="text-muted-foreground">Demandez un rattrapage pour un cours</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="cours_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cours *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cours.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.matiere_nom} - {c.classe_nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="type_rattrapage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value as any}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TypeRattrapage).map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="duree" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (min)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="eleves_concernes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Élèves concernés (séparés par ,)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="motif" render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/gestion/rattrapages')}>Annuler</Button>
            <Button type="submit"><Save className="mr-2 h-4 w-4" />Créer</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
