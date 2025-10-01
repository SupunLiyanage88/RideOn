import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import AutoComplete from "../components/AutoComplete";

const search = () => {
  const sdgValueData = [
    { label: "No Poverty", value: "1" },
    { label: "Zero Hunger", value: "2" },
    { label: "Good Health", value: "3" },
    { label: "Quality Education", value: "4" },
    { label: "Gender Equality", value: "5" },
  ];
  const { control, handleSubmit } = useForm({
    defaultValues: { sdg: "" },
  });
  return (
    <View>
      <Text>search</Text>
      <View className="p-6">
        <Controller
          control={control}
          name="sdg"
          rules={{ required: "SDG is required" }}
          render={({ field, fieldState: { error } }) => (
            <AutoComplete
              value={field.value}
              onChange={field.onChange}
              data={sdgValueData}
              error={error?.message}
              placeholder="Select Bike Type"
              placeholderTextColor="red"
            />
          )}
        />
      </View>
    </View>
  );
};

export default search;
