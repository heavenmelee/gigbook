import {
  Text, View, TouchableOpacity, StyleSheet, Platform, FlatList, TextInput, Image,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function MessagesScreen() {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  // Fetch all bookings for this customer to show as conversations
  const { data: bookings = [], isLoading, refetch } = trpc.booking.getMyBookings.useQuery();

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Filter bookings by musician name or venue
  const filtered = bookings.filter((booking: any) => {
    const musicianName = booking.musician?.name || "";
    const venueName = booking.venueName || "";
    const query = search.toLowerCase();
    return musicianName.toLowerCase().includes(query) || venueName.toLowerCase().includes(query);
  });

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <ScreenContainer className="p-0">
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Messages</Text>
      </View>
      <View style={s.searchWrap}>
        <View style={[s.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            style={[s.searchInput, { color: colors.foreground }]}
            placeholder="Search messages"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        contentContainerStyle={s.listPad}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <IconSymbol name="bubble.left.fill" size={40} color={colors.muted} />
            <Text style={[s.emptyText, { color: colors.muted }]}>No messages yet</Text>
            <Text style={[s.emptySubtext, { color: colors.muted }]}>Messages will appear here when you book a musician</Text>
          </View>
        }
        renderItem={({ item: booking }: { item: any }) => (
          <TouchableOpacity
            style={[s.threadCard, { borderBottomColor: colors.border }]}
            onPress={() => {
              tap();
              router.push({
                pathname: "/(customer)/messages/[bookingId]",
                params: { bookingId: booking.id.toString() },
              });
            }}
            activeOpacity={0.7}
          >
            <View style={[s.avatar, { backgroundColor: colors.primary }]}>
              {booking.musician?.profilePhoto ? (
                <Image source={{ uri: booking.musician.profilePhoto }} style={s.avatarImage} />
              ) : (
                <Text style={s.avatarText}>{booking.musician?.name?.charAt(0).toUpperCase() || "?"}</Text>
              )}
            </View>
            <View style={s.threadBody}>
              <View style={s.threadTop}>
                <Text style={[s.threadName, { color: colors.foreground }]}>{booking.musician?.name || "Unknown"}</Text>
                <Text style={[s.threadTime, { color: colors.muted }]}>{formatDate(booking.createdAt)}</Text>
              </View>
              <Text style={[s.bookingRef, { color: colors.primary }]}>{booking.venueName || "Booking"}</Text>
              <Text style={[s.lastMsg, { color: colors.muted }]} numberOfLines={1}>
                {booking.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  listPad: { paddingBottom: 24 },
  threadCard: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5, gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  threadBody: { flex: 1, gap: 2 },
  threadTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  threadName: { fontSize: 16, fontWeight: "600" },
  threadTime: { fontSize: 12 },
  bookingRef: { fontSize: 12, fontWeight: "500" },
  lastMsg: { fontSize: 14, marginTop: 2 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
});
