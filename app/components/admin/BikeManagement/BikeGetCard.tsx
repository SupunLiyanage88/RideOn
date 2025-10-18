import { Bike } from "@/api/bike";
import { images } from "@/constants/images";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BikeCardProps {
  bikeId?: string;
  fuelType?: string;
  bikeModel?: string;
  distance?: number;
  condition?: number;
  ownedBy?: Bike;
  onPress?: () => void;
}

const BikeGetCard: React.FC<BikeCardProps> = ({
  bikeId,
  fuelType,
  bikeModel,
  distance,
  condition,
  ownedBy,
  onPress,
}) => {
  const imageSource =
    fuelType?.toLowerCase() === "electric"
      ? images.evbike
      : fuelType?.toLowerCase() === "pedal"
        ? images.pdbike
        : images.pdbike;

  // Get condition status and color
  const getConditionStatus = (condition?: number) => {
    if (!condition) return { status: "Unknown", color: "#9CA3AF" };
    if (condition >= 80) return { status: "Excellent", color: "#10B981" };
    if (condition >= 60) return { status: "Good", color: "#F59E0B" };
    if (condition >= 40) return { status: "Fair", color: "#F97316" };
    return { status: "Poor", color: "#EF4444" };
  };

  const conditionInfo = getConditionStatus(condition);
  const getFuelTypeBadgeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "electric":
        return "#10B981";
      case "pedal":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.bikeIdContainer}>
          <Text style={styles.bikeIdLabel}>ID</Text>
          <Text style={styles.bikeId}>{bikeId || "N/A"}</Text>
        </View>
        <View
          style={[
            styles.fuelTypeBadge,
            { backgroundColor: getFuelTypeBadgeColor(fuelType) },
          ]}
        >
          <Text style={styles.fuelTypeText}>
            {fuelType?.toUpperCase() || "UNKNOWN"}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoContainer}>
          {/* Updated responsive row */}
          <View style={styles.infoRow}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Model</Text>
              <Text
                style={styles.sectionValue}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {bikeModel || "Unknown Model"}
              </Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Own By</Text>
              <Text
                style={styles.sectionValue}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {ownedBy?.createdBy?.userName || "Unknown Owner"}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <FontAwesome6 name="route" size={16} color="#6B7280" />
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{distance || 0} km</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <FontAwesome6
                name="wrench"
                size={16}
                color={conditionInfo.color}
              />
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Condition</Text>
                <View style={styles.conditionContainer}>
                  <Text
                    style={[
                      styles.conditionValue,
                      { color: conditionInfo.color },
                    ]}
                  >
                    {(condition)?.toFixed(2) || 0}%
                  </Text>
                  <Text
                    style={[
                      styles.conditionStatus,
                      { color: conditionInfo.color },
                    ]}
                  >
                    {conditionInfo.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bikeIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bikeIdLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginRight: 6,
  },
  bikeId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  fuelTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  fuelTypeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  image: {
    width: 80,
    height: 60,
  },
  infoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  infoSection: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    overflow: "hidden",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  statInfo: {
    marginLeft: 8,
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 1,
  },
  conditionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  conditionValue: {
    fontSize: 14,
    fontWeight: "700",
    marginRight: 4,
  },
  conditionStatus: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  actionIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
});

export default BikeGetCard;
