import {
  Package as AdminPackage,
  fetchActiveUserPackages,
  fetchPackages,
  fetchUserRcTotal,
} from "@/api/package";
import { createPayHereSession, fetchPayHereStatus } from "@/api/payment";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Leaderboard from "../components/user/package/Leaderboard";
import PackageCardRider from "../components/user/package/PackageCardRider";
import PurchaseConfirmModal, {
  PurchaseConfirmData,
} from "../components/user/package/PurchaseConfirmModal";
import RCBalanceHeader from "../components/user/package/RCBalanceHeader";
import SegmentedTabs from "../components/user/package/SegmentedTabs";

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
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [userRc, setUserRc] = useState<number>(0);
  const [actionBusy, setActionBusy] = useState(false);

  const [paySession, setPaySession] = useState<
    | {
        endpoint: string;
        payload: Record<string, string | number | boolean>;
      }
    | null
  >(null);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [webviewLoading, setWebviewLoading] = useState(false);

  // confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<PurchaseConfirmData | null>(null);

  // ----------------------
  // Data load function
  // ----------------------
    const loadData = useCallback(async () => {
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
      console.error("Reward loadData error:", err);
      setAvailable([]);
      setActive([]);
      setUserRc(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------
  // Initial load
  // ----------------------
    useEffect(() => {
      loadData();
    }, [loadData]);

  // ----------------------
  // Pull-to-refresh
  // ----------------------
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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
  const resetPaymentState = () => {
    setPaySession(null);
    setPaymentOrderId(null);
    setPaymentVisible(false);
    setPaymentBusy(false);
    setWebviewLoading(false);
  };

  const buildFormBody = (data: Record<string, string | number | boolean>) =>
    Object.entries(data)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        const normalized =
          typeof value === "boolean" ? (value ? "true" : "false") : String(value);
        const safe = normalized.startsWith("undefined") ? "" : normalized;
        return `${encodeURIComponent(key)}=${encodeURIComponent(safe)}`;
      })
      .join("&");

  const pollPaymentStatus = useCallback(
    async (orderId: string) => {
      setPaymentBusy(true);
      try {
        const maxAttempts = 6;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          try {
            const res = await fetchPayHereStatus(orderId);
            const status = res?.status?.toUpperCase?.() || "";

            if (status === "PAID") {
              await loadData();
              setActiveTab("Active");
              Alert.alert("Success", "Package activated successfully");
              return;
            }

            if (["FAILED", "CANCELLED", "ERROR"].includes(status)) {
              Alert.alert("Payment", "Payment was not completed.");
              return;
            }
          } catch (statusErr: any) {
            console.error("payhere status error", statusErr?.message);
          }

          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        Alert.alert(
          "Pending",
          "Payment confirmation is still pending. Please check your packages shortly."
        );
      } finally {
        setPaymentBusy(false);
      }
    },
    [loadData]
  );

  const handlePaymentResult = useCallback(
    async (result: "success" | "cancel") => {
      const orderId = paymentOrderId;

      if (!orderId) {
        resetPaymentState();
        return;
      }

      if (result === "success") {
        await pollPaymentStatus(orderId);
        resetPaymentState();
      } else {
        resetPaymentState();
        Alert.alert("Payment", "Payment was cancelled.");
      }
    },
    [paymentOrderId, pollPaymentStatus]
  );

  const onWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const msg = (event.nativeEvent.data || "").toLowerCase();
      if (msg === "success") {
        handlePaymentResult("success");
      } else if (msg === "cancel") {
        handlePaymentResult("cancel");
      }
    },
    [handlePaymentResult]
  );

  const confirmBuy = async (id: string) => {
    if (Platform.OS !== "android") {
      Alert.alert(
        "Unavailable",
        "PayHere checkout is currently supported on Android only."
      );
      return;
    }

    setActionBusy(true);
    try {
      const session = await createPayHereSession(id);
      if (!session?.success) {
        throw new Error("Unable to initialise payment");
      }

      const orderId = String(
        (session.payload.order_id as string) ||
          (session.payload.orderId as string) ||
          ""
      );

      if (!orderId) {
        throw new Error("Missing order reference from PayHere");
      }

      const patchedPayload = {
        ...session.payload,
        return_url:
          (session.payload.return_url as string)?.startsWith("undefined")
            ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/payments/payhere/mobile/return`
            : session.payload.return_url,
        cancel_url:
          (session.payload.cancel_url as string)?.startsWith("undefined")
            ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/payments/payhere/mobile/cancel`
            : session.payload.cancel_url,
        notify_url:
          (session.payload.notify_url as string)?.startsWith("undefined")
            ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/payments/payhere/notify`
            : session.payload.notify_url,
      };

      setPaySession({ endpoint: session.endpoint, payload: patchedPayload });
      setPaymentOrderId(orderId);
      setPaymentVisible(true);
      setConfirmOpen(false);
      setSelected(null);
    } catch (e: any) {
      console.error(
        "create payhere session error",
        {
          status: e?.response?.status,
          data: e?.response?.data,
          message: e?.message,
          url: e?.config?.url,
        }
      );
      Alert.alert(
        "Payment",
        e?.response?.data?.message || e?.message || "Could not start payment"
      );
    } finally {
      setActionBusy(false);
    }
  };

  const cancelPaymentFlow = useCallback(() => {
    resetPaymentState();
    Alert.alert("Payment", "Payment flow closed.");
  }, []);

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

          {/* List with pull-to-refresh */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 103,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0F172A"]}
                tintColor="#0F172A"
              />
            }
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
        busy={actionBusy}
        onClose={() => {
          setConfirmOpen(false);
          setSelected(null);
        }}
        onConfirm={confirmBuy}
      />

      <Modal
        visible={paymentVisible && !!paySession}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={cancelPaymentFlow}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0F172A" }}>
          <View style={styles.payHeader}>
            <View>
              <Text style={styles.payTitle}>PayHere Checkout</Text>
              <Text style={styles.paySubtitle}>Complete the payment to activate</Text>
            </View>
            <TouchableOpacity onPress={cancelPaymentFlow} style={styles.closePaymentBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {paySession && (
            <View style={{ flex: 1 }}>
              <WebView
                originWhitelist={["*"]}
                startInLoadingState
                javaScriptEnabled
                onLoadStart={() => setWebviewLoading(true)}
                onLoadEnd={() => setWebviewLoading(false)}
                onMessage={onWebViewMessage}
                source={{
                  uri: paySession.endpoint,
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: buildFormBody(paySession.payload),
                }}
              />
              {(webviewLoading || paymentBusy) && (
                <View style={styles.webviewOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.webviewOverlayText}>
                    {paymentBusy ? "Verifying payment..." : "Loading checkout..."}
                  </Text>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  payHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  payTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },
  paySubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  closePaymentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  webviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  webviewOverlayText: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Reward;
