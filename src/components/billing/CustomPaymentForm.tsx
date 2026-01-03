// src/components/billing/CustomPaymentForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Smartphone, CreditCard, Loader2, CheckCircle2, AlertCircle, Globe, Lock } from "lucide-react";
import { paymentsApi } from "@/api/payments/api";
import { useToast } from "@/hooks/use-toast";

interface CustomPaymentFormProps {
    transactionId: string | number;
    amount: number;
    currency: string;
    description: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

type PaymentMode = 'mtn' | 'orange' | 'moov' | 'togocel' | 'free' | 'airtel' | 'wave' | 'celtiis' | 'card';

const countryData: Record<string, {
    name: string,
    placeholder: string,
    operators: { id: string, label: string, color: string }[]
}> = {
    'TG': {
        name: 'Togo',
        placeholder: '9X XX XX XX',
        operators: [
            { id: 'togocel', label: 'Togocom', color: 'bg-yellow-400' },
            { id: 'moov', label: 'Moov', color: 'bg-blue-600' }
        ]
    },
    'BJ': {
        name: 'Bénin',
        placeholder: '01 XX XX XX XX',
        operators: [
            { id: 'mtn', label: 'MTN', color: 'bg-yellow-400' },
            { id: 'moov', label: 'Moov', color: 'bg-blue-600' },
            { id: 'celtiis', label: 'Celtiis', color: 'bg-red-500' }
        ]
    },
    'CI': {
        name: 'Côte d\'Ivoire',
        placeholder: '07 XX XX XX XX',
        operators: [
            { id: 'orange', label: 'Orange', color: 'bg-orange-500' },
            { id: 'mtn', label: 'MTN', color: 'bg-yellow-400' },
            { id: 'moov', label: 'Moov', color: 'bg-blue-600' },
            { id: 'wave', label: 'Wave', color: 'bg-sky-400' }
        ]
    },
    'SN': {
        name: 'Sénégal',
        placeholder: '77 XXX XX XX',
        operators: [
            { id: 'orange', label: 'Orange', color: 'bg-orange-500' },
            { id: 'free', label: 'Free', color: 'bg-red-600' },
            { id: 'wave', label: 'Wave', color: 'bg-sky-400' }
        ]
    },
    'NE': {
        name: 'Niger',
        placeholder: '9X XX XX XX',
        operators: [
            { id: 'airtel', label: 'Airtel', color: 'bg-red-500' },
            { id: 'orange', label: 'Orange', color: 'bg-orange-500' },
            { id: 'moov', label: 'Moov', color: 'bg-blue-600' }
        ]
    },
    'BF': {
        name: 'Burkina Faso',
        placeholder: '7X XX XX XX',
        operators: [
            { id: 'orange', label: 'Orange', color: 'bg-orange-500' },
            { id: 'moov', label: 'Moov', color: 'bg-blue-600' }
        ]
    },
    'ML': {
        name: 'Mali',
        placeholder: '7X XX XX XX',
        operators: [
            { id: 'orange', label: 'Orange', color: 'bg-orange-500' },
            { id: 'moov', label: 'Moov', color: 'bg-blue-600' }
        ]
    }
};

export const CustomPaymentForm = ({
    transactionId,
    amount,
    currency,
    description,
    onSuccess,
    onCancel
}: CustomPaymentFormProps) => {
    const [mode, setMode] = useState<PaymentMode>('togocel');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [country, setCountry] = useState('TG');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const { toast } = useToast();

    const currentOperators = countryData[country]?.operators || [];
    const currentPlaceholder = countryData[country]?.placeholder || 'XXXXXXXX';

    // Quand le pays change, on séléctionne le premier opérateur disponible
    const handleCountryChange = (newCountry: string) => {
        setCountry(newCountry);
        const data = countryData[newCountry];
        if (data && data.operators.length > 0) {
            setMode(data.operators[0].id as PaymentMode);
        }
    };

    const handleCardChange = (field: string, value: string) => {
        let formattedValue = value;
        if (field === 'number') {
            formattedValue = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
        } else if (field === 'expiry') {
            formattedValue = value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').substring(0, 5);
            if (formattedValue.endsWith('/')) formattedValue = formattedValue.slice(0, -1);
        } else if (field === 'cvv') {
            formattedValue = value.substring(0, 3);
        }
        setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
    };

    const pollTransactionStatus = async (id: string | number) => {
        setIsPolling(true);
        let attempts = 0;
        const maxAttempts = 20; // Env 1 minute (3s * 20)

        const interval = setInterval(async () => {
            try {
                attempts++;
                const result = await paymentsApi.verify(id.toString());

                if (result.status === 'approved') {
                    clearInterval(interval);
                    setIsPolling(false);
                    toast({
                        title: "Paiement réussi !",
                        description: "Votre abonnement a été activé avec succès.",
                        className: "bg-green-50 border-green-200 text-green-800"
                    });
                    if (onSuccess) onSuccess();
                } else if (result.status === 'canceled' || result.status === 'declined') {
                    clearInterval(interval);
                    setIsPolling(false);
                    toast({
                        title: "Paiement échoué",
                        description: "La transaction a été annulée ou déclinée.",
                        variant: "destructive"
                    });
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setIsPolling(false);
                    toast({
                        title: "Délai expiré",
                        description: "Nous n'avons pas reçu la confirmation. Si vous avez été débité, contactez le support.",
                    });
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode !== 'card' && !phoneNumber) {
            toast({
                title: "Numéro requis",
                description: "Veuillez saisir votre numéro de téléphone pour le Mobile Money",
                variant: "destructive"
            });
            return;
        }

        if (mode === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
            toast({
                title: "Champs manquants",
                description: "Veuillez remplir toutes les informations de votre carte",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await paymentsApi.processDirectPayment({
                transactionId,
                mode,
                country,
                phoneNumber: phoneNumber.replace(/\s/g, '')
            });

            if (result.success) {
                if (result.redirectUrl) {
                    // Pour la carte, on redirige
                    window.location.href = result.redirectUrl;
                } else {
                    // Pour Mobile Money, on attend le push et on commence à poller
                    toast({
                        title: "Paiement initié",
                        description: result.message || "Veuillez valider la transaction sur votre téléphone.",
                    });

                    // Lancer le polling pour vérifier quand c'est validé
                    pollTransactionStatus(transactionId);
                }
            } else {
                throw new Error(result.error || "Une erreur est survenue");
            }
        } catch (error: any) {
            console.error("Direct payment error:", error);
            toast({
                title: "Erreur",
                description: error.message || "Impossible de traiter le paiement",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Détails du paiement
                </CardTitle>
                <CardDescription>
                    {description} - <span className="font-bold text-foreground">{amount} {currency}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <Tabs value={mode === 'card' ? 'card' : 'momo'} onValueChange={(v) => v === 'card' ? setMode('card') : setMode('mtn')}>
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                        <TabsTrigger value="momo" className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" /> Mobile Money
                        </TabsTrigger>
                        <TabsTrigger value="card" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Carte Bancaire
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="momo" className="space-y-4 pt-4">
                        <div className="space-y-3">
                            <Label>Pays</Label>
                            <Select value={country} onValueChange={handleCountryChange}>
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center justify-center text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-sm min-w-[28px] h-5">
                                            {country}
                                        </span>
                                        <SelectValue placeholder="Choisir un pays" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {Object.entries(countryData).map(([code, data]) => (
                                        <SelectItem key={code} value={code}>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                                                    alt={data.name}
                                                    className="w-5 h-auto rounded-sm"
                                                />
                                                <span>{data.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Opérateur</Label>
                            <RadioGroup value={mode} onValueChange={(v) => setMode(v as PaymentMode)} className="flex flex-wrap gap-4">
                                {currentOperators.map((op) => (
                                    <div key={op.id} className="flex items-center space-x-2 border rounded-md px-3 py-2 bg-card hover:bg-accent transition-colors cursor-pointer">
                                        <RadioGroupItem value={op.id} id={op.id} />
                                        <Label htmlFor={op.id} className="flex items-center gap-2 cursor-pointer font-bold">
                                            <div className={`w-3 h-3 rounded-full ${op.color}`} />
                                            {op.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Numéro de téléphone</Label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder={`Ex: ${currentPlaceholder}`}
                                    className="pl-10"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Saisissez le numéro qui recevra la demande de confirmation (USSD Push).
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="card" className="pt-4 space-y-6">
                        {/* Visual Card Preview */}
                        <div className="relative h-40 w-full max-w-[320px] mx-auto perspective-1000">
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden ring-1 ring-white/20">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Globe className="h-16 w-16" />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-12 bg-yellow-500/80 rounded-md" /> {/* Chip */}
                                    <CreditCard className="h-8 w-8 text-white/80" />
                                </div>
                                <div className="text-xl font-mono tracking-widest mb-4">
                                    {cardDetails.number || '•••• •••• •••• ••••'}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="text-[8px] uppercase opacity-60">Card Holder</div>
                                        <div className="text-xs font-semibold tracking-wide uppercase truncate w-32">
                                            {cardDetails.name || 'FULL NAME'}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-[8px] uppercase opacity-60">Expires</div>
                                        <div className="text-xs font-semibold">{cardDetails.expiry || 'MM/YY'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Form Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="card-number">Numéro de Carte</Label>
                                <Input
                                    id="card-number"
                                    placeholder="4242 4242 4242 4242"
                                    value={cardDetails.number}
                                    onChange={(e) => handleCardChange('number', e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="card-name">Nom sur la Carte</Label>
                                <Input
                                    id="card-name"
                                    placeholder="JEAN DUPONT"
                                    value={cardDetails.name}
                                    onChange={(e) => handleCardChange('name', e.target.value.toUpperCase())}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="card-expiry">Expiration</Label>
                                <Input
                                    id="card-expiry"
                                    placeholder="MM/YY"
                                    value={cardDetails.expiry}
                                    onChange={(e) => handleCardChange('expiry', e.target.value)}
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="card-cvv">CVV</Label>
                                <Input
                                    id="card-cvv"
                                    type="password"
                                    placeholder="•••"
                                    value={cardDetails.cvv}
                                    onChange={(e) => handleCardChange('cvv', e.target.value)}
                                    maxLength={3}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-md text-[10px] text-slate-500">
                            <Lock className="h-3 w-3" />
                            <p>Vos données sont cryptées et traitées en toute sécurité par FedaPay.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="px-0 pb-0 gap-3">
                <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting || isPolling}>
                    Annuler
                </Button>
                <Button className="flex-[2] bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={isSubmitting || isPolling}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Traitement...
                        </>
                    ) : isPolling ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            En attente de validation...
                        </>
                    ) : (
                        mode === 'card' ? "Continuer vers le paiement" : "Payer maintenant"
                    )}
                </Button>
            </CardFooter>
            {mode !== 'card' && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800 text-[10px]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>
                        Une notification sera envoyée sur votre téléphone. Veuillez valider la transaction en saisissant votre code PIN secret sur votre mobile après avoir cliqué sur "Payer maintenant".
                    </p>
                </div>
            )}
        </Card>
    );
};
