import { createRouteSupabaseClient } from '@/lib/supabase/route-handler'
import { generateBrochureContent } from '@/lib/ai/generateBrochure'
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

    const body = await request.json()
    const { company, industry, audience, purpose, brief } = body

    if (!company || !industry || !audience || !purpose || !brief) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const content = await generateBrochureContent({
      company,
      industry,
      audience,
      purpose,
      brief,
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    )
  }
}

