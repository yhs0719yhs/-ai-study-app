// Supabase Storage integration for image uploads
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

// Initialize Supabase client
const supabaseUrl = ENV.supabaseUrl;
const supabaseAnonKey = ENV.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Storage] ERROR: SUPABASE_URL and SUPABASE_ANON_KEY are required!");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  try {
    const bucket = "problems";
    const fileName = relKey.split("/").pop() || "file";
    const path = relKey;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, data, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
      key: path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("[Storage] Upload error:", error);
    throw error;
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  try {
    const bucket = "problems";
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(relKey);

    return {
      key: relKey,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("[Storage] Get error:", error);
    throw error;
  }
}
