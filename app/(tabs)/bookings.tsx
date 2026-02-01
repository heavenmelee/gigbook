import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function UserBookingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: bookings, refetch } = trpc.booking.getMyBookings.useQuery();
  const cancelMutation = trpc.booking.cancel.useMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCancel = async (bookingId: number) => {
    try {
      await cancelMutation.mutateAsync({ bookingId });
      refetch();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
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
      case "approved": return "Menunggu Pengesahan Musician";
      case "confirmed": return "Disahkan";
      case "completed": return "Selesai";
      case "cancelled_user": return "Dibatalkan";
      case "cancelled_musician": return "Dibatalkan oleh Musician";
      case "rejected": return "Ditolak";
      default: return status;
    }
  };

  const activeBookings = bookings?.filter((b: any) => ["pending_approval", "approved", "confirmed"].includes(b.status)) || [];
  const pastBookings = bookings?.filter((b: any) => !["pending_approval", "approved", "confirmed"].includes(b.status)) || [];

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Tempahan Saya</Text>

        {activeBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Aktif</Text>
            {activeBookings.map((booking: any) => (
              <View
                key={booking.id}
                style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.bookingHeader}>
                  <Text style={[styles.bookingDate, { color: colors.foreground }]}>
                    {new Date(booking.eventDate).toLocaleDateString("ms-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + "20" }]}>
                    <Text style={{ color: getStatusColor(booking.status), fontSize: 11 }}>
                      {getStatusLabel(booking.status)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.bookingTime, { color: colors.muted }]}>
                  {booking.eventTime} {booking.eventEndTime ? `- ${booking.eventEndTime}` : ""}
                </Text>
                {booking.venueName && (
                  <Text style={[styles.bookingVenue, { color: colors.muted }]}>📍 {booking.venueName}</Text>
                )}
                <Text style={[styles.bookingAmount, { color: colors.primary }]}>RM {booking.totalAmount}</Text>
                
                {["pending_approval", "approved", "confirmed"].includes(booking.status) && (
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.error }]}
                    onPress={() => handleCancel(booking.id)}
                  >
                    <Text style={{ color: colors.error }}>Batalkan Tempahan</Text>
                  </TouchableOpacity>
                )}

                {booking.status === "completed" && !booking.hasReview && (
                  <TouchableOpacity
                    style={[styles.reviewButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/review/${booking.id}` as any)}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>Beri Ulasan</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {pastBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>Sejarah</Text>
            {pastBookings.map((booking: any) => (
              <View
                key={booking.id}
                style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.bookingHeader}>
                  <Text style={[styles.bookingDate, { color: colors.foreground }]}>
                    {new Date(booking.eventDate).toLocaleDateString("ms-MY")}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + "20" }]}>
                    <Text style={{ color: getStatusColor(booking.status), fontSize: 11 }}>
                      {getStatusLabel(booking.status)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.bookingAmount, { color: colors.muted }]}>RM {booking.totalAmount}</Text>
              </View>
            ))}
          </View>
        )}

        {(!bookings || bookings.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada tempahan lagi</Text>
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/search")}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Cari Musician</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  bookingCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  bookingDate: { fontSize: 15, fontWeight: "600", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  bookingTime: { fontSize: 14, marginBottom: 4 },
  bookingVenue: { fontSize: 14, marginBottom: 8 },
  bookingAmount: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  cancelButton: { padding: 12, borderRadius: 8, alignItems: "center", borderWidth: 1 },
  reviewButton: { padding: 12, borderRadius: 8, alignItems: "center" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16, marginBottom: 20 },
  searchButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
});
