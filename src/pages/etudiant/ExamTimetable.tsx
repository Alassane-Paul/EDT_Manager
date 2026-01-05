import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { sessionsExamenApi, SessionExamen } from "@/api/sessionsExamen/api";
import { repartitionsApi } from "@/api/sessionsExamen/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, FileText, Loader2 } from "lucide-react";

export default function ExamTimetable() {
    const { user } = useAuth();
    const classeId = (user as any)?.eleve?.classe_id;

    const { data: sessionsData, isLoading } = useQuery({
        queryKey: ["sessions-examen", classeId],
        queryFn: () => sessionsExamenApi.getByClasse(classeId!),
        enabled: !!classeId
    });

    // Grouper par date
    const sessionsByDate = sessionsData?.sessions.reduce((acc: any, session: SessionExamen) => {
        const date = session.date_examen;
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {}) || {};

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Mon Calendrier d'Examens</h1>
                    <p className="text-muted-foreground">Consultez vos examens à venir et vos salles assignées.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin h-8 w-8" />
                    </div>
                ) : Object.keys(sessionsByDate).length === 0 ? (
                    <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">Aucun examen programmé pour le moment.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(sessionsByDate)
                            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                            .map(([date, sessions]: [string, any]) => (
                                <Card key={date}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            {new Date(date).toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {sessions.map((session: SessionExamen) => (
                                            <ExamCard key={session.id} session={session} eleveId={(user as any)?.eleve?.id} />
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function ExamCard({ session, eleveId }: { session: SessionExamen; eleveId?: string }) {
    const { data: repartitionData } = useQuery({
        queryKey: ["repartition", session.id],
        queryFn: () => repartitionsApi.getRepartition(session.id),
        enabled: !!session.id
    });

    // Trouver la salle assignée à cet élève
    const maSalle = repartitionData?.repartitions.find((r: any) =>
        r.eleves_assignes.includes(eleveId)
    );

    return (
        <div className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg">{session.titre}</h3>
                    <p className="text-sm text-muted-foreground">{session.matiere?.nom_matiere}</p>
                </div>
                <Badge>{session.type.replace('_', ' ')}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{session.heure_debut} - {session.heure_fin}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Durée: {session.duree_minutes} min</span>
                </div>
            </div>

            {maSalle && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-medium">Salle assignée: {maSalle.salle?.nom_salle}</p>
                        <p className="text-xs text-muted-foreground">
                            {maSalle.nombre_places_utilisees} élèves / {maSalle.salle?.capacite} places
                        </p>
                    </div>
                </div>
            )}

            {session.instructions && (
                <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Instructions:</p>
                    <p className="text-sm text-muted-foreground">{session.instructions}</p>
                </div>
            )}
        </div>
    );
}
