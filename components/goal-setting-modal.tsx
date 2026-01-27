import { Modal, Text, View, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";

interface GoalSettingModalProps {
  visible: boolean;
  currentGoal: number;
  onClose: () => void;
  onSave: (goal: number) => void;
}

export function GoalSettingModal({
  visible,
  currentGoal,
  onClose,
  onSave,
}: GoalSettingModalProps) {
  const colors = useColors();
  const [goal, setGoal] = useState(currentGoal.toString());

  const handleSave = () => {
    const goalNum = parseInt(goal, 10);
    
    if (isNaN(goalNum) || goalNum <= 0) {
      Alert.alert("오류", "1 이상의 숫자를 입력해주세요.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    onSave(goalNum);
    onClose();
  };

  const handleClose = () => {
    setGoal(currentGoal.toString());
    onClose();
  };

  const presetGoals = [5, 10, 20, 30];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 24,
            width: "100%",
            maxWidth: 320,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              일일 목표 설정
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <IconSymbol name="xmark" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
              marginBottom: 20,
              lineHeight: 20,
            }}
          >
            하루에 풀고 싶은 문제 개수를 설정하세요. 목표를 달성하면 알림을 받을 수 있습니다.
          </Text>

          {/* Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.background,
              borderRadius: 12,
              paddingHorizontal: 12,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TextInput
              value={goal}
              onChangeText={setGoal}
              keyboardType="number-pad"
              placeholder="목표 문제 수"
              placeholderTextColor={colors.muted}
              style={{
                flex: 1,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.foreground,
              }}
            />
            <Text
              style={{
                fontSize: 16,
                color: colors.muted,
                marginLeft: 8,
              }}
            >
              문제
            </Text>
          </View>

          {/* Preset Goals */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: 8,
                fontWeight: "500",
              }}
            >
              빠른 선택
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {presetGoals.map((presetGoal) => (
                <TouchableOpacity
                  key={presetGoal}
                  onPress={() => setGoal(presetGoal.toString())}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor:
                      goal === presetGoal.toString()
                        ? colors.primary
                        : colors.background,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor:
                      goal === presetGoal.toString()
                        ? colors.primary
                        : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color:
                        goal === presetGoal.toString()
                          ? colors.background
                          : colors.foreground,
                    }}
                  >
                    {presetGoal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={handleClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.muted,
                }}
              >
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.background,
                }}
              >
                저장
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
