import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRattrapage, useRattrapageActions } from "@/hooks/useRattrapages";
import { ArrowLeft, Check, X, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { STATUT_COLORS, STATUT_LABELS } from "@/utils/rattrapageUtils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function RattrapageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rattrapage, isLoading } = useRattrapage(id || "");
  const { marquerRealise, cancelRattrapage, validateRattrapage, rejectRattrapage } = useRattrapageActions();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const r = (rattrapage as any) || {};
  const isGestionnaire = ['admin', 'directeur', 'responsable_pedagogique'].includes(user?.role || '');

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectRattrapage({ id: r.id, motif: rejectReason });
    setShowRejectDialog(false);
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) return;
    cancelRattrapage({ id: r.id, raison: cancelReason });
    setShowCancelDialog(false);
  };

  const getStatusBadge = (statut: string) => {
    return <Badge className={STATUT_COLORS[statut] || "bg-gray-500"}>{STATUT_LABELS[statut] || statut}</Badge>;
  };

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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl">{r.cours?.matiere?.nom_matiere || (isLoading ? 'Chargement...' : '—')}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {r.cours?.classe?.nom_classe} • {r.type_rattrapage}
              </div>
            </div>
            {getStatusBadge(r.statut)}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Informations Enseignant
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-base font-medium">
                    {r.cours?.enseignant?.utilisateur?.prenom} {r.cours?.enseignant?.utilisateur?.nom}
                  </p>
                  <p className="text-sm text-muted-foreground">Enseignant responsable</p>
                </div>

                <h3 className="font-semibold text-lg mt-6">Détails de la demande</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Durée:</span>
                    <span className="font-medium">{r.duree} min</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Demandé le:</span>
                    <span className="font-medium">{r.date_demande ? new Date(r.date_demande).toLocaleDateString() : '—'}</span>
                  </div>
                  {r.periode_souhaitee_debut && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Période souhaitée:</span>
                      <span className="font-medium">du {new Date(r.periode_souhaitee_debut).toLocaleDateString()} au {new Date(r.periode_souhaitee_fin).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Motif de la demande</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[100px]">
                  {r.motif || "Aucun motif précisé"}
                </div>

                {r.commentaires && (
                  <>
                    <h3 className="font-semibold text-lg mt-6">Commentaires / Notes</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm italic text-yellow-900">
                      {r.commentaires}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-6">
              {/* Actions Administration (Validation/Rejet) */}
              {isGestionnaire && r.statut === 'demande' && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
                    onClick={() => {
                      setRejectReason("");
                      setShowRejectDialog(true);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rejeter la demande
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    onClick={() => validateRattrapage(r.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Valider la demande
                  </Button>
                </>
              )}

              {/* Actions Générales */}
              {r.statut === 'planifie' && (
                <Button onClick={() => marquerRealise(r.id)} className="bg-blue-600 hover:bg-blue-700">
                  Marquer comme réalisé
                </Button>
              )}

              {(r.statut === 'demande' || r.statut === 'valide' || r.statut === 'planifie') && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setCancelReason("");
                    setShowCancelDialog(true);
                  }}
                >
                  Annuler
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler le rattrapage</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif de l'annulation. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Motif de l'annulation</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Indisponibilité de la salle, changement d'emploi du temps..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason.trim()}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet. L'enseignant sera notifié.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectReason">Motif du rejet</Label>
              <Textarea
                id="rejectReason"
                placeholder="Ex: Créneau non disponible, motif non valable..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Retour
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
