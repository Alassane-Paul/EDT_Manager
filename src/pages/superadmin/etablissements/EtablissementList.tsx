import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEtablissements } from "@/hooks/useEtablissements";
import { StatutEtablissement } from "@/types/etablissements";
import { Plus, Eye, Edit } from "lucide-react";

const STATUT_COLORS: Record<StatutEtablissement, string> = {
  [StatutEtablissement.ACTIF]: "bg-green-500",
  [StatutEtablissement.INACTIF]: "bg-red-500",
  [StatutEtablissement.SUSPENDU]: "bg-yellow-500",
  [StatutEtablissement.ARCHIVE]: "bg-gray-500",
};

export default function EtablissementList() {
  const navigate = useNavigate();
  const { etablissements, isLoading } = useEtablissements();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des établissements</h1>
            <p className="text-muted-foreground">Consulter et gérer les établissements</p>
          </div>
          <Button onClick={() => navigate("/gestion/etablissements/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel établissement
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des établissements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : etablissements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Aucun établissement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    etablissements.map((etab) => (
                      <TableRow key={etab.id}>
                        <TableCell className="font-medium">{etab.nom}</TableCell>
                        <TableCell>{etab.type}</TableCell>
                        <TableCell>{etab.ville || "-"}</TableCell>
                        <TableCell>
                          <Badge className={STATUT_COLORS[etab.statut]}>
                            {etab.statut}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/gestion/etablissements/${etab.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/gestion/etablissements/${etab.id}/edit`)}>
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

