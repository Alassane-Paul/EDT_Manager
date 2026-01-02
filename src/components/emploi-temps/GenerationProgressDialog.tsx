import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emploiTempsApi } from "@/api/emploi-temps/api";

interface GenerationProgressDialogProps {
    emploiTempsId: string | null;
    open: boolean;
    onClose: () => void;
}

export function GenerationProgressDialog({ emploiTempsId, open, onClose }: GenerationProgressDialogProps) {
    const navigate = useNavigate();
    const [status, setStatus] = useState<{
        is_generating: boolean;
        is_complete: boolean;
        nombre_creneaux: number;
        score_qualite: number;
        commentaires?: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!emploiTempsId || !open) return;

        const pollStatus = async () => {
            try {
                const statusData = await emploiTempsApi.getStatus(emploiTempsId);
                setStatus(statusData);

                // Si la génération est terminée, arrêter le polling
                if (statusData.is_complete) {
                    setTimeout(() => {
                        navigate(`/gestion/emplois-temps/${emploiTempsId}`);
                    }, 1500);
                }
            } catch (err: any) {
                setError(err.message || "Erreur lors de la vérification du statut");
            }
        };

        // Poll immédiatement
        pollStatus();

        // Puis toutes les 2 secondes
        const interval = setInterval(pollStatus, 2000);

        return () => clearInterval(interval);
    }, [emploiTempsId, open, navigate]);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Génération de l'emploi du temps</DialogTitle>
                    <DialogDescription>
                        Veuillez patienter pendant que nous générons l'emploi du temps...
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {status?.is_generating && (
                        <>
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Génération en cours...</span>
                            </div>
                            <Progress value={undefined} className="w-full" />
                        </>
                    )}

                    {status?.is_complete && (
                        <>
                            <div className="flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                                <span className="font-medium">Génération terminée !</span>
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                <p>{status.nombre_creneaux} créneaux générés</p>
                                <p>Score de qualité : {status.score_qualite}%</p>
                                <p className="mt-2">Redirection en cours...</p>
                            </div>
                        </>
                    )}

                    {error && (
                        <>
                            <div className="flex items-center justify-center gap-2 text-red-600">
                                <XCircle className="h-6 w-6" />
                                <span className="font-medium">Erreur</span>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">{error}</p>
                            <Button onClick={onClose} variant="outline" className="w-full">
                                Fermer
                            </Button>
                        </>
                    )}

                    {status?.commentaires && (
                        <p className="text-sm text-muted-foreground text-center">{status.commentaires}</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
