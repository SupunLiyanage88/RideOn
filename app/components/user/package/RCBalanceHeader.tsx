import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface RCBalanceHeaderProps {
  userRc: number;
  onInfoPress?: () => void;
}

const RCBalanceHeader: React.FC<RCBalanceHeaderProps> = ({ userRc, onInfoPress }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0B3B44", "#0E6B64", "#16B0A2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Soft glow layers */}
        <View style={[styles.glow, styles.glowTop]} />
        <View style={[styles.glow, styles.glowBottom]} />

        {/* Decorative rings */}
        <View style={[styles.ring, styles.ringOne]} />
        <View style={[styles.ring, styles.ringTwo]} />

        {/* Header Row */}
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <MaterialIcons name="monetization-on" size={16} color="rgba(255,255,255,0.95)" />
            <Text style={styles.label}>RideOn Coins</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={onInfoPress} style={styles.infoBtn}>
            <Ionicons name="information-circle" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Value Row */}
        <View style={styles.valueRow}>
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <MaterialIcons name="account-balance-wallet" size={28} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.amountWrap}>
              <Text style={styles.rcValue}>{userRc.toLocaleString("en-US")}</Text>
              <View style={styles.rcPill}>
                <Text style={styles.rcPillText}>RC</Text>
              </View>
            </View>

            <View style={styles.divider}>
              <LinearGradient
                colors={["transparent", "rgba(255,255,255,0.35)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dividerLine}
              />
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Available for rides</Text>
            </View>
          </View>
        </View>

        {/* Bottom wave */}
        <LinearGradient
          colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.wave}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 10,
  },
  gradient: {
    padding: 18,
    paddingBottom: 22,
    minHeight: 150,
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  /* Decorative glows & rings */
  glow: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    filter: "blur(10px)" as any, // safe to ignore in RN (no-op on native)
  },
  glowTop: { width: 180, height: 180, top: -60, right: -50 },
  glowBottom: { width: 140, height: 140, bottom: -40, left: -30 },

  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  ringOne: { width: 220, height: 220, top: -80, left: -40 },
  ringTwo: { width: 140, height: 140, bottom: -50, right: -10 },

  /* Header */
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    zIndex: 2,
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  infoBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },

  /* Main content */
  valueRow: { flexDirection: "row", alignItems: "center", zIndex: 2 },
  iconWrap: { marginRight: 14 },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  amountWrap: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  rcValue: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1.5,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rcPill: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  rcPillText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  divider: { marginTop: 10, marginBottom: 8 },
  dividerLine: { height: 2, width: "74%", borderRadius: 2 },

  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  /* Bottom wave */
  wave: {
    position: "absolute",
    left: -20,
    right: -20,
    bottom: -18,
    height: 60,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },
});

export default RCBalanceHeader;
