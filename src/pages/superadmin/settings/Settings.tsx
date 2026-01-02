import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Building, Clock, MapPin } from "lucide-react";

export default function Settings() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Succès",
            description: "Paramètres enregistrés avec succès",
            variant: "default",
        });
    };

    return (
        <AppLayout>
            <div className="space-y-8 p-4 md:p-8">
                <div>
                    <h1 className="text-3xl font-bold">Paramètres Système</h1>
                    <p className="text-muted-foreground">
                        Gérez les configurations globales de votre établissement et du système.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    <Tabs defaultValue="general" className="space-y-6">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="general">Général</TabsTrigger>
                            <TabsTrigger value="academique">Académique</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-muted-foreground" />
                                        Informations de l'établissement
                                    </CardTitle>
                                    <CardDescription>
                                        Ces informations apparaîtront sur les exports PDF et les documents officiels.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="base-name">Nom de l'établissement</Label>
                                            <Input id="base-name" placeholder="Ex: Institut Supérieur de Technologie" defaultValue="Sout Academy" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="base-email">Email de contact</Label>
                                            <Input id="base-email" type="email" placeholder="contact@etablissement.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="base-address">Adresse</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="base-address" className="pl-8" placeholder="Adresse complète" />
                                        </div>
                                    </div>
                                    <Button onClick={handleSave}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Enregistrer
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="academique" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        Configuration Horaire
                                    </CardTitle>
                                    <CardDescription>
                                        Définissez les créneaux par défaut pour la génération des emplois du temps.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="start-hour">Heure de début (Journée)</Label>
                                            <Input id="start-hour" type="time" defaultValue="08:00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end-hour">Heure de fin (Journée)</Label>
                                            <Input id="end-hour" type="time" defaultValue="18:00" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slot-duration">Durée par défaut d'un cours (minutes)</Label>
                                        <Input id="slot-duration" type="number" defaultValue="60" />
                                    </div>
                                    <Button onClick={handleSave}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Enregistrer
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
