import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cn } from "@/lib/utils";

export default function MusicianDocumentsViewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  
  const { data: documents, isLoading } = trpc.musician.getDocuments.useQuery();
  const document = documents?.find((d: any) => d.id === parseInt(documentId || "0"));

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </ScreenContainer>
    );
  }

  if (!document) {
    return (
      <ScreenContainer className="p-4">
        <View className="items-center justify-center py-12">
          <Text className="text-lg font-semibold text-foreground">Dokumen tidak ditemukan</Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary rounded"
          >
            <Text className="text-white font-semibold">Kembali</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/10 border-success";
      case "rejected":
        return "bg-error/10 border-error";
      default:
        return "bg-warning/10 border-warning";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "✓ Diluluskan";
      case "rejected":
        return "✗ Ditolak";
      default:
        return "⏳ Menunggu";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Status Dokumen</Text>
            <Text className="text-sm text-muted">
              Jenis: {document.documentType === "id" && "ID / Passport"}
              {document.documentType === "portfolio" && "Portfolio"}
              {document.documentType === "certificate" && "Certificate"}
            </Text>
          </View>

          {/* Status Card */}
          <View className={cn("border rounded-lg p-4", getStatusColor(document.status))}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-foreground">
                {getStatusText(document.status)}
              </Text>
              <Text className="text-xs text-muted">
                {new Date(document.updatedAt).toLocaleDateString("ms-MY")}
              </Text>
            </View>
          </View>

          {/* Rejection Reason (if rejected) */}
          {document.status === "rejected" && document.rejectionReason && (
            <View className="bg-error/10 border border-error rounded-lg p-4">
              <Text className="text-sm font-semibold text-error mb-2">Sebab Penolakan</Text>
              <Text className="text-sm text-foreground">{document.rejectionReason}</Text>
            </View>
          )}

          {/* Admin Feedback (if available) */}
          {document.adminFeedback && (
            <View className="bg-primary/10 border border-primary rounded-lg p-4">
              <Text className="text-sm font-semibold text-primary mb-2">💬 Feedback dari Admin</Text>
              <Text className="text-sm text-foreground leading-relaxed">
                {document.adminFeedback}
              </Text>
            </View>
          )}

          {/* Approved Message */}
          {document.status === "approved" && (
            <View className="bg-success/10 border border-success rounded-lg p-4">
              <Text className="text-sm font-semibold text-success mb-2">Selamat!</Text>
              <Text className="text-sm text-foreground">
                Dokumen anda telah diluluskan. Anda sekarang boleh menerbitkan listing dan menerima tempahan.
              </Text>
            </View>
          )}

          {/* Resubmit Instructions (if rejected) */}
          {document.status === "rejected" && (
            <View className="bg-warning/10 border border-warning rounded-lg p-4">
              <Text className="text-sm font-semibold text-warning mb-2">Langkah Seterusnya</Text>
              <Text className="text-sm text-foreground mb-2">
                Sila perbaiki dokumen anda mengikut feedback di atas dan muat naik semula.
              </Text>
              <Pressable
                onPress={() => router.push("/(musician)/documents")}
                className="mt-2 px-4 py-2 bg-warning rounded items-center"
              >
                <Text className="text-white font-semibold text-sm">Muat Naik Semula</Text>
              </Pressable>
            </View>
          )}

          {/* Document Preview */}
          <View className="bg-surface border border-border rounded-lg p-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Dokumen</Text>
            <Pressable
              onPress={() => {
                Alert.alert("Dokumen", document.documentUrl);
              }}
              className="p-3 bg-muted/10 rounded items-center"
            >
              <Text className="text-primary font-semibold">📄 Lihat Dokumen</Text>
            </Pressable>
          </View>

          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="py-3 px-4 bg-muted rounded items-center"
          >
            <Text className="text-foreground font-semibold">Kembali</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
