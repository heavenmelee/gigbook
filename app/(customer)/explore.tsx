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
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";

interface Musician {
  id: string;
  stageName: string;
  photo: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  verified: boolean;
  fastResponder: boolean;
  distance: number;
}

export default function CustomerExploreScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const mockMusicians: Musician[] = [
    {
      id: "1",
      stageName: "Jazz Quartet",
      photo: "https://via.placeholder.com/200",
      rating: 4.8,
      reviews: 45,
      startingPrice: 800,
      verified: true,
      fastResponder: true,
      distance: 3,
    },
    {
      id: "2",
      stageName: "Acoustic Duo",
      photo: "https://via.placeholder.com/200",
      rating: 4.9,
      reviews: 62,
      startingPrice: 600,
      verified: true,
      fastResponder: true,
      distance: 5,
    },
    {
      id: "3",
      stageName: "DJ Pro",
      photo: "https://via.placeholder.com/200",
      rating: 4.7,
      reviews: 38,
      startingPrice: 1200,
      verified: false,
      fastResponder: false,
      distance: 8,
    },
    {
      id: "4",
      stageName: "String Ensemble",
      photo: "https://via.placeholder.com/200",
      rating: 4.6,
      reviews: 28,
      startingPrice: 950,
      verified: true,
      fastResponder: true,
      distance: 2,
    },
  ];

  const handleViewMusician = (musicianId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(customer)/musician-profile?id=${musicianId}`);
  };

  const handleOpenFilters = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowFilters(true);
  };

  const handleApplyFilters = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowFilters(false);
    Alert.alert("Filters Applied", "Results updated with your filter preferences");
  };

  const renderMusicianCard = ({ item }: { item: Musician }) => (
    <TouchableOpacity
      style={[s.musicianCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleViewMusician(item.id)}
      activeOpacity={0.7}
    >
      <View style={s.cardTop}>
        <Image source={{ uri: item.photo }} style={s.musicianPhoto} />
        <View style={s.badges}>
          {item.verified && (
            <View style={[s.badge, { backgroundColor: colors.success }]}>
              <IconSymbol name="checkmark.circle.fill" size={12} color="#fff" />
              <Text style={s.badgeText}>Verified</Text>
            </View>
          )}
          {item.fastResponder && (
            <View style={[s.badge, { backgroundColor: colors.primary }]}>
              <IconSymbol name="bolt.fill" size={12} color="#fff" />
              <Text style={s.badgeText}>Fast</Text>
            </View>
          )}
        </View>
      </View>
      <View style={s.cardInfo}>
        <Text style={[s.stageName, { color: colors.foreground }]} numberOfLines={1}>
          {item.stageName}
        </Text>
        <View style={s.ratingRow}>
          <IconSymbol name="star.fill" size={13} color={colors.warning} />
          <Text style={[s.rating, { color: colors.foreground }]}>
            {item.rating.toFixed(1)}
          </Text>
          <Text style={[s.reviews, { color: colors.muted }]}>({item.reviews})</Text>
        </View>
        <View style={s.priceDistanceRow}>
          <Text style={[s.price, { color: colors.primary }]}>from RM {item.startingPrice}</Text>
          <View style={s.distanceRow}>
            <IconSymbol name="location.fill" size={12} color={colors.muted} />
            <Text style={[s.distance, { color: colors.muted }]}>{item.distance} km</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[s.viewButton, { backgroundColor: colors.primary }]}
        onPress={() => handleViewMusician(item.id)}
        activeOpacity={0.8}
      >
        <Text style={s.viewButtonText}>View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== SEARCH & FILTERS ==================== */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={s.searchRow}>
            <View style={[s.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
              <TextInput
                style={[s.searchInput, { color: colors.foreground }]}
                placeholder="Search musicians..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={[s.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleOpenFilters}
              activeOpacity={0.7}
            >
              <IconSymbol name="slider.horizontal.3" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* ==================== FILTER CHIPS ==================== */}
          <FlatList
            data={["Date", "Budget", "Distance", "Genre", "Language", "Verified"]}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterChipsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.filterChip, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Text style={[s.filterChipText, { color: colors.foreground }]}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
        </View>

        <View style={s.content}>
          {/* ==================== RESULTS ==================== */}
          <FlatList
            data={mockMusicians}
            renderItem={renderMusicianCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={s.resultsList}
          />
        </View>
      </ScrollView>

      {/* ==================== FILTERS MODAL ==================== */}
      {showFilters && (
        <View style={[s.filterModal, { backgroundColor: colors.surface }]}>
          <View style={[s.filterHeader, { borderBottomColor: colors.border }]}>
            <Text style={[s.filterTitle, { color: colors.foreground }]}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={s.filterContent} showsVerticalScrollIndicator={false}>
            <View style={s.filterSection}>
              <Text style={[s.filterLabel, { color: colors.foreground }]}>Date & Time</Text>
              <TouchableOpacity
                style={[s.filterInput, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => {}}
              >
                <Text style={[s.filterInputText, { color: colors.muted }]}>Select date</Text>
              </TouchableOpacity>
            </View>

            <View style={s.filterSection}>
              <Text style={[s.filterLabel, { color: colors.foreground }]}>Budget</Text>
              <View style={[s.sliderContainer, { backgroundColor: colors.background }]}>
                <Text style={[s.sliderLabel, { color: colors.muted }]}>RM 500 - RM 5000</Text>
              </View>
            </View>

            <View style={s.filterSection}>
              <Text style={[s.filterLabel, { color: colors.foreground }]}>Distance</Text>
              <View style={[s.sliderContainer, { backgroundColor: colors.background }]}>
                <Text style={[s.sliderLabel, { color: colors.muted }]}>0 - 50 km</Text>
              </View>
            </View>

            <View style={s.filterSection}>
              <Text style={[s.filterLabel, { color: colors.foreground }]}>Genre</Text>
              <FlatList
                data={["Jazz", "Pop", "Classical", "Electronic", "Acoustic"]}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.genreChip, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => {}}
                  >
                    <Text style={[s.genreText, { color: colors.foreground }]}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
                scrollEnabled={false}
                numColumns={2}
                columnWrapperStyle={s.genreRow}
              />
            </View>

            <View style={s.filterSection}>
              <TouchableOpacity
                style={[s.checkboxRow, { backgroundColor: colors.background }]}
                onPress={() => {}}
              >
                <View style={[s.checkbox, { borderColor: colors.border }]} />
                <Text style={[s.checkboxLabel, { color: colors.foreground }]}>Only show available</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.checkboxRow, { backgroundColor: colors.background }]}
                onPress={() => {}}
              >
                <View style={[s.checkbox, { borderColor: colors.border }]} />
                <Text style={[s.checkboxLabel, { color: colors.foreground }]}>Only show verified</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[s.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApplyFilters}
            activeOpacity={0.8}
          >
            <Text style={s.applyButtonText}>Show results</Text>
          </TouchableOpacity>
        </View>
      )}
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
    gap: 12,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    padding: 16,
  },
  resultsList: {
    gap: 12,
  },
  musicianCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardTop: {
    position: "relative",
    height: 150,
  },
  musicianPhoto: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  badges: {
    position: "absolute",
    top: 8,
    right: 8,
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardInfo: {
    padding: 12,
    gap: 6,
  },
  stageName: {
    fontSize: 15,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: "600",
  },
  reviews: {
    fontSize: 12,
  },
  priceDistanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 13,
    fontWeight: "600",
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distance: {
    fontSize: 12,
  },
  viewButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filterModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "80%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 100,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 20,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterInputText: {
    fontSize: 14,
  },
  sliderContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sliderLabel: {
    fontSize: 13,
  },
  genreRow: {
    gap: 8,
  },
  genreChip: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  genreText: {
    fontSize: 13,
    fontWeight: "500",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  applyButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
