import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useClasses } from "@/hooks/useClasses";
import { StatutClasse } from "@/types/classes";
import { Edit, Eye, Plus, Search } from "lucide-react";

const STATUT_LABELS: Record<StatutClasse, string> = {
  [StatutClasse.ACTIVE]: "Active",
  [StatutClasse.ARCHIVEE]: "Archivée",
};

const STATUT_COLORS: Record<StatutClasse, string> = {
  [StatutClasse.ACTIVE]: "bg-green-500",
  [StatutClasse.ARCHIVEE]: "bg-gray-500",
};

const skeletonRows = Array.from({ length: 5 });

export default function ClasseList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState<StatutClasse | "all">("all");
  const [niveauFilter, setNiveauFilter] = useState<string>("all");

  const filters = useMemo(
    () => ({
      search: searchTerm || undefined,
      statut: statutFilter && statutFilter !== "all" ? statutFilter : undefined,
      niveau: niveauFilter && niveauFilter !== "all" ? niveauFilter : undefined,
    }),
    [searchTerm, statutFilter, niveauFilter]
  );

  const { classes, isLoading, error } = useClasses(filters);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des classes</h1>
            <p className="text-muted-foreground">
              Consulter, filtrer et gérer l'ensemble des classes
            </p>
          </div>
          <Button onClick={() => navigate("/gestion/classes/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle classe
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:w-80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une classe (nom, filière...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={niveauFilter} onValueChange={setNiveauFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="L1">L1</SelectItem>
                    <SelectItem value="L2">L2</SelectItem>
                    <SelectItem value="L3">L3</SelectItem>
                    <SelectItem value="M1">M1</SelectItem>
                    <SelectItem value="M2">M2</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statutFilter}
                  onValueChange={(value) => setStatutFilter(value as StatutClasse | "all")}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value={StatutClasse.ACTIVE}>Active</SelectItem>
                    <SelectItem value={StatutClasse.ARCHIVEE}>Archivée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                Une erreur est survenue lors du chargement des classes.
              </div>
            )}

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Classe</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Filière</TableHead>
                    <TableHead>Effectif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    skeletonRows.map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!isLoading && classes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Aucune classe trouvée pour ces critères.
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading &&
                    classes.map((classe) => (
                      <TableRow key={classe.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{classe.nom_classe}</span>
                            <span className="text-sm text-muted-foreground">
                              {classe.annee_scolaire}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{classe.niveau}</TableCell>
                        <TableCell>{classe.filiere || "-"}</TableCell>
                        <TableCell>{classe.effectif}</TableCell>
                        <TableCell>
                          <Badge className={STATUT_COLORS[classe.statut]}>
                            {STATUT_LABELS[classe.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/gestion/classes/${classe.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/gestion/classes/${classe.id}/edit`)}
                          >
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

