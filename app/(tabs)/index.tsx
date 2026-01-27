import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ImagePickerSheet } from "@/components/image-picker-sheet";
import { useColors } from "@/hooks/use-colors";
import { takePicture, pickImage, pickFile } from "@/lib/image-picker";
import { trpc } from "@/lib/trpc";
import { saveProblem, getAllProblems } from "@/lib/storage";
import { Problem } from "@/shared/types";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("문제를 분석하는 중입니다...");
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const analyzeMutation = trpc.problem.analyze.useMutation();

  useEffect(() => {
    loadRecentProblems();
  }, []);

  const loadRecentProblems = async () => {
    try {
      const problems = await getAllProblems();
      setRecentProblems(problems.slice(0, 3));
    } catch (error) {
      console.error("최근 문제 로드 오류:", error);
    }
  };

  const handleCapturePress = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPicker(true);
  };

  const analyzeImage = async (imageUri: string) => {
    try {
      setLoadingMessage("이미지를 읽는 중입니다...");
      console.log("이미지 URI:", imageUri);

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Base64 변환 완료, 길이:", base64.length);
      setLoadingMessage("AI가 문제를 분석하는 중입니다...");

      const result = await analyzeMutation.mutateAsync({
        imageBase64: base64,
        imageName: `problem_${Date.now()}.jpg`,
      });

      console.log("분석 결과:", result);

      const problem: Problem = {
        id: Date.now().toString(),
        imageUri: imageUri,
        imageUrl: result.imageUrl,
        solution: result.solution,
        problemType: result.problemType,
        subject: result.subject,
        problemNumber: (result as any).problemNumber,
        finalAnswer: (result as any).finalAnswer,
        createdAt: new Date().toISOString(),
      };

      await saveProblem(problem);
      await loadRecentProblems();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("분석 완료", "문제 분석이 완료되었습니다.", [
        {
          text: "확인",
          onPress: () => router.push(`/problem/${problem.id}`),
        },
      ]);
    } catch (error) {
      console.error("분석 오류:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = "문제 분석 중 오류가 발생했습니다.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert("오류", errorMessage);
    } finally {
      setLoading(false);
      setLoadingMessage("문제를 분석하는 중입니다...");
    }
  };

  const handleCamera = async () => {
    setShowPicker(false);
    setLoading(true);

    try {
      const result = await takePicture();
      if (result) {
        await analyzeImage(result.uri);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("카메라 오류:", error);
      Alert.alert("오류", "카메라 사용 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const handleGallery = async () => {
    setShowPicker(false);
    setLoading(true);

    try {
      const result = await pickImage();
      if (result) {
        await analyzeImage(result.uri);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("갤러리 오류:", error);
      Alert.alert("오류", "갤러리 접근 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const handleFile = async () => {
    setShowPicker(false);
    setLoading(true);

    try {
      const result = await pickFile();
      if (result) {
        await analyzeImage(result.uri);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("파일 선택 오류:", error);
      Alert.alert("오류", "파일 선택 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const toggleProblemSelection = (problemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(problemId)) {
      newSelected.delete(problemId);
    } else {
      newSelected.add(problemId);
    }
    setSelectedProblems(newSelected);
  };

  const handleViewSelected = () => {
    if (selectedProblems.size < 2) {
      Alert.alert("알림", "2개 이상의 문제를 선택해주세요.");
      return;
    }
    const selectedIds = Array.from(selectedProblems).join(",");
    router.push(`/problem-tabs/${selectedIds}`);
  };

  return (
    <ScreenContainer className="p-6">
      <ImagePickerSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onFile={handleFile}
      />

      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-white mt-4 text-center px-6">{loadingMessage}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="mb-2">
            <Text className="text-3xl font-bold text-foreground">AI 공부 도우미</Text>
            <Text className="text-sm text-muted mt-1">
              문제를 촬영하면 AI가 풀이해드립니다
            </Text>
          </View>

          {/* Main CTA Button */}
          <TouchableOpacity
            onPress={handleCapturePress}
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 24,
                paddingVertical: 32,
                paddingHorizontal: 24,
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IconSymbol name="camera.fill" size={32} color={colors.background} />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.background,
                }}
              >
                문제 촬영하기
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.8)",
                  textAlign: "center",
                }}
              >
                카메라, 갤러리, 또는 파일에서 선택
              </Text>
            </View>
          </TouchableOpacity>

          {/* Recent Problems */}
          {recentProblems.length > 0 && (
            <View className="gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-foreground">최근 풀이한 문제</Text>
                <TouchableOpacity
                  onPress={() => router.push("/history")}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm text-primary font-medium">모두 보기</Text>
                </TouchableOpacity>
              </View>

              {isSelectionMode && selectedProblems.size > 0 && (
                <View className="flex-row gap-2 mt-4">
                  <TouchableOpacity
                    onPress={() => {
                      setIsSelectionMode(false);
                      setSelectedProblems(new Set());
                    }}
                    className="flex-1 bg-surface rounded-lg py-3 border border-border"
                  >
                    <Text className="text-center text-foreground font-semibold">취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleViewSelected}
                    className="flex-1 bg-primary rounded-lg py-3"
                  >
                    <Text className="text-center text-background font-semibold">
                      {selectedProblems.size}개 보기
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {recentProblems.map((problem) => {
                const isSelected = selectedProblems.has(problem.id);
                return (
                  <TouchableOpacity
                    key={problem.id}
                    onPress={() => {
                      if (isSelectionMode) {
                        toggleProblemSelection(problem.id);
                      } else {
                        router.push(`/problem/${problem.id}`);
                      }
                    }}
                    onLongPress={() => {
                      if (!isSelectionMode) {
                        setIsSelectionMode(true);
                        toggleProblemSelection(problem.id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`rounded-2xl p-4 border flex-row gap-4 items-center ${
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      {isSelectionMode && (
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: isSelected ? colors.primary : colors.surface,
                            borderWidth: 2,
                            borderColor: isSelected ? colors.primary : colors.border,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {isSelected && (
                            <Text style={{ color: colors.background, fontWeight: "bold" }}>
                              ✓
                            </Text>
                          )}
                        </View>
                      )}
                      <View className="flex-1 gap-2">
                        <Text className="text-sm font-semibold text-foreground">
                          {problem.problemType}
                        </Text>
                        <Text className="text-xs text-muted">
                          {new Date(problem.createdAt).toLocaleString("ko-KR")}
                        </Text>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {recentProblems.length === 0 && (
            <View className="flex-1 justify-center items-center gap-4 py-12">
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.surface,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <IconSymbol name="paperplane.fill" size={40} color={colors.muted} />
              </View>
              <Text className="text-lg font-semibold text-foreground text-center">
                아직 풀이한 문제가 없습니다
              </Text>
              <Text className="text-sm text-muted text-center">
                위의 버튼을 눌러 문제를 촬영해보세요
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
