import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function AdminPaymentsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"escrow" | "all">("escrow");

  const { data: escrowPayments, refetch: refetchEscrow } = trpc.admin.getEscrowPayments.useQuery();
  const { data: allPayments, refetch: refetchAll } = trpc.admin.getAllPayments.useQuery();
  const releaseMutation = trpc.admin.releasePayment.useMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchEscrow(), refetchAll()]);
    setRefreshing(false);
  };

  const handleRelease = async (paymentId: number) => {
    try {
      await releaseMutation.mutateAsync({ paymentId });
      refetchEscrow();
      refetchAll();
    } catch (error) {
      console.error("Failed to release payment:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return colors.warning;
      case "escrow": return colors.primary;
      case "released": return colors.success;
      case "refunded":
      case "partial_refund": return colors.error;
      default: return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Menunggu";
      case "escrow": return "Dalam Escrow";
      case "released": return "Dikeluarkan";
      case "refunded": return "Dikembalikan";
      case "partial_refund": return "Separa Dikembalikan";
      default: return status;
    }
  };

  const payments = activeTab === "escrow" ? escrowPayments : allPayments;

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Pengurusan Bayaran</Text>

        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "escrow" && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab("escrow")}
          >
            <Text style={{ color: activeTab === "escrow" ? "#fff" : colors.foreground }}>
              Escrow ({escrowPayments?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={{ color: activeTab === "all" ? "#fff" : colors.foreground }}>Semua</Text>
          </TouchableOpacity>
        </View>

        {payments && payments.length > 0 ? (
          payments.map((payment) => (
            <View
              key={payment.id}
              style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.paymentHeader}>
                <Text style={[styles.paymentId, { color: colors.muted }]}>Booking #{payment.bookingId}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + "20" }]}>
                  <Text style={{ color: getStatusColor(payment.status), fontSize: 11 }}>
                    {getStatusLabel(payment.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.amountSection}>
                <View style={styles.amountRow}>
                  <Text style={[styles.amountLabel, { color: colors.muted }]}>Jumlah:</Text>
                  <Text style={[styles.amountValue, { color: colors.foreground }]}>RM {payment.amount}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={[styles.amountLabel, { color: colors.muted }]}>Komisyen (10%):</Text>
                  <Text style={[styles.amountValue, { color: colors.success }]}>RM {payment.commission}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={[styles.amountLabel, { color: colors.muted }]}>Payout Musician:</Text>
                  <Text style={[styles.amountValue, { color: colors.primary }]}>RM {payment.musicianPayout}</Text>
                </View>
                {payment.penaltyAmount && (
                  <View style={styles.amountRow}>
                    <Text style={[styles.amountLabel, { color: colors.error }]}>Penalti:</Text>
                    <Text style={[styles.amountValue, { color: colors.error }]}>RM {payment.penaltyAmount}</Text>
                  </View>
                )}
              </View>

              {payment.escrowAt && (
                <Text style={[styles.dateText, { color: colors.muted }]}>
                  Escrow: {new Date(payment.escrowAt).toLocaleDateString("ms-MY")}
                </Text>
              )}
              {payment.releasedAt && (
                <Text style={[styles.dateText, { color: colors.success }]}>
                  Dikeluarkan: {new Date(payment.releasedAt).toLocaleDateString("ms-MY")}
                </Text>
              )}

              {payment.status === "escrow" && (
                <TouchableOpacity
                  style={[styles.releaseButton, { backgroundColor: colors.success }]}
                  onPress={() => handleRelease(payment.id)}
                >
                  <Text style={styles.releaseButtonText}>Keluarkan Bayaran</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {activeTab === "escrow" ? "Tiada bayaran dalam escrow" : "Tiada rekod bayaran"}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  tabContainer: { flexDirection: "row", borderRadius: 8, padding: 4, marginBottom: 20 },
  tab: { flex: 1, padding: 12, borderRadius: 6, alignItems: "center" },
  paymentCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  paymentId: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  amountSection: { gap: 8, marginBottom: 12 },
  amountRow: { flexDirection: "row", justifyContent: "space-between" },
  amountLabel: { fontSize: 14 },
  amountValue: { fontSize: 14, fontWeight: "600" },
  dateText: { fontSize: 12, marginBottom: 4 },
  releaseButton: { padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  releaseButtonText: { color: "#fff", fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16 },
});
