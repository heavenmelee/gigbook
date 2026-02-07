import { Text, View, ScrollView, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";

export default function AdminSettingsScreen() {
  const colors = useColors();
  const { logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/welcome");
    } catch (error: any) {
      Alert.alert("Ralat", error.message || "Gagal log keluar");
    }
  };
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: settings, refetch } = trpc.admin.getSettings.useQuery();
  const updateMutation = trpc.admin.updateSetting.useMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleSave = async () => {
    if (!editingKey) return;
    try {
      await updateMutation.mutateAsync({ key: editingKey, value: editValue });
      setEditingKey(null);
      refetch();
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      commission_rate: "Kadar Komisyen (%)",
      user_cancel_penalty_72h: "Penalti Cancel User dalam 72 jam (%)",
      musician_cancel_penalty_72h: "Penalti Cancel Musician dalam 72 jam (%)",
      max_strikes: "Maksimum Strike sebelum Suspend",
      platform_name: "Nama Platform",
      support_email: "Email Sokongan",
    };
    return labels[key] || key;
  };

  const getSettingDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      commission_rate: "Peratusan komisyen yang diambil dari setiap transaksi",
      user_cancel_penalty_72h: "Peratusan penalti jika user cancel dalam 72 jam sebelum event",
      musician_cancel_penalty_72h: "Peratusan penalti jika musician cancel dalam 72 jam sebelum event",
      max_strikes: "Bilangan strike sebelum akaun musician digantung secara automatik",
      platform_name: "Nama platform yang dipaparkan",
      support_email: "Email untuk sokongan pelanggan",
    };
    return descriptions[key] || "";
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Tetapan Platform</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Polisi Komisyen & Penalti</Text>
          
          {settings?.filter(s => ["commission_rate", "user_cancel_penalty_72h", "musician_cancel_penalty_72h", "max_strikes"].includes(s.settingKey)).map((setting) => (
            <View
              key={setting.id}
              style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                    {getSettingLabel(setting.settingKey)}
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.muted }]}>
                    {getSettingDescription(setting.settingKey)}
                  </Text>
                </View>
                {editingKey === setting.settingKey ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={[styles.editInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                      value={editValue}
                      onChangeText={setEditValue}
                      keyboardType="numeric"
                      autoFocus
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={() => setEditingKey(null)}>
                        <Text style={{ color: colors.muted }}>Batal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSave}>
                        <Text style={{ color: colors.primary, fontWeight: "600" }}>Simpan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => handleEdit(setting.settingKey, setting.settingValue)}>
                    <View style={styles.valueContainer}>
                      <Text style={[styles.settingValue, { color: colors.primary }]}>
                        {setting.settingValue}
                        {["commission_rate", "user_cancel_penalty_72h", "musician_cancel_penalty_72h"].includes(setting.settingKey) ? "%" : ""}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>Edit</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Maklumat Platform</Text>
          
          {settings?.filter(s => ["platform_name", "support_email"].includes(s.settingKey)).map((setting) => (
            <View
              key={setting.id}
              style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                    {getSettingLabel(setting.settingKey)}
                  </Text>
                </View>
                {editingKey === setting.settingKey ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={[styles.editInput, styles.textInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                      value={editValue}
                      onChangeText={setEditValue}
                      autoFocus
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={() => setEditingKey(null)}>
                        <Text style={{ color: colors.muted }}>Batal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSave}>
                        <Text style={{ color: colors.primary, fontWeight: "600" }}>Simpan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => handleEdit(setting.settingKey, setting.settingValue)}>
                    <View style={styles.valueContainer}>
                      <Text style={[styles.settingValue, { color: colors.foreground }]}>{setting.settingValue}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>Edit</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.warning + "15", borderColor: colors.warning }]}>
          <Text style={[styles.infoTitle, { color: colors.warning }]}>⚠️ Perhatian</Text>
          <Text style={[styles.infoText, { color: colors.foreground }]}>
            Perubahan pada tetapan akan berkuat kuasa serta-merta untuk semua transaksi baru. Transaksi sedia ada tidak akan terjejas.
          </Text>
        </View>

        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.error }]} onPress={handleLogout}>
          <Text style={{ color: colors.error, fontWeight: "600" }}>Log Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  settingCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  settingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  settingInfo: { flex: 1, marginRight: 16 },
  settingLabel: { fontSize: 15, fontWeight: "500", marginBottom: 4 },
  settingDescription: { fontSize: 12, lineHeight: 16 },
  valueContainer: { alignItems: "flex-end" },
  settingValue: { fontSize: 18, fontWeight: "bold", marginBottom: 2 },
  editContainer: { alignItems: "flex-end", gap: 8 },
  editInput: { width: 80, padding: 8, borderRadius: 6, borderWidth: 1, textAlign: "center", fontSize: 16 },
  textInput: { width: 150 },
  editActions: { flexDirection: "row", gap: 12 },
  infoCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  infoTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 18 },
  logoutButton: { padding: 14, borderRadius: 8, alignItems: "center", borderWidth: 1 },
});
