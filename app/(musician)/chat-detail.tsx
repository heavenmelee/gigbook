import {
  Text, View, TouchableOpacity, StyleSheet, Platform, FlatList, TextInput, KeyboardAvoidingView, Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

export default function MusicianChatDetailScreen() {
  const colors = useColors();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const convId = parseInt(conversationId || "0");

  // Fetch messages
  const { data: messages, isLoading, refetch } = trpc.chat.getMessages.useQuery(
    { conversationId: convId, limit: 50 },
    { enabled: convId > 0 }
  );

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // Auto-refresh messages every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    tap();
    setIsSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: convId,
        content: input.trim(),
      });
      setInput("");
      // Refetch messages after sending
      await refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!conversationId || convId === 0) {
    return (
      <ScreenContainer>
        <View style={s.errorContainer}>
          <Text style={[s.errorTitle, { color: colors.foreground }]}>Invalid conversation</Text>
          <Text style={[s.errorSubtitle, { color: colors.muted }]}>Please go back and select a conversation</Text>
          <TouchableOpacity style={[s.errorBtn, { backgroundColor: colors.primary }]} onPress={() => { tap(); router.back(); }}>
            <Text style={s.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={[s.chatHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: colors.surface }]} onPress={() => { tap(); router.back(); }}>
            <IconSymbol name="arrow.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={s.headerInfo}>
            <Text style={[s.headerName, { color: colors.foreground }]}>Chat</Text>
            <Text style={[s.headerSub, { color: colors.muted }]}>Online</Text>
          </View>
        </View>

        {/* Messages */}
        {isLoading ? (
          <View style={s.loadingContainer}>
            <Text style={{ color: colors.muted }}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages || []}
            contentContainerStyle={s.messageList}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item: msg }) => {
              const isMe = msg.senderRole === "musician";
              return (
                <View style={[s.msgRow, isMe && s.msgRowMe]}>
                  {!isMe && (
                    <View style={[s.msgAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={s.msgAvatarText}>C</Text>
                    </View>
                  )}
                  <View style={[s.msgBubble, isMe ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                    <Text style={[s.msgText, { color: isMe ? "#fff" : colors.foreground }]}>{msg.content}</Text>
                    <Text style={[s.msgTime, { color: isMe ? "rgba(255,255,255,0.7)" : colors.muted }]}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input Bar */}
        <View style={[s.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[s.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
            editable={!isSending}
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: input.trim() && !isSending ? colors.primary : colors.muted }]}
            onPress={handleSend}
            disabled={!input.trim() || isSending}
          >
            <IconSymbol name="paperplane.fill" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32 },
  errorTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  errorSubtitle: { fontSize: 14, textAlign: "center" },
  errorBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  errorBtnText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 17, fontWeight: "600" },
  headerSub: { fontSize: 12 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  messageList: { padding: 16, gap: 8, paddingBottom: 8 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "85%" },
  msgRowMe: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  msgAvatarText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  msgBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: "100%" },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTime: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: 28,
    borderTopWidth: 0.5,
    gap: 10,
  },
  textInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
