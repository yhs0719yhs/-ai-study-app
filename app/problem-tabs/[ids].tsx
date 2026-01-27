import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getProblemById, deleteProblem, getAllProblems } from "@/lib/storage";
import { parseSolution } from "@/lib/solution-parser";
import { SteppedSolution } from "@/components/stepped-solution";
import { Problem, ParsedSolution } from "@/shared/types";

export default function ProblemTabsScreen() {
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const router = useRouter();
  const colors = useColors();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [parsedSolutions, setParsedSolutions] = useState<(ParsedSolution | null)[]>([]);

  useEffect(() => {
    loadProblems();
  }, [ids]);

  const loadProblems = async () => {
    if (!ids) return;
    setLoading(true);

    try {
      const problemIds = ids.split(",");
      const allProblems = await getAllProblems();
      const selectedProblems = allProblems.filter((p) => problemIds.includes(p.id));

      setProblems(selectedProblems);

      // 각 문제의 풀이 파싱
      const parsed = selectedProblems.map((p) =>
        p.solution ? parseSolution(p.solution) : null
      );
      setParsedSolutions(parsed);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (problemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "문제 삭제",
      "이 문제를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            await deleteProblem(problemId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // 남은 문제가 있으면 탭 업데이트, 없으면 뒤로 이동
            const remaining = problems.filter((p) => p.id !== problemId);
            if (remaining.length > 0) {
              setProblems(remaining);
              if (currentTabIndex >= remaining.length) {
                setCurrentTabIndex(remaining.length - 1);
              }
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (problems.length === 0) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted">문제를 찾을 수 없습니다</Text>
        </View>
      </ScreenContainer>
    );
  }

  const currentProblem = problems[currentTabIndex];
  const currentParsedSolution = parsedSolutions[currentTabIndex];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={true}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={{ padding: 8 }}
          >
            <IconSymbol
              name="chevron.left.forwardslash.chevron.right"
              size={24}
              color={colors.foreground}
            />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">문제 풀이</Text>
          <TouchableOpacity
            onPress={() => handleDelete(currentProblem.id)}
            style={{ padding: 8 }}
          >
            <IconSymbol name="trash.fill" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            overflow: "hidden",
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {problems.map((problem, index) => (
              <TouchableOpacity
                key={problem.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentTabIndex(index);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor:
                    currentTabIndex === index ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor:
                    currentTabIndex === index ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: currentTabIndex === index ? "600" : "500",
                    color:
                      currentTabIndex === index ? colors.background : colors.foreground,
                  }}
                >
                  문제 {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <View className="p-6 gap-6">
          {/* Problem Type & Subject */}
          <View className="flex-row gap-2">
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary text-sm font-medium">
                {currentProblem.problemType}
              </Text>
            </View>
            {currentProblem.subject && (
              <View className="bg-surface px-3 py-1 rounded-full border border-border">
                <Text className="text-muted text-sm font-medium">
                  {currentProblem.subject}
                </Text>
              </View>
            )}
          </View>

          {/* Problem Counter */}
          <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: colors.surface,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              {currentTabIndex + 1} / {problems.length}
            </Text>
          </View>

          {/* Stepped Solution */}
          {currentParsedSolution && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <SteppedSolution
                steps={currentParsedSolution.steps}
                rawSolution={currentProblem.solution}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
