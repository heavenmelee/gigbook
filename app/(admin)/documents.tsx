import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert, FlatList, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminDocumentsScreen() {
  const { user } = useAuth();
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const { data: documents, isLoading, refetch } = trpc.admin.getPendingVerificationDocuments.useQuery();
  const approveMutation = trpc.admin.approveMusicianDocument.useMutation();
  const rejectMutation = trpc.admin.rejectMusicianDocument.useMutation();

  const handleApprove = async (documentId: number) => {
    setProcessing(true);
    try {
      await approveMutation.mutateAsync({ documentId });
      Alert.alert("Berjaya", "Dokumen telah diluluskan");
      refetch();
      setSelectedDocId(null);
    } catch (error) {
      Alert.alert("Ralat", error instanceof Error ? error.message : "Gagal meluluskan dokumen");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (documentId: number) => {
    if (!rejectionReason.trim()) {
      Alert.alert("Ralat", "Sila masukkan sebab penolakan");
      return;
    }

    setProcessing(true);
    try {
      await rejectMutation.mutateAsync({ documentId, reason: rejectionReason });
      Alert.alert("Berjaya", "Dokumen telah ditolak");
      refetch();
      setSelectedDocId(null);
      setRejectionReason("");
    } catch (error) {
      Alert.alert("Ralat", error instanceof Error ? error.message : "Gagal menolak dokumen");
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </ScreenContainer>
    );
  }

  const pendingCount = documents?.length || 0;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Pengesahan Dokumen</Text>
            <Text className="text-sm text-muted">
              {pendingCount} dokumen menunggu pengesahan
            </Text>
          </View>

          {/* Pending Documents List */}
          {pendingCount === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-lg font-semibold text-foreground">Tiada dokumen menunggu</Text>
              <Text className="text-sm text-muted mt-2">Semua dokumen telah disahkan</Text>
            </View>
          ) : (
            <View className="gap-3">
              {documents?.map((doc) => (
                <View
                  key={doc.id}
                  className={cn(
                    "border rounded-lg p-4",
                    selectedDocId === doc.id ? "border-primary bg-primary/5" : "border-border bg-surface"
                  )}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground capitalize">
                        {doc.documentType === "id" && "ID / Passport"}
                        {doc.documentType === "portfolio" && "Portfolio"}
                        {doc.documentType === "certificate" && "Certificate"}
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        Musician ID: {doc.musicianId}
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        Dimuat naik: {new Date(doc.createdAt).toLocaleDateString("ms-MY")}
                      </Text>
                    </View>
                    <View className="bg-warning/20 px-2 py-1 rounded">
                      <Text className="text-xs font-semibold text-warning">⏳ Menunggu</Text>
                    </View>
                  </View>

                  {/* Document Preview Link */}
                  <Pressable
                    className="mb-3 p-2 bg-muted/10 rounded"
                    onPress={() => {
                      // In production, open document in viewer
                      Alert.alert("Dokumen", doc.documentUrl);
                    }}
                  >
                    <Text className="text-sm text-primary font-semibold">📄 Lihat Dokumen</Text>
                  </Pressable>

                  {/* Action Buttons */}
                  {selectedDocId === doc.id ? (
                    <View className="gap-2">
                      {/* Rejection Reason Input */}
                      <View className="bg-error/10 rounded p-3 mb-2">
                        <Text className="text-xs font-semibold text-error mb-2">Sebab Penolakan (jika ditolak)</Text>
                        <TextInput
                          className="text-sm text-foreground p-2 bg-surface rounded border border-border"
                          placeholder="Masukkan sebab penolakan..."
                          placeholderTextColor="#999"
                          value={rejectionReason}
                          onChangeText={setRejectionReason}
                          multiline
                          numberOfLines={3}
                        />
                      </View>

                      {/* Approve Button */}
                      <Pressable
                        onPress={() => handleApprove(doc.id)}
                        disabled={processing}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        className={cn(
                          "py-2 px-3 rounded bg-success items-center",
                          processing && "opacity-50"
                        )}
                      >
                        {processing ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text className="text-white font-semibold text-sm">✓ Luluskan</Text>
                        )}
                      </Pressable>

                      {/* Reject Button */}
                      <Pressable
                        onPress={() => handleReject(doc.id)}
                        disabled={processing}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        className={cn(
                          "py-2 px-3 rounded bg-error items-center",
                          processing && "opacity-50"
                        )}
                      >
                        {processing ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text className="text-white font-semibold text-sm">✗ Tolak</Text>
                        )}
                      </Pressable>

                      {/* Cancel Button */}
                      <Pressable
                        onPress={() => {
                          setSelectedDocId(null);
                          setRejectionReason("");
                        }}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        className="py-2 px-3 rounded bg-muted items-center"
                      >
                        <Text className="text-foreground font-semibold text-sm">Batal</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => setSelectedDocId(doc.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      className="py-2 px-3 rounded bg-primary items-center"
                    >
                      <Text className="text-white font-semibold text-sm">Semak & Luluskan</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
