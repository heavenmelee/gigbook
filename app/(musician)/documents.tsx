import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function MusicianDocumentsScreen() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<"id" | "portfolio" | "certificate" | null>(null);

  const { data: documents, isLoading, refetch } = trpc.musician.getDocuments.useQuery();
  const { data: isVerified } = trpc.musician.isVerified.useQuery();
  const uploadMutation = trpc.musician.uploadDocument.useMutation();

  const documentTypes = [
    { id: "id", label: "ID / Passport", description: "Valid government-issued ID" },
    { id: "portfolio", label: "Portfolio", description: "Your music portfolio or samples" },
    { id: "certificate", label: "Certificate", description: "Music degree or certification (optional)" },
  ];

  const handleUpload = async (type: "id" | "portfolio" | "certificate") => {
    // Simulated document URL - in production, use image picker and upload to S3
    const mockUrl = `https://example.com/document-${type}-${Date.now()}.pdf`;
    
    setUploading(true);
    try {
      await uploadMutation.mutateAsync({
        documentType: type,
        documentUrl: mockUrl,
      });
      Alert.alert("Berjaya", "Dokumen telah dimuat naik untuk disahkan");
      refetch();
    } catch (error) {
      Alert.alert("Ralat", error instanceof Error ? error.message : "Gagal memuat naik dokumen");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </ScreenContainer>
    );
  }

  const getDocumentStatus = (type: string) => {
    const doc = documents?.find(d => d.documentType === type);
    return doc?.status || "not_uploaded";
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Pengesahan Dokumen</Text>
            <Text className="text-sm text-muted">
              Muat naik dokumen untuk disahkan oleh admin sebelum anda boleh mencipta listing
            </Text>
          </View>

          {/* Verification Status */}
          <View className={cn(
            "rounded-lg p-4",
            isVerified ? "bg-success/10" : "bg-warning/10"
          )}>
            <Text className={cn(
              "font-semibold",
              isVerified ? "text-success" : "text-warning"
            )}>
              {isVerified ? "✓ Anda telah disahkan" : "⏳ Menunggu pengesahan"}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {isVerified 
                ? "Semua dokumen anda telah diluluskan. Anda boleh mencipta listing sekarang."
                : "Sila muat naik dokumen yang diperlukan untuk disahkan oleh admin."}
            </Text>
          </View>

          {/* Document Upload Cards */}
          <View className="gap-3">
            {documentTypes.map((docType) => {
              const status = getDocumentStatus(docType.id);
              const isRequired = docType.id !== "certificate";
              
              return (
                <View
                  key={docType.id}
                  className="border border-border rounded-lg p-4 bg-surface"
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{docType.label}</Text>
                      <Text className="text-xs text-muted mt-1">{docType.description}</Text>
                      {isRequired && <Text className="text-xs text-error mt-1">*Wajib</Text>}
                    </View>
                    <View className={cn(
                      "px-2 py-1 rounded",
                      status === "approved" && "bg-success/20",
                      status === "pending" && "bg-warning/20",
                      status === "rejected" && "bg-error/20",
                      status === "not_uploaded" && "bg-muted/20"
                    )}>
                      <Text className={cn(
                        "text-xs font-semibold",
                        status === "approved" && "text-success",
                        status === "pending" && "text-warning",
                        status === "rejected" && "text-error",
                        status === "not_uploaded" && "text-muted"
                      )}>
                        {status === "approved" && "✓ Diluluskan"}
                        {status === "pending" && "⏳ Menunggu"}
                        {status === "rejected" && "✗ Ditolak"}
                        {status === "not_uploaded" && "Belum dimuat"}
                      </Text>
                    </View>
                  </View>

                  {/* Rejection Reason */}
                  {status === "rejected" && (
                    <View className="bg-error/10 rounded p-2 mb-3">
                      <Text className="text-xs text-error">
                        Sebab penolakan: Dokumen tidak jelas atau tidak sah
                      </Text>
                    </View>
                  )}

                  {/* Upload Button */}
                  {status !== "approved" && (
                    <Pressable
                      onPress={() => handleUpload(docType.id as "id" | "portfolio" | "certificate")}
                      disabled={uploading}
                      style={({ pressed }) => [
                        { opacity: pressed ? 0.7 : 1 }
                      ]}
                      className={cn(
                        "py-2 px-3 rounded bg-primary items-center",
                        uploading && "opacity-50"
                      )}
                    >
                      {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white font-semibold text-sm">
                          {status === "pending" ? "Muat Naik Semula" : "Muat Naik"}
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>

          {/* Info Box */}
          <View className="bg-primary/10 rounded-lg p-4">
            <Text className="font-semibold text-primary mb-2">ℹ️ Maklumat Penting</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Pastikan dokumen anda jelas dan mudah dibaca. Admin akan menyemak dokumen anda dalam masa 24 jam. Dokumen yang ditolak boleh dimuat naik semula.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
