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

interface ChatThread {
  id: string;
  musicianName: string;
  musicianPhoto: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  bookingId: string;
}

export default function CustomerMessagesScreen() {
  const colors = useColors();

  // Mock data
  const chatThreads: ChatThread[] = [
    {
      id: "1",
      musicianName: "Jazz Quartet",
      musicianPhoto: "https://via.placeholder.com/60",
      lastMessage: "We're excited to perform at your wedding!",
      lastMessageTime: "2 min ago",
      unreadCount: 0,
      bookingId: "1",
    },
    {
      id: "2",
      musicianName: "DJ Pro",
      musicianPhoto: "https://via.placeholder.com/60",
      lastMessage: "Can you confirm the event date?",
      lastMessageTime: "1 hour ago",
      unreadCount: 1,
      bookingId: "3",
    },
    {
      id: "3",
      musicianName: "String Ensemble",
      musicianPhoto: "https://via.placeholder.com/60",
      lastMessage: "Thank you for the booking request!",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
      bookingId: "4",
    },
  ];

  const handleOpenChat = (threadId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(customer)/chat?id=${threadId}`);
  };

  const renderChatThread = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={[
        s.threadCard,
        {
          backgroundColor: item.unreadCount > 0 ? colors.primary + "10" : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleOpenChat(item.id)}
      activeOpacity={0.7}
    >
      <View style={s.threadContent}>
        <Image source={{ uri: item.musicianPhoto }} style={s.musicianPhoto} />
        <View style={s.threadInfo}>
          <View style={s.threadHeader}>
            <Text style={[s.musicianName, { color: colors.foreground }]} numberOfLines={1}>
              {item.musicianName}
            </Text>
            <Text style={[s.time, { color: colors.muted }]}>{item.lastMessageTime}</Text>
          </View>
          <Text
            style={[
              s.lastMessage,
              {
                color: item.unreadCount > 0 ? colors.foreground : colors.muted,
                fontWeight: item.unreadCount > 0 ? "600" : "400",
              },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={[s.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={s.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== HEADER ==================== */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>Messages</Text>
        </View>

        <View style={s.content}>
          {chatThreads.length > 0 ? (
            <FlatList
              data={chatThreads}
              renderItem={renderChatThread}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={s.threadsList}
            />
          ) : (
            <View style={s.emptyState}>
              <IconSymbol name="paperplane.fill" size={48} color={colors.muted} />
              <Text style={[s.emptyTitle, { color: colors.foreground }]}>No messages yet</Text>
              <Text style={[s.emptyText, { color: colors.muted }]}>
                Messages from musicians will appear here
              </Text>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    padding: 16,
  },
  threadsList: {
    gap: 8,
  },
  threadCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  threadContent: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  musicianPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
  },
  threadInfo: {
    flex: 1,
    gap: 4,
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  musicianName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  time: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 13,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
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
});
