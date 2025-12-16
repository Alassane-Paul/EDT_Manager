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
import { useEnseignants } from "@/hooks/useEnseignants";
import { StatutProfessionnel } from "@/types/enseignants";
import { Edit, Eye, Plus, Search } from "lucide-react";

const STATUT_LABELS: Record<StatutProfessionnel, string> = {
  [StatutProfessionnel.TITULAIRE]: "Titulaire",
  [StatutProfessionnel.CONTRACTUEL]: "Contractuel",
  [StatutProfessionnel.VACATAIRE]: "Vacataire",
  [StatutProfessionnel.STAGIAIRE]: "Stagiaire",
};

const STATUT_COLORS: Record<StatutProfessionnel, string> = {
  [StatutProfessionnel.TITULAIRE]: "bg-green-500",
  [StatutProfessionnel.CONTRACTUEL]: "bg-blue-500",
  [StatutProfessionnel.VACATAIRE]: "bg-yellow-500",
  [StatutProfessionnel.STAGIAIRE]: "bg-purple-500",
};

const skeletonRows = Array.from({ length: 5 });

const formatMinutes = (minutes?: number) => {
  if (!minutes && minutes !== 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
};

export default function EnseignantsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState<StatutProfessionnel | "all">("all");

  const filters = useMemo(
    () => ({
      search: searchTerm || undefined,
      statut: statutFilter && statutFilter !== "all" ? statutFilter : undefined,
    }),
    [searchTerm, statutFilter]
  );

  const { enseignants, isLoading, error } = useEnseignants(filters);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des enseignants</h1>
            <p className="text-muted-foreground">
              Consulter, filtrer et gérer l'ensemble des enseignants
            </p>
          </div>
          <Button onClick={() => navigate("/gestion/teachers/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel enseignant
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des enseignants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:w-80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un enseignant (nom, matricule...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={statutFilter}
                onValueChange={(value) => setStatutFilter(value as StatutProfessionnel | "all")}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Statut professionnel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value={StatutProfessionnel.TITULAIRE}>Titulaire</SelectItem>
                  <SelectItem value={StatutProfessionnel.CONTRACTUEL}>Contractuel</SelectItem>
                  <SelectItem value={StatutProfessionnel.VACATAIRE}>Vacataire</SelectItem>
                  <SelectItem value={StatutProfessionnel.STAGIAIRE}>Stagiaire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                Une erreur est survenue lors du chargement des enseignants.
              </div>
            )}

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Heures/semaine</TableHead>
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
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!isLoading && enseignants.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Aucun enseignant trouvé pour ces critères.
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading &&
                    enseignants.map((enseignant) => (
                      <TableRow key={enseignant.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {enseignant.utilisateur?.prenom} {enseignant.utilisateur?.nom}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {enseignant.utilisateur?.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{enseignant.matricule}</TableCell>
                        <TableCell>
                          <Badge className={STATUT_COLORS[enseignant.statut]}>
                            {STATUT_LABELS[enseignant.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatMinutes(enseignant.heures_contractuelles_hebdo)}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/gestion/teachers/${enseignant.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/gestion/teachers/${enseignant.id}/edit`)}
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


