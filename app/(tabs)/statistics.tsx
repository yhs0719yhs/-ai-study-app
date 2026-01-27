import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { calculateStatistics, getLearningGoal, getGoalProgress, setLearningGoal } from "@/lib/storage";
import { Statistics, GoalProgress } from "@/shared/types";
import { GoalSettingModal } from "@/components/goal-setting-modal";
import { DetailedChartModal } from "@/components/detailed-chart-modal";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function StatisticsScreen() {
  const colors = useColors();
  const [stats, setStats] = useState<Statistics>({
    totalProblems: 0,
    topProblemTypes: [],
    recentTrend: [],
    subjectDistribution: [],
  });
  const [goalProgress, setGoalProgress] = useState<GoalProgress>({
    goal: 10,
    completed: 0,
    percentage: 0,
    achieved: false,
  });
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDetailedChart, setShowDetailedChart] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<"types" | "subjects">("types");

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await calculateStatistics();
    setStats(data);
    
    const progress = await getGoalProgress();
    setGoalProgress(progress);
  };

  const handleGoalSave = async (goal: number) => {
    await setLearningGoal(goal);
    await loadData();
  };

  const openDetailedChart = (type: "types" | "subjects") => {
    setSelectedChartType(type);
    setShowDetailedChart(true);
  };

  const getChartData = () => {
    if (selectedChartType === "types") {
      return stats.topProblemTypes.map((item) => ({
        type: item.type,
        count: item.count,
      }));
    }
    return stats.subjectDistribution.map((item) => ({
      type: item.subject,
      count: item.count,
    }));
  };

  const getChartTitle = () => {
    if (selectedChartType === "types") {
      return "문제 유형 분석";
    }
    return "과목별 분포";
  };

  return (
    <ScreenContainer className="p-6">
      <GoalSettingModal
        visible={showGoalModal}
        currentGoal={goalProgress.goal}
        onClose={() => setShowGoalModal(false)}
        onSave={handleGoalSave}
      />

      <DetailedChartModal
        visible={showDetailedChart}
        title={getChartTitle()}
        data={getChartData()}
        onClose={() => setShowDetailedChart(false)}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="mb-2">
            <Text className="text-3xl font-bold text-foreground">학습 통계</Text>
            <Text className="text-sm text-muted mt-1">
              오늘의 학습 진행률과 통계를 확인하세요
            </Text>
          </View>

          {/* Daily Goal Progress Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-sm text-muted mb-1">오늘의 목표</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {goalProgress.completed}/{goalProgress.goal}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGoalModal(true)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IconSymbol name="paperplane.fill" size={20} color={colors.background} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View
              style={{
                height: 12,
                backgroundColor: colors.background,
                borderRadius: 6,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${goalProgress.percentage}%`,
                  backgroundColor: goalProgress.achieved ? colors.success : colors.primary,
                  borderRadius: 6,
                }}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-muted">
                {goalProgress.percentage}% 달성
              </Text>
              {goalProgress.achieved && (
                <Text className="text-xs text-success font-semibold">
                  🎉 목표 달성!
                </Text>
              )}
            </View>
          </View>

          {/* Total Count Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-sm text-muted mb-2">총 풀이한 문제</Text>
            <Text className="text-4xl font-bold text-primary">{stats.totalProblems}</Text>
            <Text className="text-xs text-muted mt-1">문제</Text>
          </View>

          {/* Top Problem Types Card */}
          <TouchableOpacity
            onPress={() => openDetailedChart("types")}
            activeOpacity={0.7}
          >
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-foreground">
                  가장 많이 푼 문제 유형
                </Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
              {stats.topProblemTypes.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-sm text-muted text-center">
                    아직 데이터가 없습니다
                  </Text>
                  <Text className="text-xs text-muted text-center mt-2">
                    문제를 풀면 통계가 표시됩니다
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {stats.topProblemTypes.slice(0, 3).map((item, index) => (
                    <View key={`type-${item.type}-${index}`} className="gap-2">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-foreground font-medium">
                          {item.type}
                        </Text>
                        <Text className="text-sm text-muted">
                          {item.count}문제
                        </Text>
                      </View>
                      <View className="h-2 bg-muted/20 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(item.count / stats.totalProblems) * 100}%`,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Recent Trend Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              최근 7일 풀이 추세
            </Text>
            {stats.recentTrend.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-sm text-muted text-center">
                  아직 데이터가 없습니다
                </Text>
                <Text className="text-xs text-muted text-center mt-2">
                  문제를 풀면 추세가 표시됩니다
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {stats.recentTrend.map((item, index) => (
                  <View key={`trend-${item.date}-${index}`} className="flex-row justify-between items-center py-2">
                    <Text className="text-sm text-foreground">
                      {new Date(item.date).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text className="text-sm font-semibold text-primary">
                      {item.count}문제
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Subject Distribution Card */}
          {stats.subjectDistribution.length > 0 && (
            <TouchableOpacity
              onPress={() => openDetailedChart("subjects")}
              activeOpacity={0.7}
            >
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-foreground">
                    과목별 분포
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
                <View className="gap-3">
                  {stats.subjectDistribution.slice(0, 3).map((item, index) => (
                    <View key={`subject-${item.subject}-${index}`} className="flex-row justify-between items-center">
                      <Text className="text-sm text-foreground">{item.subject}</Text>
                      <Text className="text-sm text-muted">{item.count}문제</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import React from "react";
