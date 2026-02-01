import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuthContext } from "@/lib/auth-context";

export default function RoleSelectScreen() {
  const router = useRouter();
  const colors = useColors();
  const { refetch } = useAuthContext();
  const updateRoleMutation = trpc.user.updateRole.useMutation();

  const handleSelectRole = async (role: "user" | "musician") => {
    try {
      await updateRoleMutation.mutateAsync({ role });
      await refetch();
      router.replace("/pending-approval");
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Selamat Datang!
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Pilih jenis akaun anda
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleSelectRole("user")}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>🎧</Text>
            <Text style={[styles.optionTitle, { color: colors.foreground }]}>
              Saya Mencari Musician
            </Text>
            <Text style={[styles.optionDescription, { color: colors.muted }]}>
              Cari dan tempah musician untuk event anda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleSelectRole("musician")}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>🎸</Text>
            <Text style={[styles.optionTitle, { color: colors.foreground }]}>
              Saya Seorang Musician
            </Text>
            <Text style={[styles.optionDescription, { color: colors.muted }]}>
              Tawarkan perkhidmatan muzik anda kepada pelanggan
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.note, { color: colors.muted }]}>
          Akaun anda perlu diluluskan oleh admin sebelum boleh menggunakan platform
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  note: {
    marginTop: 32,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
