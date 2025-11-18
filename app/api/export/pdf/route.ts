import { createRouteSupabaseClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer'
import puppeteerCore from 'puppeteer-core'

// Disable caching
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: Request) {
  let browser: any = null

  try {
    const supabase = createRouteSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { html } = await request.json()

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      )
    }

    const isLocal = !process.env.VERCEL

    // Launch options for local dev
    const localLaunch = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }

    // Launch options for Vercel
    const productionLaunch = {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    }

    browser = isLocal
      ? await puppeteer.launch(localLaunch) // 🟢 Full Chromium from puppeteer
      : await puppeteerCore.launch(productionLaunch) // 🟢 Serverless Chromium

    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    await page.waitForTimeout(1500) // Tailwind rendering wait

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    })

    await browser.close()

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="brochure.pdf"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('PDF export error:', error)

    if (browser) {
      try {
        await browser.close()
      } catch (e) {}
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
