import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEmploiTempsClasse, useExportEmploiTemps } from "@/hooks/useEmploiTemps";
import { useClasse } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { TimetableCalendar } from "@/components/timetable/TimetableCalendar";

export default function StudentSchedule() {
    const { classeId } = useParams<{ classeId: string }>();
    const navigate = useNavigate();
    const { emploiTemps, isLoading: isScheduleLoading } = useEmploiTempsClasse(classeId!);
    const { data: classe, isLoading: isClasseLoading } = useClasse(classeId!);
    const { exportPDF, isExporting } = useExportEmploiTemps();

    if (!classeId) return null;

    if (isScheduleLoading || isClasseLoading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full text-muted-foreground">
                    Chargement de l'emploi du temps...
                </div>
            </AppLayout>
        );
    }

    const creneaux = (emploiTemps as any)?.emploi_temps?.creneaux || [];
    const className = classe ? classe.nom_classe : "Chargement...";

    return (
        <AppLayout>
            <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Emploi du Temps</h2>
                            <p className="text-muted-foreground">
                                Classe: <span className="font-semibold text-foreground">{className}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => exportPDF({ classe_id: classeId })}
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

                <Card className="flex-1 overflow-hidden flex flex-col">
                    <CardHeader className="py-3 px-4 shrink-0 border-b">
                        <CardTitle className="text-lg">Aperçu Hebdomadaire</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="h-full p-4 overflow-auto">
                            {creneaux.length > 0 ? (
                                <TimetableCalendar creneaux={creneaux} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                    <p>Aucun cours planifié pour cette classe.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
