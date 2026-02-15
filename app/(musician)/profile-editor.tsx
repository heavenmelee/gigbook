import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
  Switch,
  Modal,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/lib/auth-context";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

type Tab = "about" | "lineup" | "equipment";

export default function MusicianProfileScreen() {
  const colors = useColors();
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [showPreview, setShowPreview] = useState(false);

  const { data: profile, refetch } = trpc.musician.getProfile.useQuery();
  const updateMutation = trpc.musician.updateProfile.useMutation();

  // Form state
  const [formData, setFormData] = useState({
    // About
    stageName: "",
    realName: "",
    bio: "",
    genre: "",
    languages: [] as string[],
    location: "",
    travelRadius: "",
    travelFee: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    experienceYears: "",
    // Lineup
    lineupType: "",
    members: [] as Array<{ name: string; instrument: string }>,
    skills: [] as string[],
    setlist: [] as string[],
    // Equipment
    ownSoundSystem: false,
    equipment: [] as string[],
    stageSizeMin: "",
    powerSupply: "",
    soundcheckDuration: "",
    techRider: "",
  });

  // Temporary input states
  const [newMember, setNewMember] = useState({ name: "", instrument: "" });
  const [newSkill, setNewSkill] = useState("");
  const [newSong, setNewSong] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        stageName: profile.stageName || "",
        realName: profile.realName || "",
        bio: profile.bio || "",
        genre: profile.genre || "",
        languages: profile.languages || [],
        location: profile.location || "",
        travelRadius: profile.travelRadius?.toString() || "",
        travelFee: profile.travelFee || "",
        instagram: profile.socialLinks?.instagram || "",
        tiktok: profile.socialLinks?.tiktok || "",
        youtube: profile.socialLinks?.youtube || "",
        experienceYears: profile.experienceYears?.toString() || "",
        lineupType: profile.lineupType || "",
        members: profile.members || [],
        skills: profile.skills || [],
        setlist: profile.setlist || [],
        ownSoundSystem: profile.ownSoundSystem || false,
        equipment: profile.equipment || [],
        stageSizeMin: profile.venueRequirements?.stageSizeMin || "",
        powerSupply: profile.venueRequirements?.powerSupply || "",
        soundcheckDuration: profile.venueRequirements?.soundcheckDuration || "",
        techRider: profile.techRider || "",
      });
    }
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSave = async () => {
    try {
      const payload: Record<string, any> = {
        stageName: formData.stageName || undefined,
        realName: formData.realName || undefined,
        bio: formData.bio || undefined,
        genre: formData.genre || undefined,
        languages: formData.languages.length > 0 ? formData.languages : undefined,
        location: formData.location || undefined,
        travelRadius: formData.travelRadius ? parseInt(formData.travelRadius) : null,
        travelFee: formData.travelFee || null,
        socialLinks: {
          instagram: formData.instagram || undefined,
          tiktok: formData.tiktok || undefined,
          youtube: formData.youtube || undefined,
        },
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : null,
        lineupType: formData.lineupType || undefined,
        members: formData.members.length > 0 ? formData.members : undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        setlist: formData.setlist.length > 0 ? formData.setlist : undefined,
        ownSoundSystem: formData.ownSoundSystem,
        equipment: formData.equipment.length > 0 ? formData.equipment : undefined,
        venueRequirements: {
          stageSizeMin: formData.stageSizeMin || undefined,
          powerSupply: formData.powerSupply || undefined,
          soundcheckDuration: formData.soundcheckDuration || undefined,
        },
        techRider: formData.techRider || null,
      };

      // Remove undefined top-level keys to avoid sending unnecessary data
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      );

      await updateMutation.mutateAsync(cleanPayload as any);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Berjaya", "Profil telah dikemaskini");
      refetch();
    } catch (error: any) {
      console.error("Failed to update profile:", error?.message || error);
      Alert.alert("Ralat", "Gagal kemaskini profil. Sila cuba lagi.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        router.replace("/welcome");
      }, 100);
    } catch (error: any) {
      console.error("[Musician Profile] logout error:", error);
      Alert.alert("Ralat", error.message || "Gagal log keluar");
    }
  };

  const switchTab = (tab: Tab) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  // Profile strength calculation
  const profileStrength = useMemo(() => {
    let score = 0;
    const checks: Array<{ label: string; done: boolean }> = [];

    // About (40%)
    if (formData.stageName) {
      score += 10;
      checks.push({ label: "Nama pentas", done: true });
    } else {
      checks.push({ label: "Nama pentas", done: false });
    }

    if (formData.bio) {
      score += 10;
      checks.push({ label: "Bio", done: true });
    } else {
      checks.push({ label: "Bio", done: false });
    }

    if (formData.genre) {
      score += 5;
      checks.push({ label: "Genre", done: true });
    } else {
      checks.push({ label: "Genre", done: false });
    }

    if (formData.languages.length > 0) {
      score += 5;
      checks.push({ label: "Bahasa lagu", done: true });
    } else {
      checks.push({ label: "Bahasa lagu", done: false });
    }

    if (formData.location) {
      score += 5;
      checks.push({ label: "Lokasi", done: true });
    } else {
      checks.push({ label: "Lokasi", done: false });
    }

    if (formData.instagram || formData.tiktok || formData.youtube) {
      score += 5;
      checks.push({ label: "Social links", done: true });
    } else {
      checks.push({ label: "Social links", done: false });
    }

    // Lineup (30%)
    if (formData.lineupType) {
      score += 10;
      checks.push({ label: "Jenis lineup", done: true });
    } else {
      checks.push({ label: "Jenis lineup", done: false });
    }

    if (formData.skills.length > 0) {
      score += 10;
      checks.push({ label: "Kemahiran khas", done: true });
    } else {
      checks.push({ label: "Kemahiran khas", done: false });
    }

    if (formData.setlist.length >= 5) {
      score += 10;
      checks.push({ label: "Setlist (min 5 lagu)", done: true });
    } else {
      checks.push({ label: "Setlist (min 5 lagu)", done: false });
    }

    // Equipment (30%)
    if (formData.ownSoundSystem !== undefined) {
      score += 10;
      checks.push({ label: "Sound system info", done: true });
    } else {
      checks.push({ label: "Sound system info", done: false });
    }

    if (formData.equipment.length > 0) {
      score += 10;
      checks.push({ label: "Senarai equipment", done: true });
    } else {
      checks.push({ label: "Senarai equipment", done: false });
    }

    if (formData.stageSizeMin || formData.powerSupply || formData.soundcheckDuration) {
      score += 10;
      checks.push({ label: "Keperluan venue", done: true });
    } else {
      checks.push({ label: "Keperluan venue", done: false });
    }

    return { score, checks };
  }, [formData]);

  const addMember = () => {
    if (newMember.name && newMember.instrument) {
      setFormData({ ...formData, members: [...formData.members, newMember] });
      setNewMember({ name: "", instrument: "" });
    }
  };

  const removeMember = (index: number) => {
    setFormData({ ...formData, members: formData.members.filter((_, i) => i !== index) });
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
    setNewSkill("");
    setShowSkillPicker(false);
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const addSong = () => {
    if (newSong && !formData.setlist.includes(newSong)) {
      setFormData({ ...formData, setlist: [...formData.setlist, newSong] });
      setNewSong("");
    }
  };

  const removeSong = (index: number) => {
    setFormData({ ...formData, setlist: formData.setlist.filter((_, i) => i !== index) });
  };

  const addEquipment = () => {
    if (newEquipment && !formData.equipment.includes(newEquipment)) {
      setFormData({ ...formData, equipment: [...formData.equipment, newEquipment] });
      setNewEquipment("");
    }
  };

  const removeEquipment = (index: number) => {
    setFormData({ ...formData, equipment: formData.equipment.filter((_, i) => i !== index) });
  };

  const toggleLanguage = (lang: string) => {
    if (formData.languages.includes(lang)) {
      setFormData({ ...formData, languages: formData.languages.filter((l) => l !== lang) });
    } else {
      setFormData({ ...formData, languages: [...formData.languages, lang] });
    }
  };

  const LANGUAGES = ["Melayu", "English", "Mandarin", "Tamil", "Lain-lain"];
  const GENRES = ["Pop", "Rock", "Jazz", "Klasik", "Tradisional", "R&B", "Hip Hop", "EDM", "Acoustic", "Lain-lain"];
  const LINEUP_TYPES = ["Solo", "Duo", "Band", "Orkestra", "Kumpulan Vokal", "DJ", "Instrumen Tradisional", "Lain-lain"];
  const SKILLS = ["Emcee", "DJ Add-on", "Acoustic", "Electric", "Karaoke Host", "Bilingual", "Lain-lain"];

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[s.header, { backgroundColor: colors.primary }]}>
          <View style={s.headerContent}>
            <View style={s.headerLeft}>
              <Text style={s.headerTitle}>Profil & Pakej</Text>
              <Text style={s.headerSubtitle}>Kemaskini maklumat anda</Text>
            </View>
            <TouchableOpacity
              style={[s.previewBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              onPress={() => setShowPreview(true)}
              activeOpacity={0.7}
            >
              <IconSymbol name="eye.fill" size={18} color="#fff" />
              <Text style={s.previewBtnText}>Preview</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Strength */}
          <View style={[s.strengthCard, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <View style={s.strengthTop}>
              <Text style={s.strengthLabel}>Kekuatan Profil</Text>
              <Text style={s.strengthValue}>{profileStrength.score}%</Text>
            </View>
            <View style={[s.strengthBar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <View
                style={[
                  s.strengthFill,
                  {
                    width: `${profileStrength.score}%`,
                    backgroundColor: profileStrength.score >= 80 ? "#4ADE80" : profileStrength.score >= 50 ? "#FBBF24" : "#F87171",
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={s.bodyContent}>
          {/* Tabs */}
          <View style={[s.tabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[s.tab, activeTab === "about" && { backgroundColor: colors.primary }]}
              onPress={() => switchTab("about")}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, { color: activeTab === "about" ? "#fff" : colors.foreground }]}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, activeTab === "lineup" && { backgroundColor: colors.primary }]}
              onPress={() => switchTab("lineup")}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, { color: activeTab === "lineup" ? "#fff" : colors.foreground }]}>Line-up & Kemahiran</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, activeTab === "equipment" && { backgroundColor: colors.primary }]}
              onPress={() => switchTab("equipment")}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, { color: activeTab === "equipment" ? "#fff" : colors.foreground }]}>Equipment & Rider</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "about" && (
            <View style={s.tabContent}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Maklumat Asas</Text>

              <Text style={[s.label, { color: colors.muted }]}>Nama Pentas *</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.stageName}
                onChangeText={(text) => setFormData({ ...formData, stageName: text })}
                placeholder="Nama yang customer akan nampak"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>Nama Sebenar (Private)</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.realName}
                onChangeText={(text) => setFormData({ ...formData, realName: text })}
                placeholder="Untuk rekod dalaman sahaja"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>Bio Pendek *</Text>
              <TextInput
                style={[s.input, s.textArea, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Ceritakan tentang diri anda dan pengalaman"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
              />

              <Text style={[s.label, { color: colors.muted }]}>Genre *</Text>
              <View style={s.chipContainer}>
                {GENRES.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      s.chip,
                      { borderColor: colors.border },
                      formData.genre === genre && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setFormData({ ...formData, genre })}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: formData.genre === genre ? "#fff" : colors.foreground, fontSize: 13 }}>{genre}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.label, { color: colors.muted }]}>Bahasa Lagu *</Text>
              <View style={s.chipContainer}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      s.chip,
                      { borderColor: colors.border },
                      formData.languages.includes(lang) && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => toggleLanguage(lang)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: formData.languages.includes(lang) ? "#fff" : colors.foreground, fontSize: 13 }}>{lang}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Lokasi & Travel</Text>

              <Text style={[s.label, { color: colors.muted }]}>Lokasi Base *</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Cth: Kuala Lumpur, Selangor"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>Radius Travel (km)</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.travelRadius}
                onChangeText={(text) => setFormData({ ...formData, travelRadius: text })}
                placeholder="Cth: 50"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />

              <Text style={[s.label, { color: colors.muted }]}>Travel Fee (RM)</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.travelFee}
                onChangeText={(text) => setFormData({ ...formData, travelFee: text })}
                placeholder="Cth: 100 (flat) atau 2 (per km)"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />

              <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Social Links (Optional)</Text>

              <Text style={[s.label, { color: colors.muted }]}>Instagram</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.instagram}
                onChangeText={(text) => setFormData({ ...formData, instagram: text })}
                placeholder="@username atau URL"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>TikTok</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.tiktok}
                onChangeText={(text) => setFormData({ ...formData, tiktok: text })}
                placeholder="@username atau URL"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>YouTube</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.youtube}
                onChangeText={(text) => setFormData({ ...formData, youtube: text })}
                placeholder="Channel URL"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>Pengalaman (tahun)</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.experienceYears}
                onChangeText={(text) => setFormData({ ...formData, experienceYears: text })}
                placeholder="Cth: 5"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
            </View>
          )}

          {activeTab === "lineup" && (
            <View style={s.tabContent}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Jenis Line-up</Text>

              <View style={s.chipContainer}>
                {LINEUP_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      s.chip,
                      { borderColor: colors.border },
                      formData.lineupType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setFormData({ ...formData, lineupType: type })}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: formData.lineupType === type ? "#fff" : colors.foreground, fontSize: 13 }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Ahli & Instrumen</Text>

              {formData.members.map((member, index) => (
                <View key={index} style={[s.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={s.memberInfo}>
                    <Text style={[s.memberName, { color: colors.foreground }]}>{member.name}</Text>
                    <Text style={[s.memberInstrument, { color: colors.muted }]}>{member.instrument}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeMember(index)} activeOpacity={0.7}>
                    <IconSymbol name="xmark.circle.fill" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={[s.addMemberForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[s.input, { flex: 1, backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                  value={newMember.name}
                  onChangeText={(text) => setNewMember({ ...newMember, name: text })}
                  placeholder="Nama ahli"
                  placeholderTextColor={colors.muted}
                />
                <TextInput
                  style={[s.input, { flex: 1, backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                  value={newMember.instrument}
                  onChangeText={(text) => setNewMember({ ...newMember, instrument: text })}
                  placeholder="Instrumen"
                  placeholderTextColor={colors.muted}
                />
                <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.primary }]} onPress={addMember} activeOpacity={0.7}>
                  <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Kemahiran Khas</Text>

              <View style={s.chipContainer}>
                {SKILLS.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={[
                      s.chip,
                      { borderColor: colors.border },
                      formData.skills.includes(skill) && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => {
                      if (formData.skills.includes(skill)) {
                        removeSkill(skill);
                      } else {
                        addSkill(skill);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: formData.skills.includes(skill) ? "#fff" : colors.foreground, fontSize: 13 }}>{skill}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Typical Setlist (10-20 lagu)</Text>

              {formData.setlist.map((song, index) => (
                <View key={index} style={[s.songCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[s.songText, { color: colors.foreground }]}>
                    {index + 1}. {song}
                  </Text>
                  <TouchableOpacity onPress={() => removeSong(index)} activeOpacity={0.7}>
                    <IconSymbol name="xmark.circle.fill" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={s.addSongForm}>
                <TextInput
                  style={[s.input, { flex: 1, backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  value={newSong}
                  onChangeText={setNewSong}
                  placeholder="Nama lagu"
                  placeholderTextColor={colors.muted}
                />
                <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.primary }]} onPress={addSong} activeOpacity={0.7}>
                  <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === "equipment" && (
            <View style={s.tabContent}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Sound System</Text>

              <View style={[s.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.switchLabel, { color: colors.foreground }]}>Ada sound system sendiri?</Text>
                <Switch
                  value={formData.ownSoundSystem}
                  onValueChange={(val) => setFormData({ ...formData, ownSoundSystem: val })}
                  trackColor={{ false: colors.border, true: colors.primary + "50" }}
                  thumbColor={formData.ownSoundSystem ? colors.primary : colors.muted}
                />
              </View>

              <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Equipment List</Text>

              {formData.equipment.map((item, index) => (
                <View key={index} style={[s.equipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[s.equipText, { color: colors.foreground }]}>{item}</Text>
                  <TouchableOpacity onPress={() => removeEquipment(index)} activeOpacity={0.7}>
                    <IconSymbol name="xmark.circle.fill" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={s.addEquipForm}>
                <TextInput
                  style={[s.input, { flex: 1, backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  value={newEquipment}
                  onChangeText={setNewEquipment}
                  placeholder="Cth: Mic, DI box, Monitor, Mixer"
                  placeholderTextColor={colors.muted}
                />
                <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.primary }]} onPress={addEquipment} activeOpacity={0.7}>
                  <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Keperluan Venue</Text>

              <Text style={[s.label, { color: colors.muted }]}>Stage Size Minimum</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.stageSizeMin}
                onChangeText={(text) => setFormData({ ...formData, stageSizeMin: text })}
                placeholder="Cth: 4m x 3m"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>Power Supply</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.powerSupply}
                onChangeText={(text) => setFormData({ ...formData, powerSupply: text })}
                placeholder="Cth: 3-phase, 32A"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>Soundcheck Duration</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.soundcheckDuration}
                onChangeText={(text) => setFormData({ ...formData, soundcheckDuration: text })}
                placeholder="Cth: 1 jam"
                placeholderTextColor={colors.muted}
              />

              <Text style={[s.label, { color: colors.muted }]}>Tech Rider (PDF URL)</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={formData.techRider}
                onChangeText={(text) => setFormData({ ...formData, techRider: text })}
                placeholder="URL ke PDF tech rider"
                placeholderTextColor={colors.muted}
              />
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity style={[s.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave} activeOpacity={0.7}>
            <Text style={s.saveButtonText}>Simpan Perubahan</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={[s.logoutButton, { borderColor: colors.error }]} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={{ color: colors.error, fontWeight: "600" }}>Log Keluar</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide" onRequestClose={() => setShowPreview(false)}>
        <ScreenContainer className="p-0">
          <View style={[s.previewHeader, { backgroundColor: colors.primary }]}>
            <TouchableOpacity onPress={() => setShowPreview(false)} activeOpacity={0.7}>
              <IconSymbol name="xmark.circle.fill" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={s.previewHeaderTitle}>Preview (Customer View)</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={s.previewContent}>
            <View style={[s.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.previewName, { color: colors.foreground }]}>{formData.stageName || "Nama Pentas"}</Text>
              <Text style={[s.previewGenre, { color: colors.muted }]}>
                {formData.genre || "Genre"} • {formData.location || "Lokasi"}
              </Text>
              <View style={s.previewRating}>
                <Text style={[s.previewRatingText, { color: colors.warning }]}>⭐ {profile?.rating || "0.00"}</Text>
                <Text style={[s.previewReviews, { color: colors.muted }]}>({profile?.totalReviews || 0} ulasan)</Text>
              </View>

              {formData.bio && (
                <>
                  <Text style={[s.previewSectionTitle, { color: colors.foreground }]}>About</Text>
                  <Text style={[s.previewBio, { color: colors.foreground }]}>{formData.bio}</Text>
                </>
              )}

              {formData.languages.length > 0 && (
                <>
                  <Text style={[s.previewSectionTitle, { color: colors.foreground }]}>Bahasa Lagu</Text>
                  <View style={s.previewChips}>
                    {formData.languages.map((lang) => (
                      <View key={lang} style={[s.previewChip, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
                        <Text style={[s.previewChipText, { color: colors.primary }]}>{lang}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {formData.lineupType && (
                <>
                  <Text style={[s.previewSectionTitle, { color: colors.foreground }]}>Line-up</Text>
                  <Text style={[s.previewText, { color: colors.foreground }]}>{formData.lineupType}</Text>
                </>
              )}

              {formData.skills.length > 0 && (
                <>
                  <Text style={[s.previewSectionTitle, { color: colors.foreground }]}>Kemahiran Khas</Text>
                  <View style={s.previewChips}>
                    {formData.skills.map((skill) => (
                      <View key={skill} style={[s.previewChip, { backgroundColor: colors.success + "15", borderColor: colors.success }]}>
                        <Text style={[s.previewChipText, { color: colors.success }]}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {formData.setlist.length > 0 && (
                <>
                  <Text style={[s.previewSectionTitle, { color: colors.foreground }]}>Typical Setlist</Text>
                  {formData.setlist.slice(0, 5).map((song, i) => (
                    <Text key={i} style={[s.previewText, { color: colors.foreground }]}>
                      {i + 1}. {song}
                    </Text>
                  ))}
                  {formData.setlist.length > 5 && (
                    <Text style={[s.previewText, { color: colors.muted }]}>...dan {formData.setlist.length - 5} lagi</Text>
                  )}
                </>
              )}

              {formData.ownSoundSystem && (
                <>
                  <Text style={[s.previewSectionTitle, { color: colors.foreground }]}>Equipment</Text>
                  <Text style={[s.previewText, { color: colors.foreground }]}>✓ Ada sound system sendiri</Text>
                </>
              )}

              <View style={s.previewChecklist}>
                <Text style={[s.previewChecklistTitle, { color: colors.foreground }]}>Kekuatan Profil: {profileStrength.score}%</Text>
                {profileStrength.checks.map((check, i) => (
                  <View key={i} style={s.previewCheckItem}>
                    <IconSymbol name={check.done ? "checkmark.circle.fill" : "xmark.circle.fill"} size={16} color={check.done ? colors.success : colors.error} />
                    <Text style={[s.previewCheckText, { color: colors.muted }]}>{check.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  previewBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  strengthCard: {
    padding: 14,
    borderRadius: 14,
  },
  strengthTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  strengthValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  strengthBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 4,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabContent: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  memberCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  memberInstrument: {
    fontSize: 13,
  },
  addMemberForm: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  songCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  songText: {
    fontSize: 14,
    flex: 1,
  },
  addSongForm: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  equipCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  equipText: {
    fontSize: 14,
    flex: 1,
  },
  addEquipForm: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  logoutButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 12,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  previewHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  previewContent: {
    padding: 16,
  },
  previewCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewName: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  previewGenre: {
    fontSize: 15,
    marginBottom: 8,
  },
  previewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  previewRatingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  previewReviews: {
    fontSize: 14,
  },
  previewSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  previewBio: {
    fontSize: 14,
    lineHeight: 21,
  },
  previewChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  previewChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  previewChecklist: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  previewChecklistTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  previewCheckItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  previewCheckText: {
    fontSize: 13,
  },
});
