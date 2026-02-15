import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";

interface Booking {
  id: string;
  musicianName: string;
  musicianPhoto: string;
  date: string;
  time: string;
  location: string;
  status: "awaiting-quote" | "awaiting-deposit" | "confirmed" | "completed" | "cancelled";
  price?: number;
}

export default function CustomerBookingsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"upcoming" | "pending" | "past">("upcoming");

  // Mock data
  const upcomingBookings: Booking[] = [
    {
      id: "1",
      musicianName: "Jazz Quartet",
      musicianPhoto: "https://via.placeholder.com/60",
      date: "Sat, Feb 22",
      time: "8:00 PM",
      location: "Grand Ballroom, KL",
      status: "confirmed",
      price: 2400,
    },
    {
      id: "2",
      musicianName: "Acoustic Duo",
      musicianPhoto: "https://via.placeholder.com/60",
      date: "Sun, Mar 1",
      time: "6:00 PM",
      location: "Cafe Ambiance, Bangsar",
      status: "confirmed",
      price: 1200,
    },
  ];

  const pendingBookings: Booking[] = [
    {
      id: "3",
      musicianName: "DJ Pro",
      musicianPhoto: "https://via.placeholder.com/60",
      date: "Fri, Feb 28",
      time: "10:00 PM",
      location: "Club Euphoria, KL",
      status: "awaiting-deposit",
      price: 3600,
    },
    {
      id: "4",
      musicianName: "String Ensemble",
      musicianPhoto: "https://via.placeholder.com/60",
      date: "Wed, Mar 5",
      time: "7:00 PM",
      location: "Hotel Istana, KL",
      status: "awaiting-quote",
    },
  ];

  const pastBookings: Booking[] = [
    {
      id: "5",
      musicianName: "Jazz Quartet",
      musicianPhoto: "https://via.placeholder.com/60",
      date: "Sat, Feb 1",
      time: "8:00 PM",
      location: "Wedding Venue, Selangor",
      status: "completed",
      price: 2400,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return colors.success;
      case "awaiting-deposit":
        return colors.warning;
      case "awaiting-quote":
        return colors.primary;
      case "completed":
        return colors.success;
      case "cancelled":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "awaiting-deposit":
        return "Awaiting deposit";
      case "awaiting-quote":
        return "Awaiting quote";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getCtaText = (status: string) => {
    switch (status) {
      case "awaiting-quote":
        return "View quote";
      case "awaiting-deposit":
        return "Pay deposit";
      case "confirmed":
        return "View booking";
      case "completed":
        return "Leave review";
      default:
        return "View";
    }
  };

  const handleViewBooking = (bookingId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(customer)/booking-detail?id=${bookingId}`);
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={[s.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleViewBooking(item.id)}
      activeOpacity={0.7}
    >
      <View style={s.cardContent}>
        <Image source={{ uri: item.musicianPhoto }} style={s.musicianPhoto} />
        <View style={s.bookingInfo}>
          <Text style={[s.musicianName, { color: colors.foreground }]}>{item.musicianName}</Text>
          <View style={s.dateTimeRow}>
            <IconSymbol name="calendar" size={14} color={colors.muted} />
            <Text style={[s.dateTime, { color: colors.muted }]}>{item.date}</Text>
            <IconSymbol name="clock.fill" size={14} color={colors.muted} />
            <Text style={[s.dateTime, { color: colors.muted }]}>{item.time}</Text>
          </View>
          <View style={s.locationRow}>
            <IconSymbol name="location.fill" size={14} color={colors.muted} />
            <Text style={[s.location, { color: colors.muted }]} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
        <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={s.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[s.ctaButton, { backgroundColor: colors.primary }]}
        onPress={() => handleViewBooking(item.id)}
        activeOpacity={0.8}
      >
        <Text style={s.ctaButtonText}>{getCtaText(item.status)}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const currentBookings =
    activeTab === "upcoming"
      ? upcomingBookings
      : activeTab === "pending"
        ? pendingBookings
        : pastBookings;

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== TABS ==================== */}
        <View style={[s.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {(["upcoming", "pending", "past"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                s.tab,
                activeTab === tab && [s.tabActive, { borderBottomColor: colors.primary }],
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  s.tabText,
                  { color: activeTab === tab ? colors.primary : colors.muted },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.content}>
          {currentBookings.length > 0 ? (
            <FlatList
              data={currentBookings}
              renderItem={renderBookingCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={s.bookingsList}
            />
          ) : (
            <View style={s.emptyState}>
              <IconSymbol name="calendar" size={48} color={colors.muted} />
              <Text style={[s.emptyTitle, { color: colors.foreground }]}>No bookings yet</Text>
              <Text style={[s.emptyText, { color: colors.muted }]}>
                Start exploring musicians to make your first booking
              </Text>
              <TouchableOpacity
                style={[s.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(customer)/explore")}
                activeOpacity={0.8}
              >
                <Text style={s.emptyButtonText}>Explore musicians</Text>
              </TouchableOpacity>
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
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  musicianPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
  },
  bookingInfo: {
    flex: 1,
    gap: 6,
  },
  musicianName: {
    fontSize: 15,
    fontWeight: "600",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateTime: {
    fontSize: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  ctaButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
