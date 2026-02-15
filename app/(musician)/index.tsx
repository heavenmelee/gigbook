import { Text, View, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, RefreshControl, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/lib/auth-context";
import { useState, useCallback } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

export default function MusicianHomeScreen() {
  const colors = useColors();
  const { user } = useAuthContext();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [baseLocation, setBaseLocation] = useState("Kuala Lumpur");

  const { data: stats, refetch: refetchStats } = trpc.musician.getStats.useQuery();
  const { data: profile, refetch: refetchProfile } = trpc.musician.getProfile.useQuery();
  const { data: bookings } = trpc.musician.getBookings.useQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchProfile()]);
    setRefreshing(false);
  }, [refetchStats, refetchProfile]);

  const toggleAvailability = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsAvailable((prev) => !prev);
  }, []);

  // Get next upcoming booking
  const nextJob = bookings?.find((b) => b.status === "confirmed" && new Date(b.eventDate) > new Date());

  // Mock new requests data (replace with real API later)
  const newRequests = [
    {
      id: 1,
      type: "Corporate event",
      date: "Fri 7:30 PM",
      location: "Mont Kiara",
      distance: "12 km",
      budgetMin: 800,
      budgetMax: 1200,
      fit: "Good fit",
    },
    {
      id: 2,
      type: "Wedding",
      date: "Sat 6:00 PM",
      location: "Bangsar",
      distance: "9 km",
      budgetMin: 1500,
      budgetMax: 2000,
      fit: "Perfect fit",
    },
  ];

  const formatJobTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = d.getHours().toString().padStart(2, "0");
    const mins = d.getMinutes().toString().padStart(2, "0");
    return `${days[d.getDay()]} • ${hours}:${mins}`;
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== TOP APP BAR ==================== */}
        <View style={[s.topBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={s.avatar} onPress={() => router.push("/(musician)/profile")}>
            <Image
              source={{ uri: profile?.coverPhoto || "https://via.placeholder.com/40" }}
              style={s.avatarImage}
            />
          </TouchableOpacity>

          <TouchableOpacity style={s.locationButton} onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            Alert.alert("Change Location", "Location selector will be implemented");
          }}>
            <Text style={[s.locationLabel, { color: colors.muted }]}>Base:</Text>
            <Text style={[s.locationText, { color: colors.foreground }]}>{baseLocation}</Text>
            <IconSymbol name="chevron.down" size={16} color={colors.muted} />
          </TouchableOpacity>

          <View style={[s.availToggle, { backgroundColor: isAvailable ? colors.success + "20" : colors.muted + "20" }]}>
            <Text style={[s.availLabel, { color: isAvailable ? colors.success : colors.muted }]}>
              {isAvailable ? "Available" : "Away"}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: colors.muted + "40", true: colors.success + "60" }}
              thumbColor={isAvailable ? colors.success : colors.muted}
            />
          </View>
        </View>

        <View style={s.bodyContent}>
          {/* ==================== HERO CARD ==================== */}
          {nextJob ? (
            <View style={[s.heroCard, { backgroundColor: colors.primary }]}>
              <Text style={s.heroTitle}>Next job</Text>
              <Text style={s.heroTime}>{formatJobTime(nextJob.eventDate)} – {formatJobTime(nextJob.eventDate)}</Text>
              <View style={s.heroLocation}>
                <IconSymbol name="location.fill" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={s.heroLocationText}>{nextJob.venueAddress || "Venue"} • 5 km</Text>
              </View>
              <View style={[s.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={s.heroBadgeText}>
                  {nextJob.status === "confirmed" ? "Confirmed" : "Awaiting deposit"}
                </Text>
              </View>
              <View style={s.heroActions}>
                <TouchableOpacity
                  style={[s.heroButton, { backgroundColor: "#fff" }]}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push("/(musician)/jobs");
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[s.heroButtonText, { color: colors.primary }]}>View job</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.heroIconButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    Alert.alert("Message Customer", "Chat feature will be implemented");
                  }}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[s.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={[s.heroTitle, { color: colors.foreground }]}>No jobs today</Text>
              <Text style={[s.heroSubtitle, { color: colors.muted }]}>
                Turn on Available to receive requests
              </Text>
              <TouchableOpacity
                style={[s.heroButton, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={toggleAvailability}
                activeOpacity={0.8}
              >
                <Text style={[s.heroButtonText, { color: "#fff" }]}>Turn on Available</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ==================== NEW REQUESTS ==================== */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>New requests</Text>
              <TouchableOpacity onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push("/(musician)/jobs");
              }}>
                <Text style={[s.seeAllLink, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carousel}>
              {newRequests.map((req) => (
                <View key={req.id} style={[s.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={s.requestHeader}>
                    <Text style={[s.requestType, { color: colors.foreground }]}>{req.type}</Text>
                    <View style={[s.fitBadge, { backgroundColor: req.fit === "Perfect fit" ? colors.success + "20" : colors.primary + "20" }]}>
                      <Text style={[s.fitBadgeText, { color: req.fit === "Perfect fit" ? colors.success : colors.primary }]}>
                        {req.fit}
                      </Text>
                    </View>
                  </View>
                  <Text style={[s.requestDate, { color: colors.muted }]}>{req.date}</Text>
                  <View style={s.requestLocation}>
                    <IconSymbol name="location.fill" size={14} color={colors.muted} />
                    <Text style={[s.requestLocationText, { color: colors.muted }]}>
                      {req.location} • {req.distance}
                    </Text>
                  </View>
                  <Text style={[s.requestBudget, { color: colors.foreground }]}>
                    Budget: RM{req.budgetMin}–RM{req.budgetMax}
                  </Text>
                  <TouchableOpacity
                    style={[s.requestButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      router.push("/(musician)/jobs");
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.requestButtonText}>Quote now</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ==================== QUICK STATS ==================== */}
          <View style={s.statsRow}>
            <View style={[s.statChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.statLabel, { color: colors.muted }]}>This month</Text>
              <Text style={[s.statValue, { color: colors.foreground }]}>RM {stats?.monthlyEarnings || "0"}</Text>
            </View>
            <View style={[s.statChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.statLabel, { color: colors.muted }]}>Rating</Text>
              <Text style={[s.statValue, { color: colors.foreground }]}>{stats?.avgRating || "0.0"}</Text>
            </View>
            <View style={[s.statChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.statLabel, { color: colors.muted }]}>Response</Text>
              <Text style={[s.statValue, { color: colors.foreground }]}>12 min</Text>
            </View>
          </View>

          {/* ==================== TO-DO CARD ==================== */}
          <View style={[s.todoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.todoTitle, { color: colors.foreground }]}>Boost your bookings</Text>
            <View style={s.todoItem}>
              <View style={[s.todoIcon, { backgroundColor: colors.warning + "20" }]}>
                <IconSymbol name="plus.circle.fill" size={18} color={colors.warning} />
              </View>
              <Text style={[s.todoText, { color: colors.foreground }]}>
                Upload a highlight video <Text style={{ color: colors.error }}>(required)</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[s.todoButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                router.push("/(musician)/media");
              }}
              activeOpacity={0.8}
            >
              <Text style={s.todoButtonText}>Upload now</Text>
            </TouchableOpacity>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  locationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    gap: 4,
  },
  locationLabel: {
    fontSize: 13,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "600",
  },
  availToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  availLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    gap: 8,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  heroTime: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
  heroLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  heroLocationText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  heroButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  heroIconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    marginTop: 4,
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
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllLink: {
    fontSize: 15,
    fontWeight: "600",
  },
  carousel: {
    gap: 12,
    paddingRight: 16,
  },
  requestCard: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestType: {
    fontSize: 16,
    fontWeight: "600",
  },
  fitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fitBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requestDate: {
    fontSize: 14,
  },
  requestLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  requestLocationText: {
    fontSize: 14,
  },
  requestBudget: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  requestButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statChip: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  todoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  todoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  todoText: {
    flex: 1,
    fontSize: 14,
  },
  todoButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  todoButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
