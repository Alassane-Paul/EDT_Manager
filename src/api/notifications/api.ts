import { Notification, NotificationsResponse } from "@/types/notifications";
import axiosInstance from "../axios_instance";



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
    await axiosInstance.put("/notifications/mark-all-read");
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/notifications/${id}`);
  },
};
