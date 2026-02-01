import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function MusicianBookingsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const { data: bookings, refetch } = trpc.musician.getBookings.useQuery();
  const acceptMutation = trpc.musician.acceptBooking.useMutation();
  const rejectMutation = trpc.musician.rejectBooking.useMutation();
  const completeMutation = trpc.musician.completeBooking.useMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAccept = async (bookingId: number) => {
    try {
      await acceptMutation.mutateAsync({ bookingId });
      refetch();
    } catch (error) {
      console.error("Failed to accept booking:", error);
    }
  };

  const handleReject = async (bookingId: number) => {
    try {
      await rejectMutation.mutateAsync({ bookingId });
      refetch();
    } catch (error) {
      console.error("Failed to reject booking:", error);
    }
  };

  const handleComplete = async (bookingId: number) => {
    try {
      await completeMutation.mutateAsync({ bookingId });
      refetch();
    } catch (error) {
      console.error("Failed to complete booking:", error);
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
      case "pending_approval": return "Menunggu Kelulusan Admin";
      case "approved": return "Diluluskan - Menunggu Pengesahan";
      case "confirmed": return "Disahkan";
      case "completed": return "Selesai";
      case "cancelled_user": return "Dibatalkan oleh User";
      case "cancelled_musician": return "Dibatalkan oleh Anda";
      case "rejected": return "Ditolak";
      default: return status;
    }
  };

  const pendingBookings = bookings?.filter((b) => b.status === "approved") || [];
  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed") || [];
  const otherBookings = bookings?.filter((b) => !["approved", "confirmed"].includes(b.status)) || [];

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Tempahan Saya</Text>

        {pendingBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.warning }]}>Perlu Tindakan</Text>
            {pendingBookings.map((booking) => (
              <View
                key={booking.id}
                style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.warning }]}
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
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => handleAccept(booking.id)}
                  >
                    <Text style={styles.actionButtonText}>Terima</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error }]}
                    onPress={() => handleReject(booking.id)}
                  >
                    <Text style={styles.actionButtonText}>Tolak</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {confirmedBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>Gig Akan Datang</Text>
            {confirmedBookings.map((booking) => (
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
                <TouchableOpacity
                  style={[styles.completeButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleComplete(booking.id)}
                >
                  <Text style={styles.actionButtonText}>Tandakan Selesai</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {otherBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>Sejarah</Text>
            {otherBookings.map((booking) => (
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
  actionButtons: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  actionButtonText: { color: "#fff", fontWeight: "600" },
  completeButton: { padding: 12, borderRadius: 8, alignItems: "center" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16 },
});
