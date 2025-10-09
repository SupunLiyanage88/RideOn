import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'bike_approved' | 'bike_rejected' | 'general';
  timestamp: number;
  bikeId?: string;
  read: boolean;
}

const NOTIFICATIONS_KEY = 'user_notifications';

export const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  try {
    const existingNotifications = await getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };
    
    const updatedNotifications = [newNotification, ...existingNotifications];
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    return newNotification;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const notifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const markAsRead = async (notificationId: string) => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const removeNotification = async (notificationId: string) => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    return true;
  } catch (error) {
    console.error('Error removing notification:', error);
    return false;
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const notifications = await getNotifications();
    return notifications.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};