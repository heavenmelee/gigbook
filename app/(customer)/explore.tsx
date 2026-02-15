import {
  Text, View, ScrollView, TouchableOpacity, StyleSheet, TextInput,
  FlatList, Image, Platform, ActivityIndicator, Modal,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";

const FILTER_CHIPS = ["Date", "Budget", "Distance", "Genre", "Language", "Event type", "Verified only"];
const GENRES = ["Acoustic", "Jazz", "Pop", "Rock", "Classical", "R&B", "Traditional", "DJ", "Wedding"];

export default function ExploreScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(params.category ? [params.category] : []);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const musiciansQuery = trpc.browse.getMusicians.useQuery({
    genre: selectedGenres.length === 1 ? selectedGenres[0] : undefined,
    search: search || undefined,
  });

  const musicians = useMemo(() => {
    if (!musiciansQuery.data) return [];
    let list = musiciansQuery.data.map((m: any) => ({
      id: m.profile?.id || m.id,
      stageName: m.profile?.stageName || m.stageName || "Musician",
      coverPhoto: m.profile?.coverPhoto || null,
      rating: Number(m.profile?.rating) || 0,
      totalReviews: m.profile?.totalReviews || 0,
      verified: m.profile?.verified || false,
      genre: m.profile?.genre || "",
      location: m.profile?.location || "",
      startingPrice: m.minPrice || null,
      fastResponder: (m.profile?.totalReviews || 0) > 5,
    }));
    if (verifiedOnly) list = list.filter((m) => m.verified);
    return list;
  }, [musiciansQuery.data, verifiedOnly]);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  };

  return (
    <ScreenContainer className="p-0">
      {/* ==================== SEARCH HEADER ==================== */}
      <View style={[s.searchHeader, { borderBottomColor: colors.border }]}>
        <View style={[s.searchInputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            style={[s.searchInput, { color: colors.foreground }]}
            placeholder="Search musicians, genres..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[s.filterBtn, { backgroundColor: colors.primary }]}
          onPress={() => { tap(); setShowFilters(true); }}
        >
          <IconSymbol name="slider.horizontal.3" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ==================== FILTER CHIPS ==================== */}
      <FlatList
        data={FILTER_CHIPS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipRow}
        style={s.chipList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.chip, {
              backgroundColor: item === "Verified only" && verifiedOnly ? colors.primary : colors.surface,
              borderColor: colors.border,
            }]}
            onPress={() => {
              tap();
              if (item === "Verified only") setVerifiedOnly(!verifiedOnly);
              else setShowFilters(true);
            }}
          >
            <Text style={[s.chipText, {
              color: item === "Verified only" && verifiedOnly ? "#fff" : colors.foreground,
            }]}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />

      {/* ==================== RESULT COUNT ==================== */}
      <Text style={[s.resultCount, { color: colors.muted }]}>
        {musicians.length} musician{musicians.length !== 1 ? "s" : ""} found
      </Text>

      {/* ==================== RESULTS ==================== */}
      {musiciansQuery.isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={musicians}
          contentContainerStyle={s.listPad}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `explore-${item.id}`}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <IconSymbol name="magnifyingglass" size={40} color={colors.muted} />
              <Text style={[s.emptyText, { color: colors.muted }]}>No musicians found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => { tap(); router.push(`/(customer)/musician-profile?id=${item.id}`); }}
              activeOpacity={0.7}
            >
              <View style={[s.resultPhoto, { backgroundColor: colors.border }]}>
                {item.coverPhoto ? (
                  <Image source={{ uri: item.coverPhoto }} style={s.resultPhotoImg} />
                ) : (
                  <View style={[s.resultPhotoPlaceholder, { backgroundColor: colors.primary }]}>
                    <Text style={s.resultInitial}>{(item.stageName || "M")[0].toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <View style={s.resultBody}>
                <View style={s.resultNameRow}>
                  <Text style={[s.resultName, { color: colors.foreground }]} numberOfLines={1}>{item.stageName}</Text>
                  {item.verified && (
                    <View style={[s.badge, { backgroundColor: colors.success + "20" }]}>
                      <Text style={[s.badgeText, { color: colors.success }]}>Verified</Text>
                    </View>
                  )}
                  {item.fastResponder && (
                    <View style={[s.badge, { backgroundColor: colors.primary + "20" }]}>
                      <Text style={[s.badgeText, { color: colors.primary }]}>Fast</Text>
                    </View>
                  )}
                </View>
                <View style={s.resultRatingRow}>
                  <IconSymbol name="star.fill" size={14} color={colors.warning} />
                  <Text style={[s.resultRating, { color: colors.foreground }]}> {item.rating.toFixed(1)}</Text>
                  <Text style={[s.resultReviews, { color: colors.muted }]}> ({item.totalReviews} reviews)</Text>
                </View>
                {item.genre ? <Text style={[s.resultGenre, { color: colors.muted }]}>{item.genre}</Text> : null}
                <View style={s.resultFooter}>
                  <Text style={[s.resultPrice, { color: colors.primary }]}>
                    {item.startingPrice ? `from RM ${item.startingPrice}` : "Request quote"}
                  </Text>
                  <TouchableOpacity
                    style={[s.viewBtn, { backgroundColor: colors.primary }]}
                    onPress={() => { tap(); router.push(`/(customer)/musician-profile?id=${item.id}`); }}
                  >
                    <Text style={s.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ==================== FILTERS BOTTOM SHEET ==================== */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.filterSheet, { backgroundColor: colors.background }]}>
            <View style={s.filterHeader}>
              <Text style={[s.filterTitle, { color: colors.foreground }]}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.filterContent}>
              <Text style={[s.filterLabel, { color: colors.foreground }]}>Genre</Text>
              <View style={s.genreGrid}>
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[s.genreChip, {
                      backgroundColor: selectedGenres.includes(g) ? colors.primary : colors.surface,
                      borderColor: selectedGenres.includes(g) ? colors.primary : colors.border,
                    }]}
                    onPress={() => toggleGenre(g)}
                  >
                    <Text style={[s.genreChipText, {
                      color: selectedGenres.includes(g) ? "#fff" : colors.foreground,
                    }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.filterLabel, { color: colors.foreground, marginTop: 20 }]}>Options</Text>
              <TouchableOpacity
                style={[s.optionRow, { borderColor: colors.border }]}
                onPress={() => setVerifiedOnly(!verifiedOnly)}
              >
                <Text style={[s.optionText, { color: colors.foreground }]}>Only show verified</Text>
                <View style={[s.toggle, { backgroundColor: verifiedOnly ? colors.primary : colors.border }]}>
                  <View style={[s.toggleKnob, { transform: [{ translateX: verifiedOnly ? 18 : 2 }] }]} />
                </View>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={[s.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => { tap(); setShowFilters(false); }}
            >
              <Text style={s.applyBtnText}>Show results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  searchHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 0.5 },
  searchInputRow: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  chipList: { maxHeight: 52 },
  chipRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "500" },
  resultCount: { paddingHorizontal: 20, paddingVertical: 8, fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  resultCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  resultPhoto: { width: 100, height: 120 },
  resultPhotoImg: { width: "100%", height: "100%" },
  resultPhotoPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  resultInitial: { fontSize: 28, fontWeight: "700", color: "#fff" },
  resultBody: { flex: 1, padding: 12, justifyContent: "space-between" },
  resultNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  resultName: { fontSize: 16, fontWeight: "600" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  resultRatingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  resultRating: { fontSize: 13, fontWeight: "500" },
  resultReviews: { fontSize: 12 },
  resultGenre: { fontSize: 12, marginTop: 2 },
  resultFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  resultPrice: { fontSize: 14, fontWeight: "600" },
  viewBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  viewBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  // Filter modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  filterSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%", paddingBottom: 32 },
  filterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 12 },
  filterTitle: { fontSize: 20, fontWeight: "700" },
  filterContent: { paddingHorizontal: 20, paddingBottom: 20 },
  filterLabel: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  genreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  genreChipText: { fontSize: 14, fontWeight: "500" },
  optionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 0.5 },
  optionText: { fontSize: 15 },
  toggle: { width: 44, height: 26, borderRadius: 13, justifyContent: "center" },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff" },
  applyBtn: { marginHorizontal: 20, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
