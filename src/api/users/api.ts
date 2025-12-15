// src/api/users/api.ts
import { User, UserFilters, UserFormData, UserStats } from "@/types/users";
import axiosInstance from "../axios_instance";

export const usersApi = {
  async getAll(filters?: UserFilters): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await axiosInstance.get("/users", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  },

  async create(data: UserFormData): Promise<User> {
    const response = await axiosInstance.post("/users", data);
    return response.data.user;
  },

  async update(id: string, data: Partial<UserFormData>): Promise<User> {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data.user;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/users/${id}`);
  },

  async getStats(): Promise<UserStats> {
    const response = await axiosInstance.get("/users/stats");
    return response.data.stats;
  },
};

