import { Bike, getAllBikes } from "@/api/bike";
import { useQuery } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import React, { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
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
    queryFn: getAllBikes,
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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "85%",
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            maxHeight: "70%",
          }}
        >
          <DialogHeader title={title || "Select Bikes"} onClose={onClose} />

          {isBikeLoading ? (
            <View style={{ paddingBottom: 24, margin: 8 }}>
              <Loader textStyle={{ fontSize: 20 }} />
            </View>
          ) : (
            <FlatList
              data={bikeData || []}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const isSelected = selected.some((b) => b._id === item._id);
                return (
                  <Pressable
                    onPress={() => toggleSelection(item)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text style={{ flex: 1 }}>{item.bikeId}</Text>
                    <Text style={{ flex: 1 }}>{item.bikeModel}</Text>
                    <Text style={{ flex: 1 }}>{item.fuelType}</Text>
                    <Checkbox
                      value={isSelected}
                      onValueChange={() => toggleSelection(item)}
                      color={isSelected ? "#0B4057" : undefined}
                    />
                  </Pressable>
                );
              }}
            />
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: "#D1D5DB",
                borderRadius: 9999,
                marginRight: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "600" }}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSelect}
              disabled={isDisabled}
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: isDisabled ? "#D1D5DB" : "#0B4057",
                borderRadius: 9999,
                marginLeft: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: isDisabled ? "black" : "white",
                }}
              >
                Select
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddBikeModal;
