import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Users, BookOpen, Calendar } from "lucide-react";
import { useClasse, useClasseStats } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatutClasse } from "@/types/classes";

const STATUT_LABELS: Record<StatutClasse, string> = {
  [StatutClasse.ACTIVE]: "Active",
  [StatutClasse.ARCHIVEE]: "Archivée",
};

const STATUT_COLORS: Record<StatutClasse, string> = {
  [StatutClasse.ACTIVE]: "bg-green-500",
  [StatutClasse.ARCHIVEE]: "bg-gray-500",
};

export default function ClasseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: classe, isLoading } = useClasse(id!);
  const { data: stats } = useClasseStats(id!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!classe) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Classe non trouvée</h2>
          <Button className="mt-4" onClick={() => navigate("/gestion/classes")}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/gestion/classes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{classe.nom_classe}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{classe.niveau}</span>
              {classe.filiere && (
                <>
                  <span>•</span>
                  <span>{classe.filiere}</span>
                </>
              )}
              <span>•</span>
              <Badge className={STATUT_COLORS[classe.statut]}>
                {STATUT_LABELS[classe.statut]}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/gestion/classes/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Effectif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classe.effectif}</div>
            <p className="text-xs text-muted-foreground">étudiants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_cours || 0}</div>
            <p className="text-xs text-muted-foreground">cours assignés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.enseignants_count || 0}</div>
            <p className="text-xs text-muted-foreground">enseignants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Année scolaire</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classe.annee_scolaire}</div>
            <p className="text-xs text-muted-foreground">année en cours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Salle principale</p>
              <p className="font-medium">{classe.salle_principale || "Non assignée"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge className={`mt-1 ${STATUT_COLORS[classe.statut]}`}>
                {STATUT_LABELS[classe.statut]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

