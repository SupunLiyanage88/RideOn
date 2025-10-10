// Example: How to use the new push notification system in your app

import { addNotification } from '@/utils/notifications';

// Example usage in your app components:

// 1. Send a bike approval notification
const sendBikeApprovalNotification = async (bikeId: string) => {
  await addNotification({
    title: '🎉 Bike Approved!',
    message: 'Your bike has been approved and is ready to ride!',
    type: 'bike_approved',
    bikeId: bikeId,
  });
};

// 2. Send a bike rejection notification
const sendBikeRejectionNotification = async (bikeId: string, reason: string) => {
  await addNotification({
    title: '❌ Bike Rejected',
    message: `Your bike was rejected. Reason: ${reason}`,
    type: 'bike_rejected',
    bikeId: bikeId,
  });
};

// 3. Send a general notification
const sendGeneralNotification = async (title: string, message: string) => {
  await addNotification({
    title: title,
    message: message,
    type: 'general',
  });
};

// Examples of different notification scenarios:
export const notificationExamples = {
  
  // Welcome notification
  welcome: () => sendGeneralNotification(
    '🚴 Welcome to RideOn!', 
    'Start your biking journey today!'
  ),

  // Maintenance reminder
  maintenance: (bikeName: string) => sendGeneralNotification(
    '🔧 Maintenance Due',
    `Your ${bikeName} is due for maintenance. Book a service today!`
  ),

  // Ride completion
  rideComplete: (distance: number, duration: string) => sendGeneralNotification(
    '✅ Ride Completed!',
    `Great job! You rode ${distance}km in ${duration}. Keep it up!`
  ),

  // Low battery warning
  lowBattery: () => sendGeneralNotification(
    '🔋 Low Battery',
    'Your bike battery is low. Please charge it soon.'
  ),

  // Weather alert
  weatherAlert: (condition: string) => sendGeneralNotification(
    '⛈️ Weather Alert',
    `${condition} expected. Plan your ride accordingly.`
  ),

  // Subscription reminder
  subscriptionReminder: () => sendGeneralNotification(
    '📅 Subscription Reminder',
    'Your subscription expires in 3 days. Renew now to continue riding!'
  ),
};

/*
Key Features of the New Push Notification System:

1. ✅ Real Push Notifications: No longer just storage-based, actual push notifications
2. 🔔 Badge Count Management: Automatically updates app badge with unread count
3. 📱 Platform Support: Works on both iOS and Android
4. 🎯 Notification Categories: Support for different notification types
5. 🔧 Permission Handling: Proper permission requests and handling
6. 📝 Notification History: Still maintains local storage for notification history
7. 🎨 Custom Styling: Notifications use your app's branding colors
8. 🔄 Auto-cleanup: Proper cleanup when app is unmounted

How it works:
- When you call addNotification(), it both stores the notification locally AND sends a push notification
- The badge count is automatically managed
- Users will receive notifications even when the app is closed
- Tapping notifications can navigate to specific screens in your app
- All existing notification features are preserved while adding push functionality

Note: 
- Push notifications work on physical devices, not in simulators
- Users must grant permission for notifications to work
- The system gracefully falls back to storage-only mode if push notifications aren't available
*/