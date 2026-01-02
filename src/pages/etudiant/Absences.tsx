import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axiosInstance from "@/api/axios_instance";

interface Absence {
    id: number;
    date_debut: string;
    date_fin: string;
    motif: string;
    statut: "EN_ATTENTE" | "JUSTIFIEE" | "INJUSTIFIEE" | "REGULARISEE";
    cours?: {
        id: number;
        matiere?: {
            nom_matiere: string;
            code_matiere: string;
        };
        enseignant?: {
            utilisateur?: {
                nom: string;
                prenom: string;
            };
        };
    };
}

const AbsencesEtudiant = () => {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['mes-absences'],
        queryFn: async () => {
            const response = await axiosInstance.get('/absences/me');
            return response.data;
        }
    });

    const absences = data?.absences || [];
    const stats = {
        total: absences.length,
        justifiees: absences.filter((a: Absence) => a.statut === 'JUSTIFIEE' || a.statut === 'REGULARISEE').length,
        injustifiees: absences.filter((a: Absence) => a.statut === 'INJUSTIFIEE' || a.statut === 'EN_ATTENTE').length
    };

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'JUSTIFIEE':
            case 'REGULARISEE':
                return <Badge className="bg-green-500 hover:bg-green-600">Justifiée</Badge>;
            case 'INJUSTIFIEE':
                return <Badge variant="destructive">Injustifiée</Badge>;
            case 'EN_ATTENTE':
            default:
                return <Badge variant="secondary">En attente</Badge>;
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Mes Absences</h2>
                        <p className="text-muted-foreground">
                            Suivi de vos absences et justificatifs
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Absences</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Depuis le début de l'année</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Justifiées</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.justifiees}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Non Justifiées</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.injustifiees}</div>
                            <p className="text-xs text-muted-foreground">Action requise</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Historique</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Chargement...</div>
                        ) : absences.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucune absence enregistrée. Continuez ainsi !
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {absences.map((absence: Absence) => (
                                    <div
                                        key={absence.id}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {format(new Date(absence.date_debut), 'dd MMMM yyyy', { locale: fr })}
                                                </span>
                                                {getStatusBadge(absence.statut)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {format(new Date(absence.date_debut), 'HH:mm')} - {format(new Date(absence.date_fin), 'HH:mm')}
                                                </span>
                                                <span>•</span>
                                                <BookOpen className="h-4 w-4 ml-1" />
                                                <span>{absence.cours?.matiere?.nom_matiere || 'Cours inconnu'}</span>
                                            </div>
                                            {absence.motif && (
                                                <div className="text-sm italic text-muted-foreground">
                                                    "{absence.motif}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AbsencesEtudiant;
