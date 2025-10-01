import { MaterialIcons } from "@expo/vector-icons";
import React, { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
}

const DeleteConfirmationModal = ({
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
}: Props) => {
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal
      visible={open}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-4/5 rounded-2xl p-5">
          {/* Title */}
          <Text className="text-lg font-bold mb-2">{title}</Text>

          {/* Content */}
          <View className="mb-4">
            {typeof content === "string" ? (
              <Text className="text-sm text-gray-700">{content}</Text>
            ) : (
              content
            )}
          </View>

          {/* Actions */}
          <View className="flex-row justify-end">
            <TouchableOpacity
              disabled={submitting}
              onPress={() => {
                handleReject();
                handleClose();
              }}
              className="px-4 py-2 rounded-lg bg-gray-200 mr-2"
            >
              <Text className="text-gray-800 font-medium">Cancel</Text>
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
              className={`flex-row items-center px-4 py-2 rounded-lg ${
                submitting || deleteButtonDisabled
                  ? "bg-red-500/60"
                  : "bg-red-600"
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : customDeleteButtonIon ? (
                customDeleteButtonIon
              ) : (
                <MaterialIcons name="delete" size={20} color="#fff" />
              )}
              <Text className="text-white font-medium ml-2">
                {customDeleteButtonText
                  ? customDeleteButtonText
                  : submitting
                  ? "Deleting..."
                  : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmationModal;
