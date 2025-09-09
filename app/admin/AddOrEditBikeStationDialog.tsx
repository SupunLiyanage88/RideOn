import { BikeStation, saveBikeStation } from "@/api/bikeStation";
import queryClient from "@/state/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import DialogHeader from "../components/DialogHeader";
import HelperText from "../components/HelperText";
import MapPicker from "../components/MapPicker";
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
    register,
    reset,
    formState: { errors },
  } = useForm<BikeStation>({
    defaultValues: defaultValues,
  });
  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: saveBikeStation,
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["bike-station"] });
      console.log("Bike Save successful:", data);
      alert("Bike Save successful");
      reset();
      onClose();
    },
    onError: (data) => {
      alert("Bike Save failed");
      console.log(data);
    },
  });

  const handleSaveStation = (data: BikeStation) => {
    console.log(data);
    if (data.latitude === undefined || data.longitude === undefined) {
      alert("Please select a location on the map.");
      return;
    }
    registerMutation(data);
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-4/5">
          <DialogHeader
            title={
              defaultValues ? "Edit: ADD Bike Station" : "Add Bike Station"
            }
            onClose={onClose}
          />

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
                        message: "Station Name is required",
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
                        message: "Station Location is required",
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
            rules={{
              required: "Latitude is required",
            }}
            render={({ field: { onChange, value } }) => (
              <Controller
                control={control}
                name="longitude"
                rules={{
                  required: "Latitude is required",
                }}
                render={({
                  field: { onChange: onChangeLong, value: valueLong },
                }) => (
                  <View className="mb-6">
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
                    <HelperText
                      visible={!!errors.latitude || !!errors.longitude}
                      message={
                        errors.latitude?.message || errors.longitude?.message
                      }
                      type="error"
                    />
                    <Text className="mt-2 text-s text-zinc-500 ">
                      Lat: {value?.toFixed(5)}, Lng: {valueLong?.toFixed(5)}
                    </Text>
                  </View>
                )}
              />
            )}
          />

          <View className="flex-row justify-center">
            <Pressable
              onPress={handleSubmit(handleSaveStation)}
              className="w-full rounded-full py-3 items-center justify-center bg-[#0B4057]"
            >
              <Text className="text-white text-center font-bold">
                Save Station
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddOrEditBikeStationDialog;
