import Feather from "@expo/vector-icons/Feather";
import React, { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
interface Props {
  open: boolean;
  title: string;
  content: string | ReactNode;
  deleteFunc: () => Promise<void>;
  onSuccess?: () => void;
  handleReject: () => void;
  handleClose: () => void;
  deleteButtonDisabled?: boolean;
  customDeleteButtonText?: string;
  customDeleteButtonIon?: ReactNode;
  values?: number;
}
const THEME_COLOR = "#083A4C";
const ConfirmationModal = ({
  open,
  title,
  content,
  handleClose,
  deleteFunc,
  handleReject,
  onSuccess = () => {},
  deleteButtonDisabled,
  customDeleteButtonText,
  customDeleteButtonIon,
  values,
}: Props) => {
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal
      visible={open}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)", // bg-black/50
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            width: "80%", // w-4/5
            borderRadius: 16, // rounded-2xl
            padding: 20, // p-5
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 18, // text-lg
              fontWeight: "700", // font-bold
              marginBottom: 8, // mb-2
            }}
          >
            {title}
          </Text>
          <View style={styles.coinDetailItem}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View style={styles.iconContainer}>
                <Text>🪙</Text>
              </View>
              <Text style={styles.detailLabel}>RC Fee</Text>
            </View>
            <Text style={styles.basicChip}>{values} RC</Text>
          </View>

          {/* Content */}
          <View style={{ marginBottom: 16 }}>
            {typeof content === "string" ? (
              <Text
                style={{
                  fontSize: 14, // text-sm
                  color: "#374151", // text-gray-700
                }}
              >
                {content}
              </Text>
            ) : (
              content
            )}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity
              disabled={submitting}
              onPress={() => {
                handleReject();
                handleClose();
              }}
              style={{
                paddingHorizontal: 16, // px-4
                paddingVertical: 8, // py-2
                borderRadius: 8, // rounded-lg
                backgroundColor: "#E5E7EB", // bg-gray-200
                marginRight: 8, // mr-2
              }}
            >
              <Text
                style={{
                  color: "#1F2937", // text-gray-800
                  fontWeight: "500",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={submitting || deleteButtonDisabled}
              onPress={async () => {
                try {
                  setSubmitting(true);
                  await deleteFunc();
                  handleClose();
                  onSuccess();
                } catch (err) {
                  console.error(err);
                } finally {
                  setSubmitting(false);
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor:
                  submitting || deleteButtonDisabled
                    ? "rgba(239,68,68,0.6)" // bg-red-500/60
                    : THEME_COLOR, // bg-red-600
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : customDeleteButtonIon ? (
                customDeleteButtonIon
              ) : (
                <Feather name="check-square" size={24} color="#fff" />
              )}
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "500",
                  marginLeft: 8,
                }}
              >
                {customDeleteButtonText
                  ? customDeleteButtonText
                  : submitting
                    ? "Confirming..."
                    : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  basicChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    alignSelf: "flex-start",
  },

  coinDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME_COLOR,
    marginBottom: 9,
  },

  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e8f5e8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginRight: 6,
  },
});
