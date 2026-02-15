import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  type: "toggle" | "link" | "action";
  value?: boolean;
  onPress?: () => void;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const colors = useColors();
  const { logout } = useAuth();

  // Mock settings state
  const [notifNewBooking, setNotifNewBooking] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [weekendOnly, setWeekendOnly] = useState(false);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/welcome");
            } catch (error) {
              Alert.alert("Error", "Failed to logout");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Not Implemented", "Account deletion will be implemented");
          },
        },
      ]
    );
  };

  const notificationSettings: SettingItem[] = [
    {
      id: "new_booking",
      title: "New Booking Requests",
      description: "Get notified when customers send booking requests",
      icon: "bell.fill",
      type: "toggle",
      value: notifNewBooking,
      onPress: () => setNotifNewBooking(!notifNewBooking),
    },
    {
      id: "messages",
      title: "Messages",
      description: "Get notified for new messages from customers",
      icon: "bell.fill",
      type: "toggle",
      value: notifMessages,
      onPress: () => setNotifMessages(!notifMessages),
    },
    {
      id: "reminders",
      title: "Event Reminders",
      description: "Get reminded 24 hours before your events",
      icon: "bell.fill",
      type: "toggle",
      value: notifReminders,
      onPress: () => setNotifReminders(!notifReminders),
    },
  ];

  const availabilitySettings: SettingItem[] = [
    {
      id: "auto_accept",
      title: "Auto-accept Bookings",
      description: "Automatically accept bookings that match your availability",
      icon: "checkmark.circle.fill",
      type: "toggle",
      value: autoAccept,
      onPress: () => setAutoAccept(!autoAccept),
    },
    {
      id: "weekend_only",
      title: "Weekend Only",
      description: "Only accept bookings on Fridays, Saturdays, and Sundays",
      icon: "calendar",
      type: "toggle",
      value: weekendOnly,
      onPress: () => setWeekendOnly(!weekendOnly),
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: "change_password",
      title: "Change Password",
      icon: "gear",
      type: "link",
      onPress: () => Alert.alert("Not Implemented", "Password change will be implemented"),
    },
    {
      id: "bank_account",
      title: "Bank Account",
      description: "Manage payout bank account",
      icon: "creditcard.fill",
      type: "link",
      onPress: () => Alert.alert("Not Implemented", "Bank account management will be implemented"),
    },
    {
      id: "privacy",
      title: "Privacy & Data",
      icon: "gear",
      type: "link",
      onPress: () => Alert.alert("Not Implemented", "Privacy settings will be implemented"),
    },
  ];

  const renderToggleSetting = (item: SettingItem) => (
    <View
      key={item.id}
      style={[s.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={s.settingLeft}>
        <Text style={[s.settingTitle, { color: colors.foreground }]}>{item.title}</Text>
        {item.description && (
          <Text style={[s.settingDescription, { color: colors.muted }]}>{item.description}</Text>
        )}
      </View>
      <Switch
        value={item.value}
        onValueChange={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          item.onPress?.();
        }}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );

  const renderLinkSetting = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[s.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        item.onPress?.();
      }}
      activeOpacity={0.7}
    >
      <View style={s.settingLeft}>
        <Text style={[s.settingTitle, { color: item.destructive ? colors.error : colors.foreground }]}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={[s.settingDescription, { color: colors.muted }]}>{item.description}</Text>
        )}
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.backButton} onPress={handleBack} activeOpacity={0.7}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== NOTIFICATIONS ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Notifications</Text>
          <View style={s.settingsList}>
            {notificationSettings.map((item) => renderToggleSetting(item))}
          </View>
        </View>

        {/* ==================== AVAILABILITY ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Availability Rules</Text>
          <View style={s.settingsList}>
            {availabilitySettings.map((item) => renderToggleSetting(item))}
          </View>
        </View>

        {/* ==================== ACCOUNT ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Account</Text>
          <View style={s.settingsList}>
            {accountSettings.map((item) => renderLinkSetting(item))}
          </View>
        </View>

        {/* ==================== DANGER ZONE ==================== */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
          <View style={s.settingsList}>
            <TouchableOpacity
              style={[s.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={s.settingLeft}>
                <Text style={[s.settingTitle, { color: colors.error }]}>Logout</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={s.settingLeft}>
                <Text style={[s.settingTitle, { color: colors.error }]}>Delete Account</Text>
                <Text style={[s.settingDescription, { color: colors.muted }]}>
                  Permanently delete your account and all data
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  settingsList: {
    gap: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
