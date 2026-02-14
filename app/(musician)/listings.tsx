import { Text, View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, RefreshControl, KeyboardAvoidingView, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
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

export default function MusicianListingsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleOpenModal = (listing?: any) => {
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
    setShowModal(true);
  };

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
      setShowModal(false);
      refetch();
    } catch (error) {
      console.error("Failed to save listing:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
    } catch (error) {
      console.error("Failed to delete listing:", error);
    }
  };

  const priceTypeLabels = {
    per_hour: "Sejam",
    per_event: "Per Event",
    per_day: "Sehari",
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Listing Saya</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => handleOpenModal()}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {listings && listings.length > 0 ? (
          listings.map((listing) => (
            <View
              key={listing.id}
              style={[styles.listingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.listingHeader}>
                <Text style={[styles.listingTitle, { color: colors.foreground }]}>{listing.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: listing.isActive ? colors.success + "20" : colors.muted + "20" }]}>
                  <Text style={{ color: listing.isActive ? colors.success : colors.muted, fontSize: 12 }}>
                    {listing.isActive ? "Aktif" : "Tidak Aktif"}
                  </Text>
                </View>
              </View>
              {listing.description && (
                <Text style={[styles.listingDescription, { color: colors.muted }]} numberOfLines={2}>
                  {listing.description}
                </Text>
              )}
              <View style={styles.listingDetails}>
                <Text style={[styles.listingPrice, { color: colors.primary }]}>
                  RM {listing.price} / {priceTypeLabels[listing.priceType as keyof typeof priceTypeLabels]}
                </Text>
                {listing.category && (
                  <Text style={[styles.listingCategory, { color: colors.muted }]}>{listing.category}</Text>
                )}
              </View>
              <View style={styles.listingActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.primary }]}
                  onPress={() => handleOpenModal(listing)}
                >
                  <Text style={{ color: colors.primary }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.error }]}
                  onPress={() => handleDelete(listing.id)}
                >
                  <Text style={{ color: colors.error }}>Padam</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Tiada listing lagi. Tambah listing pertama anda!
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {editingListing ? "Edit Listing" : "Listing Baru"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Content */}
            <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={true}>
              {/* Title Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tajuk Perkhidmatan *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Contoh: Pertunjukan Piano Klasik"
                  placeholderTextColor={colors.muted}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              {/* Description Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Penerangan *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Terangkan perkhidmatan anda, pengalaman, dan apa yang anda tawarkan..."
                  placeholderTextColor={colors.muted}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Category Dropdown */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Kategori *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={[styles.dropdownButtonText, { color: formData.category ? colors.foreground : colors.muted }]}>
                    {formData.category || "Pilih kategori"}
                  </Text>
                  <IconSymbol
                    name={showCategoryPicker ? "chevron.up" : "chevron.down"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
                {showCategoryPicker && (
                  <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {MUSIC_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.pickerItem,
                          formData.category === cat && { backgroundColor: colors.primary + "20" },
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, category: cat });
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: formData.category === cat ? colors.primary : colors.foreground },
                          ]}
                        >
                          {cat}
                        </Text>
                        {formData.category === cat && (
                          <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Genre Dropdown */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Genre *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowGenrePicker(!showGenrePicker)}
                >
                  <Text style={[styles.dropdownButtonText, { color: formData.genre ? colors.foreground : colors.muted }]}>
                    {formData.genre || "Pilih genre"}
                  </Text>
                  <IconSymbol
                    name={showGenrePicker ? "chevron.up" : "chevron.down"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
                {showGenrePicker && (
                  <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {MUSIC_GENRES.map((genre) => (
                      <TouchableOpacity
                        key={genre}
                        style={[
                          styles.pickerItem,
                          formData.genre === genre && { backgroundColor: colors.primary + "20" },
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, genre: genre });
                          setShowGenrePicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: formData.genre === genre ? colors.primary : colors.foreground },
                          ]}
                        >
                          {genre}
                        </Text>
                        {formData.genre === genre && (
                          <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Price Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Harga (RM) *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Contoh: 500"
                  placeholderTextColor={colors.muted}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="numeric"
                />
              </View>

              {/* Price Type Selection */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Jenis Harga *</Text>
                <View style={styles.priceTypeContainer}>
                  {(["per_hour", "per_event", "per_day"] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.priceTypeButton,
                        { borderColor: colors.border },
                        formData.priceType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setFormData({ ...formData, priceType: type })}
                    >
                      <Text style={{ color: formData.priceType === type ? "#fff" : colors.foreground, fontWeight: "600" }}>
                        {priceTypeLabels[type]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Durasi (minit)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Contoh: 60"
                  placeholderTextColor={colors.muted}
                  value={formData.duration}
                  onChangeText={(text) => setFormData({ ...formData, duration: text })}
                  keyboardType="numeric"
                />
              </View>

              {/* Extra spacing for scrolling */}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Modal Actions - Fixed at bottom */}
            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: colors.muted, fontWeight: "600" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

const priceTypeLabels = {
  per_hour: "Sejam",
  per_event: "Per Event",
  per_day: "Sehari",
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold" },
  addButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  listingCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  listingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  listingTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  listingDescription: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  listingDetails: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  listingPrice: { fontSize: 16, fontWeight: "600" },
  listingCategory: { fontSize: 12 },
  listingActions: { flexDirection: "row", gap: 8 },
  actionButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16, textAlign: "center" },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { maxHeight: "90%", borderTopLeftRadius: 20, borderTopRightRadius: 20, display: "flex", flexDirection: "column" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: "bold" },

  // Form Styles
  formScroll: { paddingHorizontal: 20, paddingVertical: 12 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { padding: 14, borderRadius: 8, borderWidth: 1, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top" },

  // Dropdown Styles
  dropdownButton: { padding: 14, borderRadius: 8, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownButtonText: { fontSize: 16, fontWeight: "500" },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginTop: 8, maxHeight: 200 },
  pickerItem: { padding: 12, borderBottomWidth: 0.5, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pickerItemText: { fontSize: 15, fontWeight: "500" },

  priceTypeContainer: { flexDirection: "row", gap: 8 },
  priceTypeButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: "center" },

  // Modal Actions
  modalActions: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", borderWidth: 1 },
});
