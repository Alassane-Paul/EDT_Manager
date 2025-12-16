import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSalles } from '@/hooks/useSalles';
import { TypeSalle, StatutSalle } from '@/types/salles';
import { ArrowLeft } from 'lucide-react';

export default function SalleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { salles, isLoading } = useSalles();

  const salle = salles.find((s: any) => s.id === id);

  if (isLoading) return <div className="p-6">Chargement...</div>;
  if (!salle) return <div className="p-6">Salle introuvable</div>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gestion/salles')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{salle.nom_salle}</h1>
            <p className="text-muted-foreground">Détails de la salle</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <div><strong>Type:</strong> {salle.type_salle}</div>
              <div><strong>Capacité:</strong> {salle.capacite}</div>
              <div><strong>Bâtiment:</strong> {salle.batiment || '-'}</div>
              <div><strong>Étage:</strong> {salle.etage || '-'}</div>
              <div><strong>Statut:</strong> {salle.statut || '-'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
