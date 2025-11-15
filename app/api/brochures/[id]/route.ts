import { createRouteSupabaseClient } from '@/lib/supabase/route-handler'
import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brochure = await prisma.brochure.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!brochure) {
      return NextResponse.json({ error: 'Brochure not found' }, { status: 404 })
    }

    return NextResponse.json({ brochure })
  } catch (error) {
    console.error('Error fetching brochure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const brochure = await prisma.brochure.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(title && { title }),
        ...(brief !== undefined && { brief }),
        ...(content !== undefined && { content }),
        ...(template && { template }),
        ...(brandColor !== undefined && { brandColor }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(images !== undefined && { images }),
        ...(contactDetails !== undefined && { contactDetails }),
      },
    })

    if (brochure.count === 0) {
      return NextResponse.json({ error: 'Brochure not found' }, { status: 404 })
    }

    const updated = await prisma.brochure.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json({ brochure: updated })
  } catch (error) {
    console.error('Error updating brochure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brochure = await prisma.brochure.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (brochure.count === 0) {
      return NextResponse.json({ error: 'Brochure not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brochure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

