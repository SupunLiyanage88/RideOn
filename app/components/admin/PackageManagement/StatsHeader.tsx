import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  totalPackages: number;
  filteredCount: number;
  totalActive: number;
  // optional interactions
  onPressTotal?: () => void;
  onPressMatching?: () => void;
  onPressActive?: () => void;
};

const StatsHeader: React.FC<Props> = ({
  totalPackages,
  filteredCount,
  totalActive,
  onPressTotal,
  onPressMatching,
  onPressActive,
}) => {
  const matchingPercent = totalPackages ? Math.round((filteredCount / totalPackages) * 100) : 0;
  const activePercent = totalPackages
    ? Math.min(100, Math.round((totalActive / (totalPackages * 5)) * 100))
    : 0;

  return (
    <View style={styles.statsWrap}>
      {/* Total Packages */}
      <TouchableOpacity style={styles.statCard} activeOpacity={0.9} onPress={onPressTotal}>
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.cardGlassOverlay} />
          <View style={styles.iconCircleWrapper}>
            <View style={styles.iconCircle}>
              <View style={styles.iconGlow} />
              {/* if 'inventory-2' doesn't render for your icons, try 'inventory' */}
              <MaterialIcons name="inventory" size={24} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.statLabel}>TOTAL PACKAGES</Text>
          <Text style={styles.statValue}>{totalPackages}</Text>

          <View style={styles.dividerContainer}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.dividerGradient}
            />
          </View>

          <View style={styles.hintRow}>
            <MaterialIcons name="check-circle" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statHint}>All available plans</Text>
          </View>

          <View style={[styles.floatingOrb, styles.orb1]} />
          <View style={[styles.floatingOrb, styles.orb2]} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Matching */}
      <TouchableOpacity style={styles.statCard} activeOpacity={0.9} onPress={onPressMatching}>
        <LinearGradient
          colors={["#06B6D4", "#3B82F6"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.cardGlassOverlay} />
          <View style={styles.iconCircleWrapper}>
            <View style={styles.iconCircle}>
              <View style={styles.iconGlow} />
              <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.statLabel}>MATCHING</Text>
          <View style={styles.valueWithBadge}>
            <Text style={styles.statValue}>{filteredCount}</Text>
            <View style={styles.percentBadge}>
              <MaterialIcons name="trending-up" size={10} color="#FFFFFF" />
              <Text style={styles.percentText}>{matchingPercent}%</Text>
            </View>
          </View>

          <View style={styles.progressWrapper}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFillWhite, { width: `${matchingPercent}%` }]} />
            </View>
          </View>

          <View style={styles.hintRow}>
            <MaterialIcons name="search" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statHint}>of total packages</Text>
          </View>

          <View style={[styles.floatingOrb, styles.orb1]} />
          <View style={[styles.floatingOrb, styles.orb2]} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Total Active */}
      <TouchableOpacity style={styles.statCard} activeOpacity={0.9} onPress={onPressActive}>
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.cardGlassOverlay} />
          <View style={styles.iconCircleWrapper}>
            <View style={styles.iconCircle}>
              <View style={styles.iconGlow} />
              <View style={styles.livePulseDot} />
              <MaterialIcons name="people" size={24} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.statLabel}>ACTIVATED PACKAGES</Text>
          <View style={styles.valueWithBadge}>
            <Text style={styles.statValue}>{totalActive}</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.progressWrapper}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFillWhite, { width: `${activePercent}%` }]} />
            </View>
          </View>

          <View style={styles.hintRow}>
            <MaterialIcons name="verified" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statHint}>Active engagements</Text>
          </View>

          <View style={[styles.floatingOrb, styles.orb1]} />
          <View style={[styles.floatingOrb, styles.orb2]} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default memo(StatsHeader);

const styles = StyleSheet.create({
  statsWrap: { flexDirection: "row", gap: 12, marginTop: 14, marginBottom: 16 },
  statCard: {
    flex: 1,
    minHeight: 165,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  gradientCard: { flex: 1, padding: 16, position: "relative", overflow: "hidden" },
  cardGlassOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.08)" },
  iconCircleWrapper: { marginBottom: 12, zIndex: 2 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
    position: "relative", shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  iconGlow: { position: "absolute", width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,255,255,0.15)", opacity: 0.6 },
  livePulseDot: { position: "absolute", top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" },
  statLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.85)", letterSpacing: 1, marginBottom: 6, zIndex: 2 },
  statValue: { fontSize: 36, fontWeight: "900", color: "#FFFFFF", letterSpacing: -1.5, textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, zIndex: 2 },
  valueWithBadge: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, zIndex: 2 },
  percentBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 3,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)",
  },
  percentText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3 },
  liveBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 5,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)",
  },
  liveIndicator: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  liveText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
  dividerContainer: { marginVertical: 10, zIndex: 2 },
  dividerGradient: { height: 2, width: "65%", borderRadius: 1 },
  progressWrapper: { marginTop: 8, marginBottom: 8, zIndex: 2 },
  progressBar: {
    width: "100%", // ensure the inner width% renders correctly
    height: 7,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  progressFillWhite: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 5, zIndex: 2 },
  statHint: { fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: "600", letterSpacing: 0.2 },
  floatingOrb: { position: "absolute", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 },
  orb1: { width: 100, height: 100, top: -30, right: -35 },
  orb2: { width: 70, height: 70, bottom: -20, right: 15 },
});
