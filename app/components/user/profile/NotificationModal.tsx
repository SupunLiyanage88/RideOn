import {
  getNotifications,
  markAsRead,
  removeNotification,
  type Notification,
} from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onNotificationCountChange: (count: number) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onNotificationCountChange,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const notifs = await getNotifications();
      setNotifications(notifs);
      const unreadCount = notifs.filter((n: Notification) => !n.read).length;
      onNotificationCountChange(unreadCount);
    } catch (error) {
      console.error("Error loading notifications:", error);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onNotificationCountChange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible, loadNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      await loadNotifications();

      if (
        notification.type === "bike_approved" ||
        notification.type === "bike_rejected"
      ) {
        onClose();
        router.push("/components/user/profile/UserBikes");
      }
    } catch (error) {
      console.error("Error handling notification press:", error);
      Alert.alert("Error", "Failed to process notification");
    }
  };

  const handleRemoveNotification = async (notificationId: string) => {
    Alert.alert(
      "Remove Notification",
      "Are you sure you want to remove this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeNotification(notificationId);
            await loadNotifications();
          },
        },
      ]
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
      await loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;

    Alert.alert(
      "Clear All",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            for (const notification of notifications) {
              await removeNotification(notification.id);
            }
            await loadNotifications();
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "bike_approved":
        return { name: "checkmark-circle" as const, color: "#10B981" };
      case "bike_rejected":
        return { name: "close-circle" as const, color: "#EF4444" };
      default:
        return { name: "information-circle" as const, color: "#083A4C" };
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="notifications" size={24} color="#083A4C" />
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllAsRead}
                  style={styles.headerActionButton}
                >
                  <Text style={styles.headerActionText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={clearAllNotifications}
                style={styles.headerActionButton}
              >
                <Text style={styles.headerActionText}>Clear all</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#083A4C" />
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color="#E5E7EB"
              />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyDescription}>
              When you receive notifications, they will appear here
            </Text>
            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Ionicons name="refresh" size={20} color="#083A4C" />
              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#083A4C"
                colors={["#083A4C"]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.notificationsList}>
              {notifications.map((notification, index) => {
                const icon = getNotificationIcon(notification.type);

                return (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadItem,
                      index === notifications.length - 1 && styles.lastItem,
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: `${icon.color}15` },
                      ]}
                    >
                      <Ionicons name={icon.name} size={20} color={icon.color} />
                    </View>

                    <View style={styles.content}>
                      <Text style={styles.title}>{notification.title}</Text>
                      <Text style={styles.message} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.time}>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                    </View>

                    <View style={styles.actions}>
                      {!notification.read && (
                        <View style={styles.unreadIndicator} />
                      )}
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveNotification(notification.id);
                        }}
                        style={styles.deleteButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#083A4C",
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    justifyContent:"flex-end",
    paddingRight:20,
  },
  headerActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  headerActionText: {
    color: "#083A4C",
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#083A4C",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#083A4C",
    borderRadius: 12,
    shadowColor: "#083A4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  notificationsList: {
    padding: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadItem: {
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 4,
    borderLeftColor: "#083A4C",
    borderColor: "#E1F5FE",
  },
  lastItem: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginTop: 2,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#083A4C",
    marginBottom: 6,
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  actions: {
    alignItems: "center",
    gap: 8,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#083A4C",
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
});

export default NotificationModal;
