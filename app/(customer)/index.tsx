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
import { useMemo } from "react";

export default function CustomerHomeScreen() {
  const colors = useColors();

  // Fetch all musicians
  const getMusiciansQuery = trpc.browse.getMusicians.useQuery({
    genre: undefined,
    location: undefined,
    search: undefined,
  });

  // Normalize API response to consistent format
  const normalizedMusicians = useMemo(() => {
    if (!getMusiciansQuery.data) return [];
    return getMusiciansQuery.data.map((m: any) => ({
      id: m.profile?.id || m.id,
      stageName: m.profile?.stageName || m.stageName || "Musician",
      coverPhoto: m.profile?.coverPhoto,
      rating: m.profile?.rating || 0,
      totalReviews: m.profile?.totalReviews || 0,
      verified: m.profile?.verified || false,
      genre: m.profile?.genre,
    }));
  }, [getMusiciansQuery.data]);

  // Organize musicians by category
  const topRatedMusicians = useMemo(() => {
    return normalizedMusicians
      .filter((m: any) => m.verified)
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }, [normalizedMusicians]);

  const weddingMusicians = useMemo(() => {
    return normalizedMusicians
      .filter((m: any) => m.verified && m.genre?.toLowerCase().includes("wedding"))
      .slice(0, 2);
  }, [normalizedMusicians]);

  const acousticMusicians = useMemo(() => {
    return normalizedMusicians
      .filter((m: any) => m.verified && (m.genre?.toLowerCase().includes("acoustic") || m.genre?.toLowerCase().includes("chill")))
      .slice(0, 2);
  }, [normalizedMusicians]);

  const categories = ["Wedding", "Corporate", "Birthday", "Cafe/Restaurant", "Festival"];

  const handleStartBooking = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/(customer)/explore");
  };

  const handleViewMusician = (musicianId: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(customer)/musician-profile?id=${musicianId}`);
  };

  const handleSearch = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/(customer)/explore");
  };

  const renderMusicianCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[s.musicianCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleViewMusician(item.id)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.coverPhoto || "https://via.placeholder.com/200" }}
        style={s.musicianPhoto}
      />
      {item.verified && (
        <View style={[s.verifiedBadge, { backgroundColor: colors.success }]}>
          <IconSymbol name="checkmark.circle.fill" size={14} color="#fff" />
        </View>
      )}
      <View style={s.musicianInfo}>
        <Text style={[s.stageName, { color: colors.foreground }]} numberOfLines={1}>
          {item.stageName}
        </Text>
        <View style={s.ratingRow}>
          <IconSymbol name="star.fill" size={14} color={colors.warning} />
          <Text style={[s.rating, { color: colors.foreground }]}>
            {(item.rating || 0).toFixed(1)}
          </Text>
          <Text style={[s.reviews, { color: colors.muted }]}>({item.totalReviews || 0})</Text>
        </View>
        <Text style={[s.price, { color: colors.primary }]}>View profile</Text>
      </View>
    </TouchableOpacity>
  );

  if (getMusiciansQuery.isLoading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== HEADER ==================== */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={s.locationRow}>
            <IconSymbol name="location.fill" size={16} color={colors.primary} />
            <Text style={[s.location, { color: colors.foreground }]}>Kuala Lumpur</Text>
            <IconSymbol name="chevron.down" size={16} color={colors.muted} />
          </View>
        </View>

        <View style={s.content}>
          {/* ==================== SEARCH BAR ==================== */}
          <TouchableOpacity
            style={[s.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
            <Text style={[s.searchPlaceholder, { color: colors.muted }]}>
              Search musicians, genres, events
            </Text>
          </TouchableOpacity>

          {/* ==================== HERO CARD ==================== */}
          <View style={[s.heroCard, { backgroundColor: colors.primary }]}>
            <Text style={s.heroTitle}>Book a musician in minutes</Text>
            <Text style={s.heroSubtitle}>Find the perfect entertainment for your event</Text>
            <TouchableOpacity
              style={[s.heroButton, { backgroundColor: "#fff" }]}
              onPress={handleStartBooking}
              activeOpacity={0.8}
            >
              <Text style={[s.heroButtonText, { color: colors.primary }]}>Start booking</Text>
            </TouchableOpacity>
          </View>

          {/* ==================== CATEGORIES ==================== */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Event type</Text>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.categoriesContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.categoryChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push("/(customer)/explore")}
                  activeOpacity={0.7}
                >
                  <Text style={[s.categoryText, { color: colors.foreground }]}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>

          {/* ==================== TOP RATED CAROUSEL ==================== */}
          {topRatedMusicians.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: colors.foreground }]}>Top rated near you</Text>
                <TouchableOpacity onPress={() => router.push("/(customer)/explore")}>
                  <Text style={[s.seeAll, { color: colors.primary }]}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={topRatedMusicians}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.carouselContainer}
                renderItem={renderMusicianCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={true}
              />
            </View>
          )}

          {/* ==================== BEST FOR WEDDINGS ==================== */}
          {weddingMusicians.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: colors.foreground }]}>Best for weddings</Text>
                <TouchableOpacity onPress={() => router.push("/(customer)/explore")}>
                  <Text style={[s.seeAll, { color: colors.primary }]}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={weddingMusicians}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.carouselContainer}
                renderItem={renderMusicianCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={true}
              />
            </View>
          )}

          {/* ==================== ACOUSTIC & CHILL ==================== */}
          {acousticMusicians.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: colors.foreground }]}>Acoustic & chill</Text>
                <TouchableOpacity onPress={() => router.push("/(customer)/explore")}>
                  <Text style={[s.seeAll, { color: colors.primary }]}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={acousticMusicians}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.carouselContainer}
                renderItem={renderMusicianCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={true}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  location: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    gap: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    flex: 1,
  },
  heroCard: {
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  heroButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoriesContainer: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  carouselContainer: {
    gap: 12,
    paddingRight: 16,
  },
  musicianCard: {
    width: 160,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  musicianPhoto: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  musicianInfo: {
    padding: 10,
    gap: 6,
  },
  stageName: {
    fontSize: 14,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
  },
  reviews: {
    fontSize: 12,
  },
  price: {
    fontSize: 13,
    fontWeight: "600",
  },
});
