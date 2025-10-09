import { Bike, approveBikeRental } from "@/api/bike";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  Alert,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes-awaiting-approval"] });
      queryClient.invalidateQueries({ queryKey: ["bike-data"] });
      Alert.alert("Success", "Bike rental approved successfully!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to approve bike rental. Please try again.");
      console.error("Approval error:", error);
    },
  });

  const handleApprove = (bikeId: string) => {
    Alert.alert(
      "Confirm Approval",
      "Are you sure you want to approve this bike for rental?",
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

  const renderBikeItem = (bike: Bike) => (
    <View key={bike._id} style={styles.bikeItem}>
      <View style={styles.bikeHeader}>
        <Text style={styles.bikeId}>#{bike.bikeId}</Text>
        <Text style={styles.bikeModel}>{bike.bikeModel}</Text>
      </View>

      <View style={styles.bikeDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fuel Type:</Text>
          <Text style={styles.detailValue}>
            {bike.fuelType.charAt(0).toUpperCase() + bike.fuelType.slice(1)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Distance:</Text>
          <Text style={styles.detailValue}>{bike.distance} km</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Condition:</Text>
          <Text style={styles.detailValue}>{bike.condition}/100</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Owner:</Text>
          <Text style={styles.detailValue}>{bike.createdBy?.userName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Owner Email:</Text>
          <Text style={styles.detailValue}>{bike.createdBy?.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.approveButton,
          approveMutation.isPending && styles.approveButtonDisabled,
        ]}
        onPress={() => handleApprove(bike._id)}
        disabled={approveMutation.isPending}
      >
        <Text style={styles.approveButtonText}>
          {approveMutation.isPending ? "Approving..." : "Approve Rental"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bike Rental Approvals</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Loader showText={true} />
          </View>
        ) : bikes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bikes awaiting approval</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <Text style={styles.subtitle}>
              {bikes.length} bike{bikes.length !== 1 ? "s" : ""} awaiting
              approval
            </Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    paddingHorizontal: 20,
    marginTop: 10,
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
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
  },
  bikeItem: {
    backgroundColor: "#FFFFFF",
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bikeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 10,
  },
  bikeId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#083A4C",
  },
  bikeModel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  bikeDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  approveButton: {
    backgroundColor: "#37A77D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButtonDisabled: {
    backgroundColor: "#BDC3C7",
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BikeApprovalModal;
