import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useCallback } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

type TabType = "requests" | "confirmed" | "past";

// Mock data - replace with real API later
const mockRequests = [
  {
    id: 1,
    title: "Wedding dinner",
    time: "Sun • 8:30 PM – 10:30 PM",
    location: "Putrajaya",
    distance: "28 km",
    budget: 1500,
    duration: "2 hours",
    venue: "Indoor",
    status: "new" as const,
    expiresIn: "3h",
  },
  {
    id: 2,
    title: "Birthday party",
    time: "Sat • 7:00 PM – 9:00 PM",
    location: "Bangsar",
    distance: "9 km",
    budget: 800,
    duration: "2 hours",
    venue: "Outdoor",
    status: "replied" as const,
    expiresIn: null,
  },
];

const mockConfirmed = [
  {
    id: 1,
    title: "Corporate annual dinner",
    countdown: "In 2 days",
    location: "KLCC",
    distance: "6 km",
    paymentProgress: 50,
    date: "Fri • 7:30 PM",
  },
  {
    id: 2,
    title: "Wedding reception",
    countdown: "In 5 days",
    location: "Mont Kiara",
    distance: "12 km",
    paymentProgress: 100,
    date: "Sat • 6:00 PM",
  },
];

const mockPast = [
  {
    id: 1,
    title: "Corporate event",
    date: "15 Jan 2026",
    location: "KLCC",
    amount: 1200,
    status: "completed" as const,
    hasReview: false,
  },
  {
    id: 2,
    title: "Birthday party",
    date: "10 Jan 2026",
    location: "Bangsar",
    amount: 800,
    status: "completed" as const,
    hasReview: true,
  },
];

export default function JobsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filters = ["Nearby", "This week", "High budget", "Needs reply"];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const toggleFilter = (filter: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const switchTab = (tab: TabType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  return (
    <ScreenContainer className="p-0">
      <View style={[s.container, { backgroundColor: colors.background }]}>
        {/* ==================== SEARCH BAR ==================== */}
        <View style={[s.searchBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={[s.searchInput, { backgroundColor: colors.surface }]}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              style={[s.searchText, { color: colors.foreground }]}
              placeholder="Search by date, venue, customer"
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* ==================== FILTER CHIPS ==================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterChips}
          style={[s.filterRow, { borderBottomColor: colors.border }]}
        >
          {filters.map((filter) => {
            const isSelected = selectedFilters.includes(filter);
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  s.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.filterChipText,
                    { color: isSelected ? "#fff" : colors.foreground },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ==================== SEGMENTED TABS ==================== */}
        <View style={[s.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[s.tab, activeTab === "requests" && s.tabActive]}
            onPress={() => switchTab("requests")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.tabText,
                { color: activeTab === "requests" ? colors.primary : colors.muted },
              ]}
            >
              Requests
            </Text>
            {activeTab === "requests" && <View style={[s.tabIndicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.tab, activeTab === "confirmed" && s.tabActive]}
            onPress={() => switchTab("confirmed")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.tabText,
                { color: activeTab === "confirmed" ? colors.primary : colors.muted },
              ]}
            >
              Confirmed
            </Text>
            {activeTab === "confirmed" && <View style={[s.tabIndicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.tab, activeTab === "past" && s.tabActive]}
            onPress={() => switchTab("past")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.tabText,
                { color: activeTab === "past" ? colors.primary : colors.muted },
              ]}
            >
              Past
            </Text>
            {activeTab === "past" && <View style={[s.tabIndicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        </View>

        {/* ==================== TAB CONTENT ==================== */}
        <ScrollView
          contentContainerStyle={s.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "requests" && (
            <View style={s.tabContent}>
              {mockRequests.length > 0 ? (
                mockRequests.map((req) => (
                  <View key={req.id} style={[s.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={s.requestHeader}>
                      <Text style={[s.requestTitle, { color: colors.foreground }]}>{req.title}</Text>
                      <View
                        style={[
                          s.statusBadge,
                          {
                            backgroundColor:
                              req.status === "new"
                                ? colors.success + "20"
                                : req.status === "replied"
                                ? colors.primary + "20"
                                : colors.muted + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.statusBadgeText,
                            {
                              color:
                                req.status === "new"
                                  ? colors.success
                                  : req.status === "replied"
                                  ? colors.primary
                                  : colors.muted,
                            },
                          ]}
                        >
                          {req.status === "new" ? "New" : req.status === "replied" ? "Replied" : "Expired"}
                        </Text>
                      </View>
                    </View>

                    <Text style={[s.requestTime, { color: colors.foreground }]}>{req.time}</Text>

                    <View style={s.requestLocation}>
                      <IconSymbol name="location.fill" size={16} color={colors.muted} />
                      <Text style={[s.requestLocationText, { color: colors.muted }]}>
                        {req.location} • {req.distance}
                      </Text>
                    </View>

                    <Text style={[s.requestBudget, { color: colors.foreground }]}>
                      Budget: RM {req.budget.toLocaleString()}
                    </Text>

                    <View style={s.requestMeta}>
                      <Text style={[s.requestMetaText, { color: colors.muted }]}>
                        {req.duration} • {req.venue}
                      </Text>
                      {req.expiresIn && (
                        <Text style={[s.requestExpires, { color: colors.error }]}>
                          Expires in {req.expiresIn}
                        </Text>
                      )}
                    </View>

                    <View style={s.requestActions}>
                      <TouchableOpacity
                        style={[s.requestButtonPrimary, { backgroundColor: colors.primary }]}
                        onPress={() => {}}
                        activeOpacity={0.8}
                      >
                        <Text style={s.requestButtonPrimaryText}>Send quote</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.requestButtonSecondary, { borderColor: colors.border }]}
                        onPress={() => {}}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.requestButtonSecondaryText, { color: colors.foreground }]}>Ask</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.requestButtonSecondary, { borderColor: colors.border }]}
                        onPress={() => {}}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.requestButtonSecondaryText, { color: colors.foreground }]}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={s.emptyState}>
                  <Text style={[s.emptyTitle, { color: colors.foreground }]}>No requests yet</Text>
                  <Text style={[s.emptySubtitle, { color: colors.muted }]}>
                    Turn on Available to start receiving booking requests
                  </Text>
                  <TouchableOpacity
                    style={[s.emptyButton, { backgroundColor: colors.primary }]}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <Text style={s.emptyButtonText}>Turn on Available</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activeTab === "confirmed" && (
            <View style={s.tabContent}>
              {mockConfirmed.length > 0 ? (
                mockConfirmed.map((job) => (
                  <View key={job.id} style={[s.confirmedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={s.confirmedHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.confirmedTitle, { color: colors.foreground }]}>{job.title}</Text>
                        <Text style={[s.confirmedCountdown, { color: colors.primary }]}>{job.countdown}</Text>
                      </View>
                    </View>

                    <View style={s.confirmedLocation}>
                      <IconSymbol name="location.fill" size={16} color={colors.muted} />
                      <Text style={[s.confirmedLocationText, { color: colors.muted }]}>
                        {job.location} • {job.distance}
                      </Text>
                    </View>

                    <Text style={[s.confirmedDate, { color: colors.foreground }]}>{job.date}</Text>

                    <View style={s.paymentProgress}>
                      <View style={s.paymentProgressHeader}>
                        <Text style={[s.paymentProgressLabel, { color: colors.muted }]}>Payment progress</Text>
                        <Text style={[s.paymentProgressValue, { color: colors.foreground }]}>
                          {job.paymentProgress}%
                        </Text>
                      </View>
                      <View style={[s.paymentProgressBar, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            s.paymentProgressFill,
                            { backgroundColor: colors.success, width: `${job.paymentProgress}%` },
                          ]}
                        />
                      </View>
                      <Text style={[s.paymentProgressText, { color: colors.muted }]}>
                        {job.paymentProgress === 100 ? "Fully paid" : "Deposit paid"}
                      </Text>
                    </View>

                    <View style={s.confirmedActions}>
                      <TouchableOpacity
                        style={[s.confirmedButtonPrimary, { backgroundColor: colors.primary }]}
                        onPress={() => {}}
                        activeOpacity={0.8}
                      >
                        <Text style={s.confirmedButtonPrimaryText}>Open job</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.confirmedButtonSecondary, { borderColor: colors.border }]}
                        onPress={() => {}}
                        activeOpacity={0.8}
                      >
                        <IconSymbol name="paperplane.fill" size={18} color={colors.foreground} />
                        <Text style={[s.confirmedButtonSecondaryText, { color: colors.foreground }]}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={s.emptyState}>
                  <Text style={[s.emptyTitle, { color: colors.foreground }]}>No confirmed jobs</Text>
                  <Text style={[s.emptySubtitle, { color: colors.muted }]}>
                    Your confirmed bookings will appear here
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "past" && (
            <View style={s.tabContent}>
              {mockPast.length > 0 ? (
                mockPast.map((job) => (
                  <View key={job.id} style={[s.pastCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={s.pastHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.pastTitle, { color: colors.foreground }]}>{job.title}</Text>
                        <Text style={[s.pastDate, { color: colors.muted }]}>{job.date}</Text>
                      </View>
                      <View style={[s.pastStatusBadge, { backgroundColor: colors.success + "20" }]}>
                        <Text style={[s.pastStatusText, { color: colors.success }]}>Completed</Text>
                      </View>
                    </View>

                    <View style={s.pastLocation}>
                      <IconSymbol name="location.fill" size={16} color={colors.muted} />
                      <Text style={[s.pastLocationText, { color: colors.muted }]}>{job.location}</Text>
                    </View>

                    <Text style={[s.pastAmount, { color: colors.foreground }]}>
                      RM {job.amount.toLocaleString()}
                    </Text>

                    {!job.hasReview && (
                      <TouchableOpacity
                        style={[s.pastReviewButton, { borderColor: colors.primary }]}
                        onPress={() => {}}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.pastReviewButtonText, { color: colors.primary }]}>Request review</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={s.emptyState}>
                  <Text style={[s.emptyTitle, { color: colors.foreground }]}>No past jobs</Text>
                  <Text style={[s.emptySubtitle, { color: colors.muted }]}>
                    Your completed jobs will appear here
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    borderBottomWidth: 1,
  },
  filterChips: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    position: "relative",
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  tabContent: {
    padding: 16,
    gap: 16,
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  requestTitle: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requestTime: {
    fontSize: 15,
    fontWeight: "500",
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
    fontSize: 16,
    fontWeight: "600",
  },
  requestMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestMetaText: {
    fontSize: 14,
  },
  requestExpires: {
    fontSize: 13,
    fontWeight: "600",
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  requestButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  requestButtonPrimaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  requestButtonSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  requestButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
  },
  confirmedCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  confirmedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  confirmedTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  confirmedCountdown: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  confirmedLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  confirmedLocationText: {
    fontSize: 14,
  },
  confirmedDate: {
    fontSize: 15,
    fontWeight: "500",
  },
  paymentProgress: {
    gap: 6,
    marginTop: 4,
  },
  paymentProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentProgressLabel: {
    fontSize: 13,
  },
  paymentProgressValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  paymentProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  paymentProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  paymentProgressText: {
    fontSize: 12,
  },
  confirmedActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  confirmedButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmedButtonPrimaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  confirmedButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  confirmedButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pastCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  pastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  pastTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  pastDate: {
    fontSize: 14,
    marginTop: 2,
  },
  pastStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pastStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pastLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pastLocationText: {
    fontSize: 14,
  },
  pastAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  pastReviewButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 4,
  },
  pastReviewButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
