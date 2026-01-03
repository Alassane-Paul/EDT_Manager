// src/components/billing/PaymentDialog.tsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { paymentsApi } from "@/api/payments/api";
import { useToast } from "@/hooks/use-toast";
import { CustomPaymentForm } from "./CustomPaymentForm";

interface PaymentDialogProps {
    invoice?: any | null;
    subscriptionPlan?: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const PaymentDialog = ({ invoice, subscriptionPlan, open, onOpenChange, onSuccess }: PaymentDialogProps) => {
    const [isInitiating, setIsInitiating] = useState(false);
    const [transactionData, setTransactionData] = useState<{ id: string | number, amount: number, currency: string, description: string } | null>(null);
    const { toast } = useToast();

    // Si on ferme le dialogue, on reset les données de transaction
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setTransactionData(null);
        }
        onOpenChange(newOpen);
    };

    const handleInitiate = async () => {
        setIsInitiating(true);
        try {
            let result;
            let description = "";
            let amount = 0;

            if (invoice) {
                result = await paymentsApi.initiate(invoice.id);
                description = `Règlement facture ${invoice.numero_facture}`;
                amount = invoice.montant_ttc;
            } else if (subscriptionPlan) {
                result = await paymentsApi.initiateSubscription(subscriptionPlan.type);
                description = `Abonnement au plan ${subscriptionPlan.nom}`;
                amount = subscriptionPlan.prix_base;
            } else {
                throw new Error("Aucune donnée de paiement fournie");
            }

            if (result.success) {
                setTransactionData({
                    id: result.id,
                    amount: amount,
                    currency: 'XOF',
                    description: description
                });
            } else {
                throw new Error("Impossible d'initier la transaction");
            }
        } catch (error: any) {
            console.error("Initiation error:", error);
            toast({
                title: "Erreur",
                description: error.message || "Impossible d'initier la transaction",
                variant: "destructive"
            });
        } finally {
            setIsInitiating(false);
        }
    };

    const title = invoice ? "Règlement de facture" : "Abonnement au plan";
    const amount = invoice ? invoice.montant_ttc : (subscriptionPlan ? subscriptionPlan.prix_base : 0);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={`${transactionData ? 'sm:max-w-[500px]' : 'sm:max-w-[425px]'} overflow-hidden`}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {invoice ? `Facture n° ${invoice.numero_facture}` : `Plan ${subscriptionPlan?.nom}`}
                    </DialogDescription>
                </DialogHeader>

                {!transactionData ? (
                    <div className="py-6 space-y-6">
                        <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-gradient-to-b from-blue-50/50 to-transparent gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-24 w-24 text-blue-600" />
                            </div>

                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 shadow-inner">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                            <div className="text-center relative z-10">
                                <h3 className="font-bold text-lg">Paiement Sécurisé</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                                    Votre transaction est protégée par FedaPay. Choisissez votre mode de paiement préféré à l'étape suivante.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                                <img src="https://www.fedapay.com/assets/images/logo-fedapay.png" alt="FedaPay" className="h-6 opacity-80 grayscale hover:grayscale-0 transition-all" />
                            </div>
                        </div>

                        <div className="space-y-3 px-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total à régler</span>
                                <span className="font-bold text-xl text-primary">{amount} XOF</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                                <span>Plateforme sécurisée</span>
                                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-500" /> SSL 256-bit</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isInitiating}>
                                Annuler
                            </Button>
                            <Button className="flex-[2] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleInitiate} disabled={isInitiating}>
                                {isInitiating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Initialisation...
                                    </>
                                ) : (
                                    <>
                                        Continuer <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="pt-2">
                        <CustomPaymentForm
                            transactionId={transactionData.id}
                            amount={transactionData.amount}
                            currency={transactionData.currency}
                            description={transactionData.description}
                            onSuccess={() => {
                                if (onSuccess) onSuccess();
                                handleOpenChange(false);
                            }}
                            onCancel={() => handleOpenChange(false)}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
