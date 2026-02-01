import { Text, View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/lib/auth-context";
import { useState } from "react";

export default function MusicianDashboardScreen() {
  const colors = useColors();
  const { user } = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, refetch: refetchStats } = trpc.musician.getStats.useQuery();
  const { data: profile } = trpc.musician.getProfile.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.muted }]}>Selamat Datang,</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {profile?.stageName || user?.name || "Musician"}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              RM {stats?.totalEarnings || "0"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Jumlah Pendapatan</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              RM {stats?.pendingPayouts || "0"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Dalam Escrow</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats?.upcomingGigs || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Gig Akan Datang</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stats?.totalGigs || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Jumlah Gig</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Profil Anda</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Rating:</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {profile?.rating || "0"} ⭐ ({profile?.totalReviews || 0} ulasan)
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Genre:</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile?.genre || "Belum ditetapkan"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Lokasi:</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile?.location || "Belum ditetapkan"}</Text>
          </View>
        </View>

        {(profile?.strikes || 0) > 0 && (
          <View style={[styles.warningCard, { backgroundColor: colors.error + "20", borderColor: colors.error }]}>
            <Text style={[styles.warningTitle, { color: colors.error }]}>⚠️ Amaran</Text>
            <Text style={[styles.warningText, { color: colors.error }]}>
              Anda mempunyai {profile?.strikes} strike. 3 strike akan menyebabkan akaun digantung.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
