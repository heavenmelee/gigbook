import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { startOAuthLogin } from "@/constants/oauth";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";

export default function WelcomeScreen() {

  const colors = useColors();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <LinearGradient
        colors={[colors.primary, "#4F46E5"]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.heroSection}>
            <Text style={styles.logo}>🎵</Text>
            <Text style={styles.title}>Gigbook</Text>
            <Text style={styles.subtitle}>
              Tempah Musician Malaysia{"\n"}dengan Mudah & Selamat
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎸</Text>
              <Text style={styles.featureText}>Cari musician terbaik</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📅</Text>
              <Text style={styles.featureText}>Tempah dengan mudah</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureText}>Bayaran selamat dengan escrow</Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={startOAuthLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Mula Sekarang</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              Dengan meneruskan, anda bersetuju dengan{"\n"}Terma & Syarat kami
            </Text>
          </View>
        </View>
      </LinearGradient>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  heroSection: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 26,
  },
  featuresSection: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  buttonSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6366F1",
  },
  termsText: {
    marginTop: 16,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 18,
  },
});
