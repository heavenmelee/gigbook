// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "magnifyingglass": "search",
  "calendar": "event",
  "person.fill": "person",
  "music.note.list": "queue-music",
  "dollarsign.circle.fill": "attach-money",
  "checkmark.circle.fill": "check-circle",
  "gear": "settings",
  "star.fill": "star",
  "location.fill": "location-on",
  "clock.fill": "access-time",
  "xmark.circle.fill": "cancel",
  "plus.circle.fill": "add-circle",
  "arrow.left": "arrow-back",
  "exclamationmark.triangle.fill": "warning",
  "bell.fill": "notifications",
  "creditcard.fill": "credit-card",
  "person.2.fill": "people",
  "chart.bar.fill": "bar-chart",
  "music.note": "music-note",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "pencil": "edit",
  "trash": "delete",
  "chevron.up": "keyboard-arrow-up",
  "chevron.down": "keyboard-arrow-down",
  "waveform.circle.fill": "graphic-eq",
  "mic.fill": "mic",
  "guitar.fill": "music-note",
  "guitar": "music-note",
  "ellipsis": "more-horiz",
  "doc.text.fill": "description",
  "pause.circle.fill": "pause-circle-filled",
  "trash.fill": "delete",
  "arrow.up.circle.fill": "arrow-upward",
  "camera.fill": "camera-alt",
} as const satisfies IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
