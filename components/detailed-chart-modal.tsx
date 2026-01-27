import { Modal, Text, View, TouchableOpacity, ScrollView, Platform, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";

interface ChartData {
  type: string;
  count: number;
}

interface DetailedChartModalProps {
  visible: boolean;
  title: string;
  data: ChartData[];
  onClose: () => void;
}

export function DetailedChartModal({
  visible,
  title,
  data,
  onClose,
}: DetailedChartModalProps) {
  const colors = useColors();
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const screenWidth = Dimensions.get("window").width;

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
          backgroundColor: colors.background,
          paddingTop: 16,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {title}
          </Text>
          <TouchableOpacity onPress={handleClose} style={{ padding: 8 }}>
            <IconSymbol name="xmark" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 32,
          }}
        >
          {data.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.muted,
                }}
              >
                데이터가 없습니다
              </Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {/* Summary */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.muted,
                    marginBottom: 4,
                  }}
                >
                  총 개수
                </Text>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  {totalCount}
                </Text>
              </View>

              {/* Detailed List */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {data.map((item, index) => {
                  const percentage =
                    totalCount > 0
                      ? Math.round((item.count / totalCount) * 100)
                      : 0;
                  const barWidth =
                    totalCount > 0
                      ? (item.count / Math.max(...data.map((d) => d.count))) *
                        100
                      : 0;

                  return (
                    <View
                      key={index}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: index < data.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                      }}
                    >
                      {/* Item Header */}
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
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.foreground,
                            flex: 1,
                          }}
                        >
                          {item.type}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: colors.primary,
                              minWidth: 40,
                              textAlign: "right",
                            }}
                          >
                            {item.count}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.muted,
                              minWidth: 35,
                              textAlign: "right",
                            }}
                          >
                            {percentage}%
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View
                        style={{
                          height: 8,
                          backgroundColor: colors.background,
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            height: "100%",
                            width: `${barWidth}%`,
                            backgroundColor: colors.primary,
                            borderRadius: 4,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Statistics */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.foreground,
                    marginBottom: 4,
                  }}
                >
                  통계
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.muted,
                    }}
                  >
                    평균
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    {(totalCount / data.length).toFixed(1)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.muted,
                    }}
                  >
                    최대
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    {Math.max(...data.map((d) => d.count))}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.muted,
                    }}
                  >
                    최소
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    {Math.min(...data.map((d) => d.count))}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
