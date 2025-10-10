import {
  Package,
  deletePackage,
  fetchPackages,
} from "@/api/package";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddBtn from "../components/AddBtn";
import AddOrEditPackageDialog from "../components/admin/PackageManagement/AddOrEditPackageDialog";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import Loader from "../components/Loader";
import StatsHeader from "../components/admin/PackageManagement/StatsHeader";

const PackageManagement = () => {
  const [packageModalVisible, setPackageModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<Package | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    data: packageData,
    isFetching: isPackageLoading,
  } = useQuery({
    queryKey: ["package-data"],
    queryFn: fetchPackages,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return packageData ?? [];

    const tokens = term.split(/\s+/); // split query into words

    return (packageData ?? []).filter((p: Package) => {
      const name = (p.name || "").toLowerCase();
      if (!name.startsWith(tokens[0])) return false; // must start with first word
      // remaining tokens must appear after in order
      let idx = tokens[0].length;
      for (let i = 1; i < tokens.length; i++) {
        const pos = name.indexOf(tokens[i], idx);
        if (pos === -1) return false;
        idx = pos + tokens[i].length;
      }
      return true;
    });
  }, [packageData, search]);

  const queryClient = useQueryClient();
  const { mutate: deletePackageMutation, isPending: isDeleting } = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      alert("Package Deleted Successfully");
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["package-data"] });
    },
    onError: (data) => {
      alert("Package Delete Failed");
      console.log(data);
    },
  });

  const formatLKR = (n: number) =>
    `LKR ${Number(n || 0).toLocaleString("en-LK")}`;

  const formatDateTime = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    // e.g., Oct 8, 2025 • 09:15 AM
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header row: title + Add button */}
        <View style={styles.topRow}>
          
          <AddBtn
            title="Add New Package"
            backgroundColor="#083A4C"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            iconSize={22}
            onPress={() => {
              setSelectedData(null);
              setPackageModalVisible(true);
            }}
          />
        </View>
<StatsHeader
  totalPackages={packageData ? packageData.length : 0}
  filteredCount={filtered.length}
  totalActive={
    packageData
      ? packageData.filter((pkg: Package & { activationCount?: number }) => pkg.activationCount && pkg.activationCount > 0).length
      : 0
  }
  // optional taps:
  onPressTotal={() => {}}
  onPressMatching={() => {}}
  onPressActive={() => {}}
/>

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search packages by name..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialIcons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        

        {isPackageLoading && (
          <View style={{ padding: 24, margin: 8 }}>
            <Loader textStyle={{ fontSize: 20 }} showText={false} />
          </View>
        )}

        {/* Empty state */}
        {!isPackageLoading && (packageData ?? []).length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="inventory-2" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No packages yet</Text>
            <Text style={styles.emptyText}>
              Click “Add New Package” to create your first plan.
            </Text>
          </View>
        )}

        {/* No results for search */}
        {!isPackageLoading &&
          (packageData ?? []).length > 0 &&
          filtered.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No matches</Text>
              <Text style={styles.emptyText}>
                We couldn’t find any package named “{search}”.
              </Text>
            </View>
          )}

        <ScrollView style={{ marginTop: 10 }}>
          {filtered.map((pkg: Package & { activationCount?: number; createdAt?: string }) => (
            <View key={pkg._id} style={styles.card}>
              {/* Header: icon + name + actions */}
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  {pkg.icon ? (
                    <Image
                      source={{ uri: pkg.icon }}
                      style={styles.icon}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.iconPlaceholder}>
                      <MaterialIcons name="image-not-supported" size={22} color="#9CA3AF" />
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.pkgName}>{pkg.name}</Text>
                    <Text style={styles.subtleLine}>
                      Created • {formatDateTime(pkg.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={styles.roundBtn}
                    onPress={() => {
                      setSelectedData(pkg);
                      setPackageModalVisible(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={20} color="#2563EB" />
                  </TouchableOpacity>

                  <View style={{ width: 8 }} />

                  <TouchableOpacity
                    style={styles.roundBtn}
                    onPress={() => {
                      setSelectedData(pkg);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Badges row */}
              <View style={styles.badgesRow}>
                <View style={[styles.badge, { backgroundColor: "#EEF2FF" }]}>
                  <MaterialIcons name="bolt" size={14} color="#4F46E5" />
                  <Text style={[styles.badgeText, { color: "#4338CA" }]}>
                    {pkg.activationCount ?? 0} Active
                  </Text>
                </View>

                <View style={[styles.badge, { backgroundColor: "#ECFEFF" }]}>
                  <MaterialIcons name="schedule" size={14} color="#0891B2" />
                  <Text style={[styles.badgeText, { color: "#0E7490" }]}>
                    {pkg.timePeriod} days
                  </Text>
                </View>

                {pkg.recommended && (
                  <View style={[styles.badge, { backgroundColor: "#FEF3C7" }]}>
                    <MaterialIcons name="star" size={14} color="#F59E0B" />
                    <Text style={[styles.badgeText, { color: "#D97706" }]}>
                      Recommended
                    </Text>
                  </View>
                )}
              </View>

              {/* Key details */}
              <View style={styles.detailRow}>
                <MaterialIcons name="paid" size={18} color="#059669" />
                <Text style={styles.detailLabel}>Price</Text>
                <Text style={styles.detailValue}>{formatLKR(pkg.price)}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialIcons name="token" size={18} color="#374151" />
                <Text style={styles.detailLabel}>RideOn Coins</Text>
                <Text style={styles.detailValue}>{pkg.rc}</Text>
              </View>

              {/* Description */}
              <Text style={styles.description}>{pkg.description}</Text>
            </View>
          ))}
          <View style={{ height: 160 }} />
        </ScrollView>

        {packageModalVisible && (
          <AddOrEditPackageDialog
            visible={packageModalVisible}
            onClose={() => {
              setSelectedData(null);
              setPackageModalVisible(false);
            }}
            defaultValues={selectedData ?? undefined}
          />
        )}

        {deleteDialogOpen && (
          <DeleteConfirmationModal
            open={deleteDialogOpen}
            title="Remove Package Confirmation"
            content={
              <View style={styles.warningBox}>
                <Text style={{ color: "#4B5563", marginBottom: 6 }}>
                  Are you sure you want to remove this Package?
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons name="warning-amber" size={20} color="orange" />
                  <Text style={{ color: "#EF4444", fontWeight: "600", marginLeft: 6 }}>
                    This action is not reversible.
                  </Text>
                </View>
              </View>
            }
            handleClose={() => setDeleteDialogOpen(false)}
            deleteFunc={async () => {
              if (selectedData?._id) {
                deletePackageMutation(selectedData._id);
              }
              setDeleteDialogOpen(false);
            }}
            onSuccess={() => {}}
            handleReject={() => {}}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
  container: { flex: 1, paddingHorizontal: 12 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  pageTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  roundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },
  iconPlaceholder: {
    width: 56,
    height: 56,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  pkgName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtleLine: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailLabel: { marginLeft: 6, color: "#6B7280", fontSize: 13, width: 110 },
  detailValue: { color: "#111827", fontSize: 14, fontWeight: "600" },

  description: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#374151",
  },

  warningBox: {
    backgroundColor: "#FFEDD5",
    width: "100%",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DC2626",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  emptyText: { fontSize: 13, color: "#6B7280" },
});

export default PackageManagement;
