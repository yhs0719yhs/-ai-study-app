import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: "image";
  fileName?: string;
}

/**
 * 카메라 권한 요청
 */
export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== "granted") {
    Alert.alert(
      "권한 필요",
      "카메라를 사용하려면 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
      [{ text: "확인" }]
    );
    return false;
  }
  
  return true;
}

/**
 * 갤러리 권한 요청
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== "granted") {
    Alert.alert(
      "권한 필요",
      "갤러리에 접근하려면 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
      [{ text: "확인" }]
    );
    return false;
  }
  
  return true;
}

/**
 * HEIC 이미지를 JPG로 변환
 */
export async function convertHeicToJpg(heicUri: string): Promise<string> {
  try {
    const base64Data = await FileSystem.readAsStringAsync(heicUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileName = `problem_${Date.now()}.jpg`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return filePath;
  } catch (error) {
    console.error("HEIC 변환 오류:", error);
    return heicUri;
  }
}

/**
 * 카메라로 사진 촬영
 */
export async function takePicture(): Promise<ImagePickerResult | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: "image",
      fileName: `photo_${Date.now()}.jpg`,
    };
  } catch (error) {
    console.error("카메라 촬영 오류:", error);
    Alert.alert("오류", "사진 촬영 중 오류가 발생했습니다.");
    return null;
  }
}

/**
 * 갤러리에서 이미지 선택
 */
export async function pickImage(): Promise<ImagePickerResult | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    let uri = asset.uri;
    let fileName = `image_${Date.now()}.jpg`;

    if (uri.toLowerCase().includes(".heic") || uri.toLowerCase().includes(".heif")) {
      uri = await convertHeicToJpg(uri);
      fileName = `converted_${Date.now()}.jpg`;
    }

    return {
      uri: uri,
      width: asset.width,
      height: asset.height,
      type: "image",
      fileName: fileName,
    };
  } catch (error) {
    console.error("이미지 선택 오류:", error);
    Alert.alert("오류", "이미지 선택 중 오류가 발생했습니다.");
    return null;
  }
}

/**
 * 파일 시스템에서 파일 선택 (HEIC 포함)
 */
export async function pickFile(): Promise<ImagePickerResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png", "image/heic", "image/heif"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    let uri = asset.uri;
    let fileName = asset.name || `file_${Date.now()}`;

    if (
      fileName.toLowerCase().endsWith(".heic") ||
      fileName.toLowerCase().endsWith(".heif")
    ) {
      uri = await convertHeicToJpg(uri);
      fileName = fileName.replace(/\.(heic|heif)$/i, ".jpg");
    }

    return {
      uri: uri,
      width: 1024,
      height: 1024,
      type: "image",
      fileName: fileName,
    };
  } catch (error) {
    console.error("파일 선택 오류:", error);
    Alert.alert("오류", "파일 선택 중 오류가 발생했습니다.");
    return null;
  }
}
