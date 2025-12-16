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
import { TypeSalle, StatutSalle } from '@/types/salles';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  etablissement_id: z.string().min(1, 'L\'établissement est requis'),
  nom_salle: z.string().min(1, 'Le nom est requis'),
  capacite: z.coerce.number().min(1, 'Capacité minimale 1'),
  type_salle: z.nativeEnum(TypeSalle),
  batiment: z.string().optional().default(''),
  etage: z.string().optional().default(''),
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
          statut: s.statut || StatutSalle.DISPONIBLE,
        });
      }
    }
  }, [isEdit, id, salles, form, user?.establishmentId]);

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/gestion/salles')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Modifier la salle' : 'Nouvelle salle'}</h1>
          <p className="text-muted-foreground">{isEdit ? 'Modifiez la salle' : 'Ajoutez une nouvelle salle'}</p>
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
                <FormItem>
                  <FormLabel>Établissement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un établissement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {etablissements.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Infos générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="nom_salle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la salle *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Salle A101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="type_salle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
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
                    <FormLabel>Capacité *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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
            </CardContent>
          </Card>

          {/* Statut */}
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="statut" render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
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
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/gestion/salles')}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? 'Mettre à jour' : 'Créer la salle'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
