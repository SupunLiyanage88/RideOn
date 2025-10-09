import { Bike } from "@/api/bike";
import { getAvailableBikes } from "@/api/bikeStation";
import { useQuery } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DialogHeader from "../../DialogHeader";
import Loader from "../../Loader";

type AddBikeModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectBikes: (bikes: Bike[]) => void;
  title?: string;
  defaultSelected?: Bike[];
  selectedCount: number;
};

const { width: screenWidth } = Dimensions.get("window");

const AddBikeModal = ({
  visible,
  onClose,
  onSelectBikes,
  title,
  defaultSelected = [],
  selectedCount,
}: AddBikeModalProps) => {
  const { data: bikeData, isFetching: isBikeLoading } = useQuery({
    queryKey: ["bike-data"],
    queryFn: getAvailableBikes,
  });

  const [selected, setSelected] = useState<Bike[]>([]);
  const isDisabled = selectedCount < selected.length;

  useEffect(() => {
    if (visible) {
      setSelected(defaultSelected);
    }
  }, [visible, defaultSelected]);

  const toggleSelection = (bike: Bike) => {
    setSelected((prev) => {
      const exists = prev.find((b) => b._id === bike._id);
      if (exists) {
        return prev.filter((b) => b._id !== bike._id);
      } else {
        return [...prev, bike];
      }
    });
  };

  const handleSelect = () => {
    onSelectBikes(selected);
    onClose();
  };

  const BikeItem = ({ item }: { item: Bike }) => {
    const isSelected = selected.some((b) => b._id === item._id);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      toggleSelection(item);
    };

    return (
      <Animated.View
        style={[
          styles.bikeItem,
          isSelected && styles.bikeItemSelected,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Pressable onPress={handlePress} style={styles.bikeItemPressable}>
          <View style={styles.bikeInfoContainer}>
            <View style={styles.bikeMainInfo}>
              <Text style={styles.bikeId}>{item.bikeId}</Text>
              <Text style={styles.bikeModel}>{item.bikeModel}</Text>
            </View>
            <View style={styles.bikeFuelContainer}>
              <Text style={styles.fuelLabel}>Fuel:</Text>
              <Text style={styles.fuelType}>{item.fuelType}</Text>
            </View>
          </View>
          <Checkbox
            value={isSelected}
            onValueChange={handlePress}
            color={isSelected ? "#0B4057" : "#CBD5E1"}
            style={styles.checkbox}
          />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.handleBar} />

          <DialogHeader title={title || "Select Bikes"} onClose={onClose} />

          {/* Selection Counter */}
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>
              {selected.length} bike{selected.length !== 1 ? "s" : ""} selected
            </Text>
            {selectedCount > 0 && (
              <Text style={styles.limitText}>(Maximum: {selectedCount})</Text>
            )}
          </View>

          {isBikeLoading && (
            <View style={styles.loaderContainer}>
              <Loader textStyle={styles.loaderText} showText={false} />
            </View>
          )}

          <FlatList
            data={bikeData || []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <BikeItem item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No bikes available</Text>
              </View>
            )}
          />

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSelect}
              disabled={isDisabled}
              style={({ pressed }) => [
                styles.button,
                styles.selectButton,
                isDisabled && styles.selectButtonDisabled,
                pressed && !isDisabled && styles.buttonPressed,
              ]}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  isDisabled && styles.selectButtonTextDisabled,
                ]}
              >
                Confirm Selection
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  selectionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginBottom: 16,
  },
  selectionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  limitText: {
    fontSize: 13,
    color: "#6B7280",
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loaderText: {
    fontSize: 16,
    color: "#6B7280",
  },
  listContent: {
    paddingBottom: 16,
  },
  bikeItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bikeItemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#0B4057",
  },
  bikeItemPressable: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bikeInfoContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bikeMainInfo: {
    flex: 2,
  },
  bikeId: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  bikeModel: {
    fontSize: 14,
    color: "#6B7280",
  },
  bikeFuelContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: 16,
  },
  fuelLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginRight: 4,
  },
  fuelType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    backgroundColor: "#64748B",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 24,
  },
  selectButton: {
    backgroundColor: "#0B4057",
    shadowColor: "#0B4057",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  selectButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    backgroundColor: "#0B4057",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 24,
  },
  selectButtonTextDisabled: {
    color: "#6B7280",
  },
});

export default AddBikeModal;
