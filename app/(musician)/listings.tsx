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

  const getCategoryIcon = (category: string | null): any => {
    const iconMap: { [key: string]: any } = {
      "Solo": "person.fill",
      "Band": "person.2.fill",
      "DJ": "waveform.circle.fill",
      "Orkestra": "music.note.list",
      "Vokal": "mic.fill",
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
        {/* Header Section */}
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

        {/* Listings Grid */}
        {listings && listings.length > 0 ? (
          <View style={styles.listingsContainer}>
            {listings.map((listing) => (
              <View
                key={listing.id}
                style={[styles.listingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                {/* Card Header with Status */}
                <View style={styles.cardHeader}>
                  <View style={styles.categoryIconContainer}>
                    <IconSymbol
                      name={getCategoryIcon(listing.category)}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: listing.isActive ? colors.success : colors.warning },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: listing.isActive ? colors.success : colors.warning },
                      ]}
                    >
                      {listing.isActive ? "Aktif" : "Tidak Aktif"}
                    </Text>
                  </View>
                </View>

                {/* Card Title */}
                <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {listing.title}
                </Text>

                {/* Category & Genre Tags */}
                <View style={styles.tagsContainer}>
                  {listing.category && (
                    <View style={[styles.tag, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>
                        {listing.category}
                      </Text>
                    </View>
                  )}
                  {(listing as any).genre && (
                    <View style={[styles.tag, { backgroundColor: colors.primary + "10" }]}>
                      <Text style={[styles.tagText, { color: colors.muted }]}>
                        {(listing as any).genre}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                {listing.description && (
                  <Text
                    style={[styles.listingDescription, { color: colors.muted }]}
                    numberOfLines={2}
                  >
                    {listing.description}
                  </Text>
                )}

                {/* Price & Duration Section */}
                <View style={styles.priceSection}>
                  <View style={styles.priceInfo}>
                    <Text style={[styles.priceLabel, { color: colors.muted }]}>Harga</Text>
                    <Text style={[styles.priceValue, { color: colors.primary }]}>
                      RM {listing.price}
                    </Text>
                    <Text style={[styles.priceType, { color: colors.muted }]}>
                      {priceTypeLabels[listing.priceType as keyof typeof priceTypeLabels]}
                    </Text>
                  </View>
                  {listing.duration && (
                    <View style={styles.durationInfo}>
                      <Text style={[styles.durationLabel, { color: colors.muted }]}>Durasi</Text>
                      <Text style={[styles.durationValue, { color: colors.foreground }]}>
                        {listing.duration}
                      </Text>
                      <Text style={[styles.durationUnit, { color: colors.muted }]}>minit</Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
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

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {editingListing ? "Edit Listing" : "Listing Baru"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Content */}
            <ScrollView 
              contentContainerStyle={styles.formScroll}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
            >
              {/* Title Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tajuk Perkhidmatan</Text>
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
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Penerangan</Text>
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

              {/* Section Divider */}
              <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

              {/* Category Dropdown */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Kategori</Text>
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
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Genre</Text>
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

              {/* Section Divider */}
              <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

              {/* Price Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Harga (RM)</Text>
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
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Jenis Harga</Text>
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
                      <Text style={{ color: formData.priceType === type ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 14 }}>
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
              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal Actions - Fixed at bottom */}
            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: colors.muted, fontWeight: "600", fontSize: 16 }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Simpan</Text>
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

  /* Header Section */
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

  /* Listings Container */
  listingsContainer: {
    gap: 16,
  },

  /* Listing Card */
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
    backgroundColor: "rgba(10, 126, 164, 0.1)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
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

  /* Card Title */
  listingTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 24,
  },

  /* Tags */
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

  /* Description */
  listingDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },

  /* Price Section */
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
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

  /* Action Buttons */
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

  /* Empty State */
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

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  /* Form Styles */
  formScroll: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  fieldGroup: {
    marginBottom: 24,
    position: "relative",
    zIndex: 1,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
  },

  /* Section Divider */
  sectionDivider: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: -20,
  },

  /* Dropdown Styles */
  dropdownButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    maxHeight: 240,
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 0.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },

  priceTypeContainer: {
    flexDirection: "row",
    gap: 10,
  },
  priceTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Modal Actions */
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
});
