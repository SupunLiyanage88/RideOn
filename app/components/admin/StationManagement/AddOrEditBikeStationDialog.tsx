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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            width: "90%",
          }}
        >
          <DialogHeader
            title={defaultValues ? "Edit Bike Station" : "Add Bike Station"}
            onClose={onClose}
          />
          <ScrollView
            style={{ height: "60%" }}
            showsVerticalScrollIndicator={true}
          >
            {/* Station Name */}
            <Controller
              control={control}
              name="stationName"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 24 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#D4D4D8",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                    }}
                  >
                    <TextInput
                      placeholder="Station Name"
                      value={value}
                      onChangeText={onChange}
                      style={{ flex: 1, paddingVertical: 16, color: "#27272A" }}
                      placeholderTextColor="#9CA3AF"
                      defaultValue={defaultValues?.stationName}
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

            {/* Station Location */}
            <Controller
              control={control}
              name="stationLocation"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 24 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#D4D4D8",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                    }}
                  >
                    <TextInput
                      placeholder="Station Location"
                      value={value}
                      onChangeText={onChange}
                      style={{ flex: 1, paddingVertical: 16, color: "#27272A" }}
                      placeholderTextColor="#9CA3AF"
                      defaultValue={defaultValues?.stationLocation}
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

            <Controller
              control={control}
              name="bikeCount"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 8 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#D4D4D8",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                    }}
                  >
                    <TextInput
                      placeholder="Max Bike Count"
                      value={value}
                      keyboardType="numeric"
                      onChangeText={onChange}
                      style={{ flex: 1, paddingVertical: 16, color: "#27272A" }}
                      placeholderTextColor="#9CA3AF"
                      defaultValue={defaultValues?.bikeCount.toString()}
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

            {watchBikeCount && (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Pressable
                  onPress={() => setBikeModalVisible(true)}
                  disabled={isCreating || isUpdating}
                  style={{
                    width: "100%",
                    borderRadius: 9999,
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#0B4057",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {defaultValues ? "Update Bikes" : "Add Bikes"}
                  </Text>
                </Pressable>
              </View>
            )}
            <View style={{ marginTop: 20 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {bikesData?.map((bike: Bike) => (
                  <View
                    key={bike._id}
                    style={{
                      backgroundColor: "#ffffff",
                      padding: 16,
                      borderRadius: 16,
                      width: 220,
                      borderWidth: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#1F2937",
                        marginBottom: 4,
                      }}
                    >
                      {bike.bikeId}
                    </Text>

                    <Text
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        marginBottom: 6,
                      }}
                    >
                      {bike.bikeModel}
                    </Text>

                    <View
                      style={{
                        height: 1,
                        backgroundColor: "#E5E7EB",
                        marginVertical: 6,
                      }}
                    />

                    <View style={{ gap: 2 }}>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        <Text style={{ fontWeight: "600", color: "#374151" }}>
                          Fuel:
                        </Text>{" "}
                        {bike.fuelType}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        <Text style={{ fontWeight: "600", color: "#374151" }}>
                          Condition:
                        </Text>{" "}
                        {bike.condition}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
            {/* Map Picker */}
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
                    <View style={{ marginBottom: 24 }}>
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
                          errors.latitude?.message || errors.longitude?.message
                        }
                        type="error"
                      />
                      <Text
                        style={{ marginTop: 8, fontSize: 14, color: "#6B7280" }}
                      >
                        Lat: {value?.toFixed(5)}, Lng: {valueLong?.toFixed(5)}
                      </Text>
                    </View>
                  )}
                />
              )}
            />

            {/* Save Button */}
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Pressable
                onPress={handleSubmit(handleSaveStation)}
                disabled={isCreating || isUpdating}
                style={{
                  width: "100%",
                  borderRadius: 9999,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#0B4057",
                }}
              >
                {isCreating || isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {defaultValues ? "Update Station" : "Save Station"}
                  </Text>
                )}
              </Pressable>
              <AddBikeModal
                visible={bikeModalVisible}
                onClose={() => setBikeModalVisible(false)}
                onSelectBikes={handleSelectBikes}
                title="Select Bikes"
                defaultSelected={bikesData}
                selectedCount={parseInt(watchBikeCount) || 0}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddOrEditBikeStationDialog;
