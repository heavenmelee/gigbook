import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

type EventType = "booked" | "hold" | "blocked" | "available";

interface CalendarEvent {
  id: number;
  type: EventType;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
}

// Mock data - replace with real API later
const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    type: "booked",
    title: "Wedding dinner",
    startTime: "18:00",
    endTime: "22:00",
    date: "2026-02-15",
  },
  {
    id: 2,
    type: "hold",
    title: "Corporate event (pending)",
    startTime: "19:00",
    endTime: "21:00",
    date: "2026-02-17",
  },
  {
    id: 3,
    type: "blocked",
    title: "Personal",
    startTime: "14:00",
    endTime: "18:00",
    date: "2026-02-18",
  },
];

// Generate week days
const generateWeekDays = () => {
  const days = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      date: date.toISOString().split("T")[0],
      day: date.getDate(),
      dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
      isToday: date.toDateString() === today.toDateString(),
    });
  }
  return days;
};

// Generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 23; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState("February 2026");
  const [autoBuffer, setAutoBuffer] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split("T")[0]);
  const [blockTimeVisible, setBlockTimeVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const weekDays = generateWeekDays();
  const timeSlots = generateTimeSlots();

  const getEventsForDay = (date: string) => {
    return mockEvents.filter((e) => e.date === date);
  };

  const getDayIndicator = (date: string): EventType => {
    const events = getEventsForDay(date);
    if (events.some((e) => e.type === "booked")) return "booked";
    if (events.some((e) => e.type === "hold")) return "hold";
    if (events.some((e) => e.type === "blocked")) return "blocked";
    return "available";
  };

  const getIndicatorColor = (type: EventType) => {
    switch (type) {
      case "booked":
        return colors.success;
      case "hold":
        return colors.warning;
      case "blocked":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "booked":
        return { bg: colors.success + "20", border: colors.success, text: colors.success };
      case "hold":
        return { bg: colors.warning + "20", border: colors.warning, text: colors.warning };
      case "blocked":
        return { bg: colors.error + "20", border: colors.error, text: colors.error };
      default:
        return { bg: colors.surface, border: colors.border, text: colors.foreground };
    }
  };

  const openBlockTime = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setBlockTimeVisible(true);
  };

  const closeBlockTime = () => {
    setBlockTimeVisible(false);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedReason("");
  };

  const saveBlockTime = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // TODO: Save to API
    closeBlockTime();
  };

  return (
    <ScreenContainer className="p-0">
      <View style={[s.container, { backgroundColor: colors.background }]}>
        {/* ==================== TOP CONTROLS ==================== */}
        <View style={[s.topBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={s.monthSelector} onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            Alert.alert("Month Selector", "Month picker will be available in a future update. Currently showing the current week.");
          }} activeOpacity={0.7}>
            <Text style={[s.monthText, { color: colors.foreground }]}>{selectedMonth}</Text>
            <IconSymbol name="chevron.down" size={18} color={colors.foreground} />
          </TouchableOpacity>

          <View style={s.autoBufferToggle}>
            <Text style={[s.autoBufferLabel, { color: colors.foreground }]}>Auto-buffer</Text>
            <Switch
              value={autoBuffer}
              onValueChange={(value) => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setAutoBuffer(value);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ==================== WEEKLY STRIP ==================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.weekStrip}
          style={[s.weekStripContainer, { borderBottomColor: colors.border }]}
        >
          {weekDays.map((day) => {
            const isSelected = day.date === selectedDay;
            const indicator = getDayIndicator(day.date);
            return (
              <TouchableOpacity
                key={day.date}
                style={[
                  s.dayTile,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: day.isToday ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedDay(day.date);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.dayName,
                    { color: isSelected ? "#fff" : colors.muted },
                  ]}
                >
                  {day.dayName}
                </Text>
                <Text
                  style={[
                    s.dayNumber,
                    { color: isSelected ? "#fff" : colors.foreground },
                  ]}
                >
                  {day.day}
                </Text>
                <View style={[s.dayIndicator, { backgroundColor: getIndicatorColor(indicator) }]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ==================== WEEK VIEW ==================== */}
        <ScrollView contentContainerStyle={s.weekViewContent} showsVerticalScrollIndicator={false}>
          <View style={s.weekView}>
            {/* Time labels */}
            <View style={s.timeColumn}>
              {timeSlots.map((time) => (
                <View key={time} style={s.timeSlot}>
                  <Text style={[s.timeLabel, { color: colors.muted }]}>{time}</Text>
                </View>
              ))}
            </View>

            {/* Events column */}
            <View style={s.eventsColumn}>
              {timeSlots.map((time) => (
                <View
                  key={time}
                  style={[s.eventSlot, { borderBottomColor: colors.border }]}
                />
              ))}

              {/* Render events */}
              {getEventsForDay(selectedDay).map((event) => {
                const startHour = parseInt(event.startTime.split(":")[0]);
                const endHour = parseInt(event.endTime.split(":")[0]);
                const duration = endHour - startHour;
                const top = (startHour - 8) * 60; // 60px per hour
                const height = duration * 60;
                const eventColors = getEventColor(event.type);

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      s.eventBlock,
                      {
                        top,
                        height,
                        backgroundColor: eventColors.bg,
                        borderLeftColor: eventColors.border,
                      },
                    ]}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      Alert.alert(
                        event.title,
                        `${event.startTime} – ${event.endTime}\nType: ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}`,
                        event.type === "booked"
                          ? [
                              { text: "Close" },
                              { text: "View Job", onPress: () => router.push("/(musician)/jobs") },
                            ]
                          : [{ text: "Close" }]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.eventTitle, { color: eventColors.text }]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={[s.eventTime, { color: eventColors.text }]}>
                      {event.startTime} – {event.endTime}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* ==================== FLOATING CTA ==================== */}
        <TouchableOpacity
          style={[s.floatingButton, { backgroundColor: colors.primary }]}
          onPress={openBlockTime}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
          <Text style={s.floatingButtonText}>Block time</Text>
        </TouchableOpacity>

        {/* ==================== BLOCK TIME BOTTOM SHEET ==================== */}
        <Modal
          visible={blockTimeVisible}
          transparent
          animationType="slide"
          onRequestClose={closeBlockTime}
        >
          <View style={s.modalOverlay}>
            <TouchableOpacity
              style={s.modalBackdrop}
              activeOpacity={1}
              onPress={closeBlockTime}
            />
            <View style={[s.bottomSheet, { backgroundColor: colors.background }]}>
              <View style={[s.bottomSheetHeader, { borderBottomColor: colors.border }]}>
                <Text style={[s.bottomSheetTitle, { color: colors.foreground }]}>
                  Block time
                </Text>
                <TouchableOpacity onPress={closeBlockTime} activeOpacity={0.7}>
                  <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={s.bottomSheetContent}>
                {/* Step 1: Date/Time */}
                <View style={s.formSection}>
                  <Text style={[s.formLabel, { color: colors.foreground }]}>Date & Time</Text>
                  <TouchableOpacity
                    style={[s.formInput, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      // Use the currently selected day from the week strip
                      setSelectedDate(selectedDay);
                      Alert.alert("Date Selected", `Date set to ${selectedDay}. Tap a different day on the week strip to change.`);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.formInputText, { color: selectedDate ? colors.foreground : colors.muted }]}>
                      {selectedDate || "Select date"}
                    </Text>
                    <IconSymbol name="calendar" size={20} color={colors.muted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.formInput, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      const timeOptions = ["09:00 – 12:00", "12:00 – 15:00", "15:00 – 18:00", "18:00 – 21:00", "21:00 – 23:00"];
                      Alert.alert(
                        "Select Time Block",
                        "Choose a time range to block:",
                        [
                          ...timeOptions.map((t) => ({
                            text: t,
                            onPress: () => setSelectedTime(t),
                          })),
                          { text: "Cancel", style: "cancel" },
                        ]
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.formInputText, { color: selectedTime ? colors.foreground : colors.muted }]}>
                      {selectedTime || "Select time"}
                    </Text>
                    <IconSymbol name="clock.fill" size={20} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                {/* Step 2: Reason */}
                <View style={s.formSection}>
                  <Text style={[s.formLabel, { color: colors.foreground }]}>Reason</Text>
                  <View style={s.reasonChips}>
                    {["Personal", "Travel", "Other"].map((reason) => {
                      const isSelected = selectedReason === reason;
                      return (
                        <TouchableOpacity
                          key={reason}
                          style={[
                            s.reasonChip,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.surface,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => {
                            if (Platform.OS !== "web") {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                            setSelectedReason(reason);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              s.reasonChipText,
                              { color: isSelected ? "#fff" : colors.foreground },
                            ]}
                          >
                            {reason}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Step 3: Save */}
                <TouchableOpacity
                  style={[
                    s.saveButton,
                    {
                      backgroundColor: selectedDate && selectedTime && selectedReason ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={saveBlockTime}
                  disabled={!selectedDate || !selectedTime || !selectedReason}
                  activeOpacity={0.8}
                >
                  <Text style={s.saveButtonText}>Save</Text>
                </TouchableOpacity>

                {/* Advanced rules link */}
                <TouchableOpacity style={s.advancedLink} onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  closeBlockTime();
                  router.push("/(musician)/settings");
                }} activeOpacity={0.7}>
                  <Text style={[s.advancedLinkText, { color: colors.primary }]}>
                    Advanced rules (working hours, lead time, max gigs)
                  </Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  monthText: {
    fontSize: 17,
    fontWeight: "600",
  },
  autoBufferToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoBufferLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  weekStripContainer: {
    borderBottomWidth: 1,
  },
  weekStrip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dayTile: {
    width: 50,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    gap: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: "500",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  dayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  weekViewContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  weekView: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  timeColumn: {
    width: 60,
    paddingRight: 8,
  },
  timeSlot: {
    height: 60,
    justifyContent: "flex-start",
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  eventsColumn: {
    flex: 1,
    position: "relative",
  },
  eventSlot: {
    height: 60,
    borderBottomWidth: 1,
  },
  eventBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  bottomSheetContent: {
    padding: 20,
    gap: 24,
  },
  formSection: {
    gap: 12,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  formInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  formInputText: {
    fontSize: 15,
  },
  reasonChips: {
    flexDirection: "row",
    gap: 10,
  },
  reasonChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  reasonChipText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  advancedLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
  },
  advancedLinkText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
