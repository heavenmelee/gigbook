import {
  Text, View, ScrollView, TouchableOpacity, StyleSheet, Platform, FlatList, TextInput, Image,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function ChatScreen() {
  const colors = useColors();
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations, isLoading, refetch } = trpc.chat.getConversations.useQuery();
  const { data: unreadData } = trpc.chat.getUnreadCount.useQuery();

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  const filteredConversations = conversations?.filter((conv) => {
    const musicianName = conv.otherUser?.name || "";
    const bookingEvent = conv.booking?.venueName || "";
    const query = searchQuery.toLowerCase();
    return musicianName.toLowerCase().includes(query) || bookingEvent.toLowerCase().includes(query);
  }) || [];

  const handleOpenChat = (conversationId: number) => {
    tap();
    router.push({
      pathname: "/(customer)/chat-detail",
      params: { conversationId: conversationId.toString() },
    });
  };

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
    <ScreenContainer className="p-0" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Messages</Text>
        {unreadData && unreadData.unreadCount > 0 && (
          <View style={[s.badge, { backgroundColor: colors.error }]}>
            <Text style={s.badgeText}>{unreadData.unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={[s.searchContainer, { backgroundColor: colors.surface }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          style={[s.searchInput, { color: colors.foreground }]}
          placeholder="Search conversations..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      {isLoading ? (
        <View style={s.loadingContainer}>
          <Text style={{ color: colors.muted }}>Loading conversations...</Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={s.emptyContainer}>
          <IconSymbol name="paperplane.fill" size={48} color={colors.muted} />
          <Text style={[s.emptyTitle, { color: colors.foreground }]}>No conversations yet</Text>
          <Text style={[s.emptySubtitle, { color: colors.muted }]}>
            Start a conversation when you book a musician
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: conv }) => (
            <TouchableOpacity
              style={[s.conversationCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
              onPress={() => handleOpenChat(conv.id)}
            >
              <View style={s.cardContent}>
                {/* Avatar */}
                <View style={[s.avatar, { backgroundColor: colors.primary + "20" }]}>
                  {conv.otherUser?.profilePhoto ? (
                    <Image source={{ uri: conv.otherUser.profilePhoto }} style={s.avatarImage} />
                  ) : (
                    <Text style={[s.avatarText, { color: colors.primary }]}>
                      {conv.otherUser?.name?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  )}
                </View>

                {/* Message Info */}
                <View style={s.messageInfo}>
                  <View style={s.nameRow}>
                    <Text style={[s.musicianName, { color: colors.foreground }]}>
                      {conv.otherUser?.name || "Unknown"}
                    </Text>
                    <Text style={[s.timestamp, { color: colors.muted }]}>
                      {formatDate(conv.lastMessageAt)}
                    </Text>
                  </View>
                  <Text style={[s.eventName, { color: colors.muted }]}>
                    {conv.booking?.venueName || "Booking"}
                  </Text>
                  <Text
                    style={[
                      s.lastMessage,
                      {
                        color: (conv.unreadByUser || 0) > 0 ? colors.foreground : colors.muted,
                        fontWeight: (conv.unreadByUser || 0) > 0 ? "600" : "400",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {conv.lastMessagePreview || "No messages yet"}
                  </Text>
                </View>

                {/* Unread Badge */}
                {(conv.unreadByUser || 0) > 0 && (
                  <View style={[s.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={s.unreadBadgeText}>{conv.unreadByUser}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      )}
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, minWidth: 24, alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  conversationCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  cardContent: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  avatarText: { fontSize: 18, fontWeight: "600" },
  messageInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  musicianName: { fontSize: 15, fontWeight: "600" },
  timestamp: { fontSize: 12 },
  eventName: { fontSize: 12 },
  lastMessage: { fontSize: 13 },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  unreadBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
});
