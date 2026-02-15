import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

type Period = "today" | "week" | "month";

interface Transaction {
  id: number;
  date: string;
  jobName: string;
  gross: number;
  fee: number;
  net: number;
  status: "paid" | "pending" | "refund";
}

interface EscrowItem {
  id: number;
  jobRef: string;
  amount: number;
  releaseCondition: string;
}

// Mock data
const mockEscrow: EscrowItem[] = [
  { id: 1, jobRef: "Job #124", amount: 600, releaseCondition: "Released after completion" },
  { id: 2, jobRef: "Job #126", amount: 450, releaseCondition: "Released after completion" },
];

const mockTransactions: Transaction[] = [
  { id: 1, date: "2026-02-14", jobName: "Wedding dinner", gross: 1200, fee: 120, net: 1080, status: "paid" },
  { id: 2, date: "2026-02-12", jobName: "Corporate event", gross: 800, fee: 80, net: 720, status: "paid" },
  { id: 3, date: "2026-02-10", jobName: "Birthday party", gross: 500, fee: 50, net: 450, status: "paid" },
  { id: 4, date: "2026-02-08", jobName: "Cafe performance", gross: 300, fee: 30, net: 270, status: "paid" },
  { id: 5, date: "2026-02-05", jobName: "Private event", gross: 650, fee: 65, net: 585, status: "pending" },
];

export default function WalletScreen() {
  const colors = useColors();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");

  const availableBalance = 1240;
  const pendingTotal = mockEscrow.reduce((sum, item) => sum + item.amount, 0);
  
  // Mock earnings based on period
  const earnings = {
    today: { gross: 0, fee: 0, net: 0 },
    week: { gross: 2000, fee: 200, net: 1800 },
    month: { gross: 4500, fee: 450, net: 4050 },
  };

  const currentEarnings = earnings[selectedPeriod];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.success;
      case "pending":
        return colors.warning;
      case "refund":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const handleCashOut = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // TODO: Navigate to cash out flow / payout setup
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ==================== TOP SEGMENTED CONTROL ==================== */}
        <View style={[s.topBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={[s.segmentedControl, { backgroundColor: colors.surface }]}>
            {(["today", "week", "month"] as Period[]).map((period) => {
              const isSelected = selectedPeriod === period;
              return (
                <TouchableOpacity
                  key={period}
                  style={[
                    s.segment,
                    {
                      backgroundColor: isSelected ? colors.primary : "transparent",
                    },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedPeriod(period);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.segmentText,
                      { color: isSelected ? "#fff" : colors.foreground },
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.content}>
          {/* ==================== BALANCE CARD ==================== */}
          <View style={[s.balanceCard, { backgroundColor: colors.primary }]}>
            <Text style={s.balanceLabel}>Available to cash out</Text>
            <Text style={s.balanceAmount}>RM {availableBalance.toLocaleString()}</Text>
            <TouchableOpacity
              style={[s.cashOutButton, { backgroundColor: "#fff" }]}
              onPress={handleCashOut}
              activeOpacity={0.8}
            >
              <IconSymbol name="arrow.up.circle.fill" size={20} color={colors.primary} />
              <Text style={[s.cashOutButtonText, { color: colors.primary }]}>Cash out</Text>
            </TouchableOpacity>
          </View>

          {/* ==================== PENDING (ESCROW) ==================== */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>
              Pending from upcoming jobs
            </Text>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {mockEscrow.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    s.escrowRow,
                    index < mockEscrow.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={s.escrowInfo}>
                    <Text style={[s.escrowJobRef, { color: colors.foreground }]}>{item.jobRef}</Text>
                    <Text style={[s.escrowCondition, { color: colors.muted }]}>{item.releaseCondition}</Text>
                  </View>
                  <Text style={[s.escrowAmount, { color: colors.warning }]}>
                    RM {item.amount}
                  </Text>
                </View>
              ))}
              <View style={[s.escrowTotal, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[s.escrowTotalLabel, { color: colors.foreground }]}>Total pending</Text>
                <Text style={[s.escrowTotalAmount, { color: colors.foreground }]}>
                  RM {pendingTotal.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* ==================== EARNINGS SUMMARY ==================== */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>
              Earnings ({selectedPeriod})
            </Text>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.earningsRow}>
                <Text style={[s.earningsLabel, { color: colors.foreground }]}>Gross</Text>
                <Text style={[s.earningsValue, { color: colors.foreground }]}>
                  RM {currentEarnings.gross.toLocaleString()}
                </Text>
              </View>
              <View style={s.earningsRow}>
                <Text style={[s.earningsLabel, { color: colors.muted }]}>Platform fee (10%)</Text>
                <Text style={[s.earningsValue, { color: colors.muted }]}>
                  - RM {currentEarnings.fee.toLocaleString()}
                </Text>
              </View>
              <View style={[s.earningsRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
                <Text style={[s.earningsLabel, { color: colors.foreground, fontWeight: "700" }]}>Net</Text>
                <Text style={[s.earningsValue, { color: colors.success, fontWeight: "700", fontSize: 18 }]}>
                  RM {currentEarnings.net.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* ==================== LATEST TRANSACTIONS ==================== */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Latest transactions</Text>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to transactions screen
                }}
                activeOpacity={0.7}
              >
                <Text style={[s.seeAllLink, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {mockTransactions.slice(0, 5).map((txn, index) => (
                <TouchableOpacity
                  key={txn.id}
                  style={[
                    s.transactionRow,
                    index < 4 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                  onPress={() => {}}
                  activeOpacity={0.7}
                >
                  <View style={s.transactionLeft}>
                    <Text style={[s.transactionDate, { color: colors.muted }]}>{txn.date}</Text>
                    <Text style={[s.transactionJob, { color: colors.foreground }]}>{txn.jobName}</Text>
                    <Text style={[s.transactionDetails, { color: colors.muted }]}>
                      Gross: RM{txn.gross} • Fee: RM{txn.fee}
                    </Text>
                  </View>
                  <View style={s.transactionRight}>
                    <Text style={[s.transactionNet, { color: colors.foreground }]}>
                      RM {txn.net}
                    </Text>
                    <View
                      style={[
                        s.statusBadge,
                        { backgroundColor: getStatusColor(txn.status) + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          s.statusBadgeText,
                          { color: getStatusColor(txn.status) },
                        ]}
                      >
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    gap: 20,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 4,
  },
  cashOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  cashOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllLink: {
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  escrowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  escrowInfo: {
    flex: 1,
    gap: 4,
  },
  escrowJobRef: {
    fontSize: 15,
    fontWeight: "600",
  },
  escrowCondition: {
    fontSize: 13,
  },
  escrowAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  escrowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  escrowTotalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  escrowTotalAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  earningsLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  transactionLeft: {
    flex: 1,
    gap: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  transactionJob: {
    fontSize: 15,
    fontWeight: "600",
  },
  transactionDetails: {
    fontSize: 13,
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  transactionNet: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
