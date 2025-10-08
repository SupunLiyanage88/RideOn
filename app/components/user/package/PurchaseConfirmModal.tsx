// components/user/package/PurchaseConfirmModal.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export type PurchaseConfirmData = {
  id: string;
  name: string;
  rc: number;
  price: number;
  timePeriod?: number;
  icon?: string;
  description?: string;
  recommended?: boolean;
};

type Props = {
  visible: boolean;
  data?: PurchaseConfirmData | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  busy?: boolean;
};

const formatLKR = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-LK")}`;

const PurchaseConfirmModal: React.FC<Props> = ({
  visible,
  data,
  onClose,
  onConfirm,
  busy,
}) => {
  if (!data) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Full-screen backdrop with centered content */}
      <View style={styles.backdrop}>
        {/* Close when tapping outside card */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Centered card */}
        <View style={styles.cardWrap}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Confirm Purchase</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <MaterialIcons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Info card */}
          <LinearGradient
            colors={["#FFFFFF", "#F9FAFB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Top meta row */}
            <View style={styles.topRow}>
              <View style={styles.iconWrap}>
                {data.icon ? (
                  <Image source={{ uri: data.icon }} style={styles.icon} />
                ) : (
                  <View style={styles.iconPlaceholder}>
                    <MaterialIcons name="card-giftcard" size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.pkgName}>{data.name}</Text>
                <View style={styles.badges}>
                  <View style={styles.badge}>
                    <MaterialIcons name="toll" size={14} color="#0891B2" />
                    <Text style={styles.badgeText}>{data.rc} RC</Text>
                  </View>
                  {typeof data.timePeriod === "number" && (
                    <View style={styles.badge}>
                      <MaterialIcons name="schedule" size={14} color="#6366F1" />
                      <Text style={styles.badgeText}>{data.timePeriod} days</Text>
                    </View>
                  )}
                  {data.recommended && (
                    <View style={[styles.badge, styles.recommendedBadge]}>
                      <MaterialIcons name="star" size={14} color="#F59E0B" />
                      <Text style={[styles.badgeText, { color: "#92400E" }]}>Recommended</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            {data.description ? (
              <View style={styles.descriptionBox}>
                <Text style={styles.sectionLabel}>About this package</Text>
                <Text style={styles.descriptionText} numberOfLines={5}>
                  {data.description}
                </Text>
              </View>
            ) : null}

            {/* Price row */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>{formatLKR(data.price)}</Text>
            </View>
          </LinearGradient>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGhost]}>
              <Text style={[styles.btnText, styles.btnGhostText]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={busy}
              onPress={() => onConfirm(data.id)}
              style={[styles.btn, styles.btnPrimary, busy && { opacity: 0.7 }]}
            >
              <LinearGradient
                colors={["#14B8A6", "#0D9488"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnPrimaryBg}
              >
                <MaterialIcons name="shopping-cart" size={18} color="#FFFFFF" />
                <Text style={[styles.btnText, { color: "#FFFFFF" }]}>
                  {busy ? "Processing..." : "Confirm"}
                </Text>
                <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.smallNote}>
            By confirming, RideOn Coins will be credited and the package validity will start when the payment is confirmed.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Fullscreen container that centers children
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  // The dialog card wrapper (centered box)
  cardWrap: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    // subtle elevation/shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  title: { color: "#0F172A", fontSize: 16, fontWeight: "800", flex: 1 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

  card: {
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  topRow: { flexDirection: "row", alignItems: "center" },
  iconWrap: { width: 52, height: 52, borderRadius: 12, overflow: "hidden", marginRight: 12, backgroundColor: "#F3F4F6" },
  icon: { width: "100%", height: "100%" },
  iconPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },

  pkgName: { color: "#0F172A", fontSize: 16, fontWeight: "900", marginBottom: 6 },
  badges: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recommendedBadge: { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
  badgeText: { color: "#374151", fontSize: 12, fontWeight: "700" },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },

  descriptionBox: { gap: 6 },
  sectionLabel: { color: "#6B7280", fontSize: 12, fontWeight: "700" },
  descriptionText: { color: "#111827", fontSize: 13, lineHeight: 18 },

  priceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12,
  },
  priceLabel: { color: "#6B7280", fontSize: 12, fontWeight: "700" },
  priceValue: { color: "#065F46", fontSize: 18, fontWeight: "900", letterSpacing: -0.4 },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  btn: { flex: 1, height: 44, borderRadius: 12, overflow: "hidden" },
  btnGhost: {
    borderWidth: 1, borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center", justifyContent: "center",
  },
  btnGhostText: { color: "#111827" },
  btnPrimary: {},
  btnPrimaryBg: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12,
  },
  btnText: { fontSize: 14, fontWeight: "800" },
  smallNote: { color: "#6B7280", fontSize: 11, marginTop: 10, textAlign: "center" },
});

export default PurchaseConfirmModal;
