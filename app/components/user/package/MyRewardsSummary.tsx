// src/components/user/package/MyRewardsSummary.tsx
import { fetchMyRewards, MonthlyReward } from "@/api/rewards";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MyRewardsSummaryProps {
  refreshKey?: number;
}

interface MonthlyRewardSummary {
  month: string;
  totalReward: number;
  bestRank: number | null;
  entries: number;
}

const MyRewardsSummary: React.FC<MyRewardsSummaryProps> = ({ refreshKey = 0 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<MonthlyReward[]>([]);
  const [expanded, setExpanded] = useState(false);

  const loadRewards = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetchMyRewards();
      setRewards(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error(" MyRewardsSummary loadRewards error:", err);
      setRewards([]);
      setError(err?.message || "Unable to load rewards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRewards();
  }, [loadRewards, refreshKey]);

  const totalEarned = useMemo(() => {
    return rewards.reduce((acc, reward) => acc + Number(reward.rewardRC || 0), 0);
  }, [rewards]);

  const latestReward = useMemo(() => {
    if (rewards.length === 0) {
      return null;
    }

    return [...rewards].sort((a, b) => {
      const createdA = new Date(a.createdAt || a.month).getTime();
      const createdB = new Date(b.createdAt || b.month).getTime();
      return createdB - createdA;
    })[0];
  }, [rewards]);

  const monthlySummaries = useMemo<MonthlyRewardSummary[]>(() => {
    const map = new Map<string, MonthlyRewardSummary>();

    rewards.forEach((reward) => {
      const key = reward.month || "";
      const current = map.get(key);
      const rewardValue = Number(reward.rewardRC || 0);
      const rewardRank = typeof reward.rank === "number" ? reward.rank : null;

      if (current) {
        current.totalReward += rewardValue;
        current.entries += 1;
        if (rewardRank !== null) {
          current.bestRank = current.bestRank !== null ? Math.min(current.bestRank, rewardRank) : rewardRank;
        }
      } else {
        map.set(key, {
          month: key,
          totalReward: rewardValue,
          bestRank: rewardRank,
          entries: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      return parseMonthToTime(b.month) - parseMonthToTime(a.month);
    });
  }, [rewards]);

  const displaySummaries = useMemo(() => {
    if (expanded) {
      return monthlySummaries;
    }
    return monthlySummaries.slice(0, 4);
  }, [monthlySummaries, expanded]);

  const remainingCount = useMemo(() => {
    if (expanded) {
      return 0;
    }
    return Math.max(monthlySummaries.length - 4, 0);
  }, [monthlySummaries, expanded]);

  const formattedTotal = useMemo(() => formatNumber(totalEarned), [totalEarned]);

  const handleToggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.minimizedBar, expanded && styles.minimizedBarActive]}
        onPress={handleToggleExpanded}
      >
        <View style={styles.minimizedContent}>
          <View style={styles.minimizedIconWrapper}>
            <Ionicons name="gift-outline" size={20} color="#FFD700" />
          </View>
          <Text style={styles.minimizedLabel}>My Rewards</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {expanded && (
        <LinearGradient
          colors={["#083A4C", "#0E6B64", "#37A77D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.headerRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="gift-outline" size={26} color="#FFD700" />
            </View>
            <View style={styles.headerTextGroup}>
              <Text style={styles.title}>Monthly Rewards</Text>
              <Text style={styles.subtitle}>
                Celebrate your RC bonuses for staying on top of the leaderboard.
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingLabel}>Loading your rewards…</Text>
            </View>
          ) : error ? (
            <TouchableOpacity
              style={styles.errorState}
              onPress={loadRewards}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.errorLabel}>{error}</Text>
              <Text style={styles.errorHint}>Tap to retry</Text>
            </TouchableOpacity>
          ) : rewards.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="trophy-outline" size={22} color="#37A77D" />
              </View>
              <Text style={styles.emptyTitle}>No rewards just yet</Text>
              <Text style={styles.emptySubtitle}>
                Climb the leaderboard to unlock monthly RC bonuses.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total rewards earned</Text>
                <View style={styles.totalValueRow}>
                  <Ionicons name="flash-outline" size={18} color="#FFD700" />
                  <Text style={styles.totalValue}>{formattedTotal} RC</Text>
                </View>
                {latestReward && (
                  <Text style={styles.latestDetail}>
                    Latest reward · {formatMonth(latestReward.month)} · Rank #{latestReward.rank ?? "-"}
                  </Text>
                )}
              </View>

              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Recorded months</Text>
                  <View style={styles.historyBadge}>
                    <Ionicons name="time-outline" size={14} color="#083A4C" />
                    <Text style={styles.historyBadgeText}>{monthlySummaries.length} total</Text>
                  </View>
                </View>
                {displaySummaries.map((summary) => (
                  <View style={styles.historyItem} key={summary.month}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyMonth}>{formatMonth(summary.month)}</Text>
                      <Text style={styles.historyMeta}>
                        Rank {summary.bestRank ? `#${summary.bestRank}` : "—"}
                        {summary.entries > 1 ? ` · ${summary.entries} rewards` : ""}
                      </Text>
                    </View>
                    <View style={styles.historyReward}>
                      <Ionicons name="cash-outline" size={16} color="#37A77D" />
                      <Text style={styles.historyRewardText}>+{formatNumber(summary.totalReward)} RC</Text>
                    </View>
                  </View>
                ))}
                {remainingCount > 0 && (
                  <Text style={styles.moreHint}>
                    + {remainingCount} more month{remainingCount === 1 ? "" : "s"} recorded
                  </Text>
                )}
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.collapseButton}
            onPress={handleToggleExpanded}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-up" size={16} color="#FFFFFF" />
            <Text style={styles.collapseLabel}>Show less</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
};

function parseMonthToTime(month: string): number {
  if (!month) {
    return 0;
  }

  const parts = month.split("-");
  if (parts.length >= 2) {
    const year = Number(parts[0]);
    const monthIndex = Number(parts[1]) - 1;
    if (!Number.isNaN(year) && !Number.isNaN(monthIndex)) {
      return new Date(year, monthIndex, 1).getTime();
    }
  }

  const fallback = new Date(month).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}

function formatMonth(month: string): string {
  const timestamp = parseMonthToTime(month);
  if (!timestamp) {
    return month || "-";
  }

  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    console.error(" formatMonth failed:", error);
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const monthIndex = date.getMonth() + 1;
    return `${year}-${String(monthIndex).padStart(2, "0")}`;
  }
}

function formatNumber(value: number): string {
  try {
    return Math.floor(value).toLocaleString();
  } catch (error) {
    console.error(" formatNumber failed:", error);
    return String(Math.floor(value));
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  minimizedBar: {
    backgroundColor: "#0E6B64",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#083A4C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  minimizedBarActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  minimizedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  minimizedIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  minimizedLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  card: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#083A4C",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    fontWeight: "500",
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  loadingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
  },
  errorState: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,58,76,0.55)",
    gap: 6,
  },
  errorLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  errorHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "500",
  },
  totalCard: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: "rgba(8,58,76,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.75)",
    fontWeight: "700",
  },
  totalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  latestDetail: {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  historyCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  historyTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  historyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  historyBadgeText: {
    color: "#083A4C",
    fontSize: 11,
    fontWeight: "700",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  historyLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyMonth: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  historyReward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyRewardText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  moreHint: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
  },
  collapseButton: {
    marginTop: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
  },
  collapseLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});

export default MyRewardsSummary;
