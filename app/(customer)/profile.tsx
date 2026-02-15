import {
  Text, View, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/hooks/use-auth";

interface MenuItem {
  icon: any;
  label: string;
  subtitle?: string;
  action: () => void;
}

export default function CustomerProfileScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const tap = () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const handleLogout = () => {
    tap();
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => logout() },
    ]);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Account",
      items: [
        { icon: "person.crop.circle", label: "Personal info", subtitle: user?.name || "Update your details", action: () => { tap(); Alert.alert("Personal Info", "Edit your name, phone, and email."); } },
        { icon: "location.fill", label: "Saved addresses", subtitle: "Home, Work, and more", action: () => { tap(); Alert.alert("Saved Addresses", "Manage your saved addresses for faster booking."); } },
        { icon: "creditcard.fill", label: "Payment methods", subtitle: "Cards and e-wallets", action: () => { tap(); Alert.alert("Payment Methods", "Add or manage your payment methods."); } },
      ],
    },
    {
      title: "Activity",
      items: [
        { icon: "heart.fill", label: "Favorites", subtitle: "Saved musicians", action: () => { tap(); Alert.alert("Favorites", "Your saved musicians will appear here."); } },
        { icon: "receipt", label: "Receipts", subtitle: "Payment history", action: () => { tap(); Alert.alert("Receipts", "View your payment receipts and invoices."); } },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "gear", label: "Settings", subtitle: "Notifications, privacy", action: () => { tap(); Alert.alert("Settings", "Manage your notification preferences and privacy settings."); } },
        { icon: "questionmark.circle.fill", label: "Help center", subtitle: "FAQ and support", action: () => { tap(); Alert.alert("Help Center", "Browse FAQs or contact our support team."); } },
        { icon: "shield.fill", label: "Disputes", subtitle: "Report an issue", action: () => { tap(); Alert.alert("Disputes", "Report an issue with a booking or musician."); } },
      ],
    },
  ];

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[s.header, { borderBottomColor: colors.border }]}>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>Profile</Text>
        </View>

        <View style={[s.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[s.userAvatar, { backgroundColor: colors.primary }]}>
            <Text style={s.userInitial}>{(user?.name || "U")[0].toUpperCase()}</Text>
          </View>
          <View style={s.userInfo}>
            <Text style={[s.userName, { color: colors.foreground }]}>{user?.name || "User"}</Text>
            <Text style={[s.userEmail, { color: colors.muted }]}>{user?.email || "No email"}</Text>
          </View>
          <TouchableOpacity onPress={() => { tap(); Alert.alert("Edit Profile", "Update your profile information."); }}>
            <IconSymbol name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {menuSections.map((section) => (
          <View key={section.title} style={s.menuSection}>
            <Text style={[s.sectionTitle, { color: colors.muted }]}>{section.title}</Text>
            <View style={[s.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[s.menuItem, idx < section.items.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={[s.menuIcon, { backgroundColor: colors.primary + "15" }]}>
                    <IconSymbol name={item.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={s.menuBody}>
                    <Text style={[s.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                    {item.subtitle && <Text style={[s.menuSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>}
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={[s.logoutBtn, { borderColor: colors.error }]} onPress={handleLogout}>
          <Text style={[s.logoutText, { color: colors.error }]}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  userCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 14, borderWidth: 1, gap: 14 },
  userAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  userInitial: { color: "#fff", fontSize: 22, fontWeight: "700" },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 18, fontWeight: "600" },
  userEmail: { fontSize: 14 },
  menuSection: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 8, marginLeft: 4 },
  menuCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuBody: { flex: 1, gap: 1 },
  menuLabel: { fontSize: 15, fontWeight: "500" },
  menuSubtitle: { fontSize: 12 },
  logoutBtn: { marginHorizontal: 16, marginTop: 24, paddingVertical: 16, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
