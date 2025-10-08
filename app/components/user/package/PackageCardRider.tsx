import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

/** Shared base props for both variants */
type BaseProps = {
  id: string;
  name: string;
  rc: number;
  price: number;
  timePeriod?: number;
  icon?: string;
  recommended?: boolean;
  theme?: "light" | "dark";
};

/** Available (buyable) card */
type AvailableProps = BaseProps & {
  variant: "available";
  onBuy: (id: string) => void;
};

/** Active (already purchased) card */
type ActiveProps = BaseProps & {
  variant: "active";
  daysRemaining: number;
};

type Props = AvailableProps | ActiveProps;

const formatLKR = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-LK")}`;
const isAvailable = (p: Props): p is AvailableProps => p.variant === "available";

const PackageCardRider: React.FC<Props> = (props) => {
  const theme = props.theme ?? "dark";
  return theme === "light" ? <LightCard {...props} /> : <DarkCard {...props} />;
};

/* -------------------------------- Light Card ------------------------------- */
const LightCard: React.FC<Props> = (props) => {
  return (
    <View style={lightStyles.cardWrapper}>
      <LinearGradient
        colors={props.recommended ? ["#ECFEE8", "#D6FEC7"] : ["#FFFFFF", "#F9FAFB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={lightStyles.card}
      >
        {/* Decorative Corner */}
        <View style={lightStyles.cornerDecor} />

        {/* Recommended Badge */}
        {props.recommended && (
          <View style={lightStyles.recommendedBanner}>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={lightStyles.bannerGradient}
            >
              <MaterialIcons name="star" size={14} color="#FFFFFF" />
              <Text style={lightStyles.bannerText}>RECOMMENDED</Text>
            </LinearGradient>
          </View>
        )}

        {/* Header */}
        <View style={lightStyles.header}>
          <View style={lightStyles.iconContainer}>
            {props.icon ? (
              <Image source={{ uri: props.icon }} style={lightStyles.icon} resizeMode="cover" />
            ) : (
              <View style={lightStyles.iconPlaceholder}>
                <MaterialIcons name="card-giftcard" size={28} color="#9CA3AF" />
              </View>
            )}
            <View style={lightStyles.iconGlow} />
          </View>

          <View style={lightStyles.headerInfo}>
            <Text style={lightStyles.name}>{props.name}</Text>
            <View style={lightStyles.detailsRow}>
              <View style={lightStyles.detailBadge}>
                <MaterialIcons name="toll" size={12} color="#0891B2" />
                <Text style={lightStyles.detailText}>{props.rc} RC</Text>
              </View>
              {props.timePeriod ? (
                <View style={lightStyles.detailBadge}>
                  <MaterialIcons name="schedule" size={12} color="#6366F1" />
                  <Text style={lightStyles.detailText}>{props.timePeriod} days</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={lightStyles.dividerContainer}>
          <LinearGradient
            colors={["transparent", "#E5E7EB", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={lightStyles.divider}
          />
        </View>

        {/* Footer */}
        <View style={lightStyles.footer}>
          <View style={lightStyles.priceSection}>
            <Text style={lightStyles.priceLabel}>Price</Text>
            <View style={lightStyles.priceRow}>
              <MaterialIcons name="payments" size={18} color="#059669" />
              <Text style={lightStyles.price}>{formatLKR(props.price)}</Text>
            </View>
          </View>

          {isAvailable(props) ? (
            <TouchableOpacity
              style={lightStyles.buyButton}
              onPress={() => props.onBuy(props.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#083A4C", "#0F5668"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={lightStyles.buyGradient}
              >
                <MaterialIcons name="shopping-cart" size={18} color="#FFFFFF" />
                <Text style={lightStyles.buyText}>Buy Now</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={lightStyles.activePill}>
              <LinearGradient
                colors={["#DCFCE7", "#A7F3D0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={lightStyles.activePillGradient}
              >
                <MaterialIcons name="check-circle" size={16} color="#059669" />
                <Text style={lightStyles.activeText}>{props.daysRemaining} days left</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

/* -------------------------------- Dark Card -------------------------------- */
const DarkCard: React.FC<Props> = (props) => {
  return (
    <View style={darkStyles.cardWrapper}>
      <LinearGradient
        colors={props.recommended ? ["#1E3A8A", "#0F766E"] : ["#0F3C4A", "#134E4A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={darkStyles.card}
      >
        {/* Decorative Elements */}
        <View style={darkStyles.cornerDecor} />
        <View style={[darkStyles.floatingOrb, darkStyles.orb1]} />
        <View style={[darkStyles.floatingOrb, darkStyles.orb2]} />

        {/* Recommended Badge */}
        {props.recommended && (
          <View style={darkStyles.recommendedBanner}>
            <LinearGradient
              colors={["#FBBF24", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={darkStyles.bannerGradient}
            >
              <MaterialIcons name="star" size={14} color="#FFFFFF" />
              <Text style={darkStyles.bannerText}>TOP CHOICE</Text>
            </LinearGradient>
          </View>
        )}

        {/* Header */}
        <View style={darkStyles.header}>
          <View style={darkStyles.iconContainer}>
            {props.icon ? (
              <Image source={{ uri: props.icon }} style={darkStyles.icon} resizeMode="cover" />
            ) : (
              <View style={darkStyles.iconPlaceholder}>
                <MaterialIcons name="card-giftcard" size={28} color="#FFFFFF" />
              </View>
            )}
            <View style={darkStyles.iconGlow} />
          </View>

          <View style={darkStyles.headerInfo}>
            <Text style={darkStyles.name}>{props.name}</Text>
            <View style={darkStyles.detailsRow}>
              <View style={darkStyles.detailBadge}>
                <MaterialIcons name="toll" size={12} color="#5EEAD4" />
                <Text style={darkStyles.detailText}>{props.rc} RC</Text>
              </View>
              {props.timePeriod ? (
                <View style={darkStyles.detailBadge}>
                  <MaterialIcons name="schedule" size={12} color="#A5B4FC" />
                  <Text style={darkStyles.detailText}>{props.timePeriod} days</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={darkStyles.dividerContainer}>
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={darkStyles.divider}
          />
        </View>

        {/* Footer */}
        <View style={darkStyles.footer}>
          <View style={darkStyles.priceSection}>
            <Text style={darkStyles.priceLabel}>Price</Text>
            <View style={darkStyles.priceRow}>
              <MaterialIcons name="payments" size={18} color="#34D399" />
              <Text style={darkStyles.price}>{formatLKR(props.price)}</Text>
            </View>
          </View>

          {isAvailable(props) ? (
            <TouchableOpacity
              style={darkStyles.buyButton}
              onPress={() => props.onBuy(props.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#14B8A6", "#0D9488"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={darkStyles.buyGradient}
              >
                <MaterialIcons name="shopping-cart" size={18} color="#FFFFFF" />
                <Text style={darkStyles.buyText}>Buy Now</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={darkStyles.activePill}>
              <LinearGradient
                colors={["#6EE7B7", "#34D399"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={darkStyles.activePillGradient}
              >
                <MaterialIcons name="check-circle" size={16} color="#064E3B" />
                <Text style={darkStyles.activeText}>{props.daysRemaining} days left</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

/* -------------------------- Light Theme Styles -------------------------- */
const lightStyles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
    overflow: "hidden",
  },
  cornerDecor: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  recommendedBanner: {
    position: "absolute",
    top: 14,
    right: 14,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bannerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  iconContainer: { position: "relative", marginRight: 14 },
  icon: { width: 56, height: 56, borderRadius: 16 },
  iconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  headerInfo: { flex: 1 },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  detailsRow: { flexDirection: "row", gap: 8 },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailText: { fontSize: 11, fontWeight: "700", color: "#374151" },
  dividerContainer: { marginVertical: 12 },
  divider: { height: 1, width: "100%" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceSection: { flex: 1 },
  priceLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 18, fontWeight: "900", color: "#065F46", letterSpacing: -0.5 },
  buyButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#083A4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyGradient: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 12 },
  buyText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3 },
  activePill: { borderRadius: 14, overflow: "hidden" },
  activePillGradient: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  activeText: { fontSize: 13, fontWeight: "800", color: "#064E3B" },
});

/* -------------------------- Dark Theme Styles -------------------------- */
const darkStyles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  cornerDecor: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  floatingOrb: { position: "absolute", backgroundColor: "rgba(255, 255, 255, 0.06)", borderRadius: 999 },
  orb1: { width: 100, height: 100, bottom: -30, left: -30 },
  orb2: { width: 60, height: 60, top: 50, right: -20 },

  recommendedBanner: {
    position: "absolute",
    top: 14,
    right: 14,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  bannerGradient: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6 },
  bannerText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 14, zIndex: 2 },
  iconContainer: { position: "relative", marginRight: 14 },
  icon: { width: 56, height: 56, borderRadius: 16 },
  iconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  headerInfo: { flex: 1 },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  detailsRow: { flexDirection: "row", gap: 8 },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  detailText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },

  dividerContainer: { marginVertical: 12, zIndex: 2 },
  divider: { height: 1, width: "100%" },

  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 2 },
  priceSection: { flex: 1 },
  priceLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255, 255, 255, 0.7)", marginBottom: 4, letterSpacing: 0.3 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 18, fontWeight: "900", color: "#6EE7B7", letterSpacing: -0.5 },

  buyButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#14B8A6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buyGradient: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 12 },
  buyText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3 },

  activePill: { borderRadius: 14, overflow: "hidden" },
  activePillGradient: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  activeText: { fontSize: 13, fontWeight: "800", color: "#064E3B" },
});

export default PackageCardRider;
