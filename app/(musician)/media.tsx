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
import { useState } from "react";

export default function MediaScreen() {
  const colors = useColors();

  // Mock data
  const [highlightVideo, setHighlightVideo] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([
    "https://via.placeholder.com/300x200",
    "https://via.placeholder.com/300x200",
    "https://via.placeholder.com/300x200",
  ]);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleAddVideo = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Add Video", "Video picker will be implemented");
    // TODO: Implement video picker
  };

  const handleAddPhoto = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Add Photo", "Photo picker will be implemented");
    // TODO: Implement photo picker
  };

  const handleDeletePhoto = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setGallery(gallery.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={s.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Media</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== HIGHLIGHT VIDEO ==================== */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Highlight Video</Text>
            <View style={[s.requiredBadge, { backgroundColor: colors.warning + "20" }]}>
              <Text style={[s.requiredText, { color: colors.warning }]}>Required</Text>
            </View>
          </View>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            Upload a 30-90 second video showcasing your best performance. This will be the first thing customers see.
          </Text>

          {highlightVideo ? (
            <View style={[s.videoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.videoPlaceholder}>
                <IconSymbol name="pause.circle.fill" size={64} color={colors.primary} />
                <Text style={[s.videoText, { color: colors.muted }]}>Video uploaded</Text>
              </View>
              <View style={s.videoActions}>
                <TouchableOpacity
                  style={[s.videoActionButton, { borderColor: colors.border }]}
                  onPress={handleAddVideo}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="pencil" size={18} color={colors.primary} />
                  <Text style={[s.videoActionText, { color: colors.primary }]}>Replace</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.videoActionButton, { borderColor: colors.border }]}
                  onPress={() => setHighlightVideo(null)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="trash" size={18} color={colors.error} />
                  <Text style={[s.videoActionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.uploadBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleAddVideo}
              activeOpacity={0.7}
            >
              <IconSymbol name="arrow.up.circle.fill" size={48} color={colors.primary} />
              <Text style={[s.uploadTitle, { color: colors.foreground }]}>Upload Video</Text>
              <Text style={[s.uploadSubtitle, { color: colors.muted }]}>
                MP4, MOV up to 100MB
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ==================== PHOTO GALLERY ==================== */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Photo Gallery</Text>
            <Text style={[s.photoCount, { color: colors.muted }]}>{gallery.length}/10</Text>
          </View>
          <Text style={[s.sectionDescription, { color: colors.muted }]}>
            Add photos of your performances, equipment, and setup. Minimum 3 photos recommended.
          </Text>

          <View style={s.galleryGrid}>
            {gallery.map((photo, index) => (
              <View key={index} style={[s.photoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image source={{ uri: photo }} style={s.photoImage} />
                <TouchableOpacity
                  style={[s.deleteButton, { backgroundColor: colors.error }]}
                  onPress={() => handleDeletePhoto(index)}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="xmark.circle.fill" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {gallery.length < 10 && (
              <TouchableOpacity
                style={[s.addPhotoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
                <Text style={[s.addPhotoText, { color: colors.primary }]}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ==================== TIPS ==================== */}
        <View style={[s.tipsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.tipsHeader}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
            <Text style={[s.tipsTitle, { color: colors.foreground }]}>Media Tips</Text>
          </View>
          <View style={s.tipsList}>
            <Text style={[s.tipItem, { color: colors.muted }]}>• Use high-quality videos and photos</Text>
            <Text style={[s.tipItem, { color: colors.muted }]}>• Show your setup and performance style</Text>
            <Text style={[s.tipItem, { color: colors.muted }]}>• Include crowd reactions if possible</Text>
            <Text style={[s.tipItem, { color: colors.muted }]}>• Keep video under 90 seconds</Text>
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  requiredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  photoCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  uploadBox: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  uploadSubtitle: {
    fontSize: 13,
  },
  videoContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  videoPlaceholder: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  videoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  videoActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  videoActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  videoActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tipsCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 20,
  },
});
