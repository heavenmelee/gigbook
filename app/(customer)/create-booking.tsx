import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function CreateBookingScreen() {
  const colors = useColors();
  const { musicianId, packageId } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: "Event details", icon: "calendar" },
    { id: 2, title: "Choose package", icon: "gift" },
    { id: 3, title: "Add-ons", icon: "plus.circle" },
    { id: 4, title: "Summary", icon: "doc.text" },
    { id: 5, title: "Confirmation", icon: "checkmark.circle" },
  ];

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleConfirm = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Booking Confirmed", "Your booking has been confirmed successfully!");
    router.push("/(customer)/bookings");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={s.stepContent}>
            <Text style={[s.stepTitle, { color: colors.foreground }]}>Event Details</Text>
            <View style={s.form}>
              <View style={s.formGroup}>
                <Text style={[s.label, { color: colors.foreground }]}>Event Type</Text>
                <View style={s.chipRow}>
                  {["Wedding", "Corporate", "Birthday", "Cafe/Restaurant"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[s.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => {}}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.chipText, { color: colors.foreground }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={s.formGroup}>
                <Text style={[s.label, { color: colors.foreground }]}>Date & Time</Text>
                <TouchableOpacity
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {}}
                >
                  <Text style={[s.inputText, { color: colors.muted }]}>Select date and time</Text>
                </TouchableOpacity>
              </View>

              <View style={s.formGroup}>
                <Text style={[s.label, { color: colors.foreground }]}>Location</Text>
                <TouchableOpacity
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {}}
                >
                  <Text style={[s.inputText, { color: colors.muted }]}>Select location</Text>
                </TouchableOpacity>
              </View>

              <View style={s.formGroup}>
                <Text style={[s.label, { color: colors.foreground }]}>Duration</Text>
                <View style={s.chipRow}>
                  {["2 hours", "3 hours", "4 hours", "5+ hours"].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[s.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => {}}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.chipText, { color: colors.foreground }]}>{duration}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={s.formGroup}>
                <Text style={[s.label, { color: colors.foreground }]}>Crowd Size (optional)</Text>
                <TouchableOpacity
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {}}
                >
                  <Text style={[s.inputText, { color: colors.muted }]}>e.g., 50-100 guests</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={s.stepContent}>
            <Text style={[s.stepTitle, { color: colors.foreground }]}>Choose Package</Text>
            <View style={s.packagesList}>
              {[
                { name: "Standard", duration: "2 hours", price: 800 },
                { name: "Premium", duration: "3 hours", price: 1200 },
                { name: "Deluxe", duration: "4 hours", price: 1800 },
              ].map((pkg) => (
                <TouchableOpacity
                  key={pkg.name}
                  style={[s.packageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {}}
                  activeOpacity={0.7}
                >
                  <View style={s.packageHeader}>
                    <View>
                      <Text style={[s.packageName, { color: colors.foreground }]}>{pkg.name}</Text>
                      <Text style={[s.packageDuration, { color: colors.muted }]}>{pkg.duration}</Text>
                    </View>
                    <Text style={[s.packagePrice, { color: colors.primary }]}>RM {pkg.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={s.stepContent}>
            <Text style={[s.stepTitle, { color: colors.foreground }]}>Add-ons (Optional)</Text>
            <View style={s.addOnsList}>
              {[
                { name: "Song request", price: 100 },
                { name: "Extra set (1 hour)", price: 300 },
                { name: "Sound system upgrade", price: 200 },
                { name: "Emcee services", price: 150 },
              ].map((addon) => (
                <TouchableOpacity
                  key={addon.name}
                  style={[s.addOnCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {}}
                  activeOpacity={0.7}
                >
                  <View style={s.addOnHeader}>
                    <Text style={[s.addOnName, { color: colors.foreground }]}>{addon.name}</Text>
                    <Text style={[s.addOnPrice, { color: colors.primary }]}>+RM {addon.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[s.priceCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
              <Text style={[s.priceLabel, { color: colors.muted }]}>Live price update</Text>
              <Text style={[s.priceValue, { color: colors.primary }]}>RM 1,200</Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={s.stepContent}>
            <Text style={[s.stepTitle, { color: colors.foreground }]}>Summary & Payment</Text>
            <View style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.summaryRow}>
                <Text style={[s.summaryLabel, { color: colors.muted }]}>Package</Text>
                <Text style={[s.summaryValue, { color: colors.foreground }]}>Premium (3 hours)</Text>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.summaryRow}>
                <Text style={[s.summaryLabel, { color: colors.muted }]}>Date & Time</Text>
                <Text style={[s.summaryValue, { color: colors.foreground }]}>Sat, Feb 22, 8:00 PM</Text>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.summaryRow}>
                <Text style={[s.summaryLabel, { color: colors.muted }]}>Location</Text>
                <Text style={[s.summaryValue, { color: colors.foreground }]}>Grand Ballroom, KL</Text>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.summaryRow}>
                <Text style={[s.summaryLabel, { color: colors.muted }]}>Total Price</Text>
                <Text style={[s.summaryValue, { color: colors.primary, fontWeight: "700" }]}>RM 1,200</Text>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.summaryRow}>
                <Text style={[s.summaryLabel, { color: colors.muted }]}>Deposit Required</Text>
                <Text style={[s.summaryValue, { color: colors.foreground }]}>RM 300 (25%)</Text>
              </View>
            </View>
            <View style={[s.policyCard, { backgroundColor: colors.warning + "15", borderColor: colors.warning }]}>
              <Text style={[s.policyText, { color: colors.foreground }]}>
                Free cancellation up to 7 days before event
              </Text>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={s.stepContent}>
            <View style={s.confirmationBox}>
              <View style={[s.checkmark, { backgroundColor: colors.success }]}>
                <IconSymbol name="checkmark" size={48} color="#fff" />
              </View>
              <Text style={[s.confirmationTitle, { color: colors.foreground }]}>Booking Confirmed!</Text>
              <Text style={[s.confirmationText, { color: colors.muted }]}>
                Your booking has been sent to Jazz Quartet. They will confirm within 24 hours.
              </Text>
              <View style={[s.confirmationDetails, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={s.detailRow}>
                  <Text style={[s.detailLabel, { color: colors.muted }]}>Booking ID</Text>
                  <Text style={[s.detailValue, { color: colors.foreground }]}>#BK123456</Text>
                </View>
                <View style={[s.divider, { backgroundColor: colors.border }]} />
                <View style={s.detailRow}>
                  <Text style={[s.detailLabel, { color: colors.muted }]}>Status</Text>
                  <Text style={[s.detailValue, { color: colors.primary }]}>Awaiting confirmation</Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== STEPPER ==================== */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={s.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>
            Step {currentStep} of 5
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ==================== PROGRESS BAR ==================== */}
        <View style={[s.progressContainer, { backgroundColor: colors.surface }]}>
          <View style={[s.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                s.progressFill,
                { backgroundColor: colors.primary, width: `${(currentStep / 5) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* ==================== STEP CONTENT ==================== */}
        {renderStepContent()}
      </ScrollView>

      {/* ==================== ACTIONS ==================== */}
      <View style={[s.actions, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {currentStep < 5 ? (
          <TouchableOpacity
            style={[s.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={s.actionButtonText}>Next</Text>
            <IconSymbol name="chevron.right" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.actionButton, { backgroundColor: colors.success }]}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={s.actionButtonText}>Confirm Booking</Text>
            <IconSymbol name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  stepContent: {
    padding: 16,
    gap: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  inputText: {
    fontSize: 14,
  },
  packagesList: {
    gap: 12,
  },
  packageCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageName: {
    fontSize: 15,
    fontWeight: "600",
  },
  packageDuration: {
    fontSize: 12,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  addOnsList: {
    gap: 12,
  },
  addOnCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  addOnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addOnName: {
    fontSize: 14,
    fontWeight: "500",
  },
  addOnPrice: {
    fontSize: 14,
    fontWeight: "600",
  },
  priceCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
  },
  policyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  policyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  confirmationBox: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  checkmark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  confirmationText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  confirmationDetails: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
