import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRattrapages } from "@/hooks/useRattrapages";
import { StatutRattrapage } from "@/types/rattrapages";
import { Plus, Eye } from "lucide-react";

const STATUT_COLORS: Record<StatutRattrapage, string> = {
  [StatutRattrapage.DEMANDE]: "bg-yellow-500",
  [StatutRattrapage.PLANIFIE]: "bg-blue-500",
  [StatutRattrapage.REALISE]: "bg-green-500",
  [StatutRattrapage.ANNULE]: "bg-red-500",
};

export default function RattrapageList() {
  const navigate = useNavigate();
  const [statutFilter, setStatutFilter] = useState<StatutRattrapage | "">("");

  const filters = useMemo(
    () => ({
      statut: statutFilter || undefined,
    }),
    [statutFilter]
  );

  const { rattrapages, isLoading } = useRattrapages(filters);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des rattrapages</h1>
            <p className="text-muted-foreground">Consulter et gérer les cours de rattrapage</p>
          </div>
          <Button onClick={() => navigate("/gestion/rattrapages/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rattrapage
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des rattrapages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v as StatutRattrapage | "")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {Object.values(StatutRattrapage).map((statut) => (
                  <SelectItem key={statut} value={statut}>{statut}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cours</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : rattrapages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Aucun rattrapage trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    rattrapages.map((rattrapage) => (
                      <TableRow key={rattrapage.id}>
                        <TableCell>
                          {rattrapage.cours?.matiere?.nom_matiere || "N/A"} - {rattrapage.cours?.classe?.nom_classe || "N/A"}
                        </TableCell>
                        <TableCell>{rattrapage.type_rattrapage}</TableCell>
                        <TableCell>{new Date(rattrapage.date_demande).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Badge className={STATUT_COLORS[rattrapage.statut]}>
                            {rattrapage.statut}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/gestion/rattrapages/${rattrapage.id}`)}>
                            <Eye className="h-4 w-4" />
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

