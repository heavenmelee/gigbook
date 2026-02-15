import { Text, View, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { useAuth } from "@/hooks/use-auth";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function VerifyEmailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const sendVerificationMutation = trpc.auth.sendVerificationCode.useMutation();
  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation();

  // Auto-send verification code on mount
  useEffect(() => {
    const sendCode = async () => {
      try {
        await sendVerificationMutation.mutateAsync();
      } catch (error) {
        console.error("Failed to send verification code:", error);
      }
    };
    sendCode();
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Ralat", "Sila masukkan kod 6 digit");
      return;
    }

    setLoading(true);
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await verifyEmailMutation.mutateAsync({ code });
      // Check user status - if pending, go to pending-approval, else go to appropriate dashboard
      if (user?.status === "pending") {
        router.replace("/pending-approval");
      } else {
        // Route to appropriate dashboard based on user role
        if (user?.role === "musician") {
          router.replace("/(musician)");
        } else {
          router.replace("/(customer)");
        }
      }
    } catch (error: any) {
      Alert.alert("Ralat", error.message || "Kod tidak sah");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await sendVerificationMutation.mutateAsync();
      setResendTimer(60);
      Alert.alert("Berjaya", "Kod verifikasi baru telah dihantar ke email anda");
    } catch (error: any) {
      Alert.alert("Ralat", error.message || "Gagal menghantar kod");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6" containerClassName={`bg-${colors.background}`}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Sahkan Email Anda</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Kami telah menghantar kod verifikasi 6 digit ke {user?.email}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Kod Verifikasi</Text>
          <TextInput
            style={[
              styles.codeInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="000000"
            placeholderTextColor={colors.muted}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, "").slice(0, 6))}
            keyboardType="numeric"
            maxLength={6}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>Sahkan Email</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: colors.muted }]}>Tidak menerima kod?</Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendTimer > 0 || resendLoading}
              style={{ opacity: resendTimer > 0 || resendLoading ? 0.5 : 1 }}
            >
              <Text style={[styles.resendLink, { color: colors.primary }]}>
                {resendTimer > 0 ? `Hantar semula dalam ${resendTimer}s` : "Hantar semula"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Kod verifikasi akan tamat tempoh dalam 24 jam. Jika anda tidak menerima kod, sila semak folder spam anda.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.border }]}
          onPress={async () => {
            await logout();
            router.replace("/welcome");
          }}
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
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  verifyButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
