import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  action: () => void;
}

export default function CustomerProfileScreen() {
  const colors = useColors();

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: () => {
          // TODO: Implement logout
          Alert.alert("Logged out", "You have been logged out successfully");
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      id: "addresses",
      title: "Saved Addresses",
      icon: "location.fill",
      action: () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert("Saved Addresses", "Manage your saved addresses");
      },
    },
    {
      id: "payments",
      title: "Payment Methods",
      icon: "creditcard.fill",
      action: () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert("Payment Methods", "Manage your payment methods");
      },
    },
    {
      id: "favorites",
      title: "Favorites",
      icon: "star.fill",
      action: () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert("Favorites", "View your saved musicians");
      },
    },
    {
      id: "receipts",
      title: "Receipts",
      icon: "doc.text.fill",
      action: () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert("Receipts", "View your booking receipts");
      },
    },
    {
      id: "settings",
      title: "Settings",
      icon: "gear",
      action: () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert("Settings", "Manage your account settings");
      },
    },
    {
      id: "help",
      title: "Help & Support",
      icon: "exclamationmark.triangle.fill",
      action: () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert("Help & Support", "Contact our support team");
      },
    },
    {
      id: "disputes",
      title: "Disputes",
      icon: "exclamationmark.triangle.fill",
      action: () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert("Disputes", "View and manage disputes");
      },
    },
  ];

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== HEADER ==================== */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={s.profileHeader}>
            <View style={[s.profilePhoto, { backgroundColor: colors.primary }]}>
              <IconSymbol name="person.fill" size={32} color="#fff" />
            </View>
            <View style={s.profileInfo}>
              <Text style={[s.name, { color: colors.foreground }]}>John Doe</Text>
              <Text style={[s.email, { color: colors.muted }]}>john@example.com</Text>
              <Text style={[s.phone, { color: colors.muted }]}>+60 12-345 6789</Text>
            </View>
          </View>
        </View>

        <View style={s.content}>
          {/* ==================== MENU ITEMS ==================== */}
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                s.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderBottomWidth: index === menuItems.length - 1 ? 1 : 0,
                },
              ]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={s.menuItemLeft}>
                <View style={[s.menuIconContainer, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={[s.menuItemText, { color: colors.foreground }]}>{item.title}</Text>
              </View>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}

          {/* ==================== LOGOUT BUTTON ==================== */}
          <TouchableOpacity
            style={[s.logoutButton, { backgroundColor: colors.error + "15" }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <IconSymbol name="arrow.left" size={18} color={colors.error} />
            <Text style={[s.logoutButtonText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  profileHeader: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    fontSize: 13,
  },
  phone: {
    fontSize: 13,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderTopWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
