import { ScrollView, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getProblemById, deleteProblem, getAllProblems } from "@/lib/storage";
import { formatSolution } from "@/lib/math-formatter";
import { parseSolution } from "@/lib/solution-parser";
import { SteppedSolution } from "@/components/stepped-solution";
import { Problem, ParsedSolution } from "@/shared/types";

export default function ProblemDetailScreen() {
  const { id, selectedIds } = useLocalSearchParams<{ id: string; selectedIds?: string }>();
  const router = useRouter();
  const colors = useColors();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsedSolution, setParsedSolution] = useState<ParsedSolution | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    try {
      const data = await getProblemById(id);
      setProblem(data);

      if (data?.solution) {
        const parsed = parseSolution(data.solution);
        setParsedSolution(parsed);
      }

      if (selectedIds) {
        const ids = selectedIds.split(",");
        const problems = await getAllProblems();
        const selected = problems.filter((p) => ids.includes(p.id));
        setAllProblems(selected);
        const index = selected.findIndex((p) => p.id === id);
        setCurrentIndex(index >= 0 ? index : 0);
      } else {
        setAllProblems([]);
        setCurrentIndex(0);
      }
    } finally {
      setLoading(false);
    }
  }, [id, selectedIds]);

  const handleDelete = () => {
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
            if (id) {
              await deleteProblem(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const prevProblem = allProblems[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setProblem(prevProblem);
      if (prevProblem.solution) {
        setParsedSolution(parseSolution(prevProblem.solution));
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex < allProblems.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextProblem = allProblems[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setProblem(nextProblem);
      if (nextProblem.solution) {
        setParsedSolution(parseSolution(nextProblem.solution));
      }
    }
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

  if (!problem) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted">문제를 찾을 수 없습니다</Text>
        </View>
      </ScreenContainer>
    );
  }

  const hasNavigation = allProblems.length > 1;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < allProblems.length - 1;

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
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">문제 상세</Text>
          <TouchableOpacity
            onPress={handleDelete}
            style={{ padding: 8 }}
          >
            <IconSymbol name="trash.fill" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation for Multiple Problems */}
        {hasNavigation && (
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            {allProblems.map((p, index) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentIndex(index);
                  setProblem(p);
                  if (p.solution) {
                    setParsedSolution(parseSolution(p.solution));
                  }
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderBottomWidth: currentIndex === index ? 3 : 0,
                  borderBottomColor: currentIndex === index ? colors.primary : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: currentIndex === index ? "700" : "500",
                    color: currentIndex === index ? colors.primary : colors.muted,
                  }}
                >
                  문제 {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="p-6 gap-6">
          {/* Problem Number Badge */}
          {problem.problemNumber && (
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: colors.primary,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.background,
                }}
              >
                {problem.problemNumber}
              </Text>
            </View>
          )}

          {/* Problem Image */}
          <View className="bg-surface rounded-2xl overflow-hidden border border-border">
            <Image
              source={{ uri: problem.imageUri }}
              style={{ width: "100%", height: 300 }}
              resizeMode="contain"
            />
          </View>

          {/* Problem Type & Subject */}
          <View className="flex-row gap-2">
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary text-sm font-medium">
                {problem.problemType}
              </Text>
            </View>
            {problem.subject && (
              <View className="bg-surface px-3 py-1 rounded-full border border-border">
                <Text className="text-muted text-sm font-medium">
                  {problem.subject}
                </Text>
              </View>
            )}
          </View>

          {/* Stepped Solution */}
          {parsedSolution && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <SteppedSolution steps={parsedSolution.steps} rawSolution={problem.solution} />
            </View>
          )}

          {/* Navigation Section - Below Solution */}
          {hasNavigation && (
            <View style={{ gap: 12 }}>
              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                }}
              />

              {/* Navigation Controls */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <TouchableOpacity
                  onPress={handlePrevious}
                  disabled={!canGoPrevious}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: canGoPrevious ? colors.primary : colors.muted,
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: canGoPrevious ? 1 : 0.5,
                  }}
                >
                  <IconSymbol name="chevron.left" size={24} color={colors.background} />
                </TouchableOpacity>

                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.foreground,
                    minWidth: 60,
                    textAlign: "center",
                  }}
                >
                  {currentIndex + 1} / {allProblems.length}
                </Text>

                <TouchableOpacity
                  onPress={handleNext}
                  disabled={!canGoNext}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: canGoNext ? colors.primary : colors.muted,
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: canGoNext ? 1 : 0.5,
                  }}
                >
                  <IconSymbol name="chevron.right" size={24} color={colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Date */}
          <Text className="text-xs text-muted text-center">
            {new Date(problem.createdAt).toLocaleString("ko-KR")}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
