import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/lib/auth-context";
import * as Auth from "@/lib/_core/auth";

type AuthMode = "login" | "register";

export default function WelcomeScreen() {
  const router = useRouter();
  const { refetch } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"user" | "musician">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Sila masukkan email dan password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success && result.sessionToken) {
        await Auth.setSessionToken(result.sessionToken);
        await Auth.setUserInfo({
          id: result.user.id,
          openId: result.user.openId,
          name: result.user.name,
          email: result.user.email,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });
        await refetch();
        // Route based on user role
        if (result.user.role === "musician") {
          router.replace("/(musician)");
        } else if (result.user.role === "user") {
          router.replace("/(customer)");
        } else if (result.user.role === "admin") {
          router.replace("/(admin)");
        } else {
          router.replace("/welcome");
        }
      }
    } catch (error: any) {
      Alert.alert("Login Gagal", error.message || "Sila cuba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Sila lengkapkan semua maklumat");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password tidak sepadan");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password mesti sekurang-kurangnya 6 aksara");
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
        role,
      });
      if (result.success && result.sessionToken) {
        await Auth.setSessionToken(result.sessionToken);
        await Auth.setUserInfo({
          id: result.user.id,
          openId: result.user.openId,
          name: result.user.name,
          email: result.user.email,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });
        await refetch();
        
        // Redirect to email verification first
        router.replace("/verify-email");
      }
    } catch (error: any) {
      Alert.alert("Pendaftaran Gagal", error.message || "Sila cuba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo & Title */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <IconSymbol name="music.note" size={40} color="white" />
              </View>
              <Text style={styles.title}>Gigbook</Text>
              <Text style={styles.subtitle}>
                Tempah Musician Malaysia{"\n"}dengan Mudah & Selamat
              </Text>
            </View>

            {/* Auth Form Card */}
            <View style={styles.formCard}>
              {/* Tab Switcher */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, mode === "login" && styles.tabActive]}
                  onPress={() => setMode("login")}
                >
                  <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
                    Log Masuk
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, mode === "register" && styles.tabActive]}
                  onPress={() => setMode("register")}
                >
                  <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>
                    Daftar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Registration Name Field */}
              {mode === "register" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nama Penuh</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan nama anda"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="contoh@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Masukkan password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <IconSymbol
                      name={showPassword ? "eye.slash.fill" : "eye.fill"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password (Register only) */}
              {mode === "register" && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sahkan Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Masukkan password sekali lagi"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Role Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Saya adalah</Text>
                    <View style={styles.roleContainer}>
                      <TouchableOpacity
                        style={[styles.roleButton, role === "user" && styles.roleButtonActive]}
                        onPress={() => setRole("user")}
                      >
                        <Text style={[styles.roleText, role === "user" && styles.roleTextActive]}>
                          🎵 Pencari Musician
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.roleButton, role === "musician" && styles.roleButtonActive]}
                        onPress={() => setRole("musician")}
                      >
                        <Text style={[styles.roleText, role === "musician" && styles.roleTextActive]}>
                          🎸 Musician
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={mode === "login" ? handleLogin : handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === "login" ? "Log Masuk" : "Daftar Sekarang"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Switch Mode Text */}
              <View style={styles.switchModeContainer}>
                <Text style={styles.switchModeText}>
                  {mode === "login" ? "Belum ada akaun? " : "Sudah ada akaun? "}
                </Text>
                <TouchableOpacity onPress={() => setMode(mode === "login" ? "register" : "login")}>
                  <Text style={styles.switchModeLink}>
                    {mode === "login" ? "Daftar" : "Log Masuk"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              Dengan meneruskan, anda bersetuju dengan{"\n"}Terma & Syarat kami
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#6366F1",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#1F2937",
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    color: "#1F2937",
    fontSize: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  roleButtonActive: {
    borderColor: "#6366F1",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  roleText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#6B7280",
  },
  roleTextActive: {
    color: "#6366F1",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  switchModeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  switchModeText: {
    color: "#6B7280",
  },
  switchModeLink: {
    color: "#6366F1",
    fontWeight: "600",
  },
  footer: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18,
  },
});
