import axios from "axios";
import { z } from "zod";

export const notificationSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  text: z.string().max(500),
  category: z.enum(["system", "payment", "rental", "package", "accident", "incident", "general"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateNotificationData {
  userId: string;
  text: string;
  category: "system" | "payment" | "rental" | "package" | "accident" | "incident" | "general";
}

// Create notification
export async function createNotification(data: CreateNotificationData) {
  const res = await axios.post("/api/notifications", data);
  return res.data;
}

// Get all notifications (Admin)
export async function getAllNotifications(page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const res = await axios.get(`/api/notifications${params.toString() ? '?' + params.toString() : ''}`);
  return res.data;
}

// Get current user's notifications
export async function getMyNotifications(
  category?: string, 
  page?: number, 
  limit?: number
): Promise<NotificationResponse> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const res = await axios.get(`/api/notifications/my-notifications${params.toString() ? '?' + params.toString() : ''}`);
  return res.data;
}

// Get notification statistics
export async function getNotificationStats() {
  const res = await axios.get("/api/notifications/stats");
  return res.data;
}

// Update notification (Admin only)
export async function updateNotification(id: string, data: Partial<Notification>) {
  const res = await axios.put(`/api/notifications/${id}`, data);
  return res.data;
}

// Delete notification
export async function deleteNotification(id: string) {
  const res = await axios.delete(`/api/notifications/${id}`);
  return res.data;
}

// Bulk delete notifications
export async function bulkDeleteNotifications(ids: string[]) {
  const res = await axios.delete("/api/notifications/bulk-delete", {
    data: { ids }
  });
  return res.data;
}

// Helper functions for bike-related notifications
export async function createBikeApprovalNotification(userId: string, bikeModel: string) {
  return createNotification({
    userId,
    text: `🎉 Great news! Your ${bikeModel} has been approved for rental. You can now start earning from your bike!`,
    category: "rental"
  });
}

export async function createBikeRejectionNotification(userId: string, bikeModel: string, reason?: string) {
  const baseText = `❌ Unfortunately, your ${bikeModel} rental request has been rejected.`;
  const fullText = reason ? `${baseText} Reason: ${reason}` : `${baseText} Please check the bike condition and try again.`;
  
  return createNotification({
    userId,
    text: fullText.length > 500 ? fullText.substring(0, 497) + "..." : fullText,
    category: "rental"
  });
}

export async function fetchUserNotification() {
  const res = await axios.get("/api/notifications/my-notifications");
  return res.data;
}