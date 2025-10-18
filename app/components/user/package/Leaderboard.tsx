// src/components/user/package/Leaderboard.tsx
import { fetchLeaderboard, LeaderboardEntry } from "@/api/leaderboard";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MyRewardsSummary from "./MyRewardsSummary";

type Period = "all" | "month" | "week" | "day";

interface LeaderboardProps {
  theme?: "light" | "dark";
}

const periodOptions: { key: Period; label: string; icon: any }[] = [
  { key: "all", label: "All Time", icon: "infinite-outline" },
  { key: "month", label: "This Month", icon: "calendar" },
  { key: "week", label: "This Week", icon: "calendar-outline" },
  { key: "day", label: "Today", icon: "today-outline" },
];

const Leaderboard: React.FC<LeaderboardProps> = ({ theme = "light" }) => {
  const [period, setPeriod] = useState<Period>("all");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🏆";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return "#64748B";
  };

  const getCurrentPeriodLabel = () => {
    return periodOptions.find(opt => opt.key === period)?.label || "All Time";
  };

  const getCurrentPeriodIcon = () => {
    return periodOptions.find(opt => opt.key === period)?.icon || "infinite";
  };

  //  Modified loadLeaderboard: accepts optional customPeriod
  const loadLeaderboard = async (showLoadingSpinner = true, customPeriod?: Period) => {
    try {
      if (showLoadingSpinner) setLoading(true);

      const activePeriod = customPeriod || period;

      const params: any = {
        period: activePeriod,
        limit: 50,
        _t: Date.now(),
      };

      // Do not send includeRankFor implicitly from local storage. If an
      // explicit user id is needed (e.g., admin viewing another user) then
      // pass it in; otherwise omit it and let the server infer the current
      // user from the Authorization token to avoid mismatches.

      console.log(" Loading leaderboard with params:", params);

      const result = await fetchLeaderboard(params);

      console.log(" Leaderboard API response:", {
        period: params.period,
        dataCount: result.data?.length,
        userRank: result.includeRankFor,
      });

      setData(result.data || []);
      setUserRank(result.includeRankFor || null);

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      console.error(" Leaderboard load error:", {
        message: err.message,
        period: period,
        userId: currentUserId,
      });

      Alert.alert(
        "Could not load leaderboard",
        err.message || "Please try again later"
      );
      setData([]);
      setUserRank(null);
    } finally {
      if (showLoadingSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        console.log(" Loaded userId from storage:", userId);

        if (!mounted) return;
        setCurrentUserId(userId || "");

        await loadLeaderboard(true);
      } catch (err) {
        console.error(" Initialization failed:", err);
        setLoading(false);
      }
    };

    initializeUser();

    return () => {
      mounted = false;
    };
  }, []);
console.log("Fetching leaderboard for userId:", currentUserId, "period:", period);
  useEffect(() => {
    if (currentUserId !== "") {
      console.log(" Refreshing due to period/userId/forceRefresh change:", {
        period,
        currentUserId,
        forceRefresh,
        
      });
      loadLeaderboard(true);
    }
  }, [period, currentUserId, forceRefresh]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard(false);
    setForceRefresh((prev) => prev + 1);
  };


  const handlePeriodSelect = (selectedPeriod: Period) => {
    console.log(" Period selected:", selectedPeriod);

    setPeriod(selectedPeriod);
    setDropdownVisible(false);

    // Call loadLeaderboard immediately with new period
    loadLeaderboard(true, selectedPeriod);
    setForceRefresh((prev) => prev + 1);
  };

  const formatRC = (amount: number) => {
    return Math.floor(amount).toLocaleString();
  };

  const shouldShowUserRank =
    userRank &&
    userRank.rank !== null &&
    userRank.rank !== undefined &&
    userRank.totalRCSpent !== undefined;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#3B82F6"]}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#083A4C", "#0E6B64", "#37A77D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitle}>
            <View style={styles.trophyIcon}>
              <LinearGradient
                colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
                style={styles.trophyIconGradient}
              >
                <Ionicons name="trophy" size={28} color="#FFD700" />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.title}>Leaderboard</Text>
              <Text style={styles.subtitle}>
                Top riders by RC spent
              </Text>
            </View>
          </View>
        </View>

        {/* Decorative elements */}
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
      </LinearGradient>

      {/* Period Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.filterGradient}
          >
            <Ionicons name={getCurrentPeriodIcon()} size={18} color="#083A4C" />
            <Text style={styles.filterText}>{getCurrentPeriodLabel()}</Text>
            <Ionicons
              name={dropdownVisible ? "chevron-up" : "chevron-down"}
              size={18}
              color="#37A77D"
            />
          </LinearGradient>
        </TouchableOpacity>


        <Modal
          visible={dropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.dropdownMenu}>
                <Text style={styles.dropdownTitle}>Select Period</Text>
                {periodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.dropdownItem,
                      period === option.key && styles.dropdownItemActive,
                    ]}
                    onPress={() => handlePeriodSelect(option.key)}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <View
                        style={[
                          styles.dropdownIconCircle,
                          period === option.key && styles.dropdownIconCircleActive,
                        ]}
                      >
                        <Ionicons
                          name={option.icon}
                          size={18}
                          color={period === option.key ? "#FFFFFF" : "#37A77D"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          period === option.key && styles.dropdownItemTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {period === option.key && (
                      <MaterialIcons name="check-circle" size={20} color="#37A77D" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* User Rank Card */}
      {shouldShowUserRank && (
        <View style={styles.userRankWrapper}>
          <LinearGradient
            colors={["#083A4C", "#0E6B64", "#37A77D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userRankCard}
          >
            <View style={styles.userRankContent}>
              <View style={styles.userRankLeft}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.15)"]}
                  style={styles.rankBadge}
                >
                  <Text style={styles.rankBadgeText}>#{userRank.rank}</Text>
                </LinearGradient>
                <View style={styles.userRankInfo}>
                  <Text style={styles.userRankTitle}>Your Rank</Text>
                  <Text style={styles.userRankSubtitle}>
                    {userRank.rank === 1
                      ? "🏆 Champion!"
                      : userRank.rank <= 3
                      ? "🥇 Top Performer!"
                      : userRank.rank <= 10
                      ? "🚀 Great job!"
                      : "💪 Keep riding!"}
                  </Text>
                </View>
              </View>
              <View style={styles.userRankRight}>
                <MaterialIcons name="monetization-on" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.userRankRC}>
                  {formatRC(userRank.totalRCSpent)}
                </Text>
                <Text style={styles.userRankLabel}>RC SPENT</Text>
              </View>
            </View>

            {/* Decorative elements */}
            <View style={[styles.rankDecor, styles.rankDecor1]} />
            <View style={[styles.rankDecor, styles.rankDecor2]} />
          </LinearGradient>
        </View>
      )}

      {/* No Rank Card */}
      {!shouldShowUserRank && !loading && (
        <View style={styles.noRankWrapper}>
          <View style={styles.noRankCard}>
            <View style={styles.noRankIconCircle}>
              <Ionicons name="bicycle" size={28} color="#37A77D" />
            </View>
            <View style={styles.noRankContent}>
              <Text style={styles.noRankTitle}>Start Your Journey</Text>
              <Text style={styles.noRankText}>
                Complete your first ride to join the leaderboard!
              </Text>
            </View>
          </View>
        </View>
      )}

      <MyRewardsSummary refreshKey={forceRefresh} />

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.centerMessage}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              Loading {getCurrentPeriodLabel().toLowerCase()} rankings...
            </Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.centerMessage}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="medal-outline" size={56} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No Rides Yet</Text>
            <Text style={styles.emptySubtitle}>
              {period === "day"
                ? "No rides today yet!"
                : period === "week"
                ? "No rides this week yet!"
                : period === "month"
                ? "No rides this month yet!"
                : "No rides recorded yet!"}
            </Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {data.map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentUser = userRank && String(entry.userId) === String(userRank.userId);
              const rankEmoji = getRankIcon(rank);
              const isTopThree = rank <= 3;

              return (
                <View
                  key={`${entry.userId}-${rank}-${period}-${forceRefresh}`}
                  style={[
                    styles.leaderboardItem,
                    isCurrentUser && styles.leaderboardItemHighlight,
                  ]}
                >
                  {/* Rank Circle */}
                  <View
                    style={[
                      styles.rankCircle,
                      isTopThree && styles.rankCircleTop,
                    ]}
                  >
                    {isTopThree ? (
                      <LinearGradient
                        colors={
                          rank === 1
                            ? ["#FFD700", "#FFA500"]
                            : rank === 2
                            ? ["#E8E8E8", "#C0C0C0"]
                            : ["#D4AF37", "#CD7F32"]
                        }
                        style={styles.rankGradient}
                      >
                        {rankEmoji ? (
                          <Text style={styles.rankEmoji}>{rankEmoji}</Text>
                        ) : (
                          <Text style={styles.rankNumberTop}>{rank}</Text>
                        )}
                      </LinearGradient>
                    ) : (
                      <Text style={styles.rankNumber}>{rank}</Text>
                    )}
                  </View>

                  {/* User Info */}
                  <View style={styles.userInfo}>
                    <Text
                      style={[
                        styles.userName,
                        isCurrentUser && styles.userNameHighlight,
                      ]}
                      numberOfLines={1}
                    >
                      {entry.userName || "Anonymous Rider"}
                    </Text>
                    <View style={styles.userStatsRow}>
                      <View style={styles.ridesBadge}>
                        <Ionicons name="bicycle" size={12} color="#37A77D" />
                        <Text style={styles.userStats}>
                          {entry.rides} {entry.rides === 1 ? "ride" : "rides"}
                        </Text>
                      </View>
                      {isCurrentUser && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>YOU</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* RC Section */}
                  <View style={styles.rcSection}>
                    <View style={styles.rcRow}>
                      <MaterialIcons
                        name="monetization-on"
                        size={14}
                        color={isTopThree ? getRankColor(rank) : "#37A77D"}
                      />
                      <Text
                        style={[
                          styles.rcAmount,
                          isTopThree && { color: getRankColor(rank) },
                        ]}
                      >
                        {formatRC(entry.totalRCSpent)}
                      </Text>
                    </View>
                    <Text style={styles.rcLabel}>RC</Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },

  // Header Gradient Section
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  headerContent: {
    zIndex: 2,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  trophyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  trophyIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    fontWeight: "500",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorCircle1: {
    width: 180,
    height: 180,
    top: -60,
    right: -40,
  },
  decorCircle2: {
    width: 120,
    height: 120,
    bottom: -30,
    left: -30,
  },

  // Filter Section
  filterContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    zIndex: 10,
  },
  filterButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#083A4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  filterGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
  },
  filterText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#083A4C",
  },

  // Modal Dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(8, 58, 76, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#083A4C",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  dropdownItemActive: {
    backgroundColor: "#E8F5F1",
  },
  dropdownItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dropdownIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5F1",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownIconCircleActive: {
    backgroundColor: "#37A77D",
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  dropdownItemTextActive: {
    color: "#083A4C",
    fontWeight: "700",
  },

  // User Rank Card
  userRankWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#083A4C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  userRankCard: {
    padding: 18,
    position: "relative",
    overflow: "hidden",
  },
  userRankContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  userRankLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  rankBadgeText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  userRankInfo: {
    flex: 1,
  },
  userRankTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  userRankSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  userRankRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  userRankRC: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  userRankLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  rankDecor: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  rankDecor1: {
    width: 140,
    height: 140,
    top: -50,
    right: -30,
  },
  rankDecor2: {
    width: 100,
    height: 100,
    bottom: -30,
    left: -20,
  },

  // No Rank Card
  noRankWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  noRankCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#E8F5F1",
    shadowColor: "#37A77D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noRankIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F5F1",
    justifyContent: "center",
    alignItems: "center",
  },
  noRankContent: {
    flex: 1,
  },
  noRankTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#083A4C",
    marginBottom: 4,
  },
  noRankText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    lineHeight: 18,
  },

  // Scroll View content
  scrollContent: {
    paddingBottom: 150,
  },
  listContainer: {
    paddingHorizontal: 20,
  },

  // Loading & Empty States
  centerMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#083A4C",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },

  // Leaderboard Items
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8F5F1",
    shadowColor: "#083A4C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  leaderboardItemHighlight: {
    backgroundColor: "#FFF9E6",
    borderColor: "#FFD700",
    borderWidth: 2,
    shadowColor: "#FFD700",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  // Rank Circle
  rankCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  rankCircleTop: {
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  rankGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  rankEmoji: {
    fontSize: 22,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#64748B",
  },
  rankNumberTop: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  // User Info
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#083A4C",
    marginBottom: 6,
  },
  userNameHighlight: {
    color: "#B8860B",
  },
  userStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ridesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  userStats: {
    fontSize: 11,
    color: "#37A77D",
    fontWeight: "700",
  },
  youBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // RC Section
  rcSection: {
    alignItems: "flex-end",
  },
  rcRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  rcAmount: {
    fontSize: 17,
    fontWeight: "900",
    color: "#37A77D",
  },
  rcLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default Leaderboard;