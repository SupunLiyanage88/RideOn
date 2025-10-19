import {
    deletePayment,
    fetchPayments,
    PaymentRecord,
} from "@/api/payment";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import Loader from "../components/Loader";

const statusPalette: Record<PaymentRecord["status"], { bg: string; text: string }> = {
	PENDING: { bg: "#FEF3C7", text: "#92400E" },
	PAID: { bg: "#DCFCE7", text: "#166534" },
	FAILED: { bg: "#FEE2E2", text: "#991B1B" },
	CANCELLED: { bg: "#E5E7EB", text: "#374151" },
};

const PaymentManagement = () => {
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<PaymentRecord | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const queryClient = useQueryClient();
	const {
		data: payments = [],
		isFetching,
	} = useQuery({
		queryKey: ["payments"],
		queryFn: fetchPayments,
	});

	const stats = useMemo(() => {
		const total = payments.length;
		const paid = payments.filter((p) => p.status === "PAID").length;
		const pending = payments.filter((p) => p.status === "PENDING").length;
		const totalLkr = payments
			.filter((p) => p.status === "PAID")
			.reduce((sum, p) => sum + (p.amount || 0), 0);
		return { total, paid, pending, totalLkr };
	}, [payments]);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (!term) return payments;
		return payments.filter((payment) => {
			const order = payment.orderId?.toLowerCase?.() ?? "";
			const user = `${payment.userId?.firstName ?? ""} ${payment.userId?.lastName ?? ""}`
				.trim()
				.toLowerCase();
			const email = payment.userId?.email?.toLowerCase?.() ?? "";
			const pkg = payment.packageId?.name?.toLowerCase?.() ?? "";
			return (
				order.includes(term) ||
				user.includes(term) ||
				email.includes(term) ||
				pkg.includes(term)
			);
		});
	}, [payments, search]);

		const { mutateAsync: deletePaymentMutation, isPending: isDeleting } = useMutation({
		mutationFn: deletePayment,
		onSuccess: () => {
			Alert.alert("Payment removed", "The payment record was deleted successfully.");
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
		onError: (error: any) => {
			Alert.alert(
				"Deletion failed",
				error?.response?.data?.message || "Unable to delete the payment right now."
			);
		},
	});

	const formatAmount = (amount?: number, currency?: string) =>
		`${currency ?? "LKR"} ${Number(amount ?? 0).toLocaleString("en-LK", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;

	const formatDate = (iso?: string) => {
		if (!iso) return "-";
		try {
			return new Date(iso).toLocaleString("en-GB", {
				year: "numeric",
				month: "short",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			});
		} catch (error) {
			return iso;
		}
	};

	return (
		<SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
			<View style={styles.container}>
				<Text style={styles.title}>Payment Management</Text>
				<Text style={styles.subtitle}>
					Review PayHere transactions and remove obsolete entries.
				</Text>

				<View style={styles.statsRow}>
					<View style={styles.statCard}>
						<Text style={styles.statLabel}>Total Payments</Text>
						<Text style={styles.statValue}>{stats.total}</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statLabel}>Paid</Text>
						<Text style={[styles.statValue, { color: "#15803D" }]}>{stats.paid}</Text>
					</View>
				</View>

				<View style={styles.statsRow}>
					<View style={styles.statCard}>
						<Text style={styles.statLabel}>Pending</Text>
						<Text style={[styles.statValue, { color: "#B45309" }]}>{stats.pending}</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statLabel}>Paid Volume</Text>
						<Text style={styles.statValue}>{formatAmount(stats.totalLkr, "LKR")}</Text>
					</View>
				</View>

				<View style={styles.searchWrap}>
					<MaterialIcons name="search" size={20} color="#6B7280" />
					<TextInput
						placeholder="Search by user, email, package, or order ID"
						placeholderTextColor="#9CA3AF"
						value={search}
						onChangeText={setSearch}
						autoCorrect={false}
						style={styles.searchInput}
					/>
					{!!search && (
						<TouchableOpacity onPress={() => setSearch("")}>
							<MaterialIcons name="close" size={18} color="#9CA3AF" />
						</TouchableOpacity>
					)}
				</View>

				{isFetching && (
					<View style={{ padding: 24 }}>
						<Loader textStyle={{ fontSize: 18 }} showText={false} />
					</View>
				)}

				{!isFetching && payments.length === 0 && (
					<View style={styles.emptyState}>
						<MaterialIcons name="payments" size={48} color="#9CA3AF" />
						<Text style={styles.emptyTitle}>No payments recorded</Text>
						<Text style={styles.emptyText}>
							Payments captured through PayHere will appear here automatically.
						</Text>
					</View>
				)}

				{!isFetching && payments.length > 0 && filtered.length === 0 && (
					<View style={styles.emptyState}>
						<MaterialIcons name="search-off" size={48} color="#9CA3AF" />
						<Text style={styles.emptyTitle}>No matches found</Text>
						<Text style={styles.emptyText}>
							Try a different keyword to locate the payment you need.
						</Text>
					</View>
				)}

				<ScrollView
					style={{ flex: 1, marginTop: 12 }}
					contentContainerStyle={{ paddingBottom: 160 }}
					showsVerticalScrollIndicator={false}
				>
					{filtered.map((payment) => {
						const palette = statusPalette[payment.status] ?? statusPalette.PENDING;
						return (
							<View key={payment._id} style={styles.card}>
								<View style={styles.cardHeader}>
									<View style={{ flex: 1 }}>
										<Text style={styles.orderId}>{payment.orderId}</Text>
										<Text style={styles.metaLine}>
											{payment.userId?.firstName || payment.userId?.lastName
												? `${payment.userId?.firstName ?? ""} ${payment.userId?.lastName ?? ""}`.trim()
												: payment.userId?.email ?? "Unknown user"}
										</Text>
										{payment.userId?.email ? (
											<Text style={styles.metaSub}>{payment.userId.email}</Text>
										) : null}
									</View>
									<View style={[styles.statusBadge, { backgroundColor: palette.bg }]}> 
										<Text style={[styles.statusText, { color: palette.text }]}>
											{payment.status}
										</Text>
									</View>
								</View>

								<View style={styles.detailRow}>
									<MaterialIcons name="mediation" size={18} color="#2563EB" />
									<Text style={styles.detailLabel}>Package</Text>
									<Text style={styles.detailValue}>
										{payment.packageId?.name ?? "Removed package"}
									</Text>
								</View>

								<View style={styles.detailRow}>
									<MaterialIcons name="payments" size={18} color="#059669" />
									<Text style={styles.detailLabel}>Amount</Text>
									<Text style={styles.detailValue}>
										{formatAmount(payment.amount, payment.currency)}
									</Text>
								</View>

								<View style={styles.detailRow}>
									<MaterialIcons name="schedule" size={18} color="#6B7280" />
									<Text style={styles.detailLabel}>Created</Text>
									<Text style={styles.detailValue}>{formatDate(payment.createdAt)}</Text>
								</View>

								<View style={styles.detailRow}>
									<MaterialIcons name="update" size={18} color="#6B7280" />
									<Text style={styles.detailLabel}>Updated</Text>
									<Text style={styles.detailValue}>{formatDate(payment.updatedAt)}</Text>
								</View>

								<TouchableOpacity
									style={styles.deleteBtn}
									onPress={() => {
										setSelected(payment);
										setDeleteDialogOpen(true);
									}}
								>
									<MaterialIcons name="delete-outline" size={18} color="#B91C1C" />
									<Text style={styles.deleteText}>Delete</Text>
								</TouchableOpacity>
							</View>
						);
					})}
				</ScrollView>

				{deleteDialogOpen && (
					<DeleteConfirmationModal
						open={deleteDialogOpen}
						title="Delete Payment"
						content={
							<View style={styles.dialogContent}>
								<Text style={styles.dialogText}>
									Remove payment <Text style={{ fontWeight: "700" }}>{selected?.orderId}</Text>? This action cannot be undone.
								</Text>
								<Text style={[styles.dialogText, { color: "#EF4444", marginTop: 12 }]}>
									The associated package activation will remain unchanged.
								</Text>
							</View>
						}
						handleClose={() => {
							setDeleteDialogOpen(false);
							setSelected(null);
						}}
						deleteFunc={async () => {
							if (!selected?._id) return;
							await deletePaymentMutation(selected._id);
						}}
						onSuccess={() => {}}
						handleReject={() => {}}
						deleteButtonDisabled={isDeleting}
					/>
				)}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	container: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 12,
	},
	title: {
		fontSize: 22,
		fontWeight: "800",
		color: "#0F172A",
	},
	subtitle: {
		color: "#6B7280",
		fontSize: 13,
		marginTop: 4,
	},
	statsRow: {
		flexDirection: "row",
		gap: 12,
		marginTop: 16,
	},
	statCard: {
		flex: 1,
		backgroundColor: "#F9FAFB",
		borderRadius: 14,
		padding: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 3,
	},
	statLabel: {
		color: "#6B7280",
		fontSize: 12,
		fontWeight: "600",
		textTransform: "uppercase",
	},
	statValue: {
		color: "#111827",
		fontSize: 24,
		fontWeight: "800",
		marginTop: 6,
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
		marginTop: 18,
	},
	searchInput: {
		flex: 1,
		marginLeft: 8,
		fontSize: 14,
		color: "#111827",
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: 48,
		paddingHorizontal: 32,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#111827",
		marginTop: 16,
	},
	emptyText: {
		textAlign: "center",
		marginTop: 6,
		fontSize: 13,
		color: "#6B7280",
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	orderId: {
		fontSize: 16,
		fontWeight: "700",
		color: "#0F172A",
	},
	metaLine: {
		marginTop: 4,
		color: "#1F2937",
		fontSize: 13,
		fontWeight: "600",
	},
	metaSub: {
		color: "#6B7280",
		fontSize: 12,
		marginTop: 2,
	},
	statusBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
		gap: 8,
	},
	detailLabel: {
		fontSize: 13,
		color: "#6B7280",
		fontWeight: "600",
	},
	detailValue: {
		flex: 1,
		fontSize: 14,
		color: "#111827",
		fontWeight: "600",
	},
	deleteBtn: {
		marginTop: 16,
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#FEF2F2",
		borderWidth: 1,
		borderColor: "#FECACA",
		gap: 6,
	},
	deleteText: {
		color: "#B91C1C",
		fontWeight: "700",
		fontSize: 13,
	},
	dialogContent: {
		paddingVertical: 8,
	},
	dialogText: {
		color: "#374151",
		fontSize: 13,
	},
});

export default PaymentManagement;
