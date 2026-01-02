import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRattrapage, useRattrapageActions } from "@/hooks/useRattrapages";
import { ArrowLeft } from "lucide-react";

export default function RattrapageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rattrapage, isLoading } = useRattrapage(id || "");

  const { marquerRealise, cancelRattrapage } = useRattrapageActions();

  const r = (rattrapage as any) || {};

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gestion/rattrapages')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Détails rattrapage</h1>
            <p className="text-muted-foreground">Informations sur la demande de rattrapage</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{r.cours?.matiere?.nom_matiere || (isLoading ? 'Chargement...' : '—')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div><strong>Classe:</strong> {r.cours?.classe?.nom_classe}</div>
              <div><strong>Type:</strong> {r.type_rattrapage}</div>
              <div><strong>Durée:</strong> {r.duree} min</div>
              <div><strong>Statut:</strong> {r.statut}</div>
              <div><strong>Motif:</strong> {r.motif}</div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={() => marquerRealise(r.id)}>Marquer réalisé</Button>
              <Button variant="destructive" onClick={() => cancelRattrapage({ id: r.id, raison: "Annulation manuelle" })}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
