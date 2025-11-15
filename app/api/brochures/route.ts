import { createRouteSupabaseClient } from '@/lib/supabase/route-handler'
import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brochures = await prisma.brochure.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ brochures })
  } catch (error) {
    console.error('Error fetching brochures:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { title, brief, content, template, brandColor, logoUrl, images, contactDetails } =
      body

    const brochure = await prisma.brochure.create({
      data: {
        userId: session.user.id,
        title,
        brief,
        content: content || null,
        template: template || 'basic',
        brandColor: brandColor || null,
        logoUrl: logoUrl || null,
        images: images || [],
        contactDetails: contactDetails || null,
      },
    })

    return NextResponse.json({ brochure })
  } catch (error) {
    console.error('Error creating brochure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

