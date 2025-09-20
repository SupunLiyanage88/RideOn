import { Bike, saveBike } from "@/api/bike";
import queryClient from "@/state/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import DialogHeader from "../components/DialogHeader";
import HelperText from "../components/HelperText";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  defaultValues?: Bike;
};

const AddOrEditBikeDialog = ({
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
  } = useForm<Bike>({
    defaultValues: defaultValues,
  });
  const { mutate: saveBikeMutation, isPending } = useMutation({
    mutationFn: saveBike,
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["bike"] });
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

  const handleSaveStation = (data: Bike) => {
    console.log(data);
    saveBikeMutation(data);
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-4/5">
          <DialogHeader
            title={defaultValues ? "Edit: ADD Bike" : "Add Bike"}
            onClose={onClose}
          />
          <Controller
            control={control}
            name="bikeModel"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Bike Model"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("bikeModel", {
                      required: {
                        value: true,
                        message: "Station Location is required",
                      },
                    })}
                  />
                </View>
                <HelperText
                  visible={!!errors.bikeModel}
                  message={errors.bikeModel?.message}
                  type="error"
                />
              </View>
            )}
          />          
          <Controller
            control={control}
            name="fuelType"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Fuel Type: Electric / Pedal"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("fuelType", {
                      required: {
                        value: true,
                        message: "Fuel Type is required",
                      },
                    })}
                  />
                </View>
                <HelperText
                  visible={!!errors.bikeModel}
                  message={errors.bikeModel?.message}
                  type="error"
                />
              </View>
            )}
          />          
          <Controller
            control={control}
            name="distance"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Distance"
                    value={value}
                    keyboardType="number-pad"
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("distance", {
                      required: {
                        value: true,
                        message: "Distance is required",
                      },
                    })}
                  />
                </View>
                <HelperText
                  visible={!!errors.bikeModel}
                  message={errors.bikeModel?.message}
                  type="error"
                />
              </View>
            )}
          />          
          <Controller
            control={control}
            name="condition"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Condition: 1-5"
                    value={value}
                    keyboardType="number-pad"
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("condition", {
                      required: {
                        value: true,
                        message: "Condition is required",
                      },
                    })}
                  />
                </View>
                <HelperText
                  visible={!!errors.bikeModel}
                  message={errors.bikeModel?.message}
                  type="error"
                />
              </View>
            )}
          />          

          <View className="flex-row justify-center">
            <Pressable
              onPress={handleSubmit(handleSaveStation)}
              disabled={isPending}
              className="w-full rounded-full py-3 items-center justify-center bg-[#0B4057]"
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold">
                  Save Bike
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddOrEditBikeDialog;
