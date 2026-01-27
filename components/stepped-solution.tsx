import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { SolutionStep } from "@/shared/types";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatSolution } from "@/lib/math-formatter";
import { extractFinalAnswer } from "@/lib/solution-parser";

interface SteppedSolutionProps {
  steps: SolutionStep[];
  rawSolution?: string;
}

export function SteppedSolution({ steps, rawSolution }: SteppedSolutionProps) {
  const colors = useColors();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    new Set([steps[0]?.stepNumber])
  );
  const finalAnswer = rawSolution ? extractFinalAnswer(rawSolution) : null;

  const toggleStep = (stepNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const expandAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSteps(new Set(steps.map((s) => s.stepNumber)));
  };

  const collapseAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSteps(new Set());
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Header with Expand/Collapse All */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.foreground,
          }}
        >
          풀이 과정
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={expandAll}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.primary,
                fontWeight: "500",
              }}
            >
              모두 열기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={collapseAll}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                fontWeight: "500",
              }}
            >
              모두 닫기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Steps */}
      <View style={{ gap: 8 }}>
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.stepNumber);
          const isLast = index === steps.length - 1;

          return (
            <View key={step.stepNumber}>
              {/* Step Header */}
              <TouchableOpacity
                onPress={() => toggleStep(step.stepNumber)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: isExpanded ? colors.primary + "15" : colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isExpanded ? colors.primary : colors.border,
                  }}
                >
                  {/* Step Number Badge */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isExpanded ? colors.primary : colors.muted,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: colors.background,
                      }}
                    >
                      {step.stepNumber}
                    </Text>
                  </View>

                  {/* Step Title */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.foreground,
                      }}
                    >
                      {step.title}
                    </Text>
                  </View>

                  {/* Expand Icon */}
                  <IconSymbol
                    name={isExpanded ? "chevron.up" : "chevron.down"}
                    size={20}
                    color={colors.muted}
                  />
                </View>
              </TouchableOpacity>

              {/* Step Content */}
              {isExpanded && (
                <View
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: colors.background,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
                    marginLeft: 16,
                    marginTop: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      lineHeight: 20,
                      color: colors.foreground,
                    }}
                  >
                    {formatSolution(step.content)}
                  </Text>
                </View>
              )}

              {/* Connector Line */}
              {!isLast && (
                <View
                  style={{
                    height: 12,
                    marginLeft: 32,
                    borderLeftWidth: 2,
                    borderLeftColor: colors.border,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginVertical: 16,
        }}
      />

      {/* Final Answer */}
      <View
        style={{
          paddingVertical: 24,
          paddingHorizontal: 16,
          backgroundColor: finalAnswer ? colors.success + "15" : colors.warning + "15",
          borderRadius: 12,
          borderWidth: 2,
          borderColor: finalAnswer ? colors.success : colors.warning,
          gap: 12,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: finalAnswer ? colors.success : colors.warning,
          }}
        >
          {finalAnswer ? "✓ 최종 답" : "⚠ 답 없음"}
        </Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: colors.foreground,
            lineHeight: 44,
            textAlign: "center",
          }}
        >
          {finalAnswer || "답을 찾을 수 없습니다"}
        </Text>
      </View>
    </View>
  );
}
