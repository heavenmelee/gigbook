import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";

export default function CustomerHomeScreen() {
  const colors = useColors();
  const [location] = useState("Kuala Lumpur");

  // Fetch all musicians from API
  const musiciansQuery = trpc.browse.getMusicians.useQuery({
    genre: undefined,
    location: undefined,
    search: undefined,
  });

  // Normalize API data
  const musicians = useMemo(() => {
    if (!musiciansQuery.data) return [];
    return musiciansQuery.data.map((m: any) => ({
      id: m.profile?.id || m.id,
      stageName: m.profile?.stageName || m.stageName || "Musician",
      coverPhoto: m.profile?.coverPhoto || null,
      rating: Number(m.profile?.rating) || 0,
      totalReviews: m.profile?.totalReviews || 0,
      verified: m.profile?.verified || false,
      genre: m.profile?.genre || "",
      location: m.profile?.location || "",
      startingPrice: m.minPrice || null,
    }));
  }, [musiciansQuery.data]);

  // Carousels
  const topRated = useMemo(() => {
    return [...musicians].sort((a, b) => b.rating - a.rating).slice(0, 10);
  }, [musicians]);

  const weddingMusicians = useMemo(() => {
    return musicians.filter((m) => m.genre?.toLowerCase().includes("wedding")).slice(0, 10);
  }, [musicians]);

  const acousticMusicians = useMemo(() => {
    return musicians.filter((m) =>
      m.genre?.toLowerCase().includes("acoustic") || m.genre?.toLowerCase().includes("chill")
    ).slice(0, 10);
  }, [musicians]);

  const categories = ["Wedding", "Corporate", "Birthday", "Cafe/Restaurant", "Festival"];

  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleViewMusician = (id: number) => {
    tap();
    router.push(`/(customer)/musician-profile?id=${id}`);
  };

  // ==================== MUSICIAN CARD ====================
  const renderMusicianCard = ({ item }: { item: (typeof musicians)[0] }) => (
    <TouchableOpacity
      style={[s.musicianCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleViewMusician(item.id)}
      activeOpacity={0.7}
    >
      <View style={[s.musicianPhoto, { backgroundColor: colors.border }]}>
        {item.coverPhoto ? (
          <Image source={{ uri: item.coverPhoto }} style={s.musicianPhotoImg} />
        ) : (
          <View style={[s.photoPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={s.photoInitial}>{(item.stageName || "M")[0].toUpperCase()}</Text>
          </View>
        )}
        {item.verified && (
          <View style={[s.verifiedBadge, { backgroundColor: colors.success }]}>
            <IconSymbol name="checkmark" size={10} color="#fff" />
          </View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={[s.cardName, { color: colors.foreground }]} numberOfLines={1}>{item.stageName}</Text>
        <View style={s.ratingRow}>
          <IconSymbol name="star.fill" size={13} color={colors.warning} />
          <Text style={[s.ratingText, { color: colors.foreground }]}> {item.rating.toFixed(1)}</Text>
          <Text style={[s.reviewCount, { color: colors.muted }]}> ({item.totalReviews})</Text>
        </View>
        {item.startingPrice ? (
          <Text style={[s.priceText, { color: colors.primary }]}>from RM {item.startingPrice}</Text>
        ) : (
          <Text style={[s.priceText, { color: colors.muted }]}>View profile</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // ==================== LOADING ====================
  if (musiciansQuery.isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[s.loadingText, { color: colors.muted }]}>Loading musicians...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ==================== HEADER ==================== */}
        <View style={[s.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={s.locationRow} onPress={() => { tap(); }}>
            <IconSymbol name="location.fill" size={18} color={colors.primary} />
            <Text style={[s.locationText, { color: colors.foreground }]}>{location}</Text>
            <IconSymbol name="chevron.down" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* ==================== SEARCH BAR ==================== */}
        <TouchableOpacity
          style={[s.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => { tap(); router.push("/(customer)/explore"); }}
          activeOpacity={0.7}
        >
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <Text style={[s.searchPlaceholder, { color: colors.muted }]}>Search musicians, genres, events</Text>
        </TouchableOpacity>

        {/* ==================== HERO CARD ==================== */}
        <View style={[s.heroCard, { backgroundColor: colors.primary }]}>
          <Text style={s.heroTitle}>Book a musician in minutes</Text>
          <Text style={s.heroSubtitle}>Find the perfect live music for your event</Text>
          <TouchableOpacity
            style={[s.heroCTA, { backgroundColor: "#fff" }]}
            onPress={() => { tap(); router.push("/(customer)/explore"); }}
            activeOpacity={0.8}
          >
            <Text style={[s.heroCTAText, { color: colors.primary }]}>Start booking</Text>
          </TouchableOpacity>
        </View>

        {/* ==================== CATEGORIES ==================== */}
        <View style={s.section}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => { tap(); router.push(`/(customer)/explore?category=${item}`); }}
                activeOpacity={0.7}
              >
                <Text style={[s.chipText, { color: colors.foreground }]}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
        </View>

        {/* ==================== TOP RATED ==================== */}
        {topRated.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Top rated near you</Text>
              <TouchableOpacity onPress={() => { tap(); router.push("/(customer)/explore"); }}>
                <Text style={[s.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={topRated}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.carouselPad}
              renderItem={renderMusicianCard}
              keyExtractor={(item) => `top-${item.id}`}
            />
          </View>
        )}

        {/* ==================== BEST FOR WEDDINGS ==================== */}
        {weddingMusicians.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Best for weddings</Text>
              <TouchableOpacity onPress={() => { tap(); router.push("/(customer)/explore"); }}>
                <Text style={[s.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={weddingMusicians}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.carouselPad}
              renderItem={renderMusicianCard}
              keyExtractor={(item) => `wed-${item.id}`}
            />
          </View>
        )}

        {/* ==================== ACOUSTIC & CHILL ==================== */}
        {acousticMusicians.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Acoustic & chill</Text>
              <TouchableOpacity onPress={() => { tap(); router.push("/(customer)/explore"); }}>
                <Text style={[s.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={acousticMusicians}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.carouselPad}
              renderItem={renderMusicianCard}
              keyExtractor={(item) => `aco-${item.id}`}
            />
          </View>
        )}

        {/* ==================== EMPTY STATE ==================== */}
        {musicians.length === 0 && !musiciansQuery.isLoading && (
          <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="music.note" size={40} color={colors.muted} />
            <Text style={[s.emptyTitle, { color: colors.foreground }]}>No musicians available yet</Text>
            <Text style={[s.emptySubtitle, { color: colors.muted }]}>Set your event date to get started</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 16, fontWeight: "600" },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginTop: 16, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  searchPlaceholder: { fontSize: 15, flex: 1 },
  heroCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 16, padding: 24 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginBottom: 18 },
  heroCTA: { alignSelf: "flex-start", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  heroCTAText: { fontSize: 15, fontWeight: "600" },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "600" },
  chipRow: { paddingHorizontal: 20, gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 14, fontWeight: "500" },
  carouselPad: { paddingHorizontal: 20, gap: 12 },
  musicianCard: { width: 160, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  musicianPhoto: { width: "100%", height: 110 },
  musicianPhotoImg: { width: "100%", height: "100%" },
  photoPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  photoInitial: { fontSize: 32, fontWeight: "700", color: "#fff" },
  verifiedBadge: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardBody: { padding: 10, gap: 3 },
  cardName: { fontSize: 14, fontWeight: "600" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 13, fontWeight: "500" },
  reviewCount: { fontSize: 12 },
  priceText: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  emptyCard: { marginHorizontal: 20, marginTop: 24, padding: 32, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
  loadingText: { marginTop: 12, fontSize: 14 },
});
