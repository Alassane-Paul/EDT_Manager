import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatieres } from "@/hooks/useMatieres";
import { CategorieMatiere, TypeCours } from "@/types/matieres";
import { Plus, Search, Edit, Eye } from "lucide-react";

export default function MatiereList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<CategorieMatiere | "">("");

  const filters = useMemo(
    () => ({
      search: searchTerm || undefined,
      categorie: categorieFilter || undefined,
    }),
    [searchTerm, categorieFilter]
  );

  const { matieres, isLoading } = useMatieres(filters);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des matières</h1>
            <p className="text-muted-foreground">Consulter et gérer l'ensemble des matières</p>
          </div>
          <Button onClick={() => navigate("/gestion/matieres/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle matière
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des matières</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 sm:w-80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une matière..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categorieFilter} onValueChange={(v) => setCategorieFilter(v as CategorieMatiere | "")}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  {Object.values(CategorieMatiere).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Heures/sem</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : matieres.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        Aucune matière trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    matieres.map((matiere) => (
                      <TableRow key={matiere.id}>
                        <TableCell className="font-mono font-medium">{matiere.code_matiere}</TableCell>
                        <TableCell>{matiere.nom_matiere}</TableCell>
                        <TableCell>{matiere.categorie}</TableCell>
                        <TableCell>{matiere.type_cours}</TableCell>
                        <TableCell>{Math.floor(matiere.volume_horaire_hebdo / 60)}h</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/gestion/matieres/${matiere.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/gestion/matieres/${matiere.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

