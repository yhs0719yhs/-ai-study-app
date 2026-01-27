import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { Problem } from "@/shared/types";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface ProblemSelectionModalProps {
  visible: boolean;
  problems: Problem[];
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

export function ProblemSelectionModal({
  visible,
  problems,
  onClose,
  onConfirm,
}: ProblemSelectionModalProps) {
  const colors = useColors();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleProblem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    if (selectedIds.size > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onConfirm(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: 32,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              문제 선택
            </Text>
            <TouchableOpacity onPress={handleClose} style={{ padding: 8 }}>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text
            style={{
              fontSize: 13,
              color: colors.muted,
              marginBottom: 16,
            }}
          >
            비교할 문제를 선택하세요 (최소 2개)
          </Text>

          {/* Problem List */}
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ gap: 12 }}>
              {problems.map((problem) => {
                const isSelected = selectedIds.has(problem.id);
                return (
                  <TouchableOpacity
                    key={problem.id}
                    onPress={() => toggleProblem(problem.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: isSelected
                          ? colors.primary + "20"
                          : colors.surface,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }}
                    >
                      {/* Checkbox */}
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.background,
                          borderWidth: 2,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {isSelected && (
                          <IconSymbol
                            name="paperplane.fill"
                            size={14}
                            color={colors.background}
                          />
                        )}
                      </View>

                      {/* Problem Info */}
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: colors.foreground,
                          }}
                        >
                          {problem.problemType}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.muted,
                          }}
                        >
                          {new Date(problem.createdAt).toLocaleString("ko-KR")}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={handleClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={selectedIds.size < 2}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor:
                  selectedIds.size >= 2 ? colors.primary : colors.muted,
                justifyContent: "center",
                alignItems: "center",
                opacity: selectedIds.size >= 2 ? 1 : 0.5,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.background,
                }}
              >
                비교하기 ({selectedIds.size})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
