import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ressourcesApi, RessourceCours } from "@/api/ressources/api";
import { seancesVirtuellesApi, SeanceVirtuelle } from "@/api/seancesVirtuelles/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Link as LinkIcon, Download, ExternalLink, Calendar, Loader2 } from "lucide-react";

export default function VirtualClassroom() {
    const { user } = useAuth();
    const [selectedCours, setSelectedCours] = useState<string>("");

    // Get student's courses from their class
    // Assuming we can fetch this via a student endpoint or derive from user.eleve.classe_id
    // For simplicity, let's assume we have access to the student's courses

    // Fetch resources for selected course
    const { data: ressourcesData, isLoading: ressourcesLoading } = useQuery({
        queryKey: ["ressources", selectedCours],
        queryFn: () => ressourcesApi.getByCours(selectedCours),
        enabled: !!selectedCours
    });

    // Fetch virtual sessions
    const { data: seancesData, isLoading: seancesLoading } = useQuery({
        queryKey: ["seances", selectedCours],
        queryFn: () => seancesVirtuellesApi.getByCours(selectedCours),
        enabled: !!selectedCours
    });

    // For demo purposes, we'll need to get the student's courses
    // This would typically come from an API endpoint that returns courses for the student's class
    // Let's create a placeholder for now
    const studentCourses = [
        // This should be fetched from an API
    ];

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Ma Classe Virtuelle</h1>
                    <p className="text-muted-foreground">Accédez aux ressources de cours et rejoignez les séances en ligne.</p>
                </div>

                {/* Course selector would go here */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mes Cours</CardTitle>
                        <CardDescription>Sélectionnez un cours pour voir les ressources disponibles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Course cards would be mapped here */}
                            <Card className="cursor-pointer hover:border-primary transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-lg">Mathématiques</CardTitle>
                                    <CardDescription>M. Dupont</CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {selectedCours && (
                    <Tabs defaultValue="ressources" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="ressources">Ressources</TabsTrigger>
                            <TabsTrigger value="sessions">Cours en Ligne</TabsTrigger>
                        </TabsList>

                        <TabsContent value="ressources" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documents et Supports</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {ressourcesLoading ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="animate-spin h-6 w-6" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {ressourcesData?.ressources.map((ressource: RessourceCours) => (
                                                <div key={ressource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        {ressource.type === 'PDF' && <FileText className="h-5 w-5 text-red-500" />}
                                                        {ressource.type === 'VIDEO' && <Video className="h-5 w-5 text-blue-500" />}
                                                        {ressource.type === 'LIEN' && <LinkIcon className="h-5 w-5 text-green-500" />}
                                                        <div>
                                                            <p className="font-medium">{ressource.titre}</p>
                                                            {ressource.description && (
                                                                <p className="text-sm text-muted-foreground">{ressource.description}</p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Ajouté le {new Date(ressource.date_ajout).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={ressource.url} target="_blank" rel="noopener noreferrer" download>
                                                            {ressource.type === 'LIEN' ? (
                                                                <>
                                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                                    Ouvrir
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Télécharger
                                                                </>
                                                            )}
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))}
                                            {ressourcesData?.ressources.length === 0 && (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    <p>Aucune ressource disponible pour le moment.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sessions" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Séances Programmées</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {seancesLoading ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="animate-spin h-6 w-6" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {seancesData?.seances.map((seance: SeanceVirtuelle) => {
                                                const isUpcoming = new Date(seance.date_debut) > new Date();
                                                const isLive = new Date(seance.date_debut) <= new Date() && new Date(seance.date_fin) >= new Date();

                                                return (
                                                    <div key={seance.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="h-5 w-5 text-primary" />
                                                            <div>
                                                                <p className="font-medium">{seance.titre}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(seance.date_debut).toLocaleString('fr-FR', {
                                                                        dateStyle: 'medium',
                                                                        timeStyle: 'short'
                                                                    })}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {isLive && (
                                                                        <Badge variant="destructive" className="animate-pulse">
                                                                            En direct
                                                                        </Badge>
                                                                    )}
                                                                    {isUpcoming && (
                                                                        <Badge variant="secondary">
                                                                            À venir
                                                                        </Badge>
                                                                    )}
                                                                    {!isLive && !isUpcoming && (
                                                                        <Badge variant="outline">
                                                                            Terminée
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {(isLive || isUpcoming) && (
                                                            <Button asChild>
                                                                <a href={seance.lien_visio} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                                    Rejoindre
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {seancesData?.seances.length === 0 && (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    <p>Aucune séance programmée.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
}
