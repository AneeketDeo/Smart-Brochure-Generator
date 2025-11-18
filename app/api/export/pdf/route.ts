import { createRouteSupabaseClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import * as os from 'os'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

// Configure chromium to use /tmp for extraction in serverless environments
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // Set extraction path to /tmp which is writable in serverless environments
  const tmpDir = os.tmpdir()
  process.env.CHROMIUM_PATH = tmpDir
}

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
    const isVercel = process.env.VERCEL === '1'
    const isServerless = isProduction || isVercel
    
    const launchOptions: any = {
      headless: true,
      args: isServerless ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
    }

    if (isServerless) {
      try {
        // Configure chromium for serverless - it should extract to /tmp automatically
        // The CHROMIUM_PATH environment variable is set at the top of the file
        
        // Get executable path with error handling
        const executablePath = await chromium.executablePath()
        if (executablePath) {
          launchOptions.executablePath = executablePath
        } else {
          throw new Error('Failed to get chromium executable path')
        }
        launchOptions.defaultViewport = chromium.defaultViewport
      } catch (chromiumError: any) {
        console.error('Error getting chromium executable path:', chromiumError)
        console.error('Error details:', {
          message: chromiumError?.message,
          stack: chromiumError?.stack,
          env: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            CHROMIUM_PATH: process.env.CHROMIUM_PATH,
            TMPDIR: process.env.TMPDIR || os.tmpdir(),
          }
        })
        // Fallback: try to use system chromium or let puppeteer find it
        // In serverless, we still need chromium, so throw a more helpful error
        throw new Error(
          'Chromium executable not available. This may be a deployment configuration issue. ' +
          'Ensure @sparticuz/chromium is properly installed and compatible with your deployment platform. ' +
          `Error: ${chromiumError?.message || 'Unknown error'}`
        )
      }
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

    // Return PDF as binary response with proper headers for download
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="brochure.pdf"',
        'Content-Length': pdf.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
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
    if (errorMessage.includes('executable') || errorMessage.includes('browser') || errorMessage.includes('does not exist')) {
      if (errorMessage.includes('bin') || errorMessage.includes('does not exist')) {
        errorMessage = 'Chromium binary extraction failed. This is a serverless deployment issue. ' +
          'Please ensure @sparticuz/chromium is properly installed and compatible with your deployment platform. ' +
          'For local development, use: npm install puppeteer (which includes Chromium).'
      } else {
        errorMessage = 'Chromium not found. For local development, install Chromium or use: npm install puppeteer'
      }
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'PDF generation timed out. The brochure might be too large. Please try again.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

