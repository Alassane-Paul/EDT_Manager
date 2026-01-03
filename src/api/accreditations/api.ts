import axiosInstance from "../axios_instance";

export const accreditationsApi = {
    /**
     * Crée une nouvelle accréditation
     */
    create: async (data: {
        utilisateur_id: string;
        module: string;
        date_debut: string;
        date_fin: string;
        description?: string;
    }) => {
        const response = await axiosInstance.post("/accreditations", data);
        return response.data;
    },

    /**
     * Liste les accréditations de l'établissement
     */
    getAll: async () => {
        const response = await axiosInstance.get("/accreditations");
        return response.data;
    },

    /**
     * Révoque une accréditation
     */
    delete: async (id: string) => {
        const response = await axiosInstance.delete(`/accreditations/${id}`);
        return response.data;
    },

    /**
     * Vérifie l'accréditation actuelle pour un module
     */
    check: async (module: string) => {
        const response = await axiosInstance.get(`/accreditations/check/${module}`);
        return response.data;
    },

    /**
     * Récupère la liste des modules pour lesquels l'utilisateur est accrédité
     */
    getActiveModules: async () => {
        const response = await axiosInstance.get("/accreditations/me/active");
        return response.data; // { success: true, modules: [...] }
    }
};

