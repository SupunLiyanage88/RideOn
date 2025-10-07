import { Bike } from "@/api/bike";
import {
  BikeStation,
  saveBikeStation,
  updateBikeStation,
} from "@/api/bikeStation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import DialogHeader from "../../DialogHeader";
import HelperText from "../../HelperText";
import MapPicker from "../../MapPicker";
import AddBikeModal from "./AddBikeModal";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  defaultValues?: BikeStation;
};

const AddOrEditBikeStationDialog = ({
  visible,
  onClose,
  defaultValues,
}: DialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BikeStation>({
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const queryClient = useQueryClient();
  const [bikeModalVisible, setBikeModalVisible] = useState(false);
  const watchSelectedBikes = watch("addedBikes", [] as Bike[]);
  const watchBikeCount = watch("bikeCount");
  const [removedBikeIds, setRemovedBikeIds] = useState<string[]>([]);

  console.log("Watch Bikes", defaultValues?.bikes);
  const { mutate: createBikeStationMutation, isPending: isCreating } =
    useMutation({
      mutationFn: saveBikeStation,
      onSuccess: () => {
        alert("Bike Station Save Successful");
        reset();
        onClose();
        queryClient.invalidateQueries({
          queryKey: ["station-data"],
        });
      },
      onError: (data) => {
        alert("Bike Station Save Failed");
        console.log(data);
      },
    });

  const { mutate: updateBikeStationMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: updateBikeStation,
      onSuccess: () => {
        alert("Bike Station Update Successful");
        reset();
        onClose();
        queryClient.invalidateQueries({
          queryKey: ["station-data"],
        });
      },
      onError: (data) => {
        alert("Bike Station Update Failed");
        console.log(data);
      },
    });

  const handleSaveStation = (data: BikeStation) => {
    if (data.latitude === undefined || data.longitude === undefined) {
      alert("Please select a location on the map.");
      return;
    }
    if (defaultValues) {
      const updatedData = { ...data, _id: defaultValues._id };
      if (!updatedData._id) {
        alert("Bike Station Id Missing");
        return;
      }
      updateBikeStationMutation(updatedData);
    } else {
      console.log("Data", data);
      createBikeStationMutation(data);
    }
  };

  const handleSelectBikes = (bikes: Bike[]) => {
    setValue("addedBikes", bikes);
    setBikeModalVisible(false);
  };

  const bikesData = useMemo(() => {
    const defaultBikes = defaultValues?.bikes
      ? Array.isArray(defaultValues.bikes)
        ? defaultValues.bikes
        : [defaultValues.bikes]
      : [];

    const selectedBikes = watchSelectedBikes
      ? Array.isArray(watchSelectedBikes)
        ? watchSelectedBikes
        : [watchSelectedBikes]
      : [];

    // Merge and remove duplicates by _id
    const merged = [...defaultBikes, ...selectedBikes];
    const uniqueBikesMap = new Map<string, Bike>();
    merged.forEach((bike) => uniqueBikesMap.set(bike._id, bike));

    return Array.from(uniqueBikesMap.values());
  }, [defaultValues?.bikes, watchSelectedBikes]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <DialogHeader title="Add New Bike" onClose={onClose} />

          <ScrollView
            style={{ paddingHorizontal: 20, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {/* Form Section */}
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: 16,
                }}
              >
                Station Information
              </Text>

              {/* Station Name */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Station Name *
                </Text>
                <Controller
                  control={control}
                  name="stationName"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: errors.stationName
                            ? "#EF4444"
                            : "#D1D5DB",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          backgroundColor: "#F9FAFB",
                        }}
                      >
                        <TextInput
                          placeholder="Enter station name"
                          value={value}
                          onChangeText={onChange}
                          style={{
                            flex: 1,
                            paddingVertical: 14,
                            color: "#111827",
                            fontSize: 16,
                          }}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                      <HelperText
                        visible={!!errors.stationName}
                        message={errors.stationName?.message}
                        type="error"
                      />
                    </View>
                  )}
                />
              </View>

              {/* Station Location */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Station Location *
                </Text>
                <Controller
                  control={control}
                  name="stationLocation"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: errors.stationLocation
                            ? "#EF4444"
                            : "#D1D5DB",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          backgroundColor: "#F9FAFB",
                        }}
                      >
                        <TextInput
                          placeholder="Enter station address"
                          value={value}
                          onChangeText={onChange}
                          style={{
                            flex: 1,
                            paddingVertical: 14,
                            color: "#111827",
                            fontSize: 16,
                          }}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                      <HelperText
                        visible={!!errors.stationLocation}
                        message={errors.stationLocation?.message}
                        type="error"
                      />
                    </View>
                  )}
                />
              </View>

              {/* Bike Count */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Maximum Bike Capacity *
                </Text>
                <Controller
                  control={control}
                  name="bikeCount"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: errors.bikeCount ? "#EF4444" : "#D1D5DB",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          backgroundColor: "#F9FAFB",
                        }}
                      >
                        <TextInput
                          placeholder="Enter maximum number of bikes"
                          value={value?.toString()}
                          keyboardType="numeric"
                          onChangeText={onChange}
                          style={{
                            flex: 1,
                            paddingVertical: 14,
                            color: "#111827",
                            fontSize: 16,
                          }}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                      <HelperText
                        visible={!!errors.bikeCount}
                        message={errors.bikeCount?.message}
                        type="error"
                      />
                    </View>
                  )}
                />
              </View>
            </View>

            {/* Add Bikes Button */}
            {watchBikeCount && (
              <View
                style={{
                  marginBottom: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#37A77D",
                  padding: 16,
                  borderRadius: 18,
                }}
              >
                <Pressable
                  onPress={() => setBikeModalVisible(true)}
                  disabled={isCreating || isUpdating}
                  style={{
                    width: "100%",
                    height: "auto",
                    paddingVertical: 2,
                    paddingHorizontal: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#37A77D",
                    borderRadius: 18,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    {defaultValues ? "Manage Bikes" : "Select Bikes"}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Selected Bikes Preview */}
            {bikesData.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: 12,
                  }}
                >
                  Selected Bikes ({bikesData.length})
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: 12,
                    paddingRight: 20,
                  }}
                >
                  {bikesData?.map((bike: Bike) => (
                    <View
                      key={bike._id}
                      style={{
                        backgroundColor: "#ffffff",
                        padding: 16,
                        borderRadius: 16,
                        width: 200,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#1F2937",
                            marginBottom: 4,
                            flex: 1,
                          }}
                          numberOfLines={1}
                        >
                          {bike.bikeId}
                        </Text>
                        <View
                          style={{
                            backgroundColor: "#F3F4F6",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "500",
                              color: "#374151",
                            }}
                          >
                            {bike.condition}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={{
                          fontSize: 14,
                          color: "#374151",
                          marginBottom: 8,
                        }}
                        numberOfLines={1}
                      >
                        {bike.bikeModel}
                      </Text>

                      <View
                        style={{
                          height: 1,
                          backgroundColor: "#F3F4F6",
                          marginVertical: 8,
                        }}
                      />

                      <View style={{ gap: 4 }}>
                        <Text style={{ fontSize: 13, color: "#6B7280" }}>
                          <Text style={{ fontWeight: "600", color: "#374151" }}>
                            Fuel:
                          </Text>{" "}
                          {bike.fuelType}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Map Picker Section */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: 16,
                }}
              >
                Location
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginBottom: 12,
                }}
              >
                Tap on the map to set station location
              </Text>

              <Controller
                control={control}
                name="latitude"
                rules={{ required: "Latitude is required" }}
                render={({ field: { onChange, value } }) => (
                  <Controller
                    control={control}
                    name="longitude"
                    rules={{ required: "Longitude is required" }}
                    render={({
                      field: { onChange: onChangeLong, value: valueLong },
                    }) => (
                      <View>
                        <MapPicker
                          value={
                            value && valueLong
                              ? { latitude: value, longitude: valueLong }
                              : undefined
                          }
                          defaultValues={defaultValues}
                          onChange={({ latitude, longitude }) => {
                            onChange(latitude);
                            onChangeLong(longitude);
                          }}
                        />
                        <HelperText
                          visible={!!errors.latitude || !!errors.longitude}
                          message={
                            errors.latitude?.message ||
                            errors.longitude?.message
                          }
                          type="error"
                        />

                        {value && valueLong && (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              marginTop: 12,
                              paddingHorizontal: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                color: "#374151",
                                fontWeight: "500",
                              }}
                            >
                              Latitude:{" "}
                              <Text style={{ color: "#0B4057" }}>
                                {value?.toFixed(5)}
                              </Text>
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: "#374151",
                                fontWeight: "500",
                              }}
                            >
                              Longitude:{" "}
                              <Text style={{ color: "#0B4057" }}>
                                {valueLong?.toFixed(5)}
                              </Text>
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  />
                )}
              />
            </View>

            {/* Save Button */}
            <View
              style={{
                marginTop: 8,
                backgroundColor: "#0B4057",
                padding: 16,
                borderRadius: 18,
              }}
            >
              <Pressable
                onPress={handleSubmit(handleSaveStation)}
                disabled={isCreating || isUpdating}
                style={{
                  width: "100%",
                  height: "auto",
                  paddingVertical: 2,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#0B4057",
                  borderRadius: 18,
                }}
              >
                {isCreating || isUpdating ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <ActivityIndicator color="#fff" size="small" />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                    >
                      {defaultValues ? "Updating..." : "Saving..."}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    {defaultValues ? "Update Station" : "Save Station"}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Bike Selection Modal */}
      <AddBikeModal
        visible={bikeModalVisible}
        onClose={() => setBikeModalVisible(false)}
        onSelectBikes={handleSelectBikes}
        title="Select Bikes"
        defaultSelected={bikesData}
        selectedCount={parseInt(watchBikeCount) || 0}
      />
    </Modal>
  );
};

export default AddOrEditBikeStationDialog;
