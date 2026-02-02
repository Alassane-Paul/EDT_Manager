import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { sessionsExamenApi, SessionExamen } from "@/api/sessionsExamen/api";
import { repartitionsApi } from "@/api/sessionsExamen/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, FileText, Loader2, LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExamCalendar } from "@/components/examens/ExamCalendar";
import { format, startOfWeek, endOfWeek, addDays, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ExamTimetable() {
    const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
    const [currentDate, setCurrentDate] = useState(new Date());

    const { user } = useAuth();
    const classeId = (user as any)?.eleve?.classe_id;

    const { data: sessionsData, isLoading } = useQuery({
        queryKey: ["sessions-examen", classeId, format(currentDate, 'yyyy-MM-dd')],
        queryFn: () => sessionsExamenApi.getCalendrier({
            classe_id: classeId!,
            date_debut: format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            date_fin: format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        }),
        enabled: !!classeId
    });

    const sessions = sessionsData?.sessions || [];

    // Grouper par date pour le mode liste
    const sessionsByDate = sessions.reduce((acc: any, session: SessionExamen) => {
        const date = session.date_examen;
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {}) || {};

    const nextWeek = () => setCurrentDate(prev => addDays(prev, 7));
    const prevWeek = () => setCurrentDate(prev => subDays(prev, 7));
    const goToToday = () => setCurrentDate(new Date());

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Mon Calendrier d'Examens</h1>
                        <p className="text-muted-foreground">Consultez vos examens à venir et vos salles assignées.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                        <Button
                            variant={viewMode === "calendar" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("calendar")}
                            className="gap-2"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Calendrier
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="gap-2"
                        >
                            <List className="h-4 w-4" />
                            Liste
                        </Button>
                    </div>
                </div>

                {viewMode === "calendar" && (
                    <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" onClick={prevWeek}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={nextWeek}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={goToToday} className="font-medium">
                                Aujourd'hui
                            </Button>
                        </div>
                        <h2 className="text-xl font-semibold capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: fr })}
                        </h2>
                        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
                            Semaine du {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd')} au {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMMM', { locale: fr })}
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : viewMode === "calendar" ? (
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <ExamCalendar sessions={sessions} currentDate={currentDate} />
                    </div>
                ) : Object.keys(sessionsByDate).length === 0 ? (
                    <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                            <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">Aucun examen programmé pour le moment.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(sessionsByDate)
                            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                            .map(([date, sessions]: [string, any]) => (
                                <Card key={date} className="overflow-hidden border-border shadow-sm">
                                    <CardHeader className="bg-muted/30 pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <CalendarIcon className="h-5 w-5 text-primary" />
                                            {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        {sessions.map((session: SessionExamen) => (
                                            <ExamCard key={session.id} session={session} eleveId={(user as any)?.eleve?.id} />
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>
        </AppLayout >
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
