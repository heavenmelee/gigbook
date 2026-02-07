import { Text, View, ScrollView, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/lib/auth-context";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function MusicianProfileScreen() {
  const colors = useColors();
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/welcome");
    } catch (error: any) {
      Alert.alert("Ralat", error.message || "Gagal log keluar");
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    stageName: "",
    bio: "",
    genre: "",
    location: "",
    experienceYears: "",
  });

  const { data: profile, refetch } = trpc.musician.getProfile.useQuery();
  const updateMutation = trpc.musician.updateProfile.useMutation();

  useEffect(() => {
    if (profile) {
      setFormData({
        stageName: profile.stageName || "",
        bio: profile.bio || "",
        genre: profile.genre || "",
        location: profile.location || "",
        experienceYears: profile.experienceYears?.toString() || "",
      });
    }
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        ...formData,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const genres = ["Pop", "Rock", "Jazz", "Classical", "Traditional", "R&B", "Hip Hop", "EDM", "Acoustic", "Lain-lain"];

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{(profile?.stageName || user?.name || "M")[0].toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>{profile?.stageName || user?.name || "Musician"}</Text>
          <Text style={[styles.email, { color: colors.muted }]}>{user?.email}</Text>
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: colors.warning }]}>⭐ {profile?.rating || "0"}</Text>
            <Text style={[styles.reviews, { color: colors.muted }]}>({profile?.totalReviews || 0} ulasan)</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Profil Musician</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={{ color: colors.primary }}>{isEditing ? "Batal" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.muted }]}>Nama Pentas</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={formData.stageName}
                onChangeText={(text) => setFormData({ ...formData, stageName: text })}
                placeholder="Nama pentas anda"
                placeholderTextColor={colors.muted}
              />

              <Text style={[styles.label, { color: colors.muted }]}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Ceritakan tentang diri anda"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
              />

              <Text style={[styles.label, { color: colors.muted }]}>Genre</Text>
              <View style={styles.genreContainer}>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.genreChip,
                      { borderColor: colors.border },
                      formData.genre === genre && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setFormData({ ...formData, genre })}
                  >
                    <Text style={{ color: formData.genre === genre ? "#fff" : colors.foreground, fontSize: 13 }}>{genre}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.muted }]}>Lokasi</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Cth: Kuala Lumpur, Selangor"
                placeholderTextColor={colors.muted}
              />

              <Text style={[styles.label, { color: colors.muted }]}>Pengalaman (tahun)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={formData.experienceYears}
                onChangeText={(text) => setFormData({ ...formData, experienceYears: text })}
                placeholder="Cth: 5"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>Nama Pentas</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile?.stageName || "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>Genre</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile?.genre || "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>Lokasi</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile?.location || "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>Pengalaman</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>
                  {profile?.experienceYears ? `${profile.experienceYears} tahun` : "-"}
                </Text>
              </View>
              {profile?.bio && (
                <View style={styles.bioSection}>
                  <Text style={[styles.infoLabel, { color: colors.muted }]}>Bio</Text>
                  <Text style={[styles.bioText, { color: colors.foreground }]}>{profile.bio}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.error }]} onPress={handleLogout}>
          <Text style={{ color: colors.error, fontWeight: "600" }}>Log Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  header: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 22, fontWeight: "bold" },
  email: { fontSize: 14, marginTop: 4 },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  rating: { fontSize: 16, fontWeight: "600" },
  reviews: { fontSize: 14 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  form: { gap: 12 },
  label: { fontSize: 14, marginBottom: 4 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  genreContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  saveButton: { padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  profileInfo: { gap: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "500" },
  bioSection: { marginTop: 8 },
  bioText: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  logoutButton: { padding: 14, borderRadius: 8, alignItems: "center", borderWidth: 1 },
});
