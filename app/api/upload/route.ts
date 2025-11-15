import { createRouteSupabaseClient } from '@/lib/supabase/route-handler'
import { uploadFile } from '@/lib/supabase/storage'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo' or 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bucket = type === 'logo' ? 'logos' : 'images'
    const timestamp = Date.now()
    const fileName = `${session.user.id}/${timestamp}-${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const url = await uploadFile(bucket, fileName, buffer, file.type)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

