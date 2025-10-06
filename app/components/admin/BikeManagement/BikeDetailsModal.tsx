import { images } from "@/constants/images";
import { Bike } from "@/api/bike";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get('window');

interface BikeDetailsModalProps {
  visible: boolean;
  bike: Bike | null;
  onClose: () => void;
  onEdit: () => void;
}

const BikeDetailsModal: React.FC<BikeDetailsModalProps> = ({
  visible,
  bike,
  onClose,
  onEdit,
}) => {
  if (!bike) return null;

  const imageSource =
    bike.fuelType?.toLowerCase() === "electric"
      ? images.evbike
      : bike.fuelType?.toLowerCase() === "pedal"
        ? images.pdbike
        : images.pdbike;

  // Get condition status and color
  const getConditionInfo = (condition: string | number) => {
    const conditionNum = typeof condition === 'string' ? parseInt(condition) : condition;
    if (conditionNum >= 80) return { 
      status: 'Excellent', 
      color: '#10B981', 
      bgColor: '#D1FAE5',
      icon: 'check-circle' as const
    };
    if (conditionNum >= 60) return { 
      status: 'Good', 
      color: '#F59E0B', 
      bgColor: '#FEF3C7',
      icon: 'exclamation-circle' as const
    };
    if (conditionNum >= 40) return { 
      status: 'Fair', 
      color: '#F97316', 
      bgColor: '#FED7AA',
      icon: 'exclamation-triangle' as const
    };
    return { 
      status: 'Poor', 
      color: '#EF4444', 
      bgColor: '#FEE2E2',
      icon: 'times-circle' as const
    };
  };

  // Get availability status
  const getAvailabilityInfo = () => {
    if (bike.assigned) {
      return {
        status: 'In Use',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        icon: 'user' as const
      };
    }
    if (bike.availability) {
      return {
        status: 'Available',
        color: '#10B981',
        bgColor: '#D1FAE5',
        icon: 'check-circle' as const
      };
    }
    return {
      status: 'Unavailable',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      icon: 'times-circle' as const
    };
  };

  const conditionInfo = getConditionInfo(bike.condition);
  const availabilityInfo = getAvailabilityInfo();

  const getFuelTypeInfo = () => {
    switch (bike.fuelType?.toLowerCase()) {
      case 'electric':
        return { 
          color: '#10B981', 
          bgColor: '#D1FAE5', 
          icon: 'bolt' as const,
          description: 'Electric powered bike with battery'
        };
      case 'pedal':
        return { 
          color: '#3B82F6', 
          bgColor: '#DBEAFE', 
          icon: 'bicycle' as const,
          description: 'Manual pedal-powered bike'
        };
      default:
        return { 
          color: '#6B7280', 
          bgColor: '#F3F4F6', 
          icon: 'bicycle' as const,
          description: 'Standard bike'
        };
    }
  };

  const fuelTypeInfo = getFuelTypeInfo();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <FontAwesome6 name="xmark" size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Bike Details</Text>
          
          <TouchableOpacity 
            onPress={onEdit}
            style={styles.editButton}
          >
            <FontAwesome6 name="pen-to-square" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bike Image and Main Info */}
          <View style={styles.heroSection}>
            <View style={styles.imageContainer}>
              <Image
                source={imageSource}
                style={styles.bikeImage}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.mainInfo}>
              <Text style={styles.bikeId}>{bike.bikeId}</Text>
              <Text style={styles.bikeModel}>{bike.bikeModel}</Text>
              
              <View style={[
                styles.fuelTypeBadge, 
                { backgroundColor: fuelTypeInfo.bgColor }
              ]}>
                <FontAwesome6 
                  name={fuelTypeInfo.icon} 
                  size={14} 
                  color={fuelTypeInfo.color} 
                />
                <Text style={[styles.fuelTypeText, { color: fuelTypeInfo.color }]}>
                  {bike.fuelType?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Cards */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            
            <View style={styles.statusCards}>
              {/* Availability Card */}
              <View style={[
                styles.statusCard, 
                { backgroundColor: availabilityInfo.bgColor }
              ]}>
                <FontAwesome6 
                  name={availabilityInfo.icon} 
                  size={24} 
                  color={availabilityInfo.color} 
                />
                <Text style={[styles.statusLabel, { color: availabilityInfo.color }]}>
                  Availability
                </Text>
                <Text style={[styles.statusValue, { color: availabilityInfo.color }]}>
                  {availabilityInfo.status}
                </Text>
              </View>

              {/* Condition Card */}
              <View style={[
                styles.statusCard, 
                { backgroundColor: conditionInfo.bgColor }
              ]}>
                <FontAwesome6 
                  name={conditionInfo.icon} 
                  size={24} 
                  color={conditionInfo.color} 
                />
                <Text style={[styles.statusLabel, { color: conditionInfo.color }]}>
                  Condition
                </Text>
                <Text style={[styles.statusValue, { color: conditionInfo.color }]}>
                  {bike.condition}% - {conditionInfo.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Detailed Information */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Detailed Information</Text>
            
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <FontAwesome6 name="hashtag" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Bike ID</Text>
                  <Text style={styles.detailValue}>{bike.bikeId}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <FontAwesome6 name="bicycle" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Model</Text>
                  <Text style={styles.detailValue}>{bike.bikeModel}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <FontAwesome6 name={fuelTypeInfo.icon} size={16} color={fuelTypeInfo.color} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Fuel Type</Text>
                  <Text style={styles.detailValue}>{bike.fuelType}</Text>
                  <Text style={styles.detailDescription}>{fuelTypeInfo.description}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <FontAwesome6 name="route" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Total Distance</Text>
                  <Text style={styles.detailValue}>{bike.distance} km</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomAction}>
          <TouchableOpacity 
            style={styles.editButtonLarge}
            onPress={onEdit}
          >
            <FontAwesome6 name="pen-to-square" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonLargeText}>Edit Bike Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },
  imageContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  bikeImage: {
    width: 120,
    height: 80,
  },
  mainInfo: {
    alignItems: 'center',
  },
  bikeId: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  bikeModel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  fuelTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  fuelTypeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statusSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusCards: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  detailsSection: {
    padding: 20,
    paddingTop: 0,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  detailDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  editButtonLarge: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  editButtonLargeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default BikeDetailsModal;