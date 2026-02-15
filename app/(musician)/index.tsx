import { Text, View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Switch, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/lib/auth-context";
import { useState, useCallback, useMemo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

// Status labels
const STATUS_LABELS: Record<string, string> = {
  pending_approval: "Menunggu Kelulusan",
  approved: "Diluluskan",
  confirmed: "Disahkan",
  rejected: "Ditolak",
  cancelled_user: "Dibatalkan",
  cancelled_musician: "Dibatalkan",
  completed: "Selesai",
  disputed: "Dipertikaikan",
};

const STATUS_COLORS: Record<string, string> = {
  pending_approval: "warning",
  approved: "primary",
  confirmed: "success",
  rejected: "error",
  cancelled_user: "muted",
  cancelled_musician: "muted",
  completed: "success",
  disputed: "error",
};

export default function MusicianDashboardScreen() {
  const colors = useColors();
  const { user } = useAuthContext();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const { data: stats, refetch: refetchStats } = trpc.musician.getStats.useQuery();
  const { data: profile, refetch: refetchProfile } = trpc.musician.getProfile.useQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchProfile()]);
    setRefreshing(false);
  }, [refetchStats, refetchProfile]);

  const toggleAvailability = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsAvailable((prev) => !prev);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const colorKey = STATUS_COLORS[status] || "muted";
    return (colors as any)[colorKey] || colors.muted;
  }, [colors]);

  // To-do items
  const todoItems = useMemo(() => {
    const items: { text: string; type: "warning" | "info" | "error" }[] = [];
    if (stats && stats.profileCompletion < 100) {
      items.push({ text: `Lengkapkan profil anda (${stats.profileCompletion}%)`, type: "info" });
    }
    if (!profile?.coverPhoto) {
      items.push({ text: "Muat naik foto profil / cover", type: "info" });
    }
    if (!profile?.bio) {
      items.push({ text: "Tambah bio / penerangan diri", type: "info" });
    }
    if (!profile?.portfolio || profile.portfolio.length === 0) {
      items.push({ text: "Muat naik media video / portfolio", type: "warning" });
    }
    if (stats && stats.newRequests > 0) {
      items.push({ text: `${stats.newRequests} permintaan baharu menunggu respons`, type: "warning" });
    }
    return items;
  }, [stats, profile]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];
    const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== HEADER ==================== */}
        <View style={[s.headerSection, { backgroundColor: colors.primary }]}>
          <View style={s.headerTop}>
            <View style={s.headerLeft}>
              <Text style={s.headerGreeting}>Selamat Datang,</Text>
              <Text style={s.headerName} numberOfLines={1}>
                {profile?.stageName || user?.name || "Musician"}
              </Text>
              <View style={s.headerBadges}>
                {profile?.verified ? (
                  <View style={[s.badge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color="#fff" />
                    <Text style={s.badgeText}>Verified</Text>
                  </View>
                ) : (
                  <View style={[s.badge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                    <IconSymbol name="clock.fill" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={[s.badgeText, { opacity: 0.8 }]}>Pending</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity
                style={[s.notifButton]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <IconSymbol name="bell.fill" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Availability Toggle */}
          <View style={[s.availabilityBar, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <View style={s.availabilityLeft}>
              <View style={[s.availDot, { backgroundColor: isAvailable ? "#4ADE80" : "#FBBF24" }]} />
              <Text style={s.availText}>
                {isAvailable ? "Available" : "Away"}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: "rgba(255,255,255,0.2)", true: "rgba(74,222,128,0.5)" }}
              thumbColor={isAvailable ? "#4ADE80" : "#FBBF24"}
            />
          </View>
        </View>

        <View style={s.bodyContent}>
          {/* ==================== KPI CARDS ==================== */}
          <View style={s.kpiGrid}>
            <View style={[s.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: colors.primary + "15" }]}>
                <IconSymbol name="calendar" size={20} color={colors.primary} />
              </View>
              <Text style={[s.kpiValue, { color: colors.primary }]}>{stats?.upcomingGigs || 0}</Text>
              <Text style={[s.kpiLabel, { color: colors.muted }]}>Akan Datang</Text>
              <Text style={[s.kpiSub, { color: colors.muted }]}>7 hari</Text>
            </View>

            <View style={[s.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: colors.warning + "15" }]}>
                <IconSymbol name="bell.fill" size={20} color={colors.warning} />
              </View>
              <Text style={[s.kpiValue, { color: colors.warning }]}>{stats?.newRequests || 0}</Text>
              <Text style={[s.kpiLabel, { color: colors.muted }]}>Permintaan</Text>
              <Text style={[s.kpiSub, { color: colors.muted }]}>Baharu</Text>
            </View>

            <View style={[s.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: colors.success + "15" }]}>
                <IconSymbol name="dollarsign.circle.fill" size={20} color={colors.success} />
              </View>
              <Text style={[s.kpiValue, { color: colors.success }]}>RM {stats?.monthlyEarnings || "0"}</Text>
              <Text style={[s.kpiLabel, { color: colors.muted }]}>Bulan Ini</Text>
              <Text style={[s.kpiSub, { color: colors.muted }]}>Pendapatan</Text>
            </View>

            <View style={[s.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: "#F59E0B15" }]}>
                <IconSymbol name="star.fill" size={20} color="#F59E0B" />
              </View>
              <Text style={[s.kpiValue, { color: colors.foreground }]}>{stats?.avgRating || "0.00"}</Text>
              <Text style={[s.kpiLabel, { color: colors.muted }]}>Rating</Text>
              <Text style={[s.kpiSub, { color: colors.muted }]}>{stats?.totalReviews || 0} ulasan</Text>
            </View>

            <View style={[s.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: colors.error + "15" }]}>
                <IconSymbol name="dollarsign.circle.fill" size={20} color={colors.error} />
              </View>
              <Text style={[s.kpiValue, { color: colors.error }]}>RM {stats?.pendingPayouts || "0"}</Text>
              <Text style={[s.kpiLabel, { color: colors.muted }]}>Escrow</Text>
              <Text style={[s.kpiSub, { color: colors.muted }]}>Dalam proses</Text>
            </View>

            <View style={[s.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: colors.primary + "15" }]}>
                <IconSymbol name="person.fill" size={20} color={colors.primary} />
              </View>
              <Text style={[s.kpiValue, { color: colors.primary }]}>{stats?.profileCompletion || 0}%</Text>
              <Text style={[s.kpiLabel, { color: colors.muted }]}>Profil</Text>
              <Text style={[s.kpiSub, { color: colors.muted }]}>Lengkap</Text>
            </View>
          </View>

          {/* ==================== UPCOMING BOOKINGS ==================== */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Tempahan Akan Datang</Text>
              <TouchableOpacity onPress={() => router.push("/(musician)/bookings")} activeOpacity={0.7}>
                <Text style={[s.sectionLink, { color: colors.primary }]}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>

            {stats?.upcomingBookings && stats.upcomingBookings.length > 0 ? (
              stats.upcomingBookings.map((booking: any) => (
                <TouchableOpacity
                  key={booking.id}
                  style={[s.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push("/(musician)/bookings")}
                  activeOpacity={0.7}
                >
                  <View style={s.bookingLeft}>
                    <View style={[s.bookingDateBox, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={[s.bookingDateDay, { color: colors.primary }]}>
                        {new Date(booking.eventDate + "T00:00:00").getDate()}
                      </Text>
                      <Text style={[s.bookingDateMonth, { color: colors.primary }]}>
                        {["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"][new Date(booking.eventDate + "T00:00:00").getMonth()]}
                      </Text>
                    </View>
                  </View>
                  <View style={s.bookingCenter}>
                    <Text style={[s.bookingVenue, { color: colors.foreground }]} numberOfLines={1}>
                      {booking.venueName || "Lokasi belum ditetapkan"}
                    </Text>
                    <Text style={[s.bookingTime, { color: colors.muted }]}>
                      {formatDate(booking.eventDate)} · {booking.eventTime}
                    </Text>
                    <View style={[s.bookingStatusBadge, { backgroundColor: getStatusColor(booking.status) + "15" }]}>
                      <Text style={[s.bookingStatusText, { color: getStatusColor(booking.status) }]}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </Text>
                    </View>
                  </View>
                  <View style={s.bookingRight}>
                    <IconSymbol name="chevron.right" size={18} color={colors.muted} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.emptyText, { color: colors.muted }]}>Tiada tempahan akan datang</Text>
              </View>
            )}
          </View>

          {/* ==================== NEW INQUIRIES ==================== */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Permintaan Baharu</Text>
              <TouchableOpacity onPress={() => router.push("/(musician)/bookings")} activeOpacity={0.7}>
                <Text style={[s.sectionLink, { color: colors.primary }]}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>

            {stats?.pendingBookings && stats.pendingBookings.length > 0 ? (
              stats.pendingBookings.map((booking: any) => (
                <TouchableOpacity
                  key={booking.id}
                  style={[s.inquiryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push("/(musician)/bookings")}
                  activeOpacity={0.7}
                >
                  <View style={s.inquiryTop}>
                    <View style={s.inquiryInfo}>
                      <Text style={[s.inquiryVenue, { color: colors.foreground }]} numberOfLines={1}>
                        {booking.venueName || "Event"}
                      </Text>
                      <Text style={[s.inquiryDate, { color: colors.muted }]}>
                        {formatDate(booking.eventDate)} · {booking.eventTime}
                      </Text>
                    </View>
                    <Text style={[s.inquiryAmount, { color: colors.primary }]}>
                      RM {booking.totalAmount}
                    </Text>
                  </View>
                  {booking.venueAddress && (
                    <View style={s.inquiryLocationRow}>
                      <IconSymbol name="location.fill" size={14} color={colors.muted} />
                      <Text style={[s.inquiryLocation, { color: colors.muted }]} numberOfLines={1}>
                        {booking.venueAddress}
                      </Text>
                    </View>
                  )}
                  <View style={s.inquiryActions}>
                    <TouchableOpacity
                      style={[s.inquiryBtn, { backgroundColor: colors.primary }]}
                      activeOpacity={0.7}
                    >
                      <Text style={s.inquiryBtnText}>Lihat & Respons</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.emptyText, { color: colors.muted }]}>Tiada permintaan baharu</Text>
              </View>
            )}
          </View>

          {/* ==================== TO-DO / ALERTS ==================== */}
          {todoItems.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: colors.foreground }]}>Perkara Perlu Dilakukan</Text>
              </View>

              {todoItems.map((item, idx) => {
                const iconColor = item.type === "error" ? colors.error : item.type === "warning" ? colors.warning : colors.primary;
                const bgColor = item.type === "error" ? colors.error + "10" : item.type === "warning" ? colors.warning + "10" : colors.primary + "10";
                return (
                  <View
                    key={idx}
                    style={[s.todoItem, { backgroundColor: bgColor, borderColor: iconColor + "30" }]}
                  >
                    <IconSymbol
                      name={item.type === "error" ? "exclamationmark.triangle.fill" : item.type === "warning" ? "exclamationmark.triangle.fill" : "checkmark.circle.fill"}
                      size={18}
                      color={iconColor}
                    />
                    <Text style={[s.todoText, { color: colors.foreground }]}>{item.text}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* ==================== QUICK ACTIONS ==================== */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Tindakan Pantas</Text>
            </View>

            <View style={s.quickActionsGrid}>
              <TouchableOpacity
                style={[s.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push("/(musician)/profile")}
                activeOpacity={0.7}
              >
                <View style={[s.quickActionIcon, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name="person.fill" size={24} color={colors.primary} />
                </View>
                <Text style={[s.quickActionLabel, { color: colors.foreground }]}>Kemaskini{"\n"}Profil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push("/(musician)/packages")}
                activeOpacity={0.7}
              >
                <View style={[s.quickActionIcon, { backgroundColor: colors.success + "15" }]}>
                  <IconSymbol name="plus.circle.fill" size={24} color={colors.success} />
                </View>
                <Text style={[s.quickActionLabel, { color: colors.foreground }]}>Tambah{"\n"}Pakej</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push("/(musician)/profile")}
                activeOpacity={0.7}
              >
                <View style={[s.quickActionIcon, { backgroundColor: colors.warning + "15" }]}>
                  <IconSymbol name="eye.fill" size={24} color={colors.warning} />
                </View>
                <Text style={[s.quickActionLabel, { color: colors.foreground }]}>Muat Naik{"\n"}Media</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <View style={[s.quickActionIcon, { backgroundColor: colors.error + "15" }]}>
                  <IconSymbol name="creditcard.fill" size={24} color={colors.error} />
                </View>
                <Text style={[s.quickActionLabel, { color: colors.foreground }]}>Pengeluaran{"\n"}/ Payout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ==================== EARNINGS SUMMARY ==================== */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Ringkasan Pendapatan</Text>
            </View>
            <View style={[s.earningsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.earningsRow}>
                <Text style={[s.earningsLabel, { color: colors.muted }]}>Jumlah Pendapatan (Gross)</Text>
                <Text style={[s.earningsValue, { color: colors.foreground }]}>RM {stats?.totalEarnings || "0"}</Text>
              </View>
              <View style={[s.earningsDivider, { backgroundColor: colors.border }]} />
              <View style={s.earningsRow}>
                <Text style={[s.earningsLabel, { color: colors.muted }]}>Bulan Ini</Text>
                <Text style={[s.earningsValue, { color: colors.success }]}>RM {stats?.monthlyEarnings || "0"}</Text>
              </View>
              <View style={[s.earningsDivider, { backgroundColor: colors.border }]} />
              <View style={s.earningsRow}>
                <Text style={[s.earningsLabel, { color: colors.muted }]}>Dalam Escrow</Text>
                <Text style={[s.earningsValue, { color: colors.warning }]}>RM {stats?.pendingPayouts || "0"}</Text>
              </View>
              <View style={[s.earningsDivider, { backgroundColor: colors.border }]} />
              <View style={s.earningsRow}>
                <Text style={[s.earningsLabel, { color: colors.muted }]}>Jumlah Gig Selesai</Text>
                <Text style={[s.earningsValue, { color: colors.foreground }]}>{stats?.totalGigs || 0}</Text>
              </View>
            </View>
          </View>

          {/* Strikes Warning */}
          {(profile?.strikes || 0) > 0 && (
            <View style={[s.warningCard, { backgroundColor: colors.error + "15", borderColor: colors.error }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.error} />
              <View style={s.warningContent}>
                <Text style={[s.warningTitle, { color: colors.error }]}>Amaran</Text>
                <Text style={[s.warningText, { color: colors.error }]}>
                  Anda mempunyai {profile?.strikes} strike. 3 strike akan menyebabkan akaun digantung.
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },

  // Header
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: { flex: 1 },
  headerRight: {},
  headerGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  headerName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  headerBadges: { flexDirection: "row", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  availabilityBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  availabilityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  availDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  availText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  // Body
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  kpiCard: {
    width: "31%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  kpiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  kpiSub: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 1,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Booking Card
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  bookingLeft: { marginRight: 14 },
  bookingDateBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingDateDay: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
  bookingDateMonth: {
    fontSize: 11,
    fontWeight: "600",
  },
  bookingCenter: { flex: 1 },
  bookingVenue: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  bookingTime: {
    fontSize: 12,
    marginBottom: 6,
  },
  bookingStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bookingStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bookingRight: {
    marginLeft: 8,
  },

  // Inquiry Card
  inquiryCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  inquiryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  inquiryInfo: { flex: 1 },
  inquiryVenue: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  inquiryDate: {
    fontSize: 12,
  },
  inquiryAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
  },
  inquiryLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  inquiryLocation: {
    fontSize: 12,
    flex: 1,
  },
  inquiryActions: {
    flexDirection: "row",
    gap: 8,
  },
  inquiryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  inquiryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Empty Card
  emptyCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },

  // To-do
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  todoText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickAction: {
    width: "48%",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },

  // Earnings
  earningsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  earningsDivider: {
    height: 1,
  },

  // Warning
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningContent: { flex: 1 },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
