import React from "react";
import { Text } from "react-native";

type HelperTextProps = {
  visible?: boolean;   // whether to show text
  message?: string;    // message text
  type?: "error" | "info" | "success"; // style type
};

export default function HelperText({
  visible = true,
  message = "",
  type = "info",
}: HelperTextProps) {
  if (!visible || !message) return null;

  let color = "#6b7280"; // default gray (info)
  if (type === "error") color = "#ef4444"; // red-500
  if (type === "success") color = "#22c55e"; // green-500

  return (
    <Text style={{ color, fontSize: 12, marginTop: 4 }}>
      {message}
    </Text>
  );
}
