// src/api/payments/api.ts
import axiosInstance from "../axios_instance";

export const paymentsApi = {
    /**
     * Initie une transaction de paiement FedaPay
     * @param invoiceId - ID de la facture à payer
     */
    async initiate(invoiceId: string): Promise<{
        success: boolean;
        id: string;
        url: string;
        token: string;
    }> {
        const response = await axiosInstance.post("/payments/initiate", { invoiceId });
        return response.data;
    },

    /**
     * Vérifie le statut d'une transaction FedaPay
     * @param transactionId - ID de transaction FedaPay
     */
    async verify(transactionId: string): Promise<any> {
        const response = await axiosInstance.get(`/payments/verify/${transactionId}`);
        return response.data;
    },

    /**
     * Initie une transaction de souscription à un plan
     * @param planType - Type du plan (basic, premium, etc.)
     */
    async initiateSubscription(planType: string): Promise<{
        success: boolean;
        id: string;
        url: string;
        token: string;
    }> {
        const response = await axiosInstance.post("/payments/subscribe", { planType });
        return response.data;
    },

    /**
     * Traite un paiement direct (Mobile Money USSD Push ou autre)
     * @param data - Données du paiement
     */
    async processDirectPayment(data: {
        transactionId: string | number;
        mode: 'mtn' | 'orange' | 'moov' | 'togocel' | 'free' | 'airtel' | 'wave' | 'celtiis' | 'card';
        phoneNumber?: string;
        country: string;
    }): Promise<any> {
        const response = await axiosInstance.post("/payments/process", data);
        return response.data;
    },
};

