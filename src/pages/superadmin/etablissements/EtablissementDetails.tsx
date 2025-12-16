import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { useEtablissement, useEtablissementStats } from "@/hooks/useEtablissements";
import { Skeleton } from "@/components/ui/skeleton";

export default function EtablissementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: etablissement, isLoading } = useEtablissement(id || "");
  const { data: stats } = useEtablissementStats(id || "");

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!etablissement) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-muted-foreground">Établissement introuvable</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/gestion/etablissements")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{etablissement.nom}</h1>
              <p className="text-muted-foreground">{etablissement.ville || "-"} — {etablissement.type}</p>
            </div>
          </div>
          <div>
            <Button onClick={() => navigate(`/gestion/etablissements/${etablissement.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>Type:</strong> {etablissement.type}</div>
                <div><strong>Ville:</strong> {etablissement.ville || '-'}</div>
                <div><strong>Adresse:</strong> {etablissement.adresse || '-'}</div>
                <div><strong>Année scolaire:</strong> {etablissement.annee_scolaire_courante}</div>
                <div><strong>Statut:</strong> {etablissement.statut}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>Téléphone:</strong> {etablissement.telephone || '-'}</div>
                <div><strong>Email:</strong> {etablissement.email || '-'}</div>
                <div><strong>Site web:</strong> {etablissement.site_web || '-'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>Utilisateurs:</strong> {stats?.total_users ?? '-'}</div>
                <div><strong>Classes:</strong> {stats?.total_classes ?? '-'}</div>
                <div><strong>Enseignants:</strong> {stats?.total_enseignants ?? '-'}</div>
                <div><strong>Salles:</strong> {stats?.total_salles ?? '-'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
