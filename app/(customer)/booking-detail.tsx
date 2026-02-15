import {
  Text, View, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert, Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";

export default function BookingDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const booking = {
    id,
    musicianName: "Rani",
    musicianInitial: "R",
    status: "confirmed" as const,
    statusLabel: "Confirmed",
    date: "Saturday, 22 February 2026",
    time: "8:00 PM - 11:00 PM",
    location: "The Grand Ballroom, Mont Kiara",
    address: "Jalan Kiara 3, Mont Kiara, 50480 Kuala Lumpur",
    package: "Wedding Acoustic",
    duration: "3 hours",
    inclusions: ["2 sets of 45 minutes", "Sound system included", "Song request (up to 5 songs)", "MC services"],
    basePrice: 1200,
    addOns: [{ name: "Extra set (45 min)", price: 300 }],
    deposit: 500,
    depositPaid: true,
    balance: 1000,
    total: 1500,
    notes: "Please arrive 30 minutes early for setup. Parking available at B2.",
  };

  const statusColor = booking.status === "confirmed" ? colors.success : colors.warning;

  const handleMessage = () => { tap(); router.push(`/(customer)/chat?threadId=${booking.id}&name=${booking.musicianName}`); };
  const handleNavigate = () => {
    tap();
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`);
  };
  const handleReport = () => {
    tap();
    Alert.alert("Report Issue", "What would you like to report?", [
      { text: "Cancel", style: "cancel" },
      { text: "Musician didn't show up", onPress: () => Alert.alert("Reported", "We'll investigate and get back to you within 24 hours.") },
      { text: "Quality issue", onPress: () => Alert.alert("Reported", "We'll investigate and get back to you within 24 hours.") },
      { text: "Other", onPress: () => Alert.alert("Reported", "We'll investigate and get back to you within 24 hours.") },
    ]);
  };

  return (
    <ScreenContainer className="p-0" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.topBar}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: colors.surface }]} onPress={() => { tap(); router.back(); }}>
            <IconSymbol name="arrow.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[s.topTitle, { color: colors.foreground }]}>Booking details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[s.statusCard, { backgroundColor: statusColor + "15", borderColor: statusColor + "30" }]}>
          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
          <View style={s.statusInfo}>
            <Text style={[s.statusLabel, { color: statusColor }]}>{booking.statusLabel}</Text>
            <Text style={[s.statusSub, { color: colors.muted }]}>Booking #{booking.id}</Text>
          </View>
        </View>

        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.cardRow}>
            <View style={[s.avatar, { backgroundColor: colors.primary }]}>
              <Text style={s.avatarText}>{booking.musicianInitial}</Text>
            </View>
            <View style={s.cardRowInfo}>
              <Text style={[s.cardLabel, { color: colors.foreground }]}>{booking.musicianName}</Text>
              <Text style={[s.cardSub, { color: colors.muted }]}>Musician</Text>
            </View>
          </View>
        </View>

        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Where & when</Text>
          <View style={s.detailRow}>
            <IconSymbol name="calendar" size={18} color={colors.primary} />
            <View style={s.detailInfo}>
              <Text style={[s.detailLabel, { color: colors.foreground }]}>{booking.date}</Text>
              <Text style={[s.detailSub, { color: colors.muted }]}>{booking.time}</Text>
            </View>
          </View>
          <View style={s.detailRow}>
            <IconSymbol name="location.fill" size={18} color={colors.primary} />
            <View style={s.detailInfo}>
              <Text style={[s.detailLabel, { color: colors.foreground }]}>{booking.location}</Text>
              <Text style={[s.detailSub, { color: colors.muted }]}>{booking.address}</Text>
            </View>
          </View>
          <TouchableOpacity style={[s.mapBtn, { borderColor: colors.primary }]} onPress={handleNavigate}>
            <IconSymbol name="location.fill" size={16} color={colors.primary} />
            <Text style={[s.mapBtnText, { color: colors.primary }]}>Open in Maps</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Package details</Text>
          <Text style={[s.pkgName, { color: colors.foreground }]}>{booking.package}</Text>
          <Text style={[s.pkgDuration, { color: colors.muted }]}>{booking.duration}</Text>
          {booking.inclusions.map((inc, idx) => (
            <View key={idx} style={s.inclusionRow}>
              <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
              <Text style={[s.inclusionText, { color: colors.foreground }]}>{inc}</Text>
            </View>
          ))}
        </View>

        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Payment</Text>
          <View style={s.payRow}>
            <Text style={[s.payLabel, { color: colors.muted }]}>Base price</Text>
            <Text style={[s.payValue, { color: colors.foreground }]}>RM {booking.basePrice}</Text>
          </View>
          {booking.addOns.map((addon, idx) => (
            <View key={idx} style={s.payRow}>
              <Text style={[s.payLabel, { color: colors.muted }]}>{addon.name}</Text>
              <Text style={[s.payValue, { color: colors.foreground }]}>RM {addon.price}</Text>
            </View>
          ))}
          <View style={[s.payRow, s.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[s.totalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[s.totalValue, { color: colors.primary }]}>RM {booking.total}</Text>
          </View>
          <View style={s.progressWrap}>
            <View style={[s.progressBg, { backgroundColor: colors.border }]}>
              <View style={[s.progressFill, { backgroundColor: colors.success, width: booking.depositPaid ? "33%" : "0%" }]} />
            </View>
            <View style={s.progressLabels}>
              <Text style={[s.progressText, { color: booking.depositPaid ? colors.success : colors.muted }]}>Deposit RM {booking.deposit} {booking.depositPaid ? "✓" : ""}</Text>
              <Text style={[s.progressText, { color: colors.muted }]}>Balance RM {booking.balance}</Text>
            </View>
          </View>
        </View>

        {booking.notes && (
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Notes</Text>
            <Text style={[s.notesText, { color: colors.muted }]}>{booking.notes}</Text>
          </View>
        )}

        <TouchableOpacity style={[s.reportBtn, { borderColor: colors.error }]} onPress={handleReport}>
          <IconSymbol name="shield.fill" size={18} color={colors.error} />
          <Text style={[s.reportText, { color: colors.error }]}>Report an issue</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[s.stickyBottom, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleMessage}>
          <IconSymbol name="bubble.left.fill" size={20} color={colors.primary} />
          <Text style={[s.actionBtnText, { color: colors.primary }]}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={handleNavigate}>
          <IconSymbol name="location.fill" size={20} color="#fff" />
          <Text style={s.actionBtnTextW}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 18, fontWeight: "600" },
  statusCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: "700" },
  statusSub: { fontSize: 13, marginTop: 2 },
  card: { marginHorizontal: 16, marginTop: 14, padding: 18, borderRadius: 14, borderWidth: 1 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cardRowInfo: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: "600" },
  cardSub: { fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  detailRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 15, fontWeight: "500" },
  detailSub: { fontSize: 13, marginTop: 2 },
  mapBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  mapBtnText: { fontSize: 14, fontWeight: "600" },
  pkgName: { fontSize: 16, fontWeight: "600" },
  pkgDuration: { fontSize: 13, marginBottom: 10 },
  inclusionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  inclusionText: { fontSize: 14 },
  payRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  payLabel: { fontSize: 14 },
  payValue: { fontSize: 14, fontWeight: "500" },
  totalRow: { borderTopWidth: 0.5, paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "700" },
  progressWrap: { marginTop: 14 },
  progressBg: { height: 6, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  progressText: { fontSize: 12 },
  notesText: { fontSize: 14, lineHeight: 22 },
  reportBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  reportText: { fontSize: 15, fontWeight: "600" },
  stickyBottom: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 12, padding: 16, paddingBottom: 32, borderTopWidth: 0.5 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  actionBtnText: { fontSize: 15, fontWeight: "600" },
  actionBtnTextW: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
