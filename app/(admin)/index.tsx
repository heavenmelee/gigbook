import { Text, View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function AdminDashboardScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, refetch: refetchStats } = trpc.admin.getStats.useQuery();
  const { data: recentActivity, refetch: refetchActivity } = trpc.admin.getRecentActivity.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchActivity()]);
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
          <Text style={[styles.title, { color: colors.foreground }]}>Admin Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Gigbook Malaysia</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats?.totalUsers || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Jumlah Pengguna</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.success + "15", borderColor: colors.success }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats?.totalMusicians || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Musician</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.warning + "15", borderColor: colors.warning }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats?.pendingApprovals || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Menunggu Kelulusan</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent }]}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{stats?.totalBookings || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Jumlah Tempahan</Text>
          </View>
        </View>

        <View style={[styles.revenueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.revenueLabel, { color: colors.muted }]}>Jumlah Komisyen (10%)</Text>
          <Text style={[styles.revenueValue, { color: colors.success }]}>
            RM {stats?.totalRevenue || "0"}
          </Text>
        </View>

        <View style={styles.activitySection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Aktiviti Terkini</Text>
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.slice(0, 10).map((activity, index) => (
              <View
                key={activity.id || index}
                style={[styles.activityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.activityAction, { color: colors.foreground }]}>
                  {activity.action.replace(/_/g, " ")}
                </Text>
                <Text style={[styles.activityTime, { color: colors.muted }]}>
                  {new Date(activity.createdAt).toLocaleString("ms-MY")}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada aktiviti terkini</Text>
          )}
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  revenueCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: "center",
  },
  revenueLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  revenueValue: {
    fontSize: 36,
    fontWeight: "bold",
  },
  activitySection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  activityTime: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
});
