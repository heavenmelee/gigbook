import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function UserHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);

  const { data: featuredMusicians, refetch: refetchFeatured } = trpc.browse.getMusicians.useQuery({});
  const { data: upcomingBookings, refetch: refetchBookings } = trpc.booking.getMyBookings.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchFeatured(), refetchBookings()]);
    setRefreshing(false);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.muted }]}>Selamat Datang,</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name || "Pengguna"}</Text>
        </View>

        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Text style={[styles.searchPlaceholder, { color: colors.muted }]}>🔍 Cari musician...</Text>
        </TouchableOpacity>

        {upcomingBookings && upcomingBookings.filter((b: any) => b.status === "confirmed").length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tempahan Akan Datang</Text>
            {upcomingBookings.filter((b: any) => b.status === "confirmed").slice(0, 2).map((booking: any) => (
              <TouchableOpacity
                key={booking.id}
                style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push("/bookings" as any)}
              >
                <View style={styles.bookingHeader}>
                  <Text style={[styles.bookingDate, { color: colors.foreground }]}>
                    {new Date(booking.eventDate).toLocaleDateString("ms-MY", { weekday: "short", day: "numeric", month: "short" })}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
                    <Text style={{ color: colors.success, fontSize: 11 }}>Disahkan</Text>
                  </View>
                </View>
                <Text style={[styles.bookingTime, { color: colors.muted }]}>{booking.eventTime}</Text>
                {booking.venueName && (
                  <Text style={[styles.bookingVenue, { color: colors.muted }]}>📍 {booking.venueName}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Musician Popular</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={{ color: colors.primary }}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          {featuredMusicians && featuredMusicians.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.musicianList}>
                {featuredMusicians.map((musician: any) => (
                  <TouchableOpacity
                    key={musician.id}
                    style={[styles.musicianCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => router.push(`/musician/${musician.id}` as any)}
                  >
                    <View style={[styles.musicianAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>{(musician.stageName || "M")[0].toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.musicianName, { color: colors.foreground }]} numberOfLines={1}>
                      {musician.stageName || "Musician"}
                    </Text>
                    <Text style={[styles.musicianGenre, { color: colors.muted }]} numberOfLines={1}>
                      {musician.genre || "Pelbagai"}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Text style={[styles.rating, { color: colors.warning }]}>⭐ {musician.rating || "0"}</Text>
                    </View>
                    {musician.minPrice && (
                      <Text style={[styles.musicianPrice, { color: colors.primary }]}>
                        Dari RM {musician.minPrice}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada musician tersedia buat masa ini</Text>
            </View>
          )}
        </View>

        <View style={[styles.promoCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
          <Text style={[styles.promoTitle, { color: colors.primary }]}>🎵 Gigbook Malaysia</Text>
          <Text style={[styles.promoText, { color: colors.foreground }]}>
            Platform tempahan musician terbaik di Malaysia. Cari dan tempah musician untuk event anda dengan mudah!
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 16 },
  name: { fontSize: 28, fontWeight: "bold" },
  searchBar: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  searchPlaceholder: { fontSize: 16 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  bookingCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  bookingDate: { fontSize: 16, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  bookingTime: { fontSize: 14, marginBottom: 4 },
  bookingVenue: { fontSize: 14 },
  musicianList: { flexDirection: "row", gap: 12, paddingRight: 16 },
  musicianCard: { width: 140, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  musicianAvatar: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  musicianName: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  musicianGenre: { fontSize: 12, marginTop: 2 },
  ratingContainer: { marginTop: 4 },
  rating: { fontSize: 12 },
  musicianPrice: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  emptyState: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14 },
  promoCard: { padding: 20, borderRadius: 12, borderWidth: 1 },
  promoTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  promoText: { fontSize: 14, lineHeight: 20 },
});
