import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";

export default function PendingApprovalScreen() {
  const colors = useColors();
  const { logout } = useAuth();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⏳</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Menunggu Kelulusan
        </Text>

        <Text style={[styles.description, { color: colors.muted }]}>
          Terima kasih kerana mendaftar! Akaun anda sedang menunggu kelulusan daripada admin.
          {"\n\n"}
          Anda akan dapat mengakses platform sepenuhnya selepas akaun diluluskan.
        </Text>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>
            Apa yang berlaku seterusnya?
          </Text>
          <View style={styles.infoList}>
            <Text style={[styles.infoItem, { color: colors.muted }]}>
              • Admin akan menyemak permohonan anda
            </Text>
            <Text style={[styles.infoItem, { color: colors.muted }]}>
              • Anda akan menerima notifikasi apabila diluluskan
            </Text>
            <Text style={[styles.infoItem, { color: colors.muted }]}>
              • Proses kelulusan biasanya mengambil masa 24-48 jam
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.border }]}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Text style={[styles.logoutText, { color: colors.muted }]}>
            Log Keluar
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  infoCard: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
