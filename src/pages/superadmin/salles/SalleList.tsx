import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalles } from '@/hooks/useSalles';
import { TypeSalle, SalleFilters } from '@/types/salles';
import { Plus, Eye, Edit, Search } from 'lucide-react';

export default function SalleList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeSalle | 'all'>('all');

  const filters = useMemo((): SalleFilters => ({
    search: search || undefined,
    type_salle: typeFilter !== 'all' ? typeFilter : undefined,
  }), [search, typeFilter]);

  const { salles, isLoading, error } = useSalles(filters);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des salles</h1>
            <p className="text-muted-foreground">Consulter et gérer les salles</p>
          </div>
          <Button onClick={() => navigate('/gestion/salles/create')}>
            <Plus className="h-4 w-4 mr-2" /> Nouvelle salle
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des salles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher une salle (nom, bâtiment...)" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeSalle | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
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
            </div>

            {error && <div className="text-destructive">Erreur lors du chargement des salles.</div>}

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Disponible</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))}

                  {!isLoading && salles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Aucune salle trouvée.</TableCell>
                    </TableRow>
                  )}

                  {!isLoading && salles.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.nom_salle}</TableCell>
                      <TableCell>{s.type_salle}</TableCell>
                      <TableCell>{s.capacite}</TableCell>
                      <TableCell>{s.statut === 'disponible' ? 'Oui' : 'Non'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/gestion/salles/${s.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/gestion/salles/${s.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
