import {
  Text, View, TouchableOpacity, StyleSheet, Platform, FlatList, TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";

interface Thread {
  id: string;
  musicianName: string;
  musicianInitial: string;
  bookingRef: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const MOCK_THREADS: Thread[] = [
  { id: "1", musicianName: "Rani", musicianInitial: "R", bookingRef: "Wedding · 22 Feb", lastMessage: "Sure, I can play those songs!", time: "2m ago", unread: 2 },
  { id: "2", musicianName: "Jazz Trio KL", musicianInitial: "J", bookingRef: "Corporate · 28 Feb", lastMessage: "Quote sent: RM 2,500", time: "1h ago", unread: 0 },
  { id: "3", musicianName: "DJ Amir", musicianInitial: "D", bookingRef: "Birthday · 2 Mar", lastMessage: "What time should I arrive?", time: "3h ago", unread: 1 },
];

export default function MessagesScreen() {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const filtered = MOCK_THREADS.filter((t) =>
    t.musicianName.toLowerCase().includes(search.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

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
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <IconSymbol name="bubble.left.fill" size={40} color={colors.muted} />
            <Text style={[s.emptyText, { color: colors.muted }]}>No messages yet</Text>
            <Text style={[s.emptySubtext, { color: colors.muted }]}>Messages will appear here when you book a musician</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.threadCard, { borderBottomColor: colors.border }]}
            onPress={() => { tap(); router.push(`/(customer)/chat?threadId=${item.id}&name=${item.musicianName}`); }}
            activeOpacity={0.7}
          >
            <View style={[s.avatar, { backgroundColor: colors.primary }]}>
              <Text style={s.avatarText}>{item.musicianInitial}</Text>
            </View>
            <View style={s.threadBody}>
              <View style={s.threadTop}>
                <Text style={[s.threadName, { color: colors.foreground }]}>{item.musicianName}</Text>
                <Text style={[s.threadTime, { color: colors.muted }]}>{item.time}</Text>
              </View>
              <Text style={[s.bookingRef, { color: colors.primary }]}>{item.bookingRef}</Text>
              <Text style={[s.lastMsg, { color: item.unread > 0 ? colors.foreground : colors.muted, fontWeight: item.unread > 0 ? "600" : "400" }]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={[s.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={s.unreadText}>{item.unread}</Text>
              </View>
            )}
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
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  threadBody: { flex: 1, gap: 2 },
  threadTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  threadName: { fontSize: 16, fontWeight: "600" },
  threadTime: { fontSize: 12 },
  bookingRef: { fontSize: 12, fontWeight: "500" },
  lastMsg: { fontSize: 14, marginTop: 2 },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
});
