import {
  savePackage,
  updatePackage,
  type Package,
  type PackageInput,
} from "@/api/package";
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
  defaultValues?: Package; // if present → edit mode
};

const AddOrEditPackageDialog = ({
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
  } = useForm<PackageInput>({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          rc: defaultValues.rc,
          price: defaultValues.price,
          recommended: defaultValues.recommended,
          icon: defaultValues.icon,
          description: defaultValues.description,
        }
      : {
          name: "",
          rc: "",
          price: "",
          recommended: false,
          icon: "",
          description: "",
        },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PackageInput) =>
      defaultValues
        ? updatePackage(defaultValues._id, data) // edit mode
        : savePackage(data), // add mode
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      console.log("Package saved:", data);
      alert(defaultValues ? "Package updated!" : "Package created!");
      reset();
      onClose();
    },
    onError: (err) => {
      alert("Save failed");
      console.log(err);
    },
  });

  const handleSave = (data: PackageInput) => {
    console.log("Form data:", data);
    mutate(data);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-4/5">
          <DialogHeader
            title={defaultValues ? "Edit Package" : "Add Package"}
            onClose={onClose}
          />

          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Package Name"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("name", {
                      required: { value: true, message: "Name is required" },
                    })}
                  />
                </View>
                <HelperText
                  visible={!!errors.name}
                  message={errors.name?.message}
                  type="error"
                />
              </View>
            )}
          />

          {/* RC */}
          <Controller
            control={control}
            name="rc"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="RC"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("rc", {
                      required: { value: true, message: "RC is required" },
                    })}
                  />
                </View>
                <HelperText
                  visible={!!errors.rc}
                  message={errors.rc?.message}
                  type="error"
                />
              </View>
            )}
          />

          {/* Price */}
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Price"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    {...register("price", {
                      required: { value: true, message: "Price is required" },
                    })}
                  />
                </View>
                <HelperText
                  visible={!!errors.price}
                  message={errors.price?.message}
                  type="error"
                />
              </View>
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Description"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("description", {
                      required: {
                        value: true,
                        message: "Description is required",
                      },
                    })}
                  />
                </View>
                <HelperText
                  visible={!!errors.description}
                  message={errors.description?.message}
                  type="error"
                />
              </View>
            )}
          />

          {/* Icon (optional) */}
          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                  <TextInput
                    placeholder="Icon URL"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            )}
          />

          {/* Submit */}
          <View className="flex-row justify-center">
            <Pressable
              onPress={handleSubmit(handleSave)}
              disabled={isPending}
              className="w-full rounded-full py-3 items-center justify-center bg-[#0B4057]"
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold">
                  {defaultValues ? "Save Changes" : "Save Package"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddOrEditPackageDialog;
