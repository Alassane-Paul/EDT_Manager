import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMatiere } from "@/hooks/useMatieres";
import { ArrowLeft, Edit } from "lucide-react";

export default function MatiereDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: matiere, isLoading } = useMatiere(id || "");

  const m = (matiere as any) || {};

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gestion/matieres')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Détails matière</h1>
            <p className="text-muted-foreground">Informations sur la matière</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{m.nom_matiere || (isLoading ? 'Chargement...' : '—')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div><strong>Code:</strong> {m.code_matiere}</div>
              <div><strong>Catégorie:</strong> {m.categorie}</div>
              <div><strong>Type:</strong> {m.type_cours}</div>
              <div><strong>Volume hebdo:</strong> {m.volume_horaire_hebdo} min</div>
              <div><strong>Coefficient:</strong> {m.coefficient}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => navigate(`/gestion/matieres/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
