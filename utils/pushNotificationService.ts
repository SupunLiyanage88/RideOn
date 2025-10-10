import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationData {
  title: string;
  message: string;
  type: "bike_approved" | "bike_rejected" | "general";
  bikeId?: string;
}

// Configure how notifications are handled when app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<string | null> {
    try {
      // Check if this is a physical device
      if (!Device.isDevice) {
        console.warn("Push notifications only work on physical devices");
        return null;
      }

      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Failed to get push token for push notification!");
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "12d8e786-676b-4a1f-97b8-5ed0e2cd1642", // Replace with your actual Expo project ID
      });

      this.expoPushToken = token.data;

      // Store token for potential server registration
      await AsyncStorage.setItem("expoPushToken", token.data);

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#083A4C",
        });
      }

      return token.data;
    } catch (error) {
      console.error("Error initializing push notifications:", error);
      return null;
    }
  }

  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (
      response: Notifications.NotificationResponse
    ) => void
  ) {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listener for when user taps on notification
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        onNotificationResponse?.(response);
      });
  }

  removeNotificationListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  async scheduleLocalNotification(data: NotificationData) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.message,
          data: {
            type: data.type,
            bikeId: data.bikeId,
          },
          sound: true,
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error("Error scheduling local notification:", error);
      return null;
    }
  }

  async sendPushNotification(data: NotificationData, targetToken?: string) {
    const token = targetToken || this.expoPushToken;
    if (!token) {
      console.warn("No push token available");
      return;
    }

    try {
      const message = {
        to: token,
        sound: "default",
        title: data.title,
        body: data.message,
        data: {
          type: data.type,
          bikeId: data.bikeId,
        },
      };

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log("Push notification sent:", result);
      return result;
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }

  async clearBadgeCount() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error("Error clearing badge count:", error);
    }
  }

  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
    }
  }
}

export default new PushNotificationService();
