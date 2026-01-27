import { Modal, Text, TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "./ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface ImagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onFile: () => void;
}

export function ImagePickerSheet({
  visible,
  onClose,
  onCamera,
  onGallery,
  onFile,
}: ImagePickerSheetProps) {
  const colors = useColors();

  const handleCamera = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onCamera();
  };

  const handleGallery = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onGallery();
  };

  const handleFile = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onFile();
  };

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
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.sheet, { backgroundColor: colors.surface }]}
            activeOpacity={1}
          >
            <View style={styles.handle} />
            
            <Text
              style={[styles.title, { color: colors.foreground }]}
            >
              문제 이미지 선택
            </Text>

            <TouchableOpacity
              style={[styles.option, { borderBottomColor: colors.border }]}
              onPress={handleCamera}
              activeOpacity={0.7}
            >
              <IconSymbol name="camera.fill" size={24} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.foreground }]}>
                카메라로 촬영
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { borderBottomColor: colors.border }]}
              onPress={handleGallery}
              activeOpacity={0.7}
            >
              <IconSymbol name="photo.fill" size={24} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.foreground }]}>
                갤러리에서 선택
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={handleFile}
              activeOpacity={0.7}
            >
              <IconSymbol name="doc.fill" size={24} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.foreground }]}>
                파일에서 선택
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.background }]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.muted }]}>
                취소
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    padding: 16,
  },
  sheet: {
    borderRadius: 16,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
