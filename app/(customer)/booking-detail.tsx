import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";

export default function BookingDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();

  // Mock data
  const booking = {
    id: id || "1",
    musicianName: "Jazz Quartet",
    musicianPhoto: "https://via.placeholder.com/80",
    date: "Saturday, February 22, 2025",
    time: "8:00 PM",
    location: "Grand Ballroom, Kuala Lumpur",
    status: "confirmed",
    package: "Premium",
    duration: "3 hours",
    price: 2400,
    deposit: 600,
    paymentStatus: "Deposit paid",
    cancellationPolicy: "Free cancellation up to 7 days before event",
  };

  const handleMessage = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(customer)/chat?id=${booking.id}`);
  };

  const handleNavigate = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert("Navigate", "Opening maps to " + booking.location);
  };

  const handleCall = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert("Call", "Calling " + booking.musicianName);
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
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
          <Text style={[s.headerTitle, { color: colors.foreground }]}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.content}>
          {/* ==================== STATUS CARD ==================== */}
          <View style={[s.statusCard, { backgroundColor: colors.success + "15", borderColor: colors.success }]}>
            <View style={s.statusRow}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <View style={s.statusText}>
                <Text style={[s.statusTitle, { color: colors.success }]}>Confirmed</Text>
                <Text style={[s.statusSubtitle, { color: colors.muted }]}>Event is confirmed</Text>
              </View>
            </View>
          </View>

          {/* ==================== MUSICIAN CARD ==================== */}
          <View style={[s.musicianCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={s.musicianRow}>
              <Image source={{ uri: booking.musicianPhoto }} style={s.musicianPhoto} />
              <View style={s.musicianInfo}>
                <Text style={[s.musicianName, { color: colors.foreground }]}>{booking.musicianName}</Text>
                <Text style={[s.musicianRole, { color: colors.muted }]}>Professional musicians</Text>
              </View>
            </View>
          </View>

          {/* ==================== EVENT DETAILS ==================== */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Where & When</Text>
            <View style={[s.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.detailRow}>
                <View style={[s.detailIcon, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name="calendar" size={18} color={colors.primary} />
                </View>
                <View style={s.detailText}>
                  <Text style={[s.detailLabel, { color: colors.muted }]}>Date</Text>
                  <Text style={[s.detailValue, { color: colors.foreground }]}>{booking.date}</Text>
                </View>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.detailRow}>
                <View style={[s.detailIcon, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name="clock.fill" size={18} color={colors.primary} />
                </View>
                <View style={s.detailText}>
                  <Text style={[s.detailLabel, { color: colors.muted }]}>Time</Text>
                  <Text style={[s.detailValue, { color: colors.foreground }]}>{booking.time}</Text>
                </View>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.detailRow}>
                <View style={[s.detailIcon, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name="location.fill" size={18} color={colors.primary} />
                </View>
                <View style={s.detailText}>
                  <Text style={[s.detailLabel, { color: colors.muted }]}>Location</Text>
                  <Text style={[s.detailValue, { color: colors.foreground }]}>{booking.location}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ==================== PACKAGE DETAILS ==================== */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Package Details</Text>
            <View style={[s.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { color: colors.muted }]}>Package</Text>
                <Text style={[s.detailValue, { color: colors.foreground }]}>{booking.package}</Text>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { color: colors.muted }]}>Duration</Text>
                <Text style={[s.detailValue, { color: colors.foreground }]}>{booking.duration}</Text>
              </View>
            </View>
          </View>

          {/* ==================== PAYMENT STATUS ==================== */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Payment Status</Text>
            <View style={[s.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.priceRow}>
                <Text style={[s.priceLabel, { color: colors.muted }]}>Total Price</Text>
                <Text style={[s.priceValue, { color: colors.foreground }]}>RM {booking.price}</Text>
              </View>
              <View style={[s.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    s.progressFill,
                    { backgroundColor: colors.success, width: "25%" },
                  ]}
                />
              </View>
              <View style={s.paymentDetails}>
                <View style={s.paymentRow}>
                  <Text style={[s.paymentLabel, { color: colors.muted }]}>Deposit Paid</Text>
                  <Text style={[s.paymentAmount, { color: colors.success }]}>RM {booking.deposit}</Text>
                </View>
                <View style={s.paymentRow}>
                  <Text style={[s.paymentLabel, { color: colors.muted }]}>Remaining</Text>
                  <Text style={[s.paymentAmount, { color: colors.foreground }]}>
                    RM {booking.price - booking.deposit}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ==================== CANCELLATION POLICY ==================== */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Cancellation Policy</Text>
            <View style={[s.policyCard, { backgroundColor: colors.warning + "15", borderColor: colors.warning }]}>
              <Text style={[s.policyText, { color: colors.foreground }]}>{booking.cancellationPolicy}</Text>
            </View>
          </View>

          {/* ==================== SUPPORT ==================== */}
          <TouchableOpacity
            style={[s.supportButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => Alert.alert("Support", "Report an issue with this booking")}
            activeOpacity={0.7}
          >
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.error} />
            <Text style={[s.supportButtonText, { color: colors.error }]}>Report issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ==================== STICKY ACTIONS ==================== */}
      <View style={[s.stickyActions, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[s.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleMessage}
          activeOpacity={0.8}
        >
          <IconSymbol name="paperplane.fill" size={18} color="#fff" />
          <Text style={s.actionButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleNavigate}
          activeOpacity={0.8}
        >
          <IconSymbol name="location.fill" size={18} color="#fff" />
          <Text style={s.actionButtonText}>Navigate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleCall}
          activeOpacity={0.8}
        >
          <IconSymbol name="phone.fill" size={18} color="#fff" />
          <Text style={s.actionButtonText}>Call</Text>
        </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statusCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  statusSubtitle: {
    fontSize: 13,
  },
  musicianCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  musicianRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  musicianPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
  },
  musicianInfo: {
    flex: 1,
    gap: 4,
  },
  musicianName: {
    fontSize: 15,
    fontWeight: "600",
  },
  musicianRole: {
    fontSize: 13,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  detailCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
  },
  paymentCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  paymentDetails: {
    gap: 8,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 13,
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: "600",
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
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  stickyActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
