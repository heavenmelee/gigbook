import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  badge?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export default function ProfileScreen() {
  const colors = useColors();

  // Fetch profile data
  const { data: profile } = trpc.musician.getProfile.useQuery();

  // Calculate profile strength
  const calculateProfileStrength = () => {
    if (!profile) return { score: 0, checklist: [] };

    let score = 0;
    const checklist: ChecklistItem[] = [];

    // Check bio
    if (profile.bio) {
      score += 20;
      checklist.push({ id: "bio", title: "Add bio", completed: true });
    } else {
      checklist.push({ id: "bio", title: "Add bio", completed: false });
    }

    // Check highlight video (placeholder - will be implemented in Media screen)
    checklist.push({ id: "video", title: "Add highlight video", completed: false });

    // Check packages (need at least 1)
    const hasPackages = false; // TODO: Check packages count
    if (hasPackages) {
      score += 30;
      checklist.push({ id: "packages", title: "Add 3 packages", completed: true });
    } else {
      checklist.push({ id: "packages", title: "Add 3 packages", completed: false });
    }

    // Check equipment
    if (profile.equipment && profile.equipment.length > 0) {
      score += 20;
      checklist.push({ id: "equipment", title: "List equipment", completed: true });
    } else {
      checklist.push({ id: "equipment", title: "List equipment", completed: false });
    }

    // Check policies (placeholder)
    checklist.push({ id: "policies", title: "Set policies", completed: false });

    // Check payout bank (placeholder)
    checklist.push({ id: "bank", title: "Set payout bank", completed: false });

    return { score, checklist };
  };

  const { score: profileStrength, checklist } = calculateProfileStrength();

  const menuItems: MenuItem[] = [
    { id: "packages", title: "Packages", icon: "music.note.list", route: "/(musician)/packages" },
    { id: "media", title: "Media", icon: "waveform.circle.fill", route: "/(musician)/media", badge: profileStrength < 100 ? "Required" : undefined },
    { id: "equipment", title: "Equipment & Rider", icon: "guitar", route: "/(musician)/equipment" },
    { id: "policies", title: "Policies", icon: "doc.text.fill", route: "/(musician)/policies" },
    { id: "settings", title: "Settings", icon: "gear", route: "/(musician)/settings" },
    { id: "help", title: "Help & Disputes", icon: "exclamationmark.triangle.fill", route: "/(musician)/help" },
  ];

  const handleMenuPress = (item: MenuItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (item.route) {
      router.push(item.route as any);
    } else {
      // TODO: Navigate to respective screens
      console.log("Navigate to:", item.id);
    }
  };

  const handleCompleteNow = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Find first incomplete item and navigate
    const firstIncomplete = checklist.find((item) => !item.completed);
    if (firstIncomplete) {
      if (firstIncomplete.id === "packages") {
        router.push("/(musician)/packages");
      } else if (firstIncomplete.id === "bio") {
        router.push("/(musician)/profile-editor");
      }
      // TODO: Add navigation for other items
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== HEADER ==================== */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={s.profileInfo}>
            <View style={[s.photoContainer, { borderColor: colors.border }]}>
              <Image
                source={{
                  uri: profile?.coverPhoto || "https://via.placeholder.com/100",
                }}
                style={s.photo}
              />
              {profile?.verified && (
                <View style={[s.verifiedBadge, { backgroundColor: colors.success }]}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" />
                </View>
              )}
            </View>
            <View style={s.profileText}>
              <View style={s.nameRow}>
                <Text style={[s.stageName, { color: colors.foreground }]}>
                  {profile?.stageName || "Stage Name"}
                </Text>
              </View>
              <View style={s.ratingRow}>
                <IconSymbol name="star.fill" size={16} color={colors.warning} />
                <Text style={[s.ratingText, { color: colors.foreground }]}>
                  {profile?.rating ? parseFloat(profile.rating as any).toFixed(1) : "0.0"}
                </Text>
                <Text style={[s.reviewCount, { color: colors.muted }]}>
                  ({profile?.totalReviews || 0} reviews)
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.content}>
          {/* ==================== PROFILE STRENGTH CARD ==================== */}
          {profileStrength < 100 && (
            <View style={[s.strengthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.strengthHeader}>
                <Text style={[s.strengthTitle, { color: colors.foreground }]}>Profile Strength</Text>
                <Text style={[s.strengthPercent, { color: colors.primary }]}>{profileStrength}%</Text>
              </View>
              
              <View style={[s.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    s.progressFill,
                    { backgroundColor: colors.primary, width: `${profileStrength}%` },
                  ]}
                />
              </View>

              <View style={s.checklist}>
                {checklist.map((item) => (
                  <View key={item.id} style={s.checklistItem}>
                    <View
                      style={[
                        s.checkbox,
                        {
                          backgroundColor: item.completed ? colors.success : "transparent",
                          borderColor: item.completed ? colors.success : colors.border,
                        },
                      ]}
                    >
                      {item.completed && (
                        <IconSymbol name="checkmark.circle.fill" size={14} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={[
                        s.checklistText,
                        {
                          color: item.completed ? colors.muted : colors.foreground,
                          textDecorationLine: item.completed ? "line-through" : "none",
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[s.completeButton, { backgroundColor: colors.primary }]}
                onPress={handleCompleteNow}
                activeOpacity={0.8}
              >
                <Text style={s.completeButtonText}>Complete now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ==================== MENU CARDS ==================== */}
          <View style={s.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  s.menuCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  index === menuItems.length - 1 && s.menuCardLast,
                ]}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.7}
              >
                <View style={s.menuCardLeft}>
                  <View style={[s.menuIconContainer, { backgroundColor: colors.primary + "15" }]}>
                    <IconSymbol name={item.icon as any} size={24} color={colors.primary} />
                  </View>
                  <Text style={[s.menuTitle, { color: colors.foreground }]}>{item.title}</Text>
                </View>
                <View style={s.menuCardRight}>
                  {item.badge && (
                    <View style={[s.badge, { backgroundColor: colors.warning + "20" }]}>
                      <Text style={[s.badgeText, { color: colors.warning }]}>{item.badge}</Text>
                    </View>
                  )}
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photoContainer: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 38,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stageName: {
    fontSize: 22,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  reviewCount: {
    fontSize: 14,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  strengthCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  strengthTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  strengthPercent: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  checklist: {
    gap: 10,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistText: {
    fontSize: 14,
    fontWeight: "500",
  },
  completeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  menuSection: {
    gap: 0,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuCardLast: {
    borderBottomWidth: 0,
  },
  menuCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
