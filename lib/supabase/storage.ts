import { createSupabaseServerClient } from './client'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<string> {
  const supabase = createSupabaseServerClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

