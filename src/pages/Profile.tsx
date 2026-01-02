import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/auth/api";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast"; // Corrected import
import { useState, useRef } from "react";
import { Loader2, User, Lock, Camera, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
    const { user, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const changePasswordMutation = useMutation({
        mutationFn: ({ oldPassword, newPassword }: { oldPassword: string, newPassword: string }) =>
            authApi.changePassword(oldPassword, newPassword),
        onSuccess: () => {
            toast({ title: "Succès", description: "Mot de passe modifié avec succès", variant: "default" });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Une erreur est survenue lors du changement de mot de passe.";
            toast({ title: "Erreur", description: message, variant: "destructive" });
        },
    });

    const uploadAvatarMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await authApi.uploadAvatar(formData);
            return response;
        },
        onSuccess: async () => {
            toast({ title: "Succès", description: "Photo de profil mise à jour", variant: "default" });
            setSelectedImage(null);
            setImagePreview(null);
            await refreshProfile();
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Impossible de mettre à jour votre photo de profil.";
            toast({ title: "Erreur", description: message, variant: "destructive" });
        }
    });

    const handleSubmitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas", variant: "destructive" });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
            return;
        }
        changePasswordMutation.mutate({ oldPassword, newPassword });
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: "Fichier trop volumineux", description: "L'image sélectionnée dépasse la taille maximale autorisée (5 Mo).", variant: "destructive" });
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = () => {
        if (selectedImage) {
            uploadAvatarMutation.mutate(selectedImage);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const getInitials = () => {
        if (!user) return "?";
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    };

    if (!user) {
        return null;
    }

    return (
        <AppLayout>
            <div className="space-y-8 p-4 md:p-8">
                <div>
                    <h1 className="text-3xl font-bold">Mon Profil</h1>
                    <p className="text-muted-foreground">
                        Gérez vos informations personnelles et la sécurité de votre compte.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Tabs defaultValue="info" className="space-y-6">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="info" className="gap-2"><User className="h-4 w-4" /> Informations</TabsTrigger>
                            <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4" /> Sécurité</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Photo de Profil</CardTitle>
                                    <CardDescription>Personnalisez votre profil avec une photo.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-border cursor-pointer" onClick={triggerFileInput}>
                                            <AvatarImage src={imagePreview || user.photo_url || undefined} className="object-cover" />
                                            <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={triggerFileInput}>
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 text-center sm:text-left">
                                        <h3 className="font-medium">Changer votre photo</h3>
                                        <p className="text-sm text-muted-foreground">
                                            PNG, JPG ou WEBP. Max 5Mo.
                                        </p>
                                        <div className="flex gap-2 justify-center sm:justify-start">
                                            <Button variant="outline" size="sm" onClick={triggerFileInput}>
                                                Choisir une image
                                            </Button>
                                            {selectedImage && (
                                                <Button size="sm" onClick={handleUpload} disabled={uploadAvatarMutation.isPending}>
                                                    {uploadAvatarMutation.isPending ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="mr-2 h-4 w-4" />
                                                    )}
                                                    Uploader
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Informations Personnelles</CardTitle>
                                    <CardDescription>Vos informations de base.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Prénom</Label>
                                            <Input value={user.firstName} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nom</Label>
                                            <Input value={user.lastName} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={user.email} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rôle</Label>
                                            <Input value={user.role} disabled className="capitalize" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Téléphone</Label>
                                            <Input value={user.telephone || ""} disabled placeholder="Non renseigné" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Mot de passe</CardTitle>
                                        <CardDescription>Changez votre mot de passe pour sécuriser votre compte.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmitPassword} className="space-y-4 max-w-md">
                                            <div className="space-y-2">
                                                <Label htmlFor="current-password">Mot de passe actuel</Label>
                                                <Input
                                                    id="current-password"
                                                    type="password"
                                                    value={oldPassword}
                                                    onChange={(e) => setOldPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                                                <Input
                                                    id="confirm-password"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <Button type="submit" disabled={changePasswordMutation.isPending}>
                                                {changePasswordMutation.isPending && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Changer le mot de passe
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
