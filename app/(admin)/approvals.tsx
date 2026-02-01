import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function AdminApprovalsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "bookings">("users");

  const { data: pendingUsers, refetch: refetchUsers } = trpc.admin.getPendingUsers.useQuery();
  const { data: pendingBookings, refetch: refetchBookings } = trpc.admin.getPendingBookings.useQuery();
  const approveUserMutation = trpc.admin.approveUser.useMutation();
  const suspendUserMutation = trpc.admin.suspendUser.useMutation();
  const approveBookingMutation = trpc.admin.approveBooking.useMutation();
  const rejectBookingMutation = trpc.admin.rejectBooking.useMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchUsers(), refetchBookings()]);
    setRefreshing(false);
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await approveUserMutation.mutateAsync({ userId });
      refetchUsers();
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      await suspendUserMutation.mutateAsync({ userId });
      refetchUsers();
    } catch (error) {
      console.error("Failed to suspend user:", error);
    }
  };

  const handleApproveBooking = async (bookingId: number) => {
    try {
      await approveBookingMutation.mutateAsync({ bookingId });
      refetchBookings();
    } catch (error) {
      console.error("Failed to approve booking:", error);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    try {
      await rejectBookingMutation.mutateAsync({ bookingId });
      refetchBookings();
    } catch (error) {
      console.error("Failed to reject booking:", error);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Kelulusan</Text>

        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "users" && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab("users")}
          >
            <Text style={{ color: activeTab === "users" ? "#fff" : colors.foreground }}>
              Pengguna ({pendingUsers?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "bookings" && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab("bookings")}
          >
            <Text style={{ color: activeTab === "bookings" ? "#fff" : colors.foreground }}>
              Tempahan ({pendingBookings?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "users" && (
          <View style={styles.section}>
            {pendingUsers && pendingUsers.length > 0 ? (
              pendingUsers.map((user) => (
                <View
                  key={user.id}
                  style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.userName, { color: colors.foreground }]}>{user.name || "Tanpa Nama"}</Text>
                      <Text style={[styles.userEmail, { color: colors.muted }]}>{user.email}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + "20" }]}>
                      <Text style={{ color: colors.primary, fontSize: 12, textTransform: "capitalize" }}>{user.role}</Text>
                    </View>
                  </View>
                  <Text style={[styles.dateText, { color: colors.muted }]}>
                    Mendaftar: {new Date(user.createdAt).toLocaleDateString("ms-MY")}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success }]}
                      onPress={() => handleApproveUser(user.id)}
                    >
                      <Text style={styles.actionButtonText}>Luluskan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.error }]}
                      onPress={() => handleSuspendUser(user.id)}
                    >
                      <Text style={styles.actionButtonText}>Tolak</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada pengguna menunggu kelulusan</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "bookings" && (
          <View style={styles.section}>
            {pendingBookings && pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <View
                  key={booking.id}
                  style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.bookingDate, { color: colors.foreground }]}>
                    {new Date(booking.eventDate).toLocaleDateString("ms-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </Text>
                  <Text style={[styles.bookingTime, { color: colors.muted }]}>{booking.eventTime}</Text>
                  {booking.venueName && (
                    <Text style={[styles.bookingVenue, { color: colors.muted }]}>📍 {booking.venueName}</Text>
                  )}
                  <Text style={[styles.bookingAmount, { color: colors.primary }]}>RM {booking.totalAmount}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success }]}
                      onPress={() => handleApproveBooking(booking.id)}
                    >
                      <Text style={styles.actionButtonText}>Luluskan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.error }]}
                      onPress={() => handleRejectBooking(booking.id)}
                    >
                      <Text style={styles.actionButtonText}>Tolak</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada tempahan menunggu kelulusan</Text>
              </View>
            )}
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
  section: { gap: 12 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  userName: { fontSize: 16, fontWeight: "600" },
  userEmail: { fontSize: 14, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  dateText: { fontSize: 12, marginBottom: 12 },
  bookingDate: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  bookingTime: { fontSize: 14, marginBottom: 4 },
  bookingVenue: { fontSize: 14, marginBottom: 8 },
  bookingAmount: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  actionButtons: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  actionButtonText: { color: "#fff", fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16 },
});
