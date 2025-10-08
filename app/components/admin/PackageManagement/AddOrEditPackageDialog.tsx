import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch, Image, Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, PackageInput, savePackage, updatePackage, ImagePart } from "@/api/package";

interface AddOrEditPackageDialogProps {
  visible: boolean;
  onClose: () => void;
  defaultValues?: Package;
}

type LocalForm = {
  name: string;
  rc: string;           // keep inputs as strings
  price: string;
  timePeriod: string;
  description: string;
  recommended: boolean;
};

const AddOrEditPackageDialog: React.FC<AddOrEditPackageDialogProps> = ({
  visible, onClose, defaultValues,
}) => {
  const [form, setForm] = useState<LocalForm>({
    name: "",
    rc: "",
    price: "",
    timePeriod: "",
    description: "",
    recommended: false,
  });

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<ImagePart | null>(null);

  const isEditMode = !!defaultValues;
  const queryClient = useQueryClient();
  const queryKey = ["package-data"];

  useEffect(() => {
    if (defaultValues) {
      setForm({
        name: defaultValues.name ?? "",
        rc: defaultValues.rc != null ? String(defaultValues.rc) : "",
        price: defaultValues.price != null ? String(defaultValues.price) : "",
        timePeriod: defaultValues.timePeriod != null ? String(defaultValues.timePeriod) : "",
        description: defaultValues.description ?? "",
        recommended: !!defaultValues.recommended,
      });
      setPreviewUri(defaultValues.icon || null);
      setPickedImage(null); // not changed unless user picks
    } else {
      resetForm();
    }
  }, [defaultValues]);

  const resetForm = () => {
    setForm({ name: "", rc: "", price: "", timePeriod: "", description: "", recommended: false });
    setPreviewUri(null);
    setPickedImage(null);
  };

  const { mutate: savePackageMutation, isPending: isSaving } = useMutation({
    mutationFn: (payload: { data: PackageInput; image?: ImagePart }) => savePackage(payload),
    onSuccess: () => {
      alert("Package Added Successfully");
      queryClient.invalidateQueries({ queryKey });
      handleClose();
    },
    onError: (error) => {
      console.error(error);
      alert("Failed to Add Package");
    },
  });

  const { mutate: updatePackageMutation, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { id: string; data: PackageInput; image?: ImagePart }) =>
      updatePackage(payload.id, { data: payload.data, image: payload.image }),
    onSuccess: () => {
      alert("Package Updated Successfully");
      queryClient.invalidateQueries({ queryKey });
      handleClose();
    },
    onError: (error) => {
      console.error(error);
      alert("Failed to Update Package");
    },
  });

  const isLoading = isSaving || isUpdating;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { alert("Permission denied! Allow access to gallery."); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const name = asset.fileName || asset.uri.split("/").pop() || `icon_${Date.now()}.jpg`;
      const type =
        asset.mimeType ||
        (name.toLowerCase().endsWith(".png")
          ? "image/png"
          : "image/jpeg");

      const file: ImagePart = { uri: asset.uri, name, type };
      setPickedImage(file);
      setPreviewUri(asset.uri);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const prepared: PackageInput | null = useMemo(() => {
    if (!form.name.trim() || !form.rc.trim() || !form.price.trim() || !form.timePeriod.trim() || !form.description.trim()) {
      return null;
    }
    const rc = Number(form.rc);
    const price = Number(form.price);
    const timePeriod = Number(form.timePeriod);
    if ([rc, price, timePeriod].some(n => Number.isNaN(n) || n <= 0)) return null;

    return {
      name: form.name.trim(),
      rc,
      price,
      timePeriod,
      description: form.description.trim(),
      recommended: form.recommended,
    };
  }, [form]);

  const handleSubmit = () => {
    if (!prepared) { alert("⚠️ Please fill in valid values for all required fields"); return; }

    if (isEditMode && defaultValues) {
      updatePackageMutation({
        id: defaultValues._id,
        data: prepared,
        image: pickedImage || undefined, // only send if changed
      });
    } else {
      savePackageMutation({
        data: prepared,
        image: pickedImage || undefined,
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditMode ? "✏️ Edit Package" : "➕ Add New Package"}</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <InputField
              label="Package Name"
              value={form.name}
              required
              placeholder="e.g., Gold Plan"
              onChangeText={(text: string) => setForm({ ...form, name: text })}
            />

            <InputField
              label="RideOn Coins (RC)"
              value={form.rc}
              required
              keyboardType="numeric"
              placeholder="e.g., 100"
              onChangeText={(text: string) => setForm({ ...form, rc: text })}
            />

            <InputField
              label="Price (LKR)"
              value={form.price}
              required
              keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "decimal-pad"}
              placeholder="e.g., 499.99"
              onChangeText={(text: string) => setForm({ ...form, price: text })}
            />

            <InputField
              label="Time Period (Days)"
              value={form.timePeriod}
              required
              keyboardType="numeric"
              placeholder="e.g., 30"
              onChangeText={(text: string) => setForm({ ...form, timePeriod: text })}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Package Image (Optional)</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                <MaterialIcons name="image" size={20} color="#2563EB" />
                <Text style={styles.uploadText}>{previewUri ? "Change Image" : "Select from device"}</Text>
              </TouchableOpacity>
              {previewUri && <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />}
            </View>

            <InputField
              label="Description"
              value={form.description}
              required
              multiline
              placeholder="Enter package details..."
              onChangeText={(text: string) => setForm({ ...form, description: text })}
            />

            <View style={[styles.inputGroup, styles.switchGroup]}>
              <View>
                <Text style={styles.label}>Recommended Package</Text>
                <Text style={styles.helperText}>Mark this as a highlighted plan for users</Text>
              </View>
              <Switch
                value={form.recommended}
                onValueChange={(value) => setForm({ ...form, recommended: value })}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={form.recommended ? "#2563EB" : "#F3F4F6"}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.submitButtonText}>
                {isLoading ? "Saving..." : isEditMode ? "Update Package" : "Add Package"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InputField = ({
  label, required, value, placeholder, onChangeText, keyboardType = "default", multiline = false,
}: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
    />
  </View>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  dialog: { backgroundColor: "white", borderRadius: 16, width: "90%", maxHeight: "85%", overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  form: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 },
  required: { color: "#EF4444" },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, padding: 12, backgroundColor: "#F9FAFB", color: "#111827", fontSize: 14 },
  textArea: { height: 100, textAlignVertical: "top" },
  switchGroup: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  helperText: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  footer: { flexDirection: "row", padding: 20, borderTopWidth: 1, borderTopColor: "#E5E7EB", gap: 12 },
  button: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  cancelButton: { backgroundColor: "#F3F4F6" },
  cancelButtonText: { color: "#374151", fontWeight: "500" },
  submitButton: { backgroundColor: "#083A4C" },
  submitButtonText: { color: "#FFF", fontWeight: "600" },
  uploadButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#BFDBFE" },
  uploadText: { color: "#2563EB", fontWeight: "500", marginLeft: 6 },
  previewImage: { width: 100, height: 100, borderRadius: 8, marginTop: 10, alignSelf: "flex-start" },
});

export default AddOrEditPackageDialog;
