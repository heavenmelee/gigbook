import { Text, View, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function AdminUsersScreen() {
  const colors = useColors();
  const [selectedRole, setSelectedRole] = useState<"user" | "musician" | "admin" | undefined>(undefined);
  
  const { data: users = [], isLoading, refetch } = trpc.admin.getAllUsers.useQuery({ role: selectedRole });
  const deleteUserMutation = trpc.admin.deleteUser.useMutation();
  const suspendUserMutation = trpc.admin.suspendUser.useMutation();
  const approveUserMutation = trpc.admin.approveUser.useMutation();

  const handleDeleteUser = (userId: number, userName: string) => {
    Alert.alert(
      "Padam Pengguna",
      `Adakah anda pasti mahu padam ${userName}? Tindakan ini tidak boleh dibatalkan.`,
      [
        { text: "Batal", onPress: () => {}, style: "cancel" },
        {
          text: "Padam",
          onPress: async () => {
            try {
              await deleteUserMutation.mutateAsync({ userId });
              Alert.alert("Berjaya", "Pengguna telah dipadamkan");
              refetch();
            } catch (error: any) {
              Alert.alert("Ralat", error.message);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSuspendUser = async (userId: number, userName: string) => {
    Alert.alert(
      "Suspend Pengguna",
      `Adakah anda pasti mahu suspend ${userName}?`,
      [
        { text: "Batal", onPress: () => {}, style: "cancel" },
        {
          text: "Suspend",
          onPress: async () => {
            try {
              await suspendUserMutation.mutateAsync({ userId });
              Alert.alert("Berjaya", "Pengguna telah disuspend");
              refetch();
            } catch (error: any) {
              Alert.alert("Ralat", error.message);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await approveUserMutation.mutateAsync({ userId });
      Alert.alert("Berjaya", "Pengguna telah diluluskan");
      refetch();
    } catch (error: any) {
      Alert.alert("Ralat", error.message);
    }
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[styles.userEmail, { color: colors.muted }]}>{item.email}</Text>
        <View style={styles.userMeta}>
          <Text style={[styles.badge, { backgroundColor: colors.primary, color: colors.background }]}>
            {item.role}
          </Text>
          <Text style={[styles.badge, { backgroundColor: item.status === "approved" ? "#22C55E" : item.status === "suspended" ? "#EF4444" : "#F59E0B", color: "white" }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {item.status === "pending" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleApproveUser(item.id)}
          >
            <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
            <Text style={styles.actionButtonText}>Luluskan</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
          onPress={() => handleSuspendUser(item.id, item.name)}
        >
          <IconSymbol name="pause.circle.fill" size={20} color="white" />
          <Text style={styles.actionButtonText}>Suspend</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
          onPress={() => handleDeleteUser(item.id, item.name)}
        >
          <IconSymbol name="trash.fill" size={20} color="white" />
          <Text style={styles.actionButtonText}>Padam</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Pengurusan Pengguna</Text>
      </View>

      <View style={styles.filterContainer}>
        {["user", "musician", "admin"].map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedRole === role ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedRole(selectedRole === role ? undefined : (role as any))}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: selectedRole === role ? colors.background : colors.foreground },
              ]}
            >
              {role === "user" ? "Pengguna" : role === "musician" ? "Musician" : "Admin"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.muted }]}>Tiada pengguna ditemui</Text>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 14,
  },
});
