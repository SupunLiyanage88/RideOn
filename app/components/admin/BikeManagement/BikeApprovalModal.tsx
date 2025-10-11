import { Bike, approveBikeRental, rejectBikeRental } from "@/api/bike";
import { images } from "@/constants/images";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Loader from "../../Loader";

interface BikeApprovalModalProps {
  visible: boolean;
  bikes: Bike[];
  onClose: () => void;
  isLoading?: boolean;
}

const BikeApprovalModal: React.FC<BikeApprovalModalProps> = ({
  visible,
  bikes,
  onClose,
  isLoading = false,
}) => {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: approveBikeRental,
    onSuccess: async (data, bikeId) => {
      queryClient.invalidateQueries({ queryKey: ["bikes-awaiting-approval"] });
      queryClient.invalidateQueries({ queryKey: ["bike-data"] });
      
      Alert.alert("Success", "Bike rental approved successfully!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to approve bike rental. Please try again.");
      console.error("Approval error:", error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectBikeRental,
    onSuccess: async (data, bikeId) => {
      queryClient.invalidateQueries({ queryKey: ["bikes-awaiting-approval"] });
      queryClient.invalidateQueries({ queryKey: ["bike-data"] });
      
      // Find the bike that was rejected
      const rejectedBike = bikes.find(bike => bike._id === bikeId);
      
      Alert.alert("Success", "Bike rental rejected successfully!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to reject bike rental. Please try again.");
      console.error("Rejection error:", error);
    },
  });

  const handleApprove = (bikeId: string, bike: Bike) => {
    const hasPhoto = bike.imageUrl ? "✅ Photo verified" : "⚠️ No photo provided";
    Alert.alert(
      "Confirm Approval",
      `Are you sure you want to approve this bike for rental?\n\n📸 ${hasPhoto}\n🚴 Model: ${bike.bikeModel}\n📊 Condition: ${bike.condition}/100`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Approve",
          onPress: () => approveMutation.mutate(bikeId),
        },
      ]
    );
  };

  const handleReject = (bikeId: string, bike: Bike) => {
    const photoStatus = bike.imageUrl ? "Photo provided" : "No photo provided";
    Alert.alert(
      "Confirm Rejection",
      `Are you sure you want to reject this bike rental request?\n\n🚴 Model: ${bike.bikeModel}\n📸 ${photoStatus}\n📊 Condition: ${bike.condition}/100\n\nThe owner will be notified of the rejection.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => rejectMutation.mutate(bikeId),
        },
      ]
    );
  };

  // Get condition status and styling
  const getConditionInfo = (condition: number) => {
    if (condition >= 80) return { status: "Excellent", color: "#10B981", bgColor: "#ECFDF5" };
    if (condition >= 60) return { status: "Good", color: "#F59E0B", bgColor: "#FFFBEB" };
    if (condition >= 40) return { status: "Fair", color: "#F97316", bgColor: "#FFF7ED" };
    return { status: "Poor", color: "#EF4444", bgColor: "#FEF2F2" };
  };

  // Get fuel type styling
  const getFuelTypeInfo = (fuelType: string) => {
    const type = fuelType.toLowerCase();
    if (type === "electric") {
      return { 
        color: "#10B981", 
        bgColor: "#ECFDF5", 
        icon: "bolt-lightning" as const,
        image: images.evbike
      };
    }
    return { 
      color: "#3B82F6", 
      bgColor: "#EFF6FF", 
      icon: "bicycle" as const,
      image: images.pdbike
    };
  };

  const renderBikeItem = (bike: Bike) => {
    const conditionInfo = getConditionInfo(Number(bike.condition));
    const fuelInfo = getFuelTypeInfo(bike.fuelType);

    return (
      <View key={bike._id} style={styles.bikeItem}>
        {/* Header with bike image and main info */}
        <View style={styles.bikeHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.bikeImageContainer}>
              <Image source={fuelInfo.image} style={styles.bikeImage} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.bikeId}>#{bike.bikeId}</Text>
              <Text style={styles.bikeModel}>{bike.bikeModel}</Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.fuelBadge, { backgroundColor: fuelInfo.bgColor }]}>
                  <FontAwesome6 name={fuelInfo.icon} size={12} color={fuelInfo.color} />
                  <Text style={[styles.fuelBadgeText, { color: fuelInfo.color }]}>
                    {bike.fuelType.charAt(0).toUpperCase() + bike.fuelType.slice(1)}
                  </Text>
                </View>
                {/* Photo Status Badge */}
                <View style={[
                  styles.photoBadge, 
                  { backgroundColor: bike.imageUrl ? "#ECFDF5" : "#FEF2F2" }
                ]}>
                  <FontAwesome6 
                    name={bike.imageUrl ? "camera" : "camera-slash"} 
                    size={10} 
                    color={bike.imageUrl ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={[
                    styles.photoBadgeText, 
                    { color: bike.imageUrl ? "#10B981" : "#EF4444" }
                  ]}>
                    {bike.imageUrl ? "Photo" : "No Photo"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.conditionBadge, { backgroundColor: conditionInfo.bgColor }]}>
              <Text style={[styles.conditionText, { color: conditionInfo.color }]}>
                {conditionInfo.status}
              </Text>
              <Text style={styles.conditionScore}>{bike.condition}/100</Text>
            </View>
          </View>
        </View>

        {/* User Uploaded Bike Photo Section */}
        <View style={styles.userPhotoSection}>
          <View style={styles.photoHeader}>
            <FontAwesome6 name="camera" size={16} color="#374151" />
            <Text style={styles.photoHeaderText}>Owner's Photo (Proof of Condition)</Text>
          </View>
          {bike.imageUrl ? (
            <TouchableOpacity 
              style={styles.photoContainer}
              onPress={() => {
                Alert.alert(
                  "Bike Photo",
                  `Full view of ${bike.bikeModel}\n\nCondition reported: ${bike.condition}/100\nOwner: ${bike.createdBy?.userName}`,
                  [{ text: "Close", style: "cancel" }]
                );
              }}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: bike.imageUrl }} 
                style={styles.userUploadedImage}
                resizeMode="cover"
              />
              <View style={styles.photoOverlay}>
                <View style={styles.photoVerificationBadge}>
                  <FontAwesome6 name="camera" size={12} color="#FFFFFF" />
                  <Text style={styles.photoVerificationText}>User Uploaded</Text>
                </View>
              </View>
              <View style={styles.tapToViewIndicator}>
                <FontAwesome6 name="expand" size={12} color="#FFFFFF" />
                <Text style={styles.tapToViewText}>Tap to enlarge</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noPhotoContainer}>
              <FontAwesome6 name="camera-slash" size={24} color="#9CA3AF" />
              <Text style={styles.noPhotoText}>No photo uploaded</Text>
              <Text style={styles.noPhotoSubtext}>Owner didn't provide condition photo</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <FontAwesome6 name="route" size={16} color="#6B7280" />
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{bike.distance} km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <FontAwesome6 name="user" size={16} color="#6B7280" />
            <Text style={styles.statLabel}>Owner</Text>
            <Text style={styles.statValue}>{bike.createdBy?.userName}</Text>
          </View>
        </View>

        {/* Owner Details */}
        <View style={styles.ownerSection}>
          <View style={styles.ownerInfo}>
            <FontAwesome6 name="envelope" size={14} color="#6B7280" />
            <Text style={styles.ownerEmail}>{bike.createdBy?.email}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.rejectButton,
              (approveMutation.isPending || rejectMutation.isPending) &&
                styles.buttonDisabled,
            ]}
            onPress={() => handleReject(bike._id, bike)}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            <FontAwesome6 name="xmark" size={16} color="#FFFFFF" />
            <Text style={styles.rejectButtonText}>
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.approveButton,
              (approveMutation.isPending || rejectMutation.isPending) &&
                styles.buttonDisabled,
            ]}
            onPress={() => handleApprove(bike._id, bike)}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            <FontAwesome6 name="check" size={16} color="#FFFFFF" />
            <Text style={styles.approveButtonText}>
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <FontAwesome6 name="clipboard-check" size={24} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Rental Approvals</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome6 name="xmark" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={{ paddingBottom: 24, margin: 8 }}>
            <Loader showText={false} />
          </View>
        )}
        {bikes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="clipboard-check" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No bikes awaiting approval</Text>
            <Text style={styles.emptySubtext}>
              All rental requests have been processed. Check back later for new submissions.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.subtitleContainer}>
              <FontAwesome6 name="hourglass-half" size={16} color="#F59E0B" />
              <Text style={styles.subtitle}>
                {bikes.length} bike{bikes.length !== 1 ? "s" : ""} awaiting approval
              </Text>
            </View>
            {bikes.map(renderBikeItem)}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#083A4C",
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFBEB",
    marginBottom: 10,
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#92400E",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#374151",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  bikeItem: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bikeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: "row",
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  bikeImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bikeImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerInfo: {
    flex: 1,
  },
  bikeId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 2,
  },
  bikeModel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  fuelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  fuelBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  photoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  photoBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  conditionText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  conditionScore: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 15,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  ownerSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ownerEmail: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  approveButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rejectButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    elevation: 0,
    shadowOpacity: 0,
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  rejectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  // User Photo Section Styles
  userPhotoSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  photoHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  photoContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userUploadedImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  photoOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  photoVerificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  photoVerificationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tapToViewIndicator: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tapToViewText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  noPhotoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  noPhotoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
  },
  noPhotoSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
});

export default BikeApprovalModal;
