import {
  Text, View, TouchableOpacity, StyleSheet, Platform, FlatList, TextInput, KeyboardAvoidingView,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useRef } from "react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "musician" | "system";
  time: string;
}

const QUICK_REPLIES = [
  "Can you play these songs?",
  "What time do you arrive?",
  "Do you provide sound system?",
  "Can I add extra songs?",
];

export default function ChatScreen() {
  const colors = useColors();
  const { name } = useLocalSearchParams<{ threadId: string; name: string }>();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const [messages, setMessages] = useState<Message[]>([
    { id: "s1", text: "Booking created for Wedding Acoustic", sender: "system", time: "10:00 AM" },
    { id: "1", text: "Hi! I'm interested in your wedding package. Can you play some jazz standards?", sender: "me", time: "10:05 AM" },
    { id: "2", text: "Sure, I can play those songs! I have a great jazz repertoire.", sender: "musician", time: "10:08 AM" },
    { id: "s2", text: "Quote sent: RM 1,200", sender: "system", time: "10:15 AM" },
    { id: "3", text: "That sounds perfect! Yes please send the song list.", sender: "me", time: "10:20 AM" },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    tap();
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleQuickReply = (text: string) => { tap(); setInput(text); };

  return (
    <ScreenContainer className="p-0" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[s.chatHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: colors.surface }]} onPress={() => { tap(); router.back(); }}>
            <IconSymbol name="arrow.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={s.headerInfo}>
            <Text style={[s.headerName, { color: colors.foreground }]}>{name || "Chat"}</Text>
            <Text style={[s.headerSub, { color: colors.muted }]}>Online</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            if (item.sender === "system") {
              return (
                <View style={s.systemMsgWrap}>
                  <View style={[s.systemMsg, { backgroundColor: colors.surface }]}>
                    <Text style={[s.systemText, { color: colors.muted }]}>{item.text}</Text>
                  </View>
                </View>
              );
            }
            const isMe = item.sender === "me";
            return (
              <View style={[s.msgRow, isMe && s.msgRowMe]}>
                {!isMe && (
                  <View style={[s.msgAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={s.msgAvatarText}>{(name || "M")[0]}</Text>
                  </View>
                )}
                <View style={[s.msgBubble, isMe ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                  <Text style={[s.msgText, { color: isMe ? "#fff" : colors.foreground }]}>{item.text}</Text>
                  <Text style={[s.msgTime, { color: isMe ? "rgba(255,255,255,0.7)" : colors.muted }]}>{item.time}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={s.quickReplies}>
          <FlatList
            data={QUICK_REPLIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.quickList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={[s.quickChip, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => handleQuickReply(item)}>
                <Text style={[s.quickText, { color: colors.foreground }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

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
          />
          <TouchableOpacity style={[s.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]} onPress={handleSend} disabled={!input.trim()}>
            <IconSymbol name="paperplane.fill" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  chatHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 17, fontWeight: "600" },
  headerSub: { fontSize: 12 },
  messageList: { padding: 16, gap: 8, paddingBottom: 8 },
  systemMsgWrap: { alignItems: "center", marginVertical: 8 },
  systemMsg: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  systemText: { fontSize: 12 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "80%" },
  msgRowMe: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  msgAvatarText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  msgBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: "100%" },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTime: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  quickReplies: { paddingVertical: 8 },
  quickList: { paddingHorizontal: 16, gap: 8 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  quickText: { fontSize: 13 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", padding: 12, paddingBottom: 28, borderTopWidth: 0.5, gap: 10 },
  textInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
