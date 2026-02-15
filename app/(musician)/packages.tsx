import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
  Switch,
  Modal,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

type Package = {
  id: number;
  musicianId: number;
  name: string;
  eventType?: string | null;
  duration: number;
  sets: number | null;
  breakTime: number | null;
  basePrice: string;
  inclusions?: string[] | null;
  addOns?: Array<{ name: string; price: string }> | null;
  rules?: {
    overtimeRate?: string;
    depositPercent?: number;
    minLeadTime?: number;
    weekendOnly?: boolean;
  } | null;
  isPopular: boolean | null;
  isBestValue: boolean | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function PackagesScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const { data: packages, refetch } = trpc.musician.getPackages.useQuery();
  const createMutation = trpc.musician.createPackage.useMutation();
  const updateMutation = trpc.musician.updatePackage.useMutation();
  const deleteMutation = trpc.musician.deletePackage.useMutation();
  const duplicateMutation = trpc.musician.duplicatePackage.useMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    eventType: "",
    duration: "",
    sets: "1",
    breakTime: "0",
    basePrice: "",
    inclusions: [] as string[],
    addOns: [] as Array<{ name: string; price: string }>,
    overtimeRate: "",
    depositPercent: "",
    minLeadTime: "",
    weekendOnly: false,
    isPopular: false,
    isBestValue: false,
  });

  // Temporary input states
  const [newInclusion, setNewInclusion] = useState("");
  const [newAddOn, setNewAddOn] = useState({ name: "", price: "" });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const openEditor = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        eventType: pkg.eventType || "",
        duration: pkg.duration.toString(),
        sets: (pkg.sets ?? 1).toString(),
        breakTime: (pkg.breakTime ?? 0).toString(),
        basePrice: pkg.basePrice,
        inclusions: pkg.inclusions || [],
        addOns: pkg.addOns || [],
        overtimeRate: pkg.rules?.overtimeRate || "",
        depositPercent: pkg.rules?.depositPercent?.toString() || "",
        minLeadTime: pkg.rules?.minLeadTime?.toString() || "",
        weekendOnly: pkg.rules?.weekendOnly || false,
        isPopular: pkg.isPopular ?? false,
        isBestValue: pkg.isBestValue ?? false,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        eventType: "",
        duration: "",
        sets: "1",
        breakTime: "0",
        basePrice: "",
        inclusions: [],
        addOns: [],
        overtimeRate: "",
        depositPercent: "",
        minLeadTime: "",
        weekendOnly: false,
        isPopular: false,
        isBestValue: false,
      });
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingPackage(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.duration || !formData.basePrice) {
      Alert.alert("Ralat", "Sila isi nama pakej, durasi, dan harga");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        eventType: formData.eventType || undefined,
        duration: parseInt(formData.duration),
        sets: parseInt(formData.sets),
        breakTime: parseInt(formData.breakTime),
        basePrice: formData.basePrice,
        inclusions: formData.inclusions.length > 0 ? formData.inclusions : undefined,
        addOns: formData.addOns.length > 0 ? formData.addOns : undefined,
        rules: {
          overtimeRate: formData.overtimeRate || undefined,
          depositPercent: formData.depositPercent ? parseInt(formData.depositPercent) : undefined,
          minLeadTime: formData.minLeadTime ? parseInt(formData.minLeadTime) : undefined,
          weekendOnly: formData.weekendOnly,
        },
        isPopular: formData.isPopular,
        isBestValue: formData.isBestValue,
      };

      if (editingPackage) {
        await updateMutation.mutateAsync({ id: editingPackage.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Berjaya", editingPackage ? "Pakej telah dikemaskini" : "Pakej baharu telah dicipta");
      closeEditor();
      refetch();
    } catch (error) {
      console.error("Failed to save package:", error);
      Alert.alert("Ralat", "Gagal simpan pakej");
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Padam Pakej", "Adakah anda pasti mahu padam pakej ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Padam",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ id });
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            refetch();
          } catch (error) {
            console.error("Failed to delete package:", error);
            Alert.alert("Ralat", "Gagal padam pakej");
          }
        },
      },
    ]);
  };

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateMutation.mutateAsync({ id });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Berjaya", "Pakej telah diduplikasi");
      refetch();
    } catch (error) {
      console.error("Failed to duplicate package:", error);
      Alert.alert("Ralat", "Gagal duplikasi pakej");
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      await updateMutation.mutateAsync({ id: pkg.id, isActive: !pkg.isActive });
      refetch();
    } catch (error) {
      console.error("Failed to toggle package:", error);
      Alert.alert("Ralat", "Gagal kemaskini status pakej");
    }
  };

  const addInclusion = () => {
    if (newInclusion && !formData.inclusions.includes(newInclusion)) {
      setFormData({ ...formData, inclusions: [...formData.inclusions, newInclusion] });
      setNewInclusion("");
    }
  };

  const removeInclusion = (index: number) => {
    setFormData({ ...formData, inclusions: formData.inclusions.filter((_, i) => i !== index) });
  };

  const addAddOn = () => {
    if (newAddOn.name && newAddOn.price) {
      setFormData({ ...formData, addOns: [...formData.addOns, newAddOn] });
      setNewAddOn({ name: "", price: "" });
    }
  };

  const removeAddOn = (index: number) => {
    setFormData({ ...formData, addOns: formData.addOns.filter((_, i) => i !== index) });
  };

  const EVENT_TYPES = ["Perkahwinan", "Korporat", "Hari Jadi", "Pertunangan", "Festival", "Acara Persendirian", "Lain-lain"];

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[s.header, { backgroundColor: colors.primary }]}>
          <View style={s.headerContent}>
            <View style={s.headerLeft}>
              <Text style={s.headerTitle}>Pakej & Harga</Text>
              <Text style={s.headerSubtitle}>Urus pakej servis anda</Text>
            </View>
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              onPress={() => openEditor()}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
              <Text style={s.addBtnText}>Tambah</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.bodyContent}>
          {/* Empty State */}
          {(!packages || packages.length === 0) && (
            <View style={[s.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="music.note.list" size={48} color={colors.muted} />
              <Text style={[s.emptyTitle, { color: colors.foreground }]}>Tiada Pakej Lagi</Text>
              <Text style={[s.emptyText, { color: colors.muted }]}>Cipta pakej pertama anda untuk mula menerima tempahan</Text>
              <TouchableOpacity
                style={[s.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => openEditor()}
                activeOpacity={0.7}
              >
                <Text style={s.emptyBtnText}>Cipta Pakej</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Package Cards */}
          {packages && packages.length > 0 && (
            <View style={s.packageList}>
              {packages.map((pkg) => (
                <View key={pkg.id} style={[s.packageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {/* Tags */}
                  <View style={s.packageTags}>
                    {pkg.isPopular && (
                      <View style={[s.tag, { backgroundColor: colors.warning + "20", borderColor: colors.warning }]}>
                        <Text style={[s.tagText, { color: colors.warning }]}>Popular</Text>
                      </View>
                    )}
                    {pkg.isBestValue && (
                      <View style={[s.tag, { backgroundColor: colors.success + "20", borderColor: colors.success }]}>
                        <Text style={[s.tagText, { color: colors.success }]}>Best Value</Text>
                      </View>
                    )}
                    {!pkg.isActive && (
                      <View style={[s.tag, { backgroundColor: colors.muted + "20", borderColor: colors.muted }]}>
                        <Text style={[s.tagText, { color: colors.muted }]}>Disabled</Text>
                      </View>
                    )}
                  </View>

                  {/* Package Info */}
                  <Text style={[s.packageName, { color: colors.foreground }]}>{pkg.name}</Text>
                  {pkg.eventType && <Text style={[s.packageEventType, { color: colors.muted }]}>{pkg.eventType}</Text>}

                  <View style={s.packageDetails}>
                    <View style={s.packageDetailItem}>
                      <IconSymbol name="clock.fill" size={16} color={colors.muted} />
                      <Text style={[s.packageDetailText, { color: colors.foreground }]}>
                        {pkg.duration} minit ({pkg.sets ?? 1} set{(pkg.sets ?? 1) > 1 ? "s" : ""})
                      </Text>
                    </View>
                    <View style={s.packageDetailItem}>
                      <IconSymbol name="dollarsign.circle.fill" size={16} color={colors.muted} />
                      <Text style={[s.packageDetailText, { color: colors.foreground }]}>RM {pkg.basePrice}</Text>
                    </View>
                  </View>

                  {/* Inclusions */}
                  {pkg.inclusions && pkg.inclusions.length > 0 && (
                    <View style={s.packageInclusions}>
                      <Text style={[s.packageInclusionsTitle, { color: colors.muted }]}>Termasuk:</Text>
                      {pkg.inclusions.slice(0, 3).map((item, i) => (
                        <Text key={i} style={[s.packageInclusionItem, { color: colors.foreground }]}>
                          • {item}
                        </Text>
                      ))}
                      {pkg.inclusions.length > 3 && (
                        <Text style={[s.packageInclusionItem, { color: colors.muted }]}>
                          ...dan {pkg.inclusions.length - 3} lagi
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Actions */}
                  <View style={s.packageActions}>
                    <TouchableOpacity
                      style={[s.packageActionBtn, { borderColor: colors.border }]}
                      onPress={() => openEditor(pkg)}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="pencil" size={16} color={colors.primary} />
                      <Text style={[s.packageActionText, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.packageActionBtn, { borderColor: colors.border }]}
                      onPress={() => handleDuplicate(pkg.id)}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="doc.text.fill" size={16} color={colors.foreground} />
                      <Text style={[s.packageActionText, { color: colors.foreground }]}>Duplikasi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.packageActionBtn, { borderColor: colors.border }]}
                      onPress={() => handleToggleActive(pkg)}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name={pkg.isActive ? "pause.circle.fill" : "checkmark.circle.fill"} size={16} color={colors.foreground} />
                      <Text style={[s.packageActionText, { color: colors.foreground }]}>{pkg.isActive ? "Disable" : "Enable"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.packageActionBtn, { borderColor: colors.border }]}
                      onPress={() => handleDelete(pkg.id)}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="trash.fill" size={16} color={colors.error} />
                      <Text style={[s.packageActionText, { color: colors.error }]}>Padam</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {/* Editor Modal */}
      <Modal visible={showEditor} animationType="slide" onRequestClose={closeEditor}>
        <ScreenContainer className="p-0">
          <View style={[s.editorHeader, { backgroundColor: colors.primary }]}>
            <TouchableOpacity onPress={closeEditor} activeOpacity={0.7}>
              <IconSymbol name="xmark.circle.fill" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={s.editorHeaderTitle}>{editingPackage ? "Edit Pakej" : "Pakej Baharu"}</Text>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
              <Text style={s.editorHeaderSave}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.editorContent}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Maklumat Asas</Text>

            <Text style={[s.label, { color: colors.muted }]}>Nama Pakej *</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Cth: Wedding Package Standard"
              placeholderTextColor={colors.muted}
            />

            <Text style={[s.label, { color: colors.muted }]}>Jenis Event</Text>
            <View style={s.chipContainer}>
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    s.chip,
                    { borderColor: colors.border },
                    formData.eventType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setFormData({ ...formData, eventType: type })}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: formData.eventType === type ? "#fff" : colors.foreground, fontSize: 13 }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Durasi & Set</Text>

            <Text style={[s.label, { color: colors.muted }]}>Durasi Total (minit) *</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
              placeholder="Cth: 180"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />

            <Text style={[s.label, { color: colors.muted }]}>Bilangan Set</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={formData.sets}
              onChangeText={(text) => setFormData({ ...formData, sets: text })}
              placeholder="Cth: 2"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />

            <Text style={[s.label, { color: colors.muted }]}>Break Time (minit)</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={formData.breakTime}
              onChangeText={(text) => setFormData({ ...formData, breakTime: text })}
              placeholder="Cth: 15"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />

            <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Harga</Text>

            <Text style={[s.label, { color: colors.muted }]}>Harga Asas (RM) *</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={formData.basePrice}
              onChangeText={(text) => setFormData({ ...formData, basePrice: text })}
              placeholder="Cth: 2500"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />

            <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Termasuk Dalam Pakej</Text>

            {formData.inclusions.map((item, index) => (
              <View key={index} style={[s.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.itemText, { color: colors.foreground }]}>{item}</Text>
                <TouchableOpacity onPress={() => removeInclusion(index)} activeOpacity={0.7}>
                  <IconSymbol name="xmark.circle.fill" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={s.addItemForm}>
              <TextInput
                style={[s.input, { flex: 1, backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={newInclusion}
                onChangeText={setNewInclusion}
                placeholder="Cth: Sound system, Request songs (max 5)"
                placeholderTextColor={colors.muted}
              />
              <TouchableOpacity style={[s.addItemBtn, { backgroundColor: colors.primary }]} onPress={addInclusion} activeOpacity={0.7}>
                <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Add-ons (Tambahan)</Text>

            {formData.addOns.map((addOn, index) => (
              <View key={index} style={[s.addOnCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={s.addOnInfo}>
                  <Text style={[s.addOnName, { color: colors.foreground }]}>{addOn.name}</Text>
                  <Text style={[s.addOnPrice, { color: colors.muted }]}>+RM {addOn.price}</Text>
                </View>
                <TouchableOpacity onPress={() => removeAddOn(index)} activeOpacity={0.7}>
                  <IconSymbol name="xmark.circle.fill" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={[s.addAddOnForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[s.input, { flex: 1, backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={newAddOn.name}
                onChangeText={(text) => setNewAddOn({ ...newAddOn, name: text })}
                placeholder="Nama add-on"
                placeholderTextColor={colors.muted}
              />
              <TextInput
                style={[s.input, { width: 100, backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={newAddOn.price}
                onChangeText={(text) => setNewAddOn({ ...newAddOn, price: text })}
                placeholder="Harga"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
              <TouchableOpacity style={[s.addItemBtn, { backgroundColor: colors.primary }]} onPress={addAddOn} activeOpacity={0.7}>
                <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Rules & Policies</Text>

            <Text style={[s.label, { color: colors.muted }]}>Overtime Rate (RM per 30 min)</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={formData.overtimeRate}
              onChangeText={(text) => setFormData({ ...formData, overtimeRate: text })}
              placeholder="Cth: 300"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />

            <Text style={[s.label, { color: colors.muted }]}>Deposit (%)</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={formData.depositPercent}
              onChangeText={(text) => setFormData({ ...formData, depositPercent: text })}
              placeholder="Cth: 30"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />

            <Text style={[s.label, { color: colors.muted }]}>Minimum Lead Time (hari)</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={formData.minLeadTime}
              onChangeText={(text) => setFormData({ ...formData, minLeadTime: text })}
              placeholder="Cth: 7"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />

            <View style={[s.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.switchLabel, { color: colors.foreground }]}>Weekend Only</Text>
              <Switch
                value={formData.weekendOnly}
                onValueChange={(val) => setFormData({ ...formData, weekendOnly: val })}
                trackColor={{ false: colors.border, true: colors.primary + "50" }}
                thumbColor={formData.weekendOnly ? colors.primary : colors.muted}
              />
            </View>

            <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Tags</Text>

            <View style={[s.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.switchLabel, { color: colors.foreground }]}>Popular</Text>
              <Switch
                value={formData.isPopular}
                onValueChange={(val) => setFormData({ ...formData, isPopular: val })}
                trackColor={{ false: colors.border, true: colors.warning + "50" }}
                thumbColor={formData.isPopular ? colors.warning : colors.muted}
              />
            </View>

            <View style={[s.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.switchLabel, { color: colors.foreground }]}>Best Value</Text>
              <Switch
                value={formData.isBestValue}
                onValueChange={(val) => setFormData({ ...formData, isBestValue: val })}
                trackColor={{ false: colors.border, true: colors.success + "50" }}
                thumbColor={formData.isBestValue ? colors.success : colors.muted}
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  packageList: {
    gap: 16,
  },
  packageCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  packageTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  packageName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  packageEventType: {
    fontSize: 14,
    marginBottom: 12,
  },
  packageDetails: {
    gap: 8,
    marginBottom: 12,
  },
  packageDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  packageDetailText: {
    fontSize: 14,
  },
  packageInclusions: {
    marginTop: 8,
    marginBottom: 12,
  },
  packageInclusionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  packageInclusionItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  packageActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  packageActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  packageActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  editorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  editorHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  editorHeaderSave: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  editorContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
  addItemForm: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  addItemBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addOnCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  addOnInfo: {
    flex: 1,
  },
  addOnName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  addOnPrice: {
    fontSize: 13,
  },
  addAddOnForm: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
});
