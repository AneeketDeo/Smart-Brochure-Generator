import { createRouteSupabaseClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

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

    // Configure Puppeteer for serverless environment
    const isProduction = process.env.NODE_ENV === 'production'
    
    const launchOptions: any = {
      headless: true,
      args: isProduction ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
    }

    if (isProduction) {
      launchOptions.executablePath = await chromium.executablePath()
      launchOptions.defaultViewport = chromium.defaultViewport
    }
    
    browser = await puppeteer.launch(launchOptions)

    const page = await browser.newPage()
    
    // Set a longer timeout for page operations
    page.setDefaultTimeout(30000)
    page.setDefaultNavigationTimeout(30000)

    // Set content and wait for resources to load
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })

    // Additional wait to ensure Tailwind CSS is processed
    await page.waitForTimeout(2000)
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      preferCSSPageSize: false,
    })

    await browser.close()
    browser = null

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="brochure.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    
    // Clean up browser if it exists
    if (browser) {
      try {
        await browser.close()
      } catch (e) {
        console.error('Error closing browser:', e)
      }
    }

    // Return more detailed error message
    let errorMessage = error?.message || 'Failed to generate PDF'
    
    // Provide helpful error messages for common issues
    if (errorMessage.includes('executable') || errorMessage.includes('browser')) {
      errorMessage = 'Chromium not found. For local development, install Chromium or use: npm install puppeteer'
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'PDF generation timed out. The brochure might be too large. Please try again.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

