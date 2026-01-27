import { ScrollView, Text, View, RefreshControl, TouchableOpacity, Image, Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getAllProblems, deleteProblem } from "@/lib/storage";
import { Problem } from "@/shared/types";
import { ProblemSelectionModal } from "@/components/problem-selection-modal";

export default function HistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  // 화면에 포커스될 때마다 문제 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      loadProblems();
    }, [])
  );

  const loadProblems = async () => {
    try {
      const data = await getAllProblems();
      setProblems(data);
    } catch (error) {
      console.error("문제 목록 로드 오류:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProblems();
    setRefreshing(false);
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
            try {
              await deleteProblem(problemId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await loadProblems();
            } catch (error) {
              console.error("삭제 오류:", error);
              Alert.alert("오류", "문제 삭제 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  const handleCompare = (selectedIds: string[]) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSelectionModal(false);
    router.push({
      pathname: `/problem/[id]`,
      params: {
        id: selectedIds[0],
        selectedIds: selectedIds.join(","),
      },
    });
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="mb-2">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text className="text-3xl font-bold text-foreground">문제 히스토리</Text>
                <Text className="text-sm text-muted mt-1">
                  풀이한 문제들을 다시 확인하세요
                </Text>
              </View>
              {problems.length >= 2 && (
                <TouchableOpacity
                  onPress={() => setShowSelectionModal(true)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 12, fontWeight: "600" }}>
                    비교
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Selection Modal */}
          <ProblemSelectionModal
            visible={showSelectionModal}
            problems={problems}
            onClose={() => setShowSelectionModal(false)}
            onConfirm={handleCompare}
          />

          {/* Problem List or Empty State */}
          {problems.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="bg-surface rounded-2xl p-8 border border-border max-w-sm">
                <Text className="text-base text-muted text-center">
                  아직 풀이한 문제가 없습니다
                </Text>
                <Text className="text-xs text-muted text-center mt-2">
                  홈 화면에서 문제를 촬영해보세요
                </Text>
              </View>
            </View>
          ) : (
            <View className="gap-3">
              {problems.map((problem) => (
                <TouchableOpacity
                  key={problem.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/problem/${problem.id}`);
                  }}
                  className="bg-surface rounded-2xl p-4 border border-border"
                  activeOpacity={0.7}
                >
                  <View className="flex-row gap-4 items-start">
                    <Image
                      source={{ uri: problem.imageUri }}
                      style={{ width: 100, height: 100, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <View className="flex-row gap-2 mb-2">
                        <View className="bg-primary/10 px-2 py-1 rounded-md">
                          <Text className="text-primary text-xs font-medium">
                            {problem.problemType}
                          </Text>
                        </View>
                        {problem.subject && (
                          <View className="bg-muted/20 px-2 py-1 rounded-md">
                            <Text className="text-muted text-xs font-medium">
                              {problem.subject}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-foreground mb-2" numberOfLines={3}>
                        {problem.solution.substring(0, 100)}...
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(problem.createdAt).toLocaleString("ko-KR")}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(problem.id)}
                      style={{
                        padding: 8,
                        justifyContent: "flex-start",
                      }}
                    >
                      <IconSymbol name="trash.fill" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
