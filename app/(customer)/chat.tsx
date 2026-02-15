import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

interface Message {
  id: string;
  sender: "user" | "musician";
  text: string;
  timestamp: string;
}

export default function ChatScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState("");

  // Mock data
  const messages: Message[] = [
    {
      id: "1",
      sender: "musician",
      text: "Hi! Thank you for your booking request!",
      timestamp: "2:30 PM",
    },
    {
      id: "2",
      sender: "user",
      text: "Thanks! Can you play some specific songs?",
      timestamp: "2:35 PM",
    },
    {
      id: "3",
      sender: "musician",
      text: "Absolutely! We can customize our setlist. What songs would you like?",
      timestamp: "2:40 PM",
    },
  ];

  const quickReplies = [
    "Can you play these songs?",
    "What time do you arrive?",
    "Do you have backup musicians?",
    "Can you provide sound system?",
  ];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMessageText("");
    Alert.alert("Message sent", messageText);
  };

  const handleQuickReply = (reply: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMessageText(reply);
  };

  return (
    <ScreenContainer className="p-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.container}
      >
        {/* ==================== HEADER ==================== */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={s.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={s.headerTitle}>
            <Text style={[s.musicianName, { color: colors.foreground }]}>Jazz Quartet</Text>
            <Text style={[s.onlineStatus, { color: colors.success }]}>Online</Text>
          </View>
          <TouchableOpacity
            style={s.callButton}
            onPress={() => Alert.alert("Call", "Calling Jazz Quartet")}
            activeOpacity={0.7}
          >
            <IconSymbol name="phone.fill" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ==================== MESSAGES ==================== */}
        <ScrollView
          contentContainerStyle={s.messagesContent}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.background }}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                s.messageRow,
                message.sender === "user" && s.userMessageRow,
              ]}
            >
              <View
                style={[
                  s.messageBubble,
                  message.sender === "user"
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    s.messageText,
                    { color: message.sender === "user" ? "#fff" : colors.foreground },
                  ]}
                >
                  {message.text}
                </Text>
              </View>
              <Text
                style={[
                  s.messageTime,
                  { color: colors.muted },
                ]}
              >
                {message.timestamp}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* ==================== QUICK REPLIES ==================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.quickRepliesContainer}
          style={[s.quickReplies, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
        >
          {quickReplies.map((reply, idx) => (
            <TouchableOpacity
              key={idx}
              style={[s.quickReplyChip, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => handleQuickReply(reply)}
              activeOpacity={0.7}
            >
              <Text style={[s.quickReplyText, { color: colors.foreground }]} numberOfLines={2}>
                {reply}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ==================== INPUT ==================== */}
        <View style={[s.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={[s.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[s.input, { color: colors.foreground }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.muted}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={s.attachButton}
              onPress={() => Alert.alert("Attach", "Attach file or photo")}
              activeOpacity={0.7}
            >
              <IconSymbol name="paperclip" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[s.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <IconSymbol name="paperplane.fill" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    gap: 2,
  },
  musicianName: {
    fontSize: 15,
    fontWeight: "600",
  },
  onlineStatus: {
    fontSize: 12,
  },
  callButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 11,
  },
  quickReplies: {
    borderTopWidth: 1,
    maxHeight: 60,
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quickReplyChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 120,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  attachButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
