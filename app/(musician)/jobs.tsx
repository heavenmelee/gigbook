import { Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function JobsScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 items-center justify-center">
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
          Jobs
        </Text>
        <Text style={{ color: colors.muted, fontSize: 16, marginTop: 8 }}>
          Coming soon
        </Text>
      </View>
    </ScreenContainer>
  );
}
