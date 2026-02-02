import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsExamenApi, repartitionsApi, SessionExamen } from "@/api/sessionsExamen/api";
import { classesApi } from "@/api/classes/api";
import { matieresApi } from "@/api/matieres/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar as CalendarIcon, Users, Loader2, Trash2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExamForm } from "./ExamForm";
import { ExamCalendar } from "@/components/examens/ExamCalendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, subDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function ExamScheduler() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [newSessionOpen, setNewSessionOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<SessionExamen | null>(null);
    const [view, setView] = useState<"table" | "calendar">("table");
    const [currentDate, setCurrentDate] = useState(new Date());

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    const { data: classesData } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.getAll() });
    const { data: matieresData } = useQuery({ queryKey: ["matieres"], queryFn: () => matieresApi.getAll() });

    const { data: sessionsData, isLoading } = useQuery({
        queryKey: ["sessions-examen", format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')],
        queryFn: () => sessionsExamenApi.getCalendrier({
            date_debut: format(weekStart, 'yyyy-MM-dd'),
            date_fin: format(weekEnd, 'yyyy-MM-dd')
        })
    });

    const createMutation = useMutation({
        mutationFn: sessionsExamenApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions-examen"] });
            toast({ title: "Succès", description: "Session d'examen créée" });
            setNewSessionOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: sessionsExamenApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions-examen"] });
            toast({ title: "Annulé", description: "Session annulée" });
        }
    });

    const autoAssignMutation = useMutation({
        mutationFn: repartitionsApi.autoAssign,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["sessions-examen"] });
            toast({
                title: "Répartition effectuée",
                description: `${data.total_eleves} élèves répartis dans ${data.salles_utilisees} salles`
            });
        }
    });

    const handleCreateSession = (data: any) => {
        createMutation.mutate(data);
    };

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Calendrier des Examens</h1>
                        <p className="text-muted-foreground">Planifiez et gérez les examens présentiels.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/gestion/examens-presentiel/generate")}>
                            <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                            Générer un calendrier
                        </Button>
                        <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nouvelle Session
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Planifier un examen</DialogTitle>
                                </DialogHeader>
                                <ExamForm
                                    classes={classesData?.classes || []}
                                    matieres={matieresData?.matieres || []}
                                    onSubmit={handleCreateSession}
                                    isPending={createMutation.isPending}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="table" className="flex items-center gap-2">
                                <List className="h-4 w-4" />
                                Tableau
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4" />
                                Calendrier
                            </TabsTrigger>
                        </TabsList>

                        {view === "calendar" && (
                            <div className="flex items-center gap-4 bg-muted/50 p-1 rounded-lg border">
                                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 7))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-semibold capitalize min-w-[150px] text-center">
                                    {format(weekStart, 'd MMMM', { locale: fr })} - {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <TabsContent value="table">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sessions Programmées</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6" /></div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Titre</TableHead>
                                                <TableHead>Classe</TableHead>
                                                <TableHead>Matière</TableHead>
                                                <TableHead>Horaire</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sessionsData?.sessions.map((session: SessionExamen) => (
                                                <TableRow key={session.id}>
                                                    <TableCell>{new Date(session.date_examen).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-medium">{session.titre}</TableCell>
                                                    <TableCell>{session.classe?.nom_classe}</TableCell>
                                                    <TableCell>{session.matiere?.nom_matiere}</TableCell>
                                                    <TableCell>{session.heure_debut?.substring(0, 5)} - {session.heure_fin?.substring(0, 5)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={session.statut === 'PLANIFIE' ? 'default' : 'secondary'}>
                                                            {session.statut}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => autoAssignMutation.mutate(session.id)}
                                                                disabled={autoAssignMutation.isPending}
                                                            >
                                                                <Users className="h-4 w-4 mr-1" />
                                                                Répartir
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteMutation.mutate(session.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {sessionsData?.sessions.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        Aucune session programmée.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="calendar" className="min-h-[600px]">
                        {isLoading ? (
                            <Card className="flex justify-center items-center h-[600px]"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></Card>
                        ) : (
                            <ExamCalendar sessions={sessionsData?.sessions || []} currentDate={currentDate} />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
