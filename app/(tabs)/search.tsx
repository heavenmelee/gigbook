import { Text, View, ScrollView, StyleSheet, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function UserSearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

  const { data: musicians, refetch } = trpc.browse.getMusicians.useQuery({
    search: searchQuery || undefined,
    genre: selectedGenre,
    location: selectedLocation,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const genres = ["Pop", "Rock", "Jazz", "Classical", "Traditional", "R&B", "Hip Hop", "EDM", "Acoustic"];
  const locations = ["Kuala Lumpur", "Selangor", "Johor", "Penang", "Perak", "Sabah", "Sarawak"];

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Cari Musician</Text>

        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
          placeholder="Cari nama atau genre..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />

        <Text style={[styles.filterLabel, { color: colors.muted }]}>Genre</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: colors.border }, !selectedGenre && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setSelectedGenre(undefined)}
            >
              <Text style={{ color: !selectedGenre ? "#fff" : colors.foreground, fontSize: 13 }}>Semua</Text>
            </TouchableOpacity>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.filterChip, { borderColor: colors.border }, selectedGenre === genre && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setSelectedGenre(selectedGenre === genre ? undefined : genre)}
              >
                <Text style={{ color: selectedGenre === genre ? "#fff" : colors.foreground, fontSize: 13 }}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.filterLabel, { color: colors.muted }]}>Lokasi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: colors.border }, !selectedLocation && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setSelectedLocation(undefined)}
            >
              <Text style={{ color: !selectedLocation ? "#fff" : colors.foreground, fontSize: 13 }}>Semua</Text>
            </TouchableOpacity>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[styles.filterChip, { borderColor: colors.border }, selectedLocation === location && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setSelectedLocation(selectedLocation === location ? undefined : location)}
              >
                <Text style={{ color: selectedLocation === location ? "#fff" : colors.foreground, fontSize: 13 }}>{location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.resultCount, { color: colors.muted }]}>
          {musicians?.length || 0} musician dijumpai
        </Text>

        {musicians && musicians.length > 0 ? (
          musicians.map((musician: any) => (
            <TouchableOpacity
              key={musician.id}
              style={[styles.musicianCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/musician/${musician.id}` as any)}
            >
              <View style={styles.musicianRow}>
                <View style={[styles.musicianAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{(musician.stageName || "M")[0].toUpperCase()}</Text>
                </View>
                <View style={styles.musicianInfo}>
                  <Text style={[styles.musicianName, { color: colors.foreground }]}>{musician.stageName || "Musician"}</Text>
                  <Text style={[styles.musicianGenre, { color: colors.muted }]}>{musician.genre || "Pelbagai"}</Text>
                  <Text style={[styles.musicianLocation, { color: colors.muted }]}>📍 {musician.location || "Malaysia"}</Text>
                </View>
                <View style={styles.musicianStats}>
                  <Text style={[styles.rating, { color: colors.warning }]}>⭐ {musician.rating || "0"}</Text>
                  {musician.minPrice && (
                    <Text style={[styles.price, { color: colors.primary }]}>RM {musician.minPrice}</Text>
                  )}
                </View>
              </View>
              {musician.bio && (
                <Text style={[styles.musicianBio, { color: colors.muted }]} numberOfLines={2}>{musician.bio}</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada musician dijumpai</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  searchInput: { padding: 14, borderRadius: 12, borderWidth: 1, fontSize: 16, marginBottom: 16 },
  filterLabel: { fontSize: 14, marginBottom: 8 },
  filterScroll: { marginBottom: 16 },
  filterContainer: { flexDirection: "row", gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  resultCount: { fontSize: 14, marginBottom: 16 },
  musicianCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  musicianRow: { flexDirection: "row", alignItems: "center" },
  musicianAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  musicianInfo: { flex: 1, marginLeft: 12 },
  musicianName: { fontSize: 16, fontWeight: "600" },
  musicianGenre: { fontSize: 13, marginTop: 2 },
  musicianLocation: { fontSize: 12, marginTop: 2 },
  musicianStats: { alignItems: "flex-end" },
  rating: { fontSize: 14, fontWeight: "600" },
  price: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  musicianBio: { fontSize: 13, marginTop: 12, lineHeight: 18 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16 },
});
