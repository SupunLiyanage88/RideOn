import { Bike } from "@/api/bike";
import React from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const getBikeStatusText = (condition: string, availability: boolean) => {
  if (!availability) return "Unavailable";
  const conditionNum = Number(condition);
  if (conditionNum >= 85) return "Excellent";
  if (conditionNum >= 70) return "Good";
  if (conditionNum >= 50) return "Fair";
  if (conditionNum < 50) return "Poor";
  return `${condition}%`;
};

const getBikeStatusColor = (condition: string, availability: boolean) => {
  if (!availability) return "#EF4444";

  const conditionNum = Number(condition);

  if (conditionNum >= 85) return "#37A77D"; // Primary green
  if (conditionNum >= 70) return "#10B981"; // Success green
  if (conditionNum >= 50) return "#F59E0B"; // Warning amber
  if (conditionNum < 50) return "#EF4444"; // Error red

  return "#6B7280";
};

const getBikeConditionPercentage = (condition: string) => {
  const conditionNum = Number(condition);
  return Math.min(Math.max(conditionNum, 0), 100);
};

const UserBikeCard = ({ bike }: { bike: Bike }) => {
  const isSmallScreen = SCREEN_WIDTH < 375;
  const conditionPercentage = getBikeConditionPercentage(bike.condition);

  return (
    <View style={[styles.container, { padding: isSmallScreen ? 16 : 20 }]}>
      {/* Header Section with Bike Info */}
      <View style={styles.header}>
        <View style={styles.bikeInfo}>
          <View style={styles.bikeIconContainer}>
            <Text style={styles.bikeIcon}>🚲</Text>
          </View>
          <View style={styles.bikeDetails}>
            <Text
              style={[styles.bikeModel, { fontSize: isSmallScreen ? 16 : 18 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {bike.bikeModel}
            </Text>
            <Text
              style={[styles.bikeId, { fontSize: isSmallScreen ? 11 : 12 }]}
            >
              ID: {bike.bikeId}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getBikeStatusColor(
                bike.condition,
                bike.availability
              ),
              paddingHorizontal: isSmallScreen ? 8 : 10,
              paddingVertical: isSmallScreen ? 4 : 6,
            },
          ]}
        >
          <Text
            style={[styles.statusText, { fontSize: isSmallScreen ? 10 : 11 }]}
            numberOfLines={1}
          >
            {getBikeStatusText(bike.condition, bike.availability)}
          </Text>
        </View>
      </View>

      {/* Condition Progress Bar */}
      <View style={styles.conditionSection}>
        <View style={styles.conditionHeader}>
          <Text style={styles.conditionLabel}>Condition</Text>
          <Text
            style={[
              styles.conditionValue,
              { color: getBikeStatusColor(bike.condition, bike.availability) },
            ]}
          >
            {bike.condition}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${conditionPercentage}%`,
                backgroundColor: getBikeStatusColor(
                  bike.condition,
                  bike.availability
                ),
              },
            ]}
          />
        </View>
      </View>

      {/* Specs Section */}
      <View style={styles.specsSection}>
        <View style={styles.specItem}>
          <View style={styles.specIconContainer}>
            <Text style={styles.specIcon}>⛽</Text>
          </View>
          <View style={styles.specContent}>
            <Text
              style={[styles.specLabel, { fontSize: isSmallScreen ? 11 : 12 }]}
            >
              Fuel Type
            </Text>
            <Text
              style={[styles.specValue, { fontSize: isSmallScreen ? 14 : 15 }]}
              numberOfLines={1}
            >
              {bike.fuelType
                ? bike.fuelType.charAt(0).toUpperCase() + bike.fuelType.slice(1)
                : ""}
            </Text>
          </View>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specItem}>
          <View style={styles.specIconContainer}>
            <Text style={styles.specIcon}>📏</Text>
          </View>
          <View style={styles.specContent}>
            <Text
              style={[styles.specLabel, { fontSize: isSmallScreen ? 11 : 12 }]}
            >
              Distance
            </Text>
            <Text
              style={[styles.specValue, { fontSize: isSmallScreen ? 14 : 15 }]}
            >
              {bike.distance} km
            </Text>
          </View>
        </View>
      </View>

      {/* Status Cards Section */}
      <View style={styles.statusSection}>
        <View
          style={[styles.statusCard, bike.assigned && styles.statusCardActive]}
        >
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: bike.assigned ? "#37A77D" : "#EF4444" },
              ]}
            />
          </View>
          <View style={styles.statusContent}>
            <Text
              style={[
                styles.statusLabel,
                { fontSize: isSmallScreen ? 10 : 11 },
              ]}
            >
              Assignment
            </Text>
            <Text
              style={[
                styles.statusValue,
                {
                  fontSize: isSmallScreen ? 12 : 13,
                  color: bike.assigned ? "#37A77D" : "#EF4444",
                },
              ]}
            >
              {bike.assigned ? "Assigned" : "Available"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusCard,
            bike.rentApproved && styles.statusCardActive,
          ]}
        >
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: bike.rentApproved ? "#37A77D" : "#F59E0B" },
              ]}
            />
          </View>
          <View style={styles.statusContent}>
            <Text
              style={[
                styles.statusLabel,
                { fontSize: isSmallScreen ? 10 : 11 },
              ]}
            >
              Approval
            </Text>
            <Text
              style={[
                styles.statusValue,
                {
                  fontSize: isSmallScreen ? 12 : 13,
                  color: bike.rentApproved ? "#37A77D" : "#F59E0B",
                },
              ]}
            >
              {bike.rentApproved ? "Approved" : "Pending"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { paddingVertical: isSmallScreen ? 12 : 14 },
        ]}
        onPress={() => {
          console.log("View bike details:", bike._id);
        }}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.actionButtonText,
            { fontSize: isSmallScreen ? 13 : 14 },
          ]}
        >
          View Details
        </Text>
        <Text style={styles.actionButtonIcon}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  bikeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  bikeIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#F0FDF4",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#BBF7D0",
  },

  bikeIcon: {
    fontSize: 20,
  },

  bikeDetails: {
    flex: 1,
  },

  bikeModel: {
    fontWeight: "700",
    color: "#0B4057",
    marginBottom: 2,
  },

  bikeId: {
    color: "#6B7280",
    fontWeight: "500",
  },

  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  statusText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },

  conditionSection: {
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  conditionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  conditionValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 3,
  },

  specsSection: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  specItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  specDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },

  specIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  specIcon: {
    fontSize: 14,
  },

  specContent: {
    flex: 1,
  },

  specLabel: {
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },

  specValue: {
    fontWeight: "700",
    color: "#0B4057",
  },

  statusSection: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },

  statusCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },

  statusCardActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },

  statusIndicator: {
    marginRight: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusContent: {
    flex: 1,
  },

  statusLabel: {
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },

  statusValue: {
    fontWeight: "700",
  },

  actionButton: {
    backgroundColor: "#37A77D",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#37A77D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  actionButtonText: {
    color: "white",
    fontWeight: "700",
    marginRight: 8,
  },

  actionButtonIcon: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserBikeCard;
