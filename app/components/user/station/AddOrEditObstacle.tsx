import {
  hideObstacle,
  Obstacle,
  ObstacleCategory,
  saveObstacle,
} from "@/api/obstacle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import DialogHeader from "../../DialogHeader";
import HelperText from "../../HelperText";
import ToggleEnumButton from "../../ToggleEnumButton";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  defaultValues?: Obstacle;
  userLocation: { latitude: number; longitude: number } | null;
};
const AddOrEditObstacle = ({
  visible,
  onClose,
  defaultValues,
  userLocation,
}: DialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Obstacle>({
    defaultValues: {
      ...defaultValues,
    },
  });
  const queryClient = useQueryClient();

  const { mutate: saveObstacleMutation, isPending } = useMutation({
    mutationFn: saveObstacle,
    onSuccess: () => {
      alert("Obstacle Save successful");
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["obstacle-data"] });
    },
    onError: (data) => {
      alert("Obstacle Save failed");
    },
  });

  const { mutate: hideObstacleMutation, isPending: hideIsPending } =
    useMutation({
      mutationFn: hideObstacle,
      onSuccess: () => {
        alert("Obstacle Hide successful");
        reset();
        onClose();
        queryClient.invalidateQueries({ queryKey: ["obstacle-data"] });
      },
      onError: (data) => {
        alert("Obstacle Hide failed");
      },
    });

  const onSubmit = (values: Obstacle) => {
    if (defaultValues) {
      hideObstacleMutation(defaultValues._id);
    } else {
      const payLoad = {
        ...values,
        obstacleLatitude: userLocation?.latitude,
        obstacleLongitude: userLocation?.longitude,
      };
      saveObstacleMutation(payLoad);
    }
  };
  const resetForm = () => {
    reset();
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={() => {
            onClose();
            resetForm();
          }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              maxHeight: "100%",
              width: "100%",
            }}
          >
            <DialogHeader
              title={defaultValues ? "Edit Obstacle" : "Add Obstacle"}
              onClose={() => {
                resetForm();
                onClose();
              }}
              subtitle="Obstacles In Your Map"
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
            >
              {!defaultValues && (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    paddingHorizontal: 0,
                    marginBottom: 16,
                  }}
                >
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Obstacle Name is required" }}
                    render={({ field: { onChange, value } }) => (
                      <View style={{ marginBottom: 8 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#E4E4E7",
                            borderRadius: 16,
                            paddingHorizontal: 16,
                            marginTop: 30,
                          }}
                        >
                          <TextInput
                            placeholder="Obstacle Name"
                            value={value as any}
                            onChangeText={onChange}
                            style={{
                              flex: 1,
                              paddingVertical: 16,
                              color: "#111827",
                            }}
                            placeholderTextColor="#9CA3AF"
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
                </View>
              )}

              {!defaultValues && (
                <Controller
                  control={control}
                  name="category"
                  rules={{ required: "Obstacle Type is required" }}
                  render={({ field: { value, onChange } }) => (
                    <View style={{ marginBottom: 2 }}>
                      <ToggleEnumButton
                        options={ObstacleCategory}
                        value={value}
                        onChange={onChange}
                      />
                      <HelperText
                        visible={!!errors.category}
                        message={errors.category?.message}
                        type="error"
                      />
                    </View>
                  )}
                />
              )}

              {defaultValues && (
                <View
                  style={{
                    padding: 16,
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: 8,
                    }}
                  >
                    {defaultValues?.name}
                  </Text>
                  <Text style={{ fontSize: 16, color: "#6B7280" }}>
                    {defaultValues?.category}
                  </Text>
                </View>
              )}

              {defaultValues && (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    marginBottom: 6,
                  }}
                >
                  <Controller
                    control={control}
                    name="isShow"
                    defaultValue={defaultValues?.isShow}
                    render={({ field: { value, onChange } }) => (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingVertical: 8,
                        }}
                      >
                        <Text style={{ fontWeight: "700", marginTop: 8 }}>
                          Do you need to stop the ride?
                        </Text>
                        <Switch
                          value={!!value}
                          onValueChange={(val) => onChange(val)}
                          trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                          thumbColor={value ? "#2563EB" : "#F3F4F6"}
                        />
                      </View>
                    )}
                  />
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isPending || hideIsPending}
                  style={{
                    width: "100%",
                    borderRadius: 9999,
                    paddingVertical: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#0B4057",
                  }}
                >
                  {isPending || hideIsPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "700",
                        textAlign: "center",
                      }}
                    >
                      {defaultValues ? "Hide Obstacle" : "Add Obstacle"}
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
            <View style={{ marginBottom: 50 }}></View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddOrEditObstacle;
