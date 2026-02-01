import { Text, View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function MusicianListingsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
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
        price: listing.price,
        priceType: listing.priceType,
        duration: listing.duration?.toString() || "",
      });
    } else {
      setEditingListing(null);
      setFormData({ title: "", description: "", category: "", price: "", priceType: "per_event", duration: "" });
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

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editingListing ? "Edit Listing" : "Listing Baru"}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Tajuk"
              placeholderTextColor={colors.muted}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Penerangan"
              placeholderTextColor={colors.muted}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Kategori (cth: Solo, Band, DJ)"
              placeholderTextColor={colors.muted}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Harga (RM)"
              placeholderTextColor={colors.muted}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />

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
                  <Text style={{ color: formData.priceType === type ? "#fff" : colors.foreground }}>
                    {priceTypeLabels[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: colors.muted }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#fff" }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { padding: 14, borderRadius: 8, borderWidth: 1, marginBottom: 12, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: "top" },
  priceTypeContainer: { flexDirection: "row", gap: 8, marginBottom: 20 },
  priceTypeButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  modalActions: { flexDirection: "row", gap: 12 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", borderWidth: 1 },
});
