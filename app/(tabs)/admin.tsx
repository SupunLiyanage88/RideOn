import { BikeStation } from "@/api/bikeStation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import DialogHeader from "../components/DialogHeader";
import HelperText from "../components/HelperText";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
};

const MapPicker = ({
  value,
  onChange,
}: {
  value?: { latitude: number; longitude: number };
  onChange: (coords: { latitude: number; longitude: number }) => void;
}) => {
  const handlePress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    onChange({ latitude, longitude });
  };

  return (
    <MapView
      style={{ height: 200, borderRadius: 12 }}
      initialRegion={{
        latitude: value?.latitude || 6.9271, // default Colombo
        longitude: value?.longitude || 79.8612,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onPress={handlePress}
    >
      {value && <Marker coordinate={value} />}
    </MapView>
  );
};

const AddOrEditBikeStationDialog = ({ visible, onClose }: DialogProps) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<BikeStation>();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-4/5">
          <DialogHeader title="Add or Edit Bike Station" onClose={onClose} />
          <Controller
            control={control}
            name="stationName"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Station Name"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("stationName", {
                      required: {
                        value: true,
                        message: "Password is required",
                      },
                    })}
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
          <Controller
            control={control}
            name="stationLocation"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Station Location"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("stationLocation", {
                      required: {
                        value: true,
                        message: "Password is required",
                      },
                    })}
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
            name="latitude"
            render={({ field: { onChange, value } }) => (
              <Controller
                control={control}
                name="longitude"
                render={({
                  field: { onChange: onChangeLong, value: valueLong },
                }) => (
                  <View className="mb-6">
                    <Text className="mb-2 text-zinc-700">Pick Location</Text>
                    <MapPicker
                      value={
                        value && valueLong
                          ? { latitude: value, longitude: valueLong }
                          : undefined
                      }
                      onChange={({ latitude, longitude }) => {
                        onChange(latitude);
                        onChangeLong(longitude);
                      }}
                    />
                    <Text className="mt-2 text-xs text-zinc-500">
                      Lat: {value?.toFixed(5)}, Lng: {valueLong?.toFixed(5)}
                    </Text>
                  </View>
                )}
              />
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const Admin = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold mb-4">Admin</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-red-500 px-4 py-2 rounded-2xl"
      >
        <Text className="text-white font-semibold text-base">
          Add a Bike Station
        </Text>
      </TouchableOpacity>

      <AddOrEditBikeStationDialog
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Admin;
