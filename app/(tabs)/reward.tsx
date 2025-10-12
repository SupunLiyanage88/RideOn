import {
  activateUserPackage,
  Package as AdminPackage,
  fetchActiveUserPackages,
  fetchPackages,
  fetchUserRcTotal,
} from "@/api/package";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PackageCardRider from "../components/user/package/PackageCardRider";
import SegmentedTabs from "../components/user/package/SegmentedTabs";
import RCBalanceHeader from "../components/user/package/RCBalanceHeader";
import PurchaseConfirmModal, {
  PurchaseConfirmData,
} from "../components/user/package/PurchaseConfirmModal";
import Leaderboard from "../components/user/package/Leaderboard";

type AvailablePackage = AdminPackage & {
  activationCount?: number;
  createdAt?: string;
  timePeriod?: number;
};

type ActiveUserPackage = {
  _id: string;
  name: string;
  price: number;
  description: string;
  rc: number;
  timePeriod: number;
  icon: string;
  activatedAt: string;
  expiresAt: string;
  daysRemaining: number;
};

type Tab = "Available" | "Active" | "Leaderboard";

const Reward = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Available");
  const [available, setAvailable] = useState<AvailablePackage[]>([]);
  const [active, setActive] = useState<ActiveUserPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [userRc, setUserRc] = useState<number>(0);

  // confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<PurchaseConfirmData | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setAvailable([]);
          setActive([]);
          setUserRc(0);
          return;
        }
        const [allPkgs, activePkgs, rcTotal] = await Promise.all([
          fetchPackages().catch(() => []),
          fetchActiveUserPackages().catch(() => []),
          fetchUserRcTotal().catch(() => 0),
        ]);
        setAvailable(Array.isArray(allPkgs) ? allPkgs : []);
        setActive(Array.isArray(activePkgs) ? activePkgs : []);
        setUserRc(rcTotal);
      } catch (err) {
        console.error("Reward init error:", err);
        setAvailable([]);
        setActive([]);
        setUserRc(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const listShown = activeTab === "Available" ? available : active;

  const filtered = useMemo(() => {
    if (activeTab === "Leaderboard") return [];
    const term = search.trim().toLowerCase();
    if (!term) return listShown as any[];
    return (listShown as any[]).filter((p: any) =>
      (p.name || "").toLowerCase().includes(term)
    );
  }, [listShown, search, activeTab]);

  // Open modal with details
  const openConfirm = (id: string) => {
    const pkg = available.find((p) => p._id === id);
    if (!pkg) return;
    setSelected({
      id: pkg._id,
      name: pkg.name,
      rc: pkg.rc,
      price: pkg.price,
      timePeriod: pkg.timePeriod,
      icon: pkg.icon,
      description: pkg.description,
      recommended: pkg.recommended,
    });
    setConfirmOpen(true);
  };

  // Confirm -> do the purchase then refresh lists
  const confirmBuy = async (id: string) => {
    try {
      setLoading(true);
      const resp = await activateUserPackage(id);
      const [activePkgs, rc] = await Promise.all([
        fetchActiveUserPackages().catch(() => []),
        fetchUserRcTotal().catch(() => 0),
      ]);
      setActive(activePkgs);
      setUserRc(rc);
      Alert.alert("Success", resp?.message || "Package activated successfully");
      setActiveTab("Active");
    } catch (e: any) {
      console.error("activate error:", e?.response?.data || e?.message);
      Alert.alert("Error", e?.response?.data?.message || "Activation failed");
    } finally {
      setConfirmOpen(false);
      setSelected(null);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RC Packages</Text>
        <Text style={styles.subtitle}>Explore and manage your packages</Text>
      </View>

      {/* RC Balance Header Component */}
      {activeTab !== "Leaderboard" && <RCBalanceHeader userRc={userRc} />}

      {/* Tabs */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <SegmentedTabs
          options={[
            { key: "Available", label: "Available" },
            { key: "Active", label: "Active" },
            { key: "Leaderboard", label: "Leaderboard" },
          ]}
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as Tab)}
        />
      </View>

      {/* Conditional Rendering based on Tab */}
      {activeTab === "Leaderboard" ? (
        <Leaderboard theme="light" />
      ) : (
        <>
          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab.toLowerCase()} packages`}
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Ionicons
                name="close-circle"
                size={18}
                color="#9CA3AF"
                onPress={() => setSearch("")}
              />
            )}
          </View>

          {/* List */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 103,
            }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.centerMessage}>
                <Ionicons name="reload-circle" size={48} color="#6B7280" />
                <Text style={styles.messageText}>Loading packages...</Text>
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.centerMessage}>
                <Ionicons
                  name={search ? "search-outline" : "gift-outline"}
                  size={48}
                  color="#9CA3AF"
                />
                <Text style={styles.messageTitle}>
                  {search
                    ? "No matches found"
                    : `No ${activeTab.toLowerCase()} packages`}
                </Text>
                <Text style={styles.messageSubtitle}>
                  {search
                    ? `Try a different search term`
                    : activeTab === "Available"
                    ? "Check back later for new packages"
                    : "Purchase packages to see them here"}
                </Text>
              </View>
            ) : activeTab === "Available" ? (
              (filtered as AvailablePackage[]).map((p) => (
                <PackageCardRider
                  key={p._id}
                  theme="light"
                  variant="available"
                  id={p._id}
                  name={p.name}
                  rc={p.rc}
                  price={p.price}
                  timePeriod={p.timePeriod}
                  icon={p.icon}
                  recommended={p.recommended}
                  onBuy={openConfirm}
                />
              ))
            ) : (
              (filtered as ActiveUserPackage[]).map((p) => (
                <PackageCardRider
                  key={p._id}
                  theme="light"
                  variant="active"
                  id={p._id}
                  name={p.name}
                  rc={p.rc}
                  price={p.price}
                  icon={p.icon}
                  daysRemaining={p.daysRemaining}
                />
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Confirmation Modal */}
      <PurchaseConfirmModal
        visible={confirmOpen}
        data={selected}
        busy={loading}
        onClose={() => {
          setConfirmOpen(false);
          setSelected(null);
        }}
        onConfirm={confirmBuy}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 0,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
  },
  centerMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  messageText: {
    color: "#6B7280",
    fontSize: 15,
    marginTop: 12,
    fontWeight: "500",
  },
  messageTitle: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  messageSubtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default Reward;