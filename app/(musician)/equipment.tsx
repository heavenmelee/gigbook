import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function EquipmentScreen() {
  const colors = useColors();

  const { data: profile } = trpc.musician.getProfile.useQuery();
  const updateMutation = trpc.musician.updateProfile.useMutation();

  const [ownSoundSystem, setOwnSoundSystem] = useState(profile?.ownSoundSystem || false);
  const [equipment, setEquipment] = useState<string[]>(profile?.equipment || []);
  const [newEquipment, setNewEquipment] = useState("");
  const [stageSizeMin, setStageSizeMin] = useState(profile?.venueRequirements?.stageSizeMin || "");
  const [powerSupply, setPowerSupply] = useState(profile?.venueRequirements?.powerSupply || "");
  const [soundcheckDuration, setSoundcheckDuration] = useState(profile?.venueRequirements?.soundcheckDuration || "");
  const [techRider, setTechRider] = useState(profile?.techRider || "");

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleSave = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await updateMutation.mutateAsync({
        ownSoundSystem,
        equipment,
        venueRequirements: {
          stageSizeMin,
          powerSupply,
          soundcheckDuration,
        },
        techRider,
      });
      Alert.alert("Success", "Equipment & rider updated");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update equipment & rider");
    }
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment("");
    }
  };

  const removeEquipment = (item: string) => {
    setEquipment(equipment.filter((e) => e !== item));
  };

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.backButton} onPress={handleBack} activeOpacity={0.7}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Equipment & Rider</Text>
        <TouchableOpacity style={s.saveButton} onPress={handleSave} activeOpacity={0.7}>
          <Text style={[s.saveButtonText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== SOUND SYSTEM ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Sound System</Text>
          <View style={[s.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={s.switchLeft}>
              <Text style={[s.switchLabel, { color: colors.foreground }]}>I have my own sound system</Text>
              <Text style={[s.switchDescription, { color: colors.muted }]}>
                PA system, speakers, mixer, etc.
              </Text>
            </View>
            <Switch
              value={ownSoundSystem}
              onValueChange={(value) => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setOwnSoundSystem(value);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ==================== EQUIPMENT LIST ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Equipment List</Text>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            List all equipment you bring (mics, instruments, DI boxes, monitors, etc.)
          </Text>

          <View style={s.equipmentList}>
            {equipment.map((item, index) => (
              <View key={index} style={[s.equipmentChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.equipmentText, { color: colors.foreground }]}>{item}</Text>
                <TouchableOpacity onPress={() => removeEquipment(item)} activeOpacity={0.7}>
                  <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={s.addEquipmentRow}>
            <TextInput
              style={[s.equipmentInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={newEquipment}
              onChangeText={setNewEquipment}
              placeholder="e.g. Shure SM58 microphone"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              onSubmitEditing={addEquipment}
            />
            <TouchableOpacity
              style={[s.addButton, { backgroundColor: colors.primary }]}
              onPress={addEquipment}
              activeOpacity={0.8}
            >
              <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================== VENUE REQUIREMENTS ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Venue Requirements</Text>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            Specify your minimum requirements for the venue
          </Text>

          <Text style={[s.label, { color: colors.muted }]}>Minimum Stage Size</Text>
          <TextInput
            style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
            value={stageSizeMin}
            onChangeText={setStageSizeMin}
            placeholder="e.g. 4m x 3m"
            placeholderTextColor={colors.muted}
          />

          <Text style={[s.label, { color: colors.muted }]}>Power Supply</Text>
          <TextInput
            style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
            value={powerSupply}
            onChangeText={setPowerSupply}
            placeholder="e.g. 240V, 13A socket x 3"
            placeholderTextColor={colors.muted}
          />

          <Text style={[s.label, { color: colors.muted }]}>Soundcheck Duration</Text>
          <TextInput
            style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
            value={soundcheckDuration}
            onChangeText={setSoundcheckDuration}
            placeholder="e.g. 30 minutes"
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* ==================== TECH RIDER ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Technical Rider</Text>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            Additional technical requirements or notes for the venue
          </Text>

          <TextInput
            style={[s.textArea, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
            value={techRider}
            onChangeText={setTechRider}
            placeholder="e.g. Wireless mic system required, stage lighting preferences, etc."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={6}
          />
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  switchLeft: {
    flex: 1,
    gap: 4,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  switchDescription: {
    fontSize: 13,
  },
  equipmentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  equipmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  equipmentText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addEquipmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  equipmentInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: "top",
  },
});
