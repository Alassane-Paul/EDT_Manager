import axiosInstance from "../axios_instance";

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  titre: string;
  message: string;
  lu: boolean;
  date_creation: string;
  utilisateur_id: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  non_lues: number;
}

export const notificationsApi = {
  async getAll(): Promise<NotificationsResponse> {
    const response = await axiosInstance.get("/notifications");
    return response.data;
  },

  async getUnread(): Promise<Notification[]> {
    const response = await axiosInstance.get("/notifications/unread");
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await axiosInstance.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await axiosInstance.put("/notifications/read-all");
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/notifications/${id}`);
  },
};
