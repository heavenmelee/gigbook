import {
  Text, View, TouchableOpacity, StyleSheet, Platform, FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";

type BookingStatus = "awaiting_quote" | "awaiting_deposit" | "confirmed" | "completed" | "cancelled";
type Tab = "upcoming" | "pending" | "past";

interface Booking {
  id: string;
  musicianName: string;
  musicianInitial: string;
  date: string;
  time: string;
  location: string;
  status: BookingStatus;
  package: string;
  amount: string;
}

const MOCK_BOOKINGS: Booking[] = [
  { id: "1", musicianName: "Rani", musicianInitial: "R", date: "Sat, 22 Feb", time: "8:00 PM", location: "Mont Kiara", status: "confirmed", package: "Wedding Acoustic", amount: "RM 1,200" },
  { id: "2", musicianName: "Jazz Trio KL", musicianInitial: "J", date: "Fri, 28 Feb", time: "7:00 PM", location: "Bangsar", status: "awaiting_deposit", package: "Corporate Jazz", amount: "RM 2,500" },
  { id: "3", musicianName: "DJ Amir", musicianInitial: "D", date: "Sun, 2 Mar", time: "9:00 PM", location: "KLCC", status: "awaiting_quote", package: "Custom", amount: "TBD" },
  { id: "4", musicianName: "Rani", musicianInitial: "R", date: "Sat, 1 Feb", time: "6:00 PM", location: "Petaling Jaya", status: "completed", package: "Birthday Acoustic", amount: "RM 800" },
  { id: "5", musicianName: "Siti Band", musicianInitial: "S", date: "Fri, 10 Jan", time: "7:30 PM", location: "Shah Alam", status: "cancelled", package: "Wedding Band", amount: "RM 3,000" },
];

const STATUS_CONFIG: Record<BookingStatus, { label: string; colorKey: "primary" | "warning" | "success" | "error" | "muted" }> = {
  awaiting_quote: { label: "Awaiting quote", colorKey: "warning" },
  awaiting_deposit: { label: "Awaiting deposit", colorKey: "warning" },
  confirmed: { label: "Confirmed", colorKey: "success" },
  completed: { label: "Completed", colorKey: "primary" },
  cancelled: { label: "Cancelled", colorKey: "error" },
};

export default function BookingsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "pending", label: "Pending" },
    { key: "past", label: "Past" },
  ];

  const filtered = MOCK_BOOKINGS.filter((b) => {
    if (activeTab === "upcoming") return b.status === "confirmed";
    if (activeTab === "pending") return b.status === "awaiting_quote" || b.status === "awaiting_deposit";
    return b.status === "completed" || b.status === "cancelled";
  });

  const getCTA = (booking: Booking) => {
    switch (booking.status) {
      case "awaiting_quote": return { label: "View quote", action: () => router.push(`/(customer)/booking-detail?id=${booking.id}`) };
      case "awaiting_deposit": return { label: "Pay deposit", action: () => router.push(`/(customer)/booking-detail?id=${booking.id}`) };
      case "confirmed": return { label: "View booking", action: () => router.push(`/(customer)/booking-detail?id=${booking.id}`) };
      case "completed": return { label: "Leave review", action: () => router.push(`/(customer)/booking-detail?id=${booking.id}`) };
      default: return null;
    }
  };

  return (
    <ScreenContainer className="p-0">
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Bookings</Text>
      </View>
      <View style={[s.tabRow, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => { tap(); setActiveTab(tab.key); }}
          >
            <Text style={[s.tabText, { color: activeTab === tab.key ? colors.primary : colors.muted }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        contentContainerStyle={s.listPad}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <IconSymbol name="calendar" size={40} color={colors.muted} />
            <Text style={[s.emptyText, { color: colors.muted }]}>No {activeTab} bookings</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusCfg = STATUS_CONFIG[item.status];
          const cta = getCTA(item);
          const statusColor = colors[statusCfg.colorKey];
          return (
            <TouchableOpacity
              style={[s.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => { tap(); router.push(`/(customer)/booking-detail?id=${item.id}`); }}
              activeOpacity={0.7}
            >
              <View style={s.cardTop}>
                <View style={[s.musicianAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={s.avatarText}>{item.musicianInitial}</Text>
                </View>
                <View style={s.cardInfo}>
                  <Text style={[s.musicianName, { color: colors.foreground }]}>{item.musicianName}</Text>
                  <Text style={[s.bookingDate, { color: colors.muted }]}>{item.date} · {item.time}</Text>
                  <View style={s.locationRow}>
                    <IconSymbol name="location.fill" size={12} color={colors.muted} />
                    <Text style={[s.locationText, { color: colors.muted }]}> {item.location}</Text>
                  </View>
                </View>
                <View style={[s.statusBadge, { backgroundColor: statusColor + "20" }]}>
                  <Text style={[s.statusText, { color: statusColor }]}>{statusCfg.label}</Text>
                </View>
              </View>
              <View style={[s.cardBottom, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[s.packageLabel, { color: colors.muted }]}>{item.package}</Text>
                  <Text style={[s.amountText, { color: colors.foreground }]}>{item.amount}</Text>
                </View>
                {cta && (
                  <TouchableOpacity
                    style={[s.ctaBtn, { backgroundColor: colors.primary }]}
                    onPress={() => { tap(); cta.action(); }}
                  >
                    <Text style={s.ctaBtnText}>{cta.label}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  tabRow: { flexDirection: "row", borderBottomWidth: 0.5 },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 15, fontWeight: "600" },
  listPad: { padding: 16, gap: 12, paddingBottom: 24 },
  bookingCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  cardTop: { flexDirection: "row", padding: 16, gap: 12, alignItems: "flex-start" },
  musicianAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cardInfo: { flex: 1, gap: 2 },
  musicianName: { fontSize: 16, fontWeight: "600" },
  bookingDate: { fontSize: 13 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 0.5 },
  packageLabel: { fontSize: 12 },
  amountText: { fontSize: 16, fontWeight: "700" },
  ctaBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  ctaBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});
