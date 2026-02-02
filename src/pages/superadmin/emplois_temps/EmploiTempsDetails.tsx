import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEmploiTempsById, useEmploiTempsActions, useExportEmploiTemps } from "@/hooks/useEmploiTemps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, CheckCircle2, Download, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimetableCalendar } from "@/components/timetable/TimetableCalendar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";

export default function EmploiTempsDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { emploiTemps, isLoading } = useEmploiTempsById(id!);
    const { validerEmploiTemps, isValidating, publierEmploiTemps, isPublishing, deleteEmploiTemps, isDeleting } = useEmploiTempsActions();
    const { exportPDF, isExporting } = useExportEmploiTemps();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleDelete = async () => {
        if (!id) return;
        deleteEmploiTemps(id, {
            onSuccess: () => {
                navigate("/gestion/emplois-temps");
            }
        });
    };

    if (!id) return null;

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">Chargement...</div>
            </AppLayout>
        );
    }

    if (!emploiTemps) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <h2 className="text-2xl font-bold">Emploi du temps non trouvé</h2>
                    <Button onClick={() => navigate(-1)}>Retour</Button>
                </div>
            </AppLayout>
        );
    }

    // Cast to specific type if needed
    const details = emploiTemps as any;
    const creneaux = details.emploi_temps.creneaux || [];

    return (
        <AppLayout>
            <div className="space-y-6 flex flex-col">
                <div className="flex items-center gap-4 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/gestion/emplois-temps")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{details.emploi_temps.nom_version}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <BadgeWrapper status={details.emploi_temps.statut} />
                            <span className="text-sm">•</span>
                            <span className="text-sm">{details.emploi_temps.classe?.nom_classe}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4 shrink-0">
                    {/* Stats cards remain similar, maybe compacted */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Période</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs font-bold">
                                Du {new Date(details.emploi_temps.periode_debut).toLocaleDateString()}
                            </div>
                            <div className="text-xs font-bold">
                                Au {new Date(details.emploi_temps.periode_fin).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Qualité</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {details.emploi_temps.score_qualite ? `${details.emploi_temps.score_qualite.toFixed(0)}%` : "-"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="min-h-[1000px] flex flex-col overflow-hidden">
                    <CardHeader className="py-3 px-4 shrink-0 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Aperçu de l'emploi du temps</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => exportPDF({ id, classe_id: details.emploi_temps.classe_id })}
                                    disabled={isExporting}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exporter PDF
                                </Button>
                                {details.emploi_temps.statut === "brouillon" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => validerEmploiTemps(id)}
                                        disabled={isValidating}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Valider
                                    </Button>
                                )}
                                {(details.emploi_temps.statut === "brouillon" || details.emploi_temps.statut === "valide") && (
                                    <Button
                                        size="sm"
                                        onClick={() => publierEmploiTemps(id)}
                                        disabled={isPublishing}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Publier
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setIsConfirmOpen(true)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="h-full p-4 overflow-auto">
                            <TimetableCalendar creneaux={creneaux} />
                        </div>
                    </CardContent>
                </Card>

                <ConfirmDialog
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                    onConfirm={handleDelete}
                    title="Supprimer l'emploi du temps"
                    description="Êtes-vous sûr de vouloir supprimer définitivement cet emploi du temps ?"
                    confirmText="Supprimer"
                    variant="destructive"
                />
            </div>
        </AppLayout>
    );
}

const BadgeWrapper = ({ status }: { status: string }) => {
    const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        brouillon: "secondary",
        valide: "outline",
        publie: "default",
        archive: "destructive",
    };
    return <Badge variant={STATUS_COLORS[status] || "default"} className="capitalize">{status}</Badge>;
}
