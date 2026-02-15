import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";

export default function PoliciesScreen() {
  const colors = useColors();

  // Mock data - will be integrated with database later
  const [depositPercent, setDepositPercent] = useState("30");
  const [cancellationPolicy, setCancellationPolicy] = useState("flexible");
  const [overtimeRate, setOvertimeRate] = useState("150");
  const [leadTime, setLeadTime] = useState("7");

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Success", "Policies updated");
    // TODO: Save to database
    router.back();
  };

  const cancellationPolicies = [
    {
      id: "flexible",
      title: "Flexible",
      description: "Full refund if cancelled 7+ days before event",
    },
    {
      id: "moderate",
      title: "Moderate",
      description: "50% refund if cancelled 14+ days before event",
    },
    {
      id: "strict",
      title: "Strict",
      description: "No refund, deposit non-refundable",
    },
  ];

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.backButton} onPress={handleBack} activeOpacity={0.7}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Policies</Text>
        <TouchableOpacity style={s.saveButton} onPress={handleSave} activeOpacity={0.7}>
          <Text style={[s.saveButtonText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== DEPOSIT ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Deposit Requirement</Text>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            Percentage of total fee required as deposit to confirm booking
          </Text>

          <View style={s.depositRow}>
            <TextInput
              style={[s.depositInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={depositPercent}
              onChangeText={setDepositPercent}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={[s.percentSign, { color: colors.foreground }]}>%</Text>
          </View>

          <View style={[s.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.warning} />
            <Text style={[s.infoText, { color: colors.muted }]}>
              Recommended: 30-50%. Deposit is held in escrow until event completion.
            </Text>
          </View>
        </View>

        {/* ==================== CANCELLATION POLICY ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Cancellation Policy</Text>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            Choose how you handle booking cancellations
          </Text>

          <View style={s.policyOptions}>
            {cancellationPolicies.map((policy) => (
              <TouchableOpacity
                key={policy.id}
                style={[
                  s.policyCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: cancellationPolicy === policy.id ? colors.primary : colors.border,
                  },
                  cancellationPolicy === policy.id && { borderWidth: 2 },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setCancellationPolicy(policy.id);
                }}
                activeOpacity={0.7}
              >
                <View style={s.policyHeader}>
                  <Text style={[s.policyTitle, { color: colors.foreground }]}>{policy.title}</Text>
                  {cancellationPolicy === policy.id && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                  )}
                </View>
                <Text style={[s.policyDescription, { color: colors.muted }]}>
                  {policy.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ==================== OVERTIME RATE ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Overtime Rate</Text>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            Charge per hour if event runs beyond agreed duration
          </Text>

          <View style={s.rateRow}>
            <Text style={[s.currencyLabel, { color: colors.foreground }]}>RM</Text>
            <TextInput
              style={[s.rateInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={overtimeRate}
              onChangeText={setOvertimeRate}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.muted}
            />
            <Text style={[s.perHourLabel, { color: colors.muted }]}>per hour</Text>
          </View>
        </View>

        {/* ==================== LEAD TIME ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Minimum Lead Time</Text>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            Minimum days in advance customers must book
          </Text>

          <View style={s.rateRow}>
            <TextInput
              style={[s.leadTimeInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={leadTime}
              onChangeText={setLeadTime}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.muted}
            />
            <Text style={[s.daysLabel, { color: colors.muted }]}>days</Text>
          </View>
        </View>

        {/* ==================== TIPS ==================== */}
        <View style={[s.tipsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.tipsHeader}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
            <Text style={[s.tipsTitle, { color: colors.foreground }]}>Policy Tips</Text>
          </View>
          <View style={s.tipsList}>
            <Text style={[s.tipItem, { color: colors.muted }]}>• Clear policies build trust with customers</Text>
            <Text style={[s.tipItem, { color: colors.muted }]}>• Flexible policies may attract more bookings</Text>
            <Text style={[s.tipItem, { color: colors.muted }]}>• Strict policies protect you from last-minute cancellations</Text>
            <Text style={[s.tipItem, { color: colors.muted }]}>• Overtime rates should be clearly communicated upfront</Text>
          </View>
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
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  depositRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  depositInput: {
    width: 100,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  percentSign: {
    fontSize: 32,
    fontWeight: "700",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  policyOptions: {
    gap: 12,
  },
  policyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  policyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  policyDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencyLabel: {
    fontSize: 20,
    fontWeight: "600",
  },
  rateInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  perHourLabel: {
    fontSize: 15,
  },
  leadTimeInput: {
    width: 100,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  daysLabel: {
    fontSize: 15,
  },
  tipsCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 20,
  },
});
