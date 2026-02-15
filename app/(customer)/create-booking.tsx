import {
  Text, View, ScrollView, TouchableOpacity, StyleSheet, Platform, TextInput, Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

const EVENT_TYPES = ["Wedding", "Corporate", "Birthday", "Cafe/Restaurant", "Festival", "Private party", "Other"];
const ADD_ONS = [
  { id: "songs", name: "Song requests (up to 10)", price: 100 },
  { id: "extra_set", name: "Extra set (45 min)", price: 300 },
  { id: "sound", name: "Sound system upgrade", price: 500 },
  { id: "emcee", name: "Emcee services", price: 200 },
  { id: "lighting", name: "Basic lighting", price: 350 },
];

export default function CreateBookingScreen() {
  const colors = useColors();
  const { musicianId, packageId } = useLocalSearchParams<{ musicianId: string; packageId: string }>();
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("3");
  const [crowdSize, setCrowdSize] = useState("");
  const [selectedPkg, setSelectedPkg] = useState(packageId || "");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const mockPackages = [
    { id: "1", name: "Wedding Acoustic", duration: "3 hours", price: 1200, inclusions: ["2 sets of 45 min", "Sound system", "Song requests"] },
    { id: "2", name: "Corporate Jazz", duration: "2 hours", price: 800, inclusions: ["1 set of 90 min", "Background music"] },
    { id: "3", name: "Full Band Experience", duration: "4 hours", price: 2500, inclusions: ["3 sets", "Full band", "Sound + lighting", "MC"] },
  ];

  const selectedPackage = mockPackages.find((p) => p.id === selectedPkg);
  const basePrice = selectedPackage?.price || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, id) => sum + (ADD_ONS.find((a) => a.id === id)?.price || 0), 0);
  const total = basePrice + addOnsTotal;
  const deposit = Math.round(total * 0.3);

  const toggleAddOn = (id: string) => {
    tap();
    setSelectedAddOns((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const canNext = () => {
    if (step === 1) return eventType && date && time && location;
    if (step === 2) return !!selectedPkg;
    return true;
  };

  const handleNext = () => { tap(); if (step < 5) setStep(step + 1); };
  const handleBack = () => { tap(); if (step > 1) setStep(step - 1); else router.back(); };

  const handleConfirm = () => {
    tap();
    Alert.alert("Booking Confirmed!", "Your booking request has been sent. The musician will confirm shortly.", [
      { text: "View booking", onPress: () => router.replace("/(customer)/bookings") },
    ]);
  };

  const STEPS = ["Event", "Package", "Add-ons", "Summary", "Confirm"];

  return (
    <ScreenContainer className="p-0" edges={["top", "left", "right"]}>
      <View style={[s.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: colors.surface }]} onPress={handleBack}>
          <IconSymbol name="arrow.left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.topTitle, { color: colors.foreground }]}>Create booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.stepperRow}>
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const active = stepNum === step;
          const done = stepNum < step;
          return (
            <View key={label} style={s.stepItem}>
              <View style={[s.stepCircle, { backgroundColor: done ? colors.success : active ? colors.primary : colors.border }]}>
                {done ? <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" /> : <Text style={[s.stepNum, { color: active ? "#fff" : colors.muted }]}>{stepNum}</Text>}
              </View>
              <Text style={[s.stepLabel, { color: active ? colors.primary : colors.muted }]}>{label}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={s.stepContent}>
            <Text style={[s.fieldLabel, { color: colors.foreground }]}>Event type</Text>
            <View style={s.chipRow}>
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity key={type} style={[s.chip, { borderColor: eventType === type ? colors.primary : colors.border, backgroundColor: eventType === type ? colors.primary + "15" : colors.surface }]} onPress={() => { tap(); setEventType(type); }}>
                  <Text style={[s.chipText, { color: eventType === type ? colors.primary : colors.foreground }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[s.fieldLabel, { color: colors.foreground }]}>Date</Text>
            <TextInput style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} placeholder="e.g. 22 Feb 2026" placeholderTextColor={colors.muted} value={date} onChangeText={setDate} />
            <Text style={[s.fieldLabel, { color: colors.foreground }]}>Time</Text>
            <TextInput style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} placeholder="e.g. 8:00 PM" placeholderTextColor={colors.muted} value={time} onChangeText={setTime} />
            <Text style={[s.fieldLabel, { color: colors.foreground }]}>Location</Text>
            <TextInput style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} placeholder="Venue name and address" placeholderTextColor={colors.muted} value={location} onChangeText={setLocation} />
            <Text style={[s.fieldLabel, { color: colors.foreground }]}>Duration (hours)</Text>
            <TextInput style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} placeholder="3" placeholderTextColor={colors.muted} value={duration} onChangeText={setDuration} keyboardType="numeric" />
            <Text style={[s.fieldLabel, { color: colors.foreground }]}>Crowd size (optional)</Text>
            <TextInput style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} placeholder="e.g. 100" placeholderTextColor={colors.muted} value={crowdSize} onChangeText={setCrowdSize} keyboardType="numeric" />
          </View>
        )}

        {step === 2 && (
          <View style={s.stepContent}>
            <Text style={[s.stepHeading, { color: colors.foreground }]}>Choose a package</Text>
            {mockPackages.map((pkg) => (
              <TouchableOpacity key={pkg.id} style={[s.pkgCard, { backgroundColor: colors.surface, borderColor: selectedPkg === pkg.id ? colors.primary : colors.border, borderWidth: selectedPkg === pkg.id ? 2 : 1 }]} onPress={() => { tap(); setSelectedPkg(pkg.id); }}>
                <View style={s.pkgHeader}>
                  <Text style={[s.pkgName, { color: colors.foreground }]}>{pkg.name}</Text>
                  <Text style={[s.pkgPrice, { color: colors.primary }]}>RM {pkg.price}</Text>
                </View>
                <Text style={[s.pkgDuration, { color: colors.muted }]}>{pkg.duration}</Text>
                {pkg.inclusions.map((inc, idx) => (
                  <View key={idx} style={s.incRow}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
                    <Text style={[s.incText, { color: colors.foreground }]}>{inc}</Text>
                  </View>
                ))}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={s.stepContent}>
            <Text style={[s.stepHeading, { color: colors.foreground }]}>Add extras (optional)</Text>
            {ADD_ONS.map((addon) => {
              const selected = selectedAddOns.includes(addon.id);
              return (
                <TouchableOpacity key={addon.id} style={[s.addonCard, { backgroundColor: colors.surface, borderColor: selected ? colors.primary : colors.border, borderWidth: selected ? 2 : 1 }]} onPress={() => toggleAddOn(addon.id)}>
                  <View style={s.addonInfo}>
                    <Text style={[s.addonName, { color: colors.foreground }]}>{addon.name}</Text>
                    <Text style={[s.addonPrice, { color: colors.primary }]}>+ RM {addon.price}</Text>
                  </View>
                  <View style={[s.checkbox, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : "transparent" }]}>
                    {selected && <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={[s.livePrice, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <Text style={[s.livePriceLabel, { color: colors.muted }]}>Running total</Text>
              <Text style={[s.livePriceValue, { color: colors.primary }]}>RM {total}</Text>
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={s.stepContent}>
            <Text style={[s.stepHeading, { color: colors.foreground }]}>Booking summary</Text>
            <View style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.muted }]}>Event</Text><Text style={[s.summaryValue, { color: colors.foreground }]}>{eventType}</Text></View>
              <View style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.muted }]}>Date & time</Text><Text style={[s.summaryValue, { color: colors.foreground }]}>{date} · {time}</Text></View>
              <View style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.muted }]}>Location</Text><Text style={[s.summaryValue, { color: colors.foreground }]}>{location}</Text></View>
              <View style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.muted }]}>Package</Text><Text style={[s.summaryValue, { color: colors.foreground }]}>{selectedPackage?.name}</Text></View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.muted }]}>Base price</Text><Text style={[s.summaryValue, { color: colors.foreground }]}>RM {basePrice}</Text></View>
              {selectedAddOns.map((id) => { const addon = ADD_ONS.find((a) => a.id === id); return addon ? (<View key={id} style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.muted }]}>{addon.name}</Text><Text style={[s.summaryValue, { color: colors.foreground }]}>RM {addon.price}</Text></View>) : null; })}
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.summaryRow}><Text style={[s.totalLabel, { color: colors.foreground }]}>Total</Text><Text style={[s.totalValue, { color: colors.primary }]}>RM {total}</Text></View>
              <View style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.muted }]}>Deposit (30%)</Text><Text style={[s.summaryValue, { color: colors.warning }]}>RM {deposit}</Text></View>
            </View>
            <View style={[s.policyCard, { backgroundColor: colors.warning + "10", borderColor: colors.warning + "30" }]}>
              <IconSymbol name="shield.fill" size={18} color={colors.warning} />
              <View style={s.policyInfo}>
                <Text style={[s.policyTitle, { color: colors.foreground }]}>Cancellation policy</Text>
                <Text style={[s.policyText, { color: colors.muted }]}>Free cancellation up to 48 hours before the event. 50% charge within 48 hours.</Text>
              </View>
            </View>
          </View>
        )}

        {step === 5 && (
          <View style={[s.stepContent, s.confirmContent]}>
            <View style={[s.confirmIcon, { backgroundColor: colors.success + "20" }]}>
              <IconSymbol name="checkmark.circle.fill" size={48} color={colors.success} />
            </View>
            <Text style={[s.confirmTitle, { color: colors.foreground }]}>Booking submitted!</Text>
            <Text style={[s.confirmSub, { color: colors.muted }]}>Your booking request has been sent to the musician. You'll receive a confirmation once they accept.</Text>
            <View style={[s.confirmCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.confirmLabel, { color: colors.muted }]}>Status</Text>
              <View style={[s.confirmBadge, { backgroundColor: colors.warning + "20" }]}>
                <Text style={[s.confirmBadgeText, { color: colors.warning }]}>Awaiting musician confirmation</Text>
              </View>
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {step < 5 ? (
        <View style={[s.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          {step === 4 ? (
            <TouchableOpacity style={[s.ctaBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
              <Text style={s.ctaBtnText}>Pay deposit RM {deposit} & confirm</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.ctaBtn, { backgroundColor: canNext() ? colors.primary : colors.muted }]} onPress={handleNext} disabled={!canNext()}>
              <Text style={s.ctaBtnText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={[s.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity style={[s.ctaBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
            <Text style={s.ctaBtnText}>View my bookings</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 18, fontWeight: "600" },
  stepperRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  stepItem: { alignItems: "center", gap: 4 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 12, fontWeight: "700" },
  stepLabel: { fontSize: 10, fontWeight: "600" },
  scrollContent: { paddingBottom: 24 },
  stepContent: { paddingHorizontal: 20, gap: 12 },
  stepHeading: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  fieldLabel: { fontSize: 15, fontWeight: "600", marginTop: 4 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 14, fontWeight: "500" },
  input: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, fontSize: 15 },
  pkgCard: { padding: 18, borderRadius: 14, gap: 6, marginBottom: 4 },
  pkgHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pkgName: { fontSize: 16, fontWeight: "600" },
  pkgPrice: { fontSize: 18, fontWeight: "700" },
  pkgDuration: { fontSize: 13 },
  incRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  incText: { fontSize: 13 },
  addonCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, marginBottom: 4 },
  addonInfo: { flex: 1 },
  addonName: { fontSize: 15, fontWeight: "500" },
  addonPrice: { fontSize: 13, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  livePrice: { flexDirection: "row", justifyContent: "space-between", padding: 16, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  livePriceLabel: { fontSize: 15, fontWeight: "500" },
  livePriceValue: { fontSize: 20, fontWeight: "700" },
  summaryCard: { padding: 18, borderRadius: 14, borderWidth: 1, gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "500", textAlign: "right", flex: 1, marginLeft: 16 },
  divider: { height: 0.5, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "700" },
  policyCard: { flexDirection: "row", padding: 16, borderRadius: 14, borderWidth: 1, gap: 12, marginTop: 4 },
  policyInfo: { flex: 1 },
  policyTitle: { fontSize: 14, fontWeight: "600" },
  policyText: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  confirmContent: { alignItems: "center", paddingTop: 40 },
  confirmIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  confirmTitle: { fontSize: 24, fontWeight: "700" },
  confirmSub: { fontSize: 15, textAlign: "center", lineHeight: 22, paddingHorizontal: 20, marginTop: 8 },
  confirmCard: { padding: 20, borderRadius: 14, borderWidth: 1, marginTop: 24, width: "100%", alignItems: "center", gap: 10 },
  confirmLabel: { fontSize: 14 },
  confirmBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  confirmBadgeText: { fontSize: 14, fontWeight: "600" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, borderTopWidth: 0.5 },
  ctaBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
