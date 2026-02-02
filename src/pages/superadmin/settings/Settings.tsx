import { AppLayout } from "@/components/layout/AppLayout";
import { PeriodesTab } from "./tabs/PeriodesTab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Building, Clock, MapPin, Loader2 } from "lucide-react";
import { useEtablissement } from "@/hooks/useEtablissement";
import { useEffect, useState } from "react";
import { EtablissementFormData } from "@/types/etablissements";

export default function Settings() {
    const { toast } = useToast();
    const { etablissement, isLoading, updateEtablissement, isUpdating } = useEtablissement();
    const [formData, setFormData] = useState<Partial<EtablissementFormData>>({});

    useEffect(() => {
        if (etablissement) {
            setFormData({
                nom: etablissement.nom,
                email: etablissement.email,
                adresse: etablissement.adresse,
                heure_debut_journee: etablissement.heure_debut_journee,
                heure_fin_journee: etablissement.heure_fin_journee,
                duree_cours_standard: etablissement.duree_cours_standard,
            });
        }
    }, [etablissement]);

    const handleSave = async () => {
        try {
            await updateEtablissement(formData);
            toast({
                title: "Succès",
                description: "Paramètres enregistrés avec succès",
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible d'enregistrer les paramètres",
                variant: "destructive",
            });
        }
    };

    const handleChange = (field: keyof EtablissementFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

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
                            <TabsTrigger value="periodes">Périodes</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        </TabsList>

                        <TabsContent value="periodes" className="space-y-6">
                            <PeriodesTab />
                        </TabsContent>

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
                                            <Input
                                                id="base-name"
                                                value={formData.nom || ""}
                                                onChange={(e) => handleChange("nom", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="base-email">Email de contact</Label>
                                            <Input
                                                id="base-email"
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={(e) => handleChange("email", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="base-address">Adresse</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="base-address"
                                                className="pl-8"
                                                value={formData.adresse || ""}
                                                onChange={(e) => handleChange("adresse", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleSave} disabled={isUpdating}>
                                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
                                            <Input
                                                id="start-hour"
                                                type="time"
                                                value={formData.heure_debut_journee || "08:00"}
                                                onChange={(e) => handleChange("heure_debut_journee", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end-hour">Heure de fin (Journée)</Label>
                                            <Input
                                                id="end-hour"
                                                type="time"
                                                value={formData.heure_fin_journee || "18:00"}
                                                onChange={(e) => handleChange("heure_fin_journee", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slot-duration">Durée par défaut d'un cours (minutes)</Label>
                                        <Input
                                            id="slot-duration"
                                            type="number"
                                            min="0"
                                            value={formData.duree_cours_standard || 60}
                                            onChange={(e) => handleChange("duree_cours_standard", parseInt(e.target.value))}
                                        />
                                    </div>
                                    <Button onClick={handleSave} disabled={isUpdating}>
                                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
