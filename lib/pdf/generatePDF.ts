import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generate PDF from HTML content using client-side rendering
 * This is Vercel-friendly and doesn't require serverless Chromium
 * 
 * Improved version that:
 * - Matches preview layout exactly
 * - Handles smart page breaks
 * - Preserves all styling
 */
export async function generatePDFFromHTML(html: string, filename: string = 'brochure.pdf'): Promise<void> {
  // Create a temporary container to render the HTML with exact preview dimensions
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '210mm' // A4 width in mm
  container.style.maxWidth = '210mm'
  container.style.margin = '0'
  container.style.padding = '0'
  container.style.backgroundColor = '#ffffff'
  container.style.overflow = 'visible'
  container.innerHTML = html
  
  // Append to body temporarily
  document.body.appendChild(container)
  
  try {
    // Wait for Tailwind CDN and all resources to load
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Wait for all images to load
    const images = container.querySelectorAll('img')
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve()
        return new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = resolve // Continue even if image fails
          setTimeout(resolve, 3000) // Timeout after 3s
        })
      })
    )
    
    // Additional wait for styles to fully apply
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Capture the container as canvas with high quality
    const canvas = await html2canvas(container, {
      scale: 2, // High quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: container.scrollWidth,
      height: container.scrollHeight,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
      allowTaint: false,
      removeContainer: false,
    })
    
    // Calculate PDF dimensions (A4: 210mm x 297mm)
    const pdfWidth = 210 // A4 width in mm
    const pdfHeight = 297 // A4 height in mm
    const margin = 5 // Small margin to avoid edge cutting
    
    // Calculate image dimensions maintaining aspect ratio
    const imgWidth = pdfWidth - (margin * 2)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Smart page break: Split content with better handling
    const pageHeight = pdfHeight - (margin * 2)
    let yPosition = margin
    let sourceY = 0
    let remainingHeight = imgHeight
    
    // Try to detect natural break points (sections) in the HTML
    const sections = container.querySelectorAll('section, .section, [class*="section"]')
    const breakPoints: number[] = []
    
    if (sections.length > 0) {
      // Calculate approximate Y positions of sections
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const relativeY = (rect.top / container.scrollHeight) * imgHeight
        breakPoints.push(relativeY)
      })
    }
    
    while (remainingHeight > 0) {
      // Calculate how much we can fit on this page
      let heightOnPage = Math.min(remainingHeight, pageHeight)
      
      // Try to align with a natural break point if we're close
      if (breakPoints.length > 0 && yPosition > margin) {
        const nextBreakPoint = breakPoints.find(bp => bp > sourceY && bp < sourceY + heightOnPage + 20)
        if (nextBreakPoint && nextBreakPoint - sourceY < pageHeight) {
          // Adjust to break at the section boundary
          heightOnPage = nextBreakPoint - sourceY
        }
      }
      
      // Ensure we don't have a tiny slice at the end
      if (remainingHeight - heightOnPage < 10 && remainingHeight - heightOnPage > 0) {
        heightOnPage = remainingHeight // Fit the rest on this page
      }
      
      const sourceHeight = (heightOnPage / imgHeight) * canvas.height
      
      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceHeight
      const pageCtx = pageCanvas.getContext('2d')
      
      if (pageCtx) {
        // Draw the slice of the original canvas
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight, // Source
          0, 0, canvas.width, sourceHeight // Destination
        )
        
        // Add to PDF
        if (yPosition > margin) {
          pdf.addPage()
          yPosition = margin
        }
        
        pdf.addImage(
          pageCanvas.toDataURL('image/png', 0.95),
          'PNG',
          margin,
          yPosition,
          imgWidth,
          heightOnPage
        )
      }
      
      // Update positions for next iteration
      sourceY += sourceHeight
      remainingHeight -= heightOnPage
      yPosition += heightOnPage
    }
    
    // Save the PDF
    pdf.save(filename)
  } finally {
    // Clean up: remove the temporary container
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  }
}

/**
 * Generate PDF from an iframe element - RECOMMENDED
 * This captures the exact preview as rendered, ensuring perfect layout matching
 */
export async function generatePDFFromIframe(iframe: HTMLIFrameElement, filename: string = 'brochure.pdf'): Promise<void> {
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      throw new Error('Cannot access iframe content. Make sure the iframe is from the same origin.')
    }
    
    const body = iframeDoc.body
    if (!body) {
      throw new Error('Iframe body not found')
    }
    
    // Wait for Tailwind CDN and all styles to load
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Wait for all images to load
    const images = body.querySelectorAll('img')
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve()
        return new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve // Continue even if image fails
          setTimeout(resolve, 3000) // Timeout after 3s
        })
      })
    )
    
    // Additional wait for styles to fully apply
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Capture the iframe content with high quality
    const canvas = await html2canvas(body, {
      scale: 2, // High quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: body.scrollWidth,
      height: body.scrollHeight,
      windowWidth: body.scrollWidth,
      windowHeight: body.scrollHeight,
      allowTaint: false,
    })
    
    // Calculate PDF dimensions (A4: 210mm x 297mm)
    const pdfWidth = 210 // A4 width in mm
    const pdfHeight = 297 // A4 height in mm
    const margin = 5 // Small margin to avoid edge cutting
    
    // Calculate image dimensions maintaining aspect ratio
    const imgWidth = pdfWidth - (margin * 2)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Smart page break: Split content with better handling
    const pageHeight = pdfHeight - (margin * 2)
    let yPosition = margin
    let sourceY = 0
    let remainingHeight = imgHeight
    
    // Try to detect natural break points (sections) in the HTML
    const sections = body.querySelectorAll('section, .section, [class*="section"]')
    const breakPoints: number[] = []
    
    if (sections.length > 0) {
      // Calculate approximate Y positions of sections
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const relativeY = (rect.top / body.scrollHeight) * imgHeight
        breakPoints.push(relativeY)
      })
    }
    
    while (remainingHeight > 0) {
      // Calculate how much we can fit on this page
      let heightOnPage = Math.min(remainingHeight, pageHeight)
      
      // Try to align with a natural break point if we're close
      if (breakPoints.length > 0 && yPosition > margin) {
        const nextBreakPoint = breakPoints.find(bp => bp > sourceY && bp < sourceY + heightOnPage + 20)
        if (nextBreakPoint && nextBreakPoint - sourceY < pageHeight) {
          // Adjust to break at the section boundary
          heightOnPage = nextBreakPoint - sourceY
        }
      }
      
      // Ensure we don't have a tiny slice at the end
      if (remainingHeight - heightOnPage < 10 && remainingHeight - heightOnPage > 0) {
        heightOnPage = remainingHeight // Fit the rest on this page
      }
      
      const sourceHeight = (heightOnPage / imgHeight) * canvas.height
      
      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceHeight
      const pageCtx = pageCanvas.getContext('2d')
      
      if (pageCtx) {
        // Draw the slice of the original canvas
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight, // Source
          0, 0, canvas.width, sourceHeight // Destination
        )
        
        // Add to PDF
        if (yPosition > margin) {
          pdf.addPage()
          yPosition = margin
        }
        
        pdf.addImage(
          pageCanvas.toDataURL('image/png', 0.95),
          'PNG',
          margin,
          yPosition,
          imgWidth,
          heightOnPage
        )
      }
      
      // Update positions for next iteration
      sourceY += sourceHeight
      remainingHeight -= heightOnPage
      yPosition += heightOnPage
    }
    
    pdf.save(filename)
  } catch (error) {
    console.error('Error generating PDF from iframe:', error)
    throw error
  }
}

