import {
  Text, View, ScrollView, TouchableOpacity, StyleSheet, Platform, FlatList, TextInput, KeyboardAvoidingView, Image,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function MessageDetailScreen() {
  const colors = useColors();
  const { bookingId } = useLocalSearchParams();
  const [messageText, setMessageText] = useState("");
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const bookingIdNum = parseInt(bookingId as string, 10);

  // Fetch booking details
  const { data: bookingData } = trpc.booking.getById.useQuery({ id: bookingIdNum });
  const booking = bookingData?.booking;
  const musicianProfile = bookingData?.musicianProfile;
  const musicianUser = bookingData?.musicianUser;

  // Fetch messages for this booking (create/get conversation first)
  const { data: messages = [], refetch: refetchMessages } = trpc.chat.getMessages.useQuery({ conversationId: bookingIdNum });

  // Send message mutation
  const { mutate: sendMessage, isPending } = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
    },
  });

  // Auto-refresh messages every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetchMessages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    tap();
    sendMessage({
      conversationId: bookingIdNum,
      content: messageText,
    });
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const isCustomer = true; // This is the customer view

  if (!booking || !bookingData) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScreenContainer className="p-0" edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => { tap(); router.back(); }}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={s.headerContent}>
            <Text style={[s.musicianName, { color: colors.foreground }]}>
              {musicianUser?.name || "Musician"}
            </Text>
            <Text style={[s.bookingInfo, { color: colors.muted }]}>
              {booking?.venueName}
            </Text>
          </View>
          <View style={[s.avatar, { backgroundColor: colors.primary + "20" }]}>
            {musicianUser?.profilePhoto ? (
              <Image source={{ uri: musicianUser.profilePhoto }} style={s.avatarImage} />
            ) : (
              <Text style={[s.avatarText, { color: colors.primary }]}>
                {musicianUser?.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            )}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: msg }) => {
            // Messages from 'user' role are from the customer (this view)
            return (
              <View style={[s.messageRow, { justifyContent: msg.senderRole === "user" ? "flex-end" : "flex-start" }]}>
                <View
                  style={[
                    s.messageBubble,
                    {
                      backgroundColor: msg.senderRole === "user" ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[s.messageText, { color: msg.senderRole === "user" ? "#fff" : colors.foreground }]}>
                    {msg.content}
                  </Text>
                  <Text style={[s.messageTime, { color: msg.senderRole === "user" ? "#fff" : colors.muted }]}>
                    {formatTime(msg.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Text style={{ color: colors.muted }}>No messages yet. Start the conversation!</Text>
            </View>
          }
          contentContainerStyle={s.messagesList}
          inverted
        />

        {/* Input */}
        <View style={[s.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[s.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            editable={!isPending}
          />
          <TouchableOpacity
            style={[s.sendButton, { backgroundColor: colors.primary, opacity: isPending ? 0.6 : 1 }]}
            onPress={handleSendMessage}
            disabled={isPending || !messageText.trim()}
          >
            <IconSymbol name="paperplane.fill" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  headerContent: { flex: 1 },
  musicianName: { fontSize: 16, fontWeight: "600" },
  bookingInfo: { fontSize: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  avatarText: { fontSize: 16, fontWeight: "600" },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  messageRow: { flexDirection: "row", marginBottom: 8 },
  messageBubble: { maxWidth: "80%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 0.5 },
  messageText: { fontSize: 14 },
  messageTime: { fontSize: 11, marginTop: 4 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
