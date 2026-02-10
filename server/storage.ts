// Supabase Storage integration for image uploads
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = ENV.supabaseUrl;
    const supabaseAnonKey = ENV.supabaseAnonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("[Storage] ERROR: SUPABASE_URL and SUPABASE_ANON_KEY are required!");
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  try {
    const client = getSupabaseClient();
    const bucket = "problems";
    const path = relKey;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await client.storage
      .from(bucket)
      .upload(path, data, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = client.storage.from(bucket).getPublicUrl(path);

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
    const client = getSupabaseClient();
    const bucket = "problems";
    const { data: urlData } = client.storage.from(bucket).getPublicUrl(relKey);

    return {
      key: relKey,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("[Storage] Get error:", error);
    throw error;
  }
}
