import { Text, View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, RefreshControl, KeyboardAvoidingView, Platform, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Music categories
const MUSIC_CATEGORIES = [
  "Solo",
  "Band",
  "DJ",
  "Orkestra",
  "Vokal",
  "Instrumen Tradisional",
  "Instrumen Barat",
  "Lain-lain",
];

// Music genres
const MUSIC_GENRES = [
  "Pop",
  "Rock",
  "Jazz",
  "Klasik",
  "R&B",
  "Hip Hop",
  "Dangdut",
  "Melayu",
  "Tradisional",
  "Lain-lain",
];

const PRICE_TYPE_LABELS: Record<string, string> = {
  per_hour: "Sejam",
  per_event: "Per Event",
  per_day: "Sehari",
};

// ===================== PICKER MODAL COMPONENT =====================
function PickerModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  colors: any;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={pickerStyles.overlay}>
        <View style={[pickerStyles.container, { backgroundColor: colors.background }]}>
          {/* Picker Header */}
          <View style={[pickerStyles.header, { borderBottomColor: colors.border }]}>
            <Text style={[pickerStyles.title, { color: colors.foreground }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={pickerStyles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Picker Options */}
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            contentContainerStyle={pickerStyles.listContent}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item;
              return (
                <TouchableOpacity
                  style={[
                    pickerStyles.option,
                    { borderBottomColor: colors.border },
                    isSelected && { backgroundColor: colors.primary + "15" },
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      pickerStyles.optionText,
                      { color: isSelected ? colors.primary : colors.foreground },
                      isSelected && { fontWeight: "700" },
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <IconSymbol name="checkmark.circle.fill" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    maxHeight: "60%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

// ===================== MAIN SCREEN =====================
export default function MusicianListingsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    genre: "",
    price: "",
    priceType: "per_event" as "per_hour" | "per_event" | "per_day",
    duration: "",
  });

  const { data: listings, refetch } = trpc.musician.getListings.useQuery();
  const createMutation = trpc.musician.createListing.useMutation();
  const updateMutation = trpc.musician.updateListing.useMutation();
  const deleteMutation = trpc.musician.deleteListing.useMutation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleOpenModal = useCallback((listing?: any) => {
    if (listing) {
      setEditingListing(listing);
      setFormData({
        title: listing.title,
        description: listing.description || "",
        category: listing.category || "",
        genre: listing.genre || "",
        price: listing.price,
        priceType: listing.priceType,
        duration: listing.duration?.toString() || "",
      });
    } else {
      setEditingListing(null);
      setFormData({ title: "", description: "", category: "", genre: "", price: "", priceType: "per_event", duration: "" });
    }
    setShowFormModal(true);
  }, []);

  const handleSave = async () => {
    try {
      if (editingListing) {
        await updateMutation.mutateAsync({
          id: editingListing.id,
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : undefined,
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : undefined,
        });
      }
      setShowFormModal(false);
      refetch();
    } catch (error) {
      console.error("Failed to save listing:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const doDelete = async () => {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
      } catch (error) {
        console.error("Failed to delete listing:", error);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Adakah anda pasti mahu padam listing ini?")) {
        await doDelete();
      }
    } else {
      Alert.alert(
        "Padam Listing",
        "Adakah anda pasti mahu padam listing ini? Tindakan ini tidak boleh dibatalkan.",
        [
          { text: "Batal", style: "cancel" },
          { text: "Padam", style: "destructive", onPress: doDelete },
        ]
      );
    }
  };

  const getCategoryIcon = (category: string | null): any => {
    const iconMap: Record<string, any> = {
      Solo: "person.fill",
      Band: "person.2.fill",
      DJ: "waveform.circle.fill",
      Orkestra: "music.note.list",
      Vokal: "mic.fill",
      "Instrumen Tradisional": "music.note",
      "Instrumen Barat": "guitar.fill",
      "Lain-lain": "ellipsis",
    };
    return category && iconMap[category] ? iconMap[category] : "music.note";
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.foreground }]}>Listing Saya</Text>
            <Text style={[styles.pageSubtitle, { color: colors.muted }]}>
              {listings?.length || 0} perkhidmatan aktif
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => handleOpenModal()}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Listings */}
        {listings && listings.length > 0 ? (
          <View style={styles.listingsContainer}>
            {listings.map((listing) => (
              <View
                key={listing.id}
                style={[styles.listingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryIconContainer, { backgroundColor: colors.primary + "15" }]}>
                    <IconSymbol name={getCategoryIcon(listing.category)} size={24} color={colors.primary} />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: listing.isActive ? colors.success + "15" : colors.warning + "15" }]}>
                    <View style={[styles.statusDot, { backgroundColor: listing.isActive ? colors.success : colors.warning }]} />
                    <Text style={[styles.statusText, { color: listing.isActive ? colors.success : colors.warning }]}>
                      {listing.isActive ? "Aktif" : "Tidak Aktif"}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {listing.title}
                </Text>

                <View style={styles.tagsContainer}>
                  {listing.category && (
                    <View style={[styles.tag, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{listing.category}</Text>
                    </View>
                  )}
                  {(listing as any).genre && (
                    <View style={[styles.tag, { backgroundColor: colors.muted + "20" }]}>
                      <Text style={[styles.tagText, { color: colors.muted }]}>{(listing as any).genre}</Text>
                    </View>
                  )}
                </View>

                {listing.description && (
                  <Text style={[styles.listingDescription, { color: colors.muted }]} numberOfLines={2}>
                    {listing.description}
                  </Text>
                )}

                <View style={[styles.priceSection, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                  <View style={styles.priceInfo}>
                    <Text style={[styles.priceLabel, { color: colors.muted }]}>Harga</Text>
                    <Text style={[styles.priceValue, { color: colors.primary }]}>RM {listing.price}</Text>
                    <Text style={[styles.priceType, { color: colors.muted }]}>
                      {PRICE_TYPE_LABELS[listing.priceType] || listing.priceType}
                    </Text>
                  </View>
                  {listing.duration && (
                    <View style={styles.durationInfo}>
                      <Text style={[styles.durationLabel, { color: colors.muted }]}>Durasi</Text>
                      <Text style={[styles.durationValue, { color: colors.foreground }]}>{listing.duration}</Text>
                      <Text style={[styles.durationUnit, { color: colors.muted }]}>minit</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}
                    onPress={() => handleOpenModal(listing)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="pencil" size={18} color={colors.primary} />
                    <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: colors.error + "15", borderColor: colors.error }]}
                    onPress={() => handleDelete(listing.id)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="trash" size={18} color={colors.error} />
                    <Text style={[styles.deleteButtonText, { color: colors.error }]}>Padam</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Tiada Listing</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Mulakan dengan membuat listing pertama anda untuk mula menerima booking
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => handleOpenModal()}
            >
              <Text style={styles.emptyButtonText}>Buat Listing Pertama</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ==================== FORM MODAL ==================== */}
      <Modal visible={showFormModal} animationType="slide" transparent onRequestClose={() => setShowFormModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={formStyles.overlay}>
          <View style={[formStyles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[formStyles.header, { borderBottomColor: colors.border }]}>
              <Text style={[formStyles.headerTitle, { color: colors.foreground }]}>
                {editingListing ? "Edit Listing" : "Listing Baru"}
              </Text>
              <TouchableOpacity onPress={() => setShowFormModal(false)} style={formStyles.closeBtn}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form */}
            <ScrollView
              contentContainerStyle={formStyles.formContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Tajuk */}
              <View style={formStyles.field}>
                <Text style={[formStyles.label, { color: colors.foreground }]}>Tajuk Perkhidmatan</Text>
                <TextInput
                  style={[formStyles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Contoh: Pertunjukan Piano Klasik"
                  placeholderTextColor={colors.muted}
                  value={formData.title}
                  onChangeText={(t) => setFormData({ ...formData, title: t })}
                />
              </View>

              {/* Penerangan */}
              <View style={formStyles.field}>
                <Text style={[formStyles.label, { color: colors.foreground }]}>Penerangan</Text>
                <TextInput
                  style={[formStyles.input, formStyles.textArea, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Terangkan perkhidmatan anda..."
                  placeholderTextColor={colors.muted}
                  value={formData.description}
                  onChangeText={(t) => setFormData({ ...formData, description: t })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Divider */}
              <View style={[formStyles.divider, { backgroundColor: colors.border }]} />

              {/* Kategori - opens separate modal */}
              <View style={formStyles.field}>
                <Text style={[formStyles.label, { color: colors.foreground }]}>Kategori</Text>
                <TouchableOpacity
                  style={[formStyles.selector, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowCategoryPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[formStyles.selectorText, { color: formData.category ? colors.foreground : colors.muted }]}>
                    {formData.category || "Pilih kategori"}
                  </Text>
                  <IconSymbol name="chevron.right" size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>

              {/* Genre - opens separate modal */}
              <View style={formStyles.field}>
                <Text style={[formStyles.label, { color: colors.foreground }]}>Genre</Text>
                <TouchableOpacity
                  style={[formStyles.selector, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowGenrePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[formStyles.selectorText, { color: formData.genre ? colors.foreground : colors.muted }]}>
                    {formData.genre || "Pilih genre"}
                  </Text>
                  <IconSymbol name="chevron.right" size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={[formStyles.divider, { backgroundColor: colors.border }]} />

              {/* Harga */}
              <View style={formStyles.field}>
                <Text style={[formStyles.label, { color: colors.foreground }]}>Harga (RM)</Text>
                <TextInput
                  style={[formStyles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Contoh: 500"
                  placeholderTextColor={colors.muted}
                  value={formData.price}
                  onChangeText={(t) => setFormData({ ...formData, price: t })}
                  keyboardType="numeric"
                />
              </View>

              {/* Jenis Harga */}
              <View style={formStyles.field}>
                <Text style={[formStyles.label, { color: colors.foreground }]}>Jenis Harga</Text>
                <View style={formStyles.priceTypeRow}>
                  {(["per_hour", "per_event", "per_day"] as const).map((type) => {
                    const isActive = formData.priceType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          formStyles.priceTypeBtn,
                          { borderColor: colors.border },
                          isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                        onPress={() => setFormData({ ...formData, priceType: type })}
                        activeOpacity={0.7}
                      >
                        <Text style={[formStyles.priceTypeBtnText, { color: isActive ? "#fff" : colors.foreground }]}>
                          {PRICE_TYPE_LABELS[type]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Durasi */}
              <View style={formStyles.field}>
                <Text style={[formStyles.label, { color: colors.foreground }]}>Durasi (minit)</Text>
                <TextInput
                  style={[formStyles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Contoh: 60"
                  placeholderTextColor={colors.muted}
                  value={formData.duration}
                  onChangeText={(t) => setFormData({ ...formData, duration: t })}
                  keyboardType="numeric"
                />
              </View>

              {/* Bottom padding */}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Fixed Footer Buttons */}
            <View style={[formStyles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[formStyles.footerBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setShowFormModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[formStyles.footerBtnText, { color: colors.muted }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[formStyles.footerBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Text style={[formStyles.footerBtnText, { color: "#fff" }]}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== CATEGORY PICKER MODAL ==================== */}
      <PickerModal
        visible={showCategoryPicker}
        title="Pilih Kategori"
        options={MUSIC_CATEGORIES}
        selectedValue={formData.category}
        onSelect={(val) => setFormData({ ...formData, category: val })}
        onClose={() => setShowCategoryPicker(false)}
        colors={colors}
      />

      {/* ==================== GENRE PICKER MODAL ==================== */}
      <PickerModal
        visible={showGenrePicker}
        title="Pilih Genre"
        options={MUSIC_GENRES}
        selectedValue={formData.genre}
        onSelect={(val) => setFormData({ ...formData, genre: val })}
        onClose={() => setShowGenrePicker(false)}
        colors={colors}
      />
    </ScreenContainer>
  );
}

// ===================== FORM STYLES =====================
const formStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    maxHeight: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  divider: {
    height: 1,
    marginBottom: 24,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  priceTypeRow: {
    flexDirection: "row",
    gap: 10,
  },
  priceTypeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  priceTypeBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  footerBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

// ===================== LISTING CARD STYLES =====================
const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  listingsContainer: {
    gap: 16,
  },
  listingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listingDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  priceType: {
    fontSize: 12,
    fontWeight: "500",
  },
  durationInfo: {
    alignItems: "flex-end",
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  durationUnit: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
