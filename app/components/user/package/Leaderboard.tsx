// src/components/user/package/Leaderboard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { fetchLeaderboard, LeaderboardEntry } from "@/api/leaderboard";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Period = "all" | "month" | "week" | "day";

interface LeaderboardProps {
  theme?: "light" | "dark";
}

const periodOptions: { key: Period; label: string; icon: string }[] = [
  { key: "all", label: "All Time", icon: "infinite" },
  { key: "month", label: "This Month", icon: "calendar" },
  { key: "week", label: "This Week", icon: "calendar-outline" },
  { key: "day", label: "Today", icon: "today" },
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

      if (currentUserId && currentUserId.trim() !== "") {
        params.includeRankFor = currentUserId;
      }

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
  };


  const handlePeriodSelect = (selectedPeriod: Period) => {
    console.log(" Period selected:", selectedPeriod);

    setPeriod(selectedPeriod);
    setDropdownVisible(false);

    // Call loadLeaderboard immediately with new period
    loadLeaderboard(true, selectedPeriod);
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerTitle}>
          <View style={styles.trophyIcon}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        <Text style={styles.subtitle}>
          Top riders by RC spent • {getCurrentPeriodLabel()}
        </Text>
      </View>

      {/* Dropdown */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
          activeOpacity={0.7}
        >
          <Ionicons name={getCurrentPeriodIcon() as any} size={16} color="#3B82F6" />
          <Text style={styles.dropdownButtonText}>{getCurrentPeriodLabel()}</Text>
          <Ionicons
            name={dropdownVisible ? "chevron-up" : "chevron-down"}
            size={16}
            color="#64748B"
          />
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
            <View style={styles.dropdownMenu}>
              {periodOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.dropdownItem,
                    period === option.key && styles.dropdownItemActive,
                  ]}
                  onPress={() => handlePeriodSelect(option.key)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={period === option.key ? "#3B82F6" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      period === option.key && styles.dropdownItemTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {period === option.key && (
                    <Ionicons name="checkmark" size={16} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {shouldShowUserRank && (
        <View style={styles.userRankCard}>
          <View style={styles.userRankContent}>
            <View style={styles.userRankLeft}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>#{userRank.rank}</Text>
              </View>
              <View>
                <Text style={styles.userRankTitle}>Your Rank</Text>
                <Text style={styles.userRankSubtitle}>
                  {userRank.rank === 1
                    ? "You're #1! 🎉"
                    : userRank.rank <= 10
                    ? "Great job! 🚀"
                    : "Keep riding to climb! 💪"}
                </Text>
              </View>
            </View>
            <View style={styles.userRankRight}>
              <Text style={styles.userRankRC}>
                {formatRC(userRank.totalRCSpent)}
              </Text>
              <Text style={styles.userRankLabel}>RC SPENT</Text>
            </View>
          </View>
        </View>
      )}

      {currentUserId && !shouldShowUserRank && !loading && (
        <View style={styles.noRankCard}>
          <View style={styles.noRankContent}>
            <Ionicons name="bicycle" size={20} color="#64748B" />
            <Text style={styles.noRankText}>
              Complete your first ride to get ranked!
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
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
              const isCurrentUser =
                String(entry.userId) === String(currentUserId);
              const rankEmoji = getRankIcon(rank);

              return (
                <View
                  key={`${entry.userId}-${rank}-${period}-${forceRefresh}`}
                  style={[
                    styles.leaderboardItem,
                    isCurrentUser && styles.leaderboardItemHighlight,
                    rank <= 3 && styles.leaderboardItemTop,
                  ]}
                >
                  <View
                    style={[
                      styles.rankCircle,
                      rank <= 3 && {
                        backgroundColor: getRankColor(rank),
                        borderWidth: 0,
                      },
                    ]}
                  >
                    {rankEmoji ? (
                      <Text style={styles.rankEmoji}>{rankEmoji}</Text>
                    ) : (
                      <Text
                        style={[
                          styles.rankNumber,
                          rank <= 3 && styles.rankNumberTop,
                        ]}
                      >
                        {rank}
                      </Text>
                    )}
                  </View>

                  <View style={styles.userInfo}>
                    <Text
                      style={[
                        styles.userName,
                        isCurrentUser && styles.userNameHighlight,
                      ]}
                      numberOfLines={1}
                    >
                      {entry.userName || "Anonymous Rider"}
                      {isCurrentUser && (
                        <Text style={styles.youBadge}> (You)</Text>
                      )}
                    </Text>
                    <Text style={styles.userStats}>
                      {entry.rides} {entry.rides === 1 ? "ride" : "rides"} •{" "}
                      {getCurrentPeriodLabel()}
                    </Text>
                  </View>

                  <View style={styles.rcSection}>
                    <Text
                      style={[
                        styles.rcAmount,
                        rank <= 3 && { color: getRankColor(rank) },
                      ]}
                    >
                      {formatRC(entry.totalRCSpent)}
                    </Text>
                    <Text style={styles.rcLabel}>RC SPENT</Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trophyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginLeft: 52,
    fontWeight: "500",
  },
  dropdownContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#F0F9FF",
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  dropdownItemTextActive: {
    color: "#0F172A",
    fontWeight: "600",
  },
  userRankCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#667EEA",
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  userRankContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRankLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  rankBadgeText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  userRankTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userRankSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  userRankRight: {
    alignItems: "flex-end",
  },
  userRankRC: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  userRankLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    marginTop: 2,
  },
  noRankCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    padding: 16,
  },
  noRankContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  noRankText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  centerMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 6,
    textAlign: "center",
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  leaderboardItemHighlight: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
    borderWidth: 1.5,
  },
  leaderboardItemTop: {
    borderWidth: 0,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  rankEmoji: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748B",
  },
  rankNumberTop: {
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  userNameHighlight: {
    color: "#92400E",
  },
  youBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
  userStats: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  rcSection: {
    alignItems: "flex-end",
  },
  rcAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: "#3B82F6",
  },
  rcLabel: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 1,
  },
});

export default Leaderboard;