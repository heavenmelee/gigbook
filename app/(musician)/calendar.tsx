import { Text, View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";

export default function MusicianCalendarScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startDate = useMemo(() => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return date.toISOString().split("T")[0];
  }, [currentMonth]);

  const endDate = useMemo(() => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return date.toISOString().split("T")[0];
  }, [currentMonth]);

  const { data: availability, refetch } = trpc.musician.getAvailability.useQuery({ startDate, endDate });
  const setAvailabilityMutation = trpc.musician.setAvailability.useMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(i);
    
    return days;
  }, [currentMonth]);

  const availabilityMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    availability?.forEach((a) => {
      map[a.date] = a.isAvailable ?? true;
    });
    return map;
  }, [availability]);

  const handleToggleAvailability = async (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const currentAvailability = availabilityMap[dateStr] ?? true;
    
    try {
      await setAvailabilityMutation.mutateAsync({
        date: dateStr,
        isAvailable: !currentAvailability,
      });
      refetch();
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const monthNames = [
    "Januari", "Februari", "Mac", "April", "Mei", "Jun",
    "Julai", "Ogos", "September", "Oktober", "November", "Disember"
  ];

  const dayNames = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Kalendar Ketersediaan</Text>

        <View style={[styles.calendarContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
              <Text style={[styles.navText, { color: colors.primary }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.foreground }]}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
              <Text style={[styles.navText, { color: colors.primary }]}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dayNamesRow}>
            {dayNames.map((name) => (
              <Text key={name} style={[styles.dayName, { color: colors.muted }]}>
                {name}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {daysInMonth.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isAvailable = availabilityMap[dateStr] ?? true;
              const past = isPast(day);

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday(day) && { borderColor: colors.primary, borderWidth: 2 },
                    !past && (isAvailable ? { backgroundColor: colors.success + "20" } : { backgroundColor: colors.error + "20" }),
                    past && { opacity: 0.4 },
                  ]}
                  onPress={() => !past && handleToggleAvailability(day)}
                  disabled={past}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: colors.foreground },
                      isToday(day) && { fontWeight: "bold", color: colors.primary },
                    ]}
                  >
                    {day}
                  </Text>
                  {!past && (
                    <View
                      style={[
                        styles.availabilityDot,
                        { backgroundColor: isAvailable ? colors.success : colors.error },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>Tersedia</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>Tidak Tersedia</Text>
          </View>
        </View>

        <Text style={[styles.hint, { color: colors.muted }]}>
          Tekan pada tarikh untuk menukar status ketersediaan
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  calendarContainer: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  monthNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  navButton: { padding: 8 },
  navText: { fontSize: 24, fontWeight: "bold" },
  monthTitle: { fontSize: 18, fontWeight: "600" },
  dayNamesRow: { flexDirection: "row", marginBottom: 8 },
  dayName: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "600" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.28%", aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 8, marginBottom: 4 },
  dayText: { fontSize: 14 },
  availabilityDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  legend: { flexDirection: "row", justifyContent: "center", gap: 24, marginBottom: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 14 },
  hint: { fontSize: 12, textAlign: "center" },
});
