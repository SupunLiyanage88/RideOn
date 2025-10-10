import AsyncStorage from "@react-native-async-storage/async-storage";
import pushNotificationService, { NotificationData } from './pushNotificationService';

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
let notificationCount = 0;

export const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  try {
    // Store notification locally for history
    const existingNotifications = await getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };
    
    const updatedNotifications = [newNotification, ...existingNotifications];
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    
    // Send push notification
    const notificationData: NotificationData = {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      bikeId: notification.bikeId,
    };
    
    await pushNotificationService.scheduleLocalNotification(notificationData);
    
    // Update badge count
    notificationCount++;
    await pushNotificationService.setBadgeCount(notificationCount);
    
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
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && !notification.read) {
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
      
      // Update badge count
      const unreadCount = await getUnreadCount();
      await pushNotificationService.setBadgeCount(unreadCount - 1);
      notificationCount = Math.max(0, unreadCount - 1);
    }
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
    await pushNotificationService.clearBadgeCount();
    notificationCount = 0;
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};

// Initialize push notifications
export const initializePushNotifications = async () => {
  try {
    const token = await pushNotificationService.initialize();
    
    if (token) {
      console.log('Push notification token:', token);
      
      // Set up listeners for incoming notifications
      pushNotificationService.setupNotificationListeners(
        (notification) => {
          // Handle received notification while app is running
          console.log('Notification received while app is running:', notification);
        },
        (response) => {
          // Handle user tap on notification
          console.log('User tapped notification:', response);
          // You can navigate to specific screens based on notification data
        }
      );
      
      // Update badge count from stored notifications
      const unreadCount = await getUnreadCount();
      notificationCount = unreadCount;
      await pushNotificationService.setBadgeCount(unreadCount);
    }
    
    return token;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return null;
  }
};

// Clean up notification listeners
export const cleanupNotifications = () => {
  pushNotificationService.removeNotificationListeners();
};