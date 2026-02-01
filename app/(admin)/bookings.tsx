import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function AdminBookingsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: bookings, refetch } = trpc.admin.getAllBookings.useQuery({ status: statusFilter });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_approval": return colors.warning;
      case "approved": return colors.primary;
      case "confirmed": return colors.success;
      case "completed": return colors.success;
      case "cancelled_user":
      case "cancelled_musician":
      case "rejected": return colors.error;
      default: return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_approval": return "Menunggu Kelulusan";
      case "approved": return "Diluluskan";
      case "confirmed": return "Disahkan";
      case "completed": return "Selesai";
      case "cancelled_user": return "Dibatalkan User";
      case "cancelled_musician": return "Dibatalkan Musician";
      case "rejected": return "Ditolak";
      default: return status;
    }
  };

  const filters = [
    { label: "Semua", value: undefined },
    { label: "Menunggu", value: "pending_approval" },
    { label: "Diluluskan", value: "approved" },
    { label: "Disahkan", value: "confirmed" },
    { label: "Selesai", value: "completed" },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Semua Tempahan</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.label}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border },
                  statusFilter === filter.value && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setStatusFilter(filter.value)}
              >
                <Text style={{ color: statusFilter === filter.value ? "#fff" : colors.foreground, fontSize: 13 }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <View
              key={booking.id}
              style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.bookingHeader}>
                <Text style={[styles.bookingId, { color: colors.muted }]}>#{booking.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + "20" }]}>
                  <Text style={{ color: getStatusColor(booking.status), fontSize: 11 }}>
                    {getStatusLabel(booking.status)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.bookingDate, { color: colors.foreground }]}>
                {new Date(booking.eventDate).toLocaleDateString("ms-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </Text>
              <Text style={[styles.bookingTime, { color: colors.muted }]}>
                {booking.eventTime} {booking.eventEndTime ? `- ${booking.eventEndTime}` : ""}
              </Text>
              {booking.venueName && (
                <Text style={[styles.bookingVenue, { color: colors.muted }]}>📍 {booking.venueName}</Text>
              )}
              <View style={styles.bookingFooter}>
                <Text style={[styles.bookingAmount, { color: colors.primary }]}>RM {booking.totalAmount}</Text>
                <Text style={[styles.bookingCreated, { color: colors.muted }]}>
                  {new Date(booking.createdAt).toLocaleDateString("ms-MY")}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada tempahan dijumpai</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  filterScroll: { marginBottom: 16 },
  filterContainer: { flexDirection: "row", gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  bookingCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  bookingId: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  bookingDate: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  bookingTime: { fontSize: 14, marginBottom: 4 },
  bookingVenue: { fontSize: 14, marginBottom: 8 },
  bookingFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  bookingAmount: { fontSize: 18, fontWeight: "bold" },
  bookingCreated: { fontSize: 12 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16 },
});
