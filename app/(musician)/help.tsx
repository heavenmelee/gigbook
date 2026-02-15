import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function HelpScreen() {
  const colors = useColors();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "How do I get paid?",
      answer: "Payments are held in escrow and released to your bank account 24 hours after event completion. You can withdraw your balance anytime from the Wallet tab.",
    },
    {
      id: "2",
      question: "What if a customer cancels?",
      answer: "Cancellation policies depend on your settings. If cancelled within your policy window, you'll receive the deposit as compensation. Full payment is refunded to customer if cancelled outside policy window.",
    },
    {
      id: "3",
      question: "How do I handle disputes?",
      answer: "If you have a dispute with a customer, contact our support team immediately. We'll mediate and review evidence from both parties to reach a fair resolution.",
    },
    {
      id: "4",
      question: "Can I decline booking requests?",
      answer: "Yes, you can decline any booking request. However, frequent declines may affect your visibility in search results. It's better to keep your calendar updated.",
    },
    {
      id: "5",
      question: "What is the platform fee?",
      answer: "Gigbook charges 10% commission on all bookings. This fee is automatically deducted from your payout.",
    },
  ];

  const supportOptions: SupportOption[] = [
    {
      id: "email",
      title: "Email Support",
      description: "Get help via email (24-48 hour response)",
      icon: "paperplane.fill",
      action: () => {
        Linking.openURL("mailto:support@gigbook.my?subject=Musician Support Request");
      },
    },
    {
      id: "whatsapp",
      title: "WhatsApp Support",
      description: "Chat with us on WhatsApp (Mon-Fri, 9am-6pm)",
      icon: "bell.fill",
      action: () => {
        Alert.alert("Not Implemented", "WhatsApp support will be implemented");
      },
    },
    {
      id: "dispute",
      title: "File a Dispute",
      description: "Report an issue with a booking or customer",
      icon: "exclamationmark.triangle.fill",
      action: () => {
        Alert.alert("Not Implemented", "Dispute filing will be implemented");
      },
    },
  ];

  const toggleFAQ = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.backButton} onPress={handleBack} activeOpacity={0.7}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Help & Disputes</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== SUPPORT OPTIONS ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Contact Support</Text>
          <View style={s.supportGrid}>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[s.supportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  option.action();
                }}
                activeOpacity={0.7}
              >
                <View style={[s.supportIconContainer, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name={option.icon as any} size={28} color={colors.primary} />
                </View>
                <Text style={[s.supportTitle, { color: colors.foreground }]}>{option.title}</Text>
                <Text style={[s.supportDescription, { color: colors.muted }]}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ==================== FAQ ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Frequently Asked Questions</Text>
          <View style={s.faqList}>
            {faqs.map((faq) => (
              <View
                key={faq.id}
                style={[s.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <TouchableOpacity
                  style={s.faqHeader}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.faqQuestion, { color: colors.foreground }]}>{faq.question}</Text>
                  <IconSymbol
                    name={expandedFAQ === faq.id ? "chevron.up" : "chevron.down"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
                {expandedFAQ === faq.id && (
                  <View style={s.faqAnswerContainer}>
                    <Text style={[s.faqAnswer, { color: colors.muted }]}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ==================== RESOURCES ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Resources</Text>
          <View style={s.resourcesList}>
            <TouchableOpacity
              style={[s.resourceRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => Alert.alert("Not Implemented", "Terms of Service will be implemented")}
              activeOpacity={0.7}
            >
              <Text style={[s.resourceText, { color: colors.foreground }]}>Terms of Service</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.resourceRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => Alert.alert("Not Implemented", "Privacy Policy will be implemented")}
              activeOpacity={0.7}
            >
              <Text style={[s.resourceText, { color: colors.foreground }]}>Privacy Policy</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.resourceRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => Alert.alert("Not Implemented", "Community Guidelines will be implemented")}
              activeOpacity={0.7}
            >
              <Text style={[s.resourceText, { color: colors.foreground }]}>Community Guidelines</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================== APP INFO ==================== */}
        <View style={[s.appInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.appInfoText, { color: colors.muted }]}>Gigbook v1.0.0</Text>
          <Text style={[s.appInfoText, { color: colors.muted }]}>© 2026 Gigbook Malaysia</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  supportGrid: {
    gap: 12,
  },
  supportCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    alignItems: "center",
  },
  supportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  supportDescription: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  resourcesList: {
    gap: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  resourceText: {
    fontSize: 15,
    fontWeight: "600",
  },
  appInfo: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  appInfoText: {
    fontSize: 12,
  },
});
