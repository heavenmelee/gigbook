import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";

interface Package {
  id: string;
  name: string;
  duration: string;
  price: number;
  inclusions: string[];
}

export default function MusicianProfileScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();

  // Mock data
  const musician = {
    id: id || "1",
    stageName: "Jazz Quartet",
    photo: "https://via.placeholder.com/300",
    rating: 4.8,
    reviews: 45,
    verified: true,
    bio: "Professional jazz quartet with 15+ years of experience. Perfect for weddings, corporate events, and intimate gatherings.",
  };

  const packages: Package[] = [
    {
      id: "1",
      name: "Standard",
      duration: "2 hours",
      price: 800,
      inclusions: ["4 musicians", "Sound system", "Setup & soundcheck"],
    },
    {
      id: "2",
      name: "Premium",
      duration: "3 hours",
      price: 1200,
      inclusions: ["4 musicians", "Sound system", "MC services", "Custom setlist"],
    },
    {
      id: "3",
      name: "Deluxe",
      duration: "4 hours",
      price: 1800,
      inclusions: ["6 musicians", "Premium sound", "MC services", "Custom setlist", "Backup band"],
    },
  ];

  const reviews = [
    {
      id: "1",
      name: "Sarah",
      rating: 5,
      text: "Amazing performance! Highly recommended!",
    },
    {
      id: "2",
      name: "Mike",
      rating: 5,
      text: "Professional and talented. Made our wedding perfect.",
    },
  ];

  const handleSelectPackage = (packageId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(customer)/create-booking?musicianId=${musician.id}&packageId=${packageId}`);
  };

  const handleMessage = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert("Message", "Opening chat with " + musician.stageName);
  };

  const handleShare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert("Share", "Sharing musician profile");
  };

  const renderPackage = ({ item }: { item: Package }) => (
    <View style={[s.packageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={s.packageHeader}>
        <View>
          <Text style={[s.packageName, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[s.packageDuration, { color: colors.muted }]}>{item.duration}</Text>
        </View>
        <Text style={[s.packagePrice, { color: colors.primary }]}>RM {item.price}</Text>
      </View>
      <View style={s.inclusions}>
        {item.inclusions.map((inclusion, idx) => (
          <View key={idx} style={s.inclusionRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
            <Text style={[s.inclusionText, { color: colors.foreground }]}>{inclusion}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[s.selectButton, { backgroundColor: colors.primary }]}
        onPress={() => handleSelectPackage(item.id)}
        activeOpacity={0.8}
      >
        <Text style={s.selectButtonText}>Select package</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReview = ({ item }: { item: any }) => (
    <View style={[s.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={s.reviewHeader}>
        <Text style={[s.reviewName, { color: colors.foreground }]}>{item.name}</Text>
        <View style={s.ratingRow}>
          {[...Array(item.rating)].map((_, i) => (
            <IconSymbol key={i} name="star.fill" size={14} color={colors.warning} />
          ))}
        </View>
      </View>
      <Text style={[s.reviewText, { color: colors.muted }]}>{item.text}</Text>
    </View>
  );

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== HEADER ==================== */}
        <View style={s.headerContainer}>
          <TouchableOpacity
            style={[s.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Image source={{ uri: musician.photo }} style={s.musicianPhoto} />
        </View>

        <View style={s.content}>
          {/* ==================== INFO ==================== */}
          <View style={s.infoSection}>
            <View style={s.nameRatingRow}>
              <View style={s.nameColumn}>
                <View style={s.nameRow}>
                  <Text style={[s.stageName, { color: colors.foreground }]}>{musician.stageName}</Text>
                  {musician.verified && (
                    <View style={[s.verifiedBadge, { backgroundColor: colors.success }]}>
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" />
                    </View>
                  )}
                </View>
                <View style={s.ratingRow}>
                  <IconSymbol name="star.fill" size={16} color={colors.warning} />
                  <Text style={[s.rating, { color: colors.foreground }]}>
                    {musician.rating.toFixed(1)}
                  </Text>
                  <Text style={[s.reviews, { color: colors.muted }]}>({musician.reviews} reviews)</Text>
                </View>
              </View>
            </View>
            <Text style={[s.bio, { color: colors.muted }]}>{musician.bio}</Text>
          </View>

          {/* ==================== ACTION BUTTONS ==================== */}
          <View style={s.actionButtons}>
            <TouchableOpacity
              style={[s.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <IconSymbol name="paperplane.fill" size={18} color="#fff" />
              <Text style={s.actionButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
              <Text style={[s.actionButtonText, { color: colors.primary }]}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* ==================== PACKAGES ==================== */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Packages</Text>
            <FlatList
              data={packages}
              renderItem={renderPackage}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={s.packagesList}
            />
          </View>

          {/* ==================== REVIEWS ==================== */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Reviews</Text>
              <TouchableOpacity onPress={() => Alert.alert("All Reviews", "View all reviews")}>
                <Text style={[s.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={s.reviewsList}
            />
          </View>
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
  headerContainer: {
    position: "relative",
    height: 300,
  },
  musicianPhoto: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  infoSection: {
    gap: 12,
  },
  nameRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameColumn: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stageName: {
    fontSize: 24,
    fontWeight: "700",
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
  },
  reviews: {
    fontSize: 14,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
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
  packagesList: {
    gap: 12,
  },
  packageCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageName: {
    fontSize: 15,
    fontWeight: "600",
  },
  packageDuration: {
    fontSize: 12,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  inclusions: {
    gap: 6,
  },
  inclusionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inclusionText: {
    fontSize: 13,
  },
  selectButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "600",
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
