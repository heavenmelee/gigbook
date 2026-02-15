import {
  Text, View, ScrollView, TouchableOpacity, StyleSheet, Image,
  Platform, ActivityIndicator, Alert, Share,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";

export default function MusicianProfileScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const profileQuery = trpc.browse.getMusicianById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const data = profileQuery.data;
  const profile = data?.profile;
  const listings = data?.listings || [];
  const reviews = data?.reviews || [];

  if (profileQuery.isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center p-6">
        <Text style={[s.emptyText, { color: colors.muted }]}>Musician not found</Text>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={s.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const handleShare = async () => {
    tap();
    try { await Share.share({ message: `Check out ${profile.stageName} on Gigbook!` }); } catch {}
  };

  const handleMessage = () => {
    tap();
    Alert.alert("Message", `Start a conversation with ${profile.stageName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Message", onPress: () => router.push("/(customer)/messages") },
    ]);
  };

  const handleSelectPackage = (pkg: any) => {
    tap();
    router.push(`/(customer)/create-booking?musicianId=${profile.id}&packageId=${pkg.id}`);
  };

  const handleRequestQuote = () => {
    tap();
    router.push(`/(customer)/create-booking?musicianId=${profile.id}`);
  };

  return (
    <ScreenContainer className="p-0" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={[s.backArrow, { backgroundColor: colors.surface }]} onPress={() => { tap(); router.back(); }}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        {/* Header */}
        <View style={[s.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[s.avatar, { backgroundColor: colors.primary }]}>
            {profile.coverPhoto ? (
              <Image source={{ uri: profile.coverPhoto }} style={s.avatarImg} />
            ) : (
              <Text style={s.avatarInitial}>{(profile.stageName || "M")[0].toUpperCase()}</Text>
            )}
          </View>
          <Text style={[s.stageName, { color: colors.foreground }]}>{profile.stageName}</Text>
          {profile.verified ? (
            <View style={[s.badge, { backgroundColor: colors.success + "20" }]}>
              <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
              <Text style={[s.badgeText, { color: colors.success }]}>Verified</Text>
            </View>
          ) : null}
          <View style={s.ratingRow}>
            <IconSymbol name="star.fill" size={18} color={colors.warning} />
            <Text style={[s.ratingNum, { color: colors.foreground }]}> {Number(profile.rating || 0).toFixed(1)}</Text>
            <Text style={[s.reviewsCount, { color: colors.muted }]}> ({profile.totalReviews || 0} reviews)</Text>
          </View>
          {profile.genre ? <Text style={[s.genre, { color: colors.muted }]}>{profile.genre}</Text> : null}
          {profile.location ? (
            <View style={s.locationRow}>
              <IconSymbol name="location.fill" size={14} color={colors.muted} />
              <Text style={[s.locationText, { color: colors.muted }]}> {profile.location}</Text>
            </View>
          ) : null}
          <View style={s.quickBtns}>
            <TouchableOpacity style={[s.quickBtn, { backgroundColor: colors.primary }]} onPress={handleMessage}>
              <IconSymbol name="bubble.left.fill" size={18} color="#fff" />
              <Text style={s.quickBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.quickBtnOutline, { borderColor: colors.border }]} onPress={handleShare}>
              <IconSymbol name="square.and.arrow.up" size={18} color={colors.foreground} />
              <Text style={[s.quickBtnTextDark, { color: colors.foreground }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio */}
        {profile.bio ? (
          <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[s.bioText, { color: colors.muted }]}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* Packages */}
        <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Packages</Text>
          {listings.length > 0 ? listings.map((pkg: any) => (
            <View key={pkg.id} style={[s.packageCard, { borderColor: colors.border }]}>
              <Text style={[s.pkgName, { color: colors.foreground }]}>{pkg.name}</Text>
              <Text style={[s.pkgDuration, { color: colors.muted }]}>{pkg.duration} hours</Text>
              {pkg.inclusions && Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
                <View style={s.inclusionsList}>
                  {pkg.inclusions.map((inc: string, idx: number) => (
                    <View key={idx} style={s.inclusionRow}>
                      <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
                      <Text style={[s.inclusionText, { color: colors.foreground }]}>{inc}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={s.pkgFooter}>
                <Text style={[s.pkgPrice, { color: colors.primary }]}>RM {pkg.basePrice}</Text>
                <TouchableOpacity style={[s.selectBtn, { backgroundColor: colors.primary }]} onPress={() => handleSelectPackage(pkg)}>
                  <Text style={s.selectBtnText}>Select package</Text>
                </TouchableOpacity>
              </View>
            </View>
          )) : (
            <Text style={[s.emptySection, { color: colors.muted }]}>No packages listed yet. Request a custom quote.</Text>
          )}
        </View>

        {/* Reviews */}
        <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Reviews</Text>
          {reviews.length > 0 ? reviews.slice(0, 3).map((rev: any) => (
            <View key={rev.id} style={[s.reviewCard, { borderColor: colors.border }]}>
              <View style={s.reviewHeader}>
                <Text style={[s.reviewerName, { color: colors.foreground }]}>{rev.reviewerName || "Customer"}</Text>
                <View style={s.reviewStars}>
                  {[...Array(Math.min(rev.rating || 5, 5))].map((_, i) => (
                    <IconSymbol key={i} name="star.fill" size={12} color={colors.warning} />
                  ))}
                </View>
              </View>
              {rev.comment ? <Text style={[s.reviewComment, { color: colors.muted }]}>{rev.comment}</Text> : null}
            </View>
          )) : (
            <Text style={[s.emptySection, { color: colors.muted }]}>No reviews yet</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[s.stickyCTA, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[s.ctaBtn, { backgroundColor: colors.primary }]} onPress={handleRequestQuote}>
          <Text style={s.ctaBtnText}>Request a quote</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  backArrow: { position: "absolute", top: 8, left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerCard: { marginHorizontal: 16, marginTop: 56, padding: 24, borderRadius: 16, borderWidth: 1, alignItems: "center" },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarInitial: { fontSize: 32, fontWeight: "700", color: "#fff" },
  stageName: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  ratingNum: { fontSize: 16, fontWeight: "600" },
  reviewsCount: { fontSize: 14 },
  genre: { fontSize: 14, marginBottom: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  locationText: { fontSize: 13 },
  quickBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  quickBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 },
  quickBtnOutline: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
  quickBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  quickBtnTextDark: { fontSize: 14, fontWeight: "600" },
  sectionCard: { marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 14 },
  bioText: { fontSize: 14, lineHeight: 22 },
  packageCard: { borderTopWidth: 0.5, paddingTop: 14, marginTop: 14 },
  pkgName: { fontSize: 16, fontWeight: "600" },
  pkgDuration: { fontSize: 13, marginTop: 2 },
  inclusionsList: { marginTop: 8, gap: 4 },
  inclusionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  inclusionText: { fontSize: 13 },
  pkgFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  pkgPrice: { fontSize: 18, fontWeight: "700" },
  selectBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  selectBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  reviewCard: { borderTopWidth: 0.5, paddingTop: 12, marginTop: 12 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewerName: { fontSize: 14, fontWeight: "600" },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewComment: { fontSize: 13, lineHeight: 20, marginTop: 6 },
  emptySection: { fontSize: 14 },
  stickyCTA: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, borderTopWidth: 0.5 },
  ctaBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  emptyText: { fontSize: 16, marginBottom: 16 },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  backBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
