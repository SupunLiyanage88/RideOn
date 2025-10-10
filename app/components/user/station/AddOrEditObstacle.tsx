import { Obstacle, ObstacleCategory, saveObstacle } from "@/api/obstacle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal, ScrollView } from "react-native";
import DialogHeader from "../../DialogHeader";
import ToggleEnumButton from "../../ToggleEnumButton";
import HelperText from "../../HelperText";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  defaultValues?: Obstacle;
};
const AddOrEditObstacle = ({
  visible,
  onClose,
  defaultValues,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
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
      console.log(data);
    },
  });
  return (
    <Modal visible={visible} transparent animationType="slide">
      <DialogHeader
        title={defaultValues ? "Edit Incident" : "Add Incident"}
        onClose={onClose}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Controller
                control={control}
                name=
                rules={{ required: "Incident Type is required" }}
                render={({ field: { value, onChange } }) => (
                  <>
                  <ToggleEnumButton options={ObstacleCategory} value={value} onChange={onChange} />
                    <HelperText
                      visible={!!errors.category}
                      message={errors.category?.message}
                      type="error"
                    />
                  </>
                )}
              />
      </ScrollView>
    </Modal>
  );
};

export default AddOrEditObstacle;
