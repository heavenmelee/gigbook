import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, TextInput, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";

export default function MusicianDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const musicianId = parseInt(id || "0");
  const [refreshing, setRefreshing] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingForm, setBookingForm] = useState({
    eventTime: "",
    eventEndTime: "",
    venueName: "",
    venueAddress: "",
    specialRequests: "",
  });

  const { data, refetch } = trpc.browse.getMusicianById.useQuery({ id: musicianId });
  const { data: availability } = trpc.browse.getMusicianAvailability.useQuery({ musicianId });
  const createBookingMutation = trpc.booking.create.useMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleOpenBooking = (listing: any) => {
    setSelectedListing(listing);
    setShowBookingModal(true);
  };

  const handleCreateBooking = async () => {
    if (!selectedListing || !selectedDate || !bookingForm.eventTime) return;
    
    try {
      await createBookingMutation.mutateAsync({
        musicianId,
        listingId: selectedListing.id,
        eventDate: selectedDate,
        eventTime: bookingForm.eventTime,
        eventEndTime: bookingForm.eventEndTime || undefined,
        venueName: bookingForm.venueName || undefined,
        venueAddress: bookingForm.venueAddress || undefined,
        specialRequests: bookingForm.specialRequests || undefined,
        totalAmount: selectedListing.price,
      });
      setShowBookingModal(false);
      setSelectedDate("");
      setBookingForm({ eventTime: "", eventEndTime: "", venueName: "", venueAddress: "", specialRequests: "" });
      router.push("/(customer)/bookings");
    } catch (error) {
      console.error("Failed to create booking:", error);
    }
  };

  const availabilityMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    availability?.forEach((a: any) => {
      map[a.date] = a.isAvailable ?? true;
    });
    return map;
  }, [availability]);

  const next30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        day: date.getDate(),
        dayName: date.toLocaleDateString("ms-MY", { weekday: "short" }),
        isAvailable: availabilityMap[dateStr] !== false,
      });
    }
    return days;
  }, [availabilityMap]);

  if (!data) {
    return (
      <ScreenContainer className="p-4">
        <Text style={[styles.loadingText, { color: colors.muted }]}>Memuatkan...</Text>
      </ScreenContainer>
    );
  }

  const { profile, user, listings, reviews } = data;

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: colors.primary }}>← Kembali</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{(profile?.stageName || "M")[0].toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>{profile?.stageName || user?.name || "Musician"}</Text>
          <Text style={[styles.genre, { color: colors.muted }]}>{profile?.genre || "Pelbagai"}</Text>
          <View style={styles.ratingRow}>
            <Text style={[styles.rating, { color: colors.warning }]}>⭐ {profile?.rating || "0"}</Text>
            <Text style={[styles.reviews, { color: colors.muted }]}>({profile?.totalReviews || 0} ulasan)</Text>
          </View>
          {profile?.location && (
            <Text style={[styles.location, { color: colors.muted }]}>📍 {profile.location}</Text>
          )}
        </View>

        {profile?.bio && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Tentang</Text>
            <Text style={[styles.bioText, { color: colors.muted }]}>{profile.bio}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Perkhidmatan</Text>
          {listings && listings.length > 0 ? (
            listings.map((listing: any) => (
              <View
                key={listing.id}
                style={[styles.listingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.listingTitle, { color: colors.foreground }]}>{listing.title}</Text>
                {listing.description && (
                  <Text style={[styles.listingDescription, { color: colors.muted }]}>{listing.description}</Text>
                )}
                <View style={styles.listingFooter}>
                  <Text style={[styles.listingPrice, { color: colors.primary }]}>
                    RM {listing.price} / {listing.priceType === "per_hour" ? "jam" : listing.priceType === "per_day" ? "hari" : "event"}
                  </Text>
                  <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleOpenBooking(listing)}
                  >
                    <Text style={styles.bookButtonText}>Tempah</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada perkhidmatan tersedia</Text>
          )}
        </View>

        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ulasan</Text>
            {reviews.slice(0, 5).map((review: any) => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewRating, { color: colors.warning }]}>{"⭐".repeat(review.rating)}</Text>
                  <Text style={[styles.reviewDate, { color: colors.muted }]}>
                    {new Date(review.createdAt).toLocaleDateString("ms-MY")}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={[styles.reviewComment, { color: colors.foreground }]}>{review.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showBookingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Tempah {selectedListing?.title}</Text>

            <Text style={[styles.label, { color: colors.muted }]}>Pilih Tarikh</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              <View style={styles.dateContainer}>
                {next30Days.map((day) => (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.dateChip,
                      { borderColor: colors.border },
                      !day.isAvailable && { opacity: 0.4 },
                      selectedDate === day.date && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => day.isAvailable && setSelectedDate(day.date)}
                    disabled={!day.isAvailable}
                  >
                    <Text style={{ color: selectedDate === day.date ? "#fff" : colors.muted, fontSize: 11 }}>{day.dayName}</Text>
                    <Text style={{ color: selectedDate === day.date ? "#fff" : colors.foreground, fontSize: 16, fontWeight: "600" }}>{day.day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.label, { color: colors.muted }]}>Masa Mula *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Cth: 19:00"
              placeholderTextColor={colors.muted}
              value={bookingForm.eventTime}
              onChangeText={(text) => setBookingForm({ ...bookingForm, eventTime: text })}
            />

            <Text style={[styles.label, { color: colors.muted }]}>Masa Tamat</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Cth: 22:00"
              placeholderTextColor={colors.muted}
              value={bookingForm.eventEndTime}
              onChangeText={(text) => setBookingForm({ ...bookingForm, eventEndTime: text })}
            />

            <Text style={[styles.label, { color: colors.muted }]}>Nama Venue</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Cth: Dewan Serbaguna"
              placeholderTextColor={colors.muted}
              value={bookingForm.venueName}
              onChangeText={(text) => setBookingForm({ ...bookingForm, venueName: text })}
            />

            <Text style={[styles.label, { color: colors.muted }]}>Alamat Venue</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Alamat penuh"
              placeholderTextColor={colors.muted}
              value={bookingForm.venueAddress}
              onChangeText={(text) => setBookingForm({ ...bookingForm, venueAddress: text })}
            />

            <View style={[styles.priceInfo, { backgroundColor: colors.primary + "15" }]}>
              <Text style={[styles.priceLabel, { color: colors.muted }]}>Jumlah Bayaran:</Text>
              <Text style={[styles.priceValue, { color: colors.primary }]}>RM {selectedListing?.price}</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={{ color: colors.muted }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateBooking}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Tempah & Bayar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  loadingText: { fontSize: 16, textAlign: "center", marginTop: 40 },
  backButton: { marginBottom: 16 },
  header: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 40, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 24, fontWeight: "bold" },
  genre: { fontSize: 16, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  rating: { fontSize: 16, fontWeight: "600" },
  reviews: { fontSize: 14 },
  location: { fontSize: 14, marginTop: 8 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  bioText: { fontSize: 14, lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  listingCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  listingTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  listingDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  listingFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  listingPrice: { fontSize: 18, fontWeight: "bold" },
  bookButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  bookButtonText: { color: "#fff", fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 20 },
  reviewCard: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  reviewRating: { fontSize: 14 },
  reviewDate: { fontSize: 12 },
  reviewComment: { fontSize: 14, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 12, fontSize: 16 },
  dateScroll: { marginBottom: 16 },
  dateContainer: { flexDirection: "row", gap: 8 },
  dateChip: { width: 50, paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  priceInfo: { padding: 16, borderRadius: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 20, fontWeight: "bold" },
  modalActions: { flexDirection: "row", gap: 12 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", borderWidth: 1 },
});
