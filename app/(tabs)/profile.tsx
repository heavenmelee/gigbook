import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/lib/auth-context";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function UserProfileScreen() {
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

  const { data: profile, refetch } = trpc.user.getProfile.useQuery();
  const { data: bookings } = trpc.booking.getMyBookings.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const completedBookings = bookings?.filter((b: any) => b.status === "completed").length || 0;
  const activeBookings = bookings?.filter((b: any) => ["pending_approval", "approved", "confirmed"].includes(b.status)).length || 0;

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{(user?.name || "U")[0].toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name || "Pengguna"}</Text>
          <Text style={[styles.email, { color: colors.muted }]}>{user?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{activeBookings}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Tempahan Aktif</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{completedBookings}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Selesai</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Maklumat Akaun</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Nama</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile?.name || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile?.email || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Telefon</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile?.phone || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
              <Text style={{ color: colors.success, fontSize: 12, textTransform: "capitalize" }}>
                {profile?.status || "active"}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Tentang Gigbook</Text>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Gigbook adalah platform tempahan musician terbaik di Malaysia. Cari dan tempah musician untuk event anda dengan mudah dan selamat.
          </Text>
          <Text style={[styles.versionText, { color: colors.muted }]}>Versi 1.0.0</Text>
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
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 4 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  aboutText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  versionText: { fontSize: 12 },
  logoutButton: { padding: 14, borderRadius: 8, alignItems: "center", borderWidth: 1 },
});
