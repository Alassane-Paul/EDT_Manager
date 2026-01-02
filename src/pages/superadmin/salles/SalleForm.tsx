import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalles, useSallesActions } from '@/hooks/useSalles';
import { useSalles as useSallesList } from '@/hooks/useSalles';
import { useEtablissements } from '@/hooks/useEtablissements';
import { AppLayout } from "@/components/layout/AppLayout";
import { TypeSalle, StatutSalle } from '@/types/salles';
// ... (rest similar)
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  etablissement_id: z.string().min(1, 'L\'établissement est requis'),
  nom_salle: z.string().min(1, 'Le nom est requis'),
  capacite: z.coerce.number().min(1, 'Capacité minimale 1'),
  type_salle: z.nativeEnum(TypeSalle),
  batiment: z.string().optional().default(''),
  etage: z.string().optional().default(''),
  surface: z.coerce.number().optional(),
  accessibilite_pmr: z.boolean().default(false),
  statut: z.nativeEnum(StatutSalle).optional().default(StatutSalle.DISPONIBLE),
});

type FormValues = z.infer<typeof schema>;

export default function SalleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { user } = useAuth();
  const { etablissements } = useEtablissements();

  const { salles } = useSallesList();
  const isAdmin = user?.role === "admin";
  const filteredEtablissements = isAdmin
    ? etablissements || []
    : (etablissements || []).filter((e: any) => e.id === user?.establishmentId);

  const { createSalle, updateSalle } = useSallesActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      etablissement_id: user?.establishmentId || '',
      nom_salle: '',
      capacite: 30,
      type_salle: TypeSalle.STANDARD,
      batiment: '',
      etage: '',
      surface: 50,
      accessibilite_pmr: true,
      statut: StatutSalle.DISPONIBLE,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      // load salle from salles cache if present
      const s = salles.find((x: any) => x.id === id);
      if (s) {
        form.reset({
          etablissement_id: s.etablissement_id || user?.establishmentId || '',
          nom_salle: s.nom_salle,
          capacite: s.capacite,
          type_salle: s.type_salle as any,
          batiment: s.batiment || '',
          etage: s.etage || '',
          surface: s.surface || 50,
          accessibilite_pmr: s.accessibilite_pmr || false,
          statut: s.statut || StatutSalle.DISPONIBLE,
        });
      }
    }
  }, [isEdit, id, salles, form]);

  const onSubmit = (values: FormValues) => {
    if (isEdit && id) {
      updateSalle({ id, data: values });
      navigate(`/gestion/salles/${id}`);
    } else {
      createSalle(values);
      navigate('/gestion/salles');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gestion/salles')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEdit ? 'Modifier la salle' : 'Nouvelle salle'}</h1>
            <p className="text-muted-foreground">{isEdit ? 'Modifiez les informations de la salle' : 'Ajoutez une nouvelle salle à l\'établissement'}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration de la salle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <FormField control={form.control} name="etablissement_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Établissement *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isAdmin}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un établissement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredEtablissements.map((e: any) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="nom_salle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la salle *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Salle A101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="type_salle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de salle *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="laboratoire">Laboratoire</SelectItem>
                            <SelectItem value="gymnase">Gymnase</SelectItem>
                            <SelectItem value="amphitheatre">Amphithéâtre</SelectItem>
                            <SelectItem value="atelier">Atelier</SelectItem>
                            <SelectItem value="informatique">Informatique</SelectItem>
                            <SelectItem value="musique">Musique</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="capacite" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacité (personnes) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="batiment" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bâtiment</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Bâtiment A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="etage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Étage</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1er" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="surface" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surface (m²)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="statut" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut actuel</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="occupe">Occupée</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="fermee">Fermée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="accessibilite_pmr" render={({ field }) => (
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
                        <FormLabel className="cursor-pointer">Accessibilité PMR (Personnes à Mobilité Réduite)</FormLabel>
                      </div>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" size="lg" onClick={() => navigate('/gestion/salles')}>
                  Annuler
                </Button>
                <Button type="submit" size="lg">
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? 'Mettre à jour' : 'Créer la salle'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
