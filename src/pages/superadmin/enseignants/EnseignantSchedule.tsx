import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEmploiTempsEnseignant, useExportEmploiTemps } from "@/hooks/useEmploiTemps";
import { useEnseignant } from "@/hooks/useEnseignants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { TimetableCalendar } from "@/components/timetable/TimetableCalendar";

export default function EnseignantSchedule() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { emploiTemps, isLoading: isScheduleLoading } = useEmploiTempsEnseignant(id!);
    const { data: enseignant, isLoading: isEnseignantLoading } = useEnseignant(id!);
    const { exportPDF, isExporting } = useExportEmploiTemps();

    if (!id) return null;

    if (isScheduleLoading || isEnseignantLoading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full text-muted-foreground">
                    Chargement de l'emploi du temps...
                </div>
            </AppLayout>
        );
    }

    const creneaux = (emploiTemps as any)?.emploi_temps?.creneaux || [];
    const teacherName = enseignant ? `${enseignant.utilisateur.prenom} ${enseignant.utilisateur.nom}` : "Chargement...";

    return (
        <AppLayout>
            <div className="space-y-6 flex flex-col">
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Emploi du Temps</h2>
                            <p className="text-muted-foreground">
                                Enseignant: <span className="font-semibold text-foreground">{teacherName}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => exportPDF({ enseignant_id: id })}
                            disabled={isExporting}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                        </Button>
                    </div>
                </div>

                <Card className="min-h-[1000px] flex flex-col overflow-hidden">
                    <CardHeader className="py-3 px-4 shrink-0 border-b">
                        <CardTitle className="text-lg">Aperçu Hebdomadaire</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="h-full p-4 overflow-auto">
                            {creneaux.length > 0 ? (
                                <TimetableCalendar creneaux={creneaux} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                    <p>Aucun cours planifié pour cet enseignant.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
