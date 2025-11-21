import html2canvas from 'html2canvas'

/**
 * Export HTML content as an image (PNG, JPG, or SVG)
 * This is useful for seamless single-image exports without page breaks
 */

export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'svg'

/**
 * Generate image from HTML content
 */
export async function generateImageFromHTML(
  html: string,
  format: ImageFormat = 'png',
  filename: string = 'brochure'
): Promise<void> {
  // Create a temporary container to render the HTML
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
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Wait for all images to load
    const images = container.querySelectorAll('img')
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
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (format === 'svg') {
      // For SVG, we'll convert the HTML to SVG
      await exportAsSVG(container, filename)
    } else {
      // For PNG/JPG, use html2canvas
      await exportAsRasterImage(container, format, filename)
    }
  } finally {
    // Clean up: remove the temporary container
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  }
}

/**
 * Generate image from iframe element - RECOMMENDED
 * This captures the exact preview as rendered
 */
export async function generateImageFromIframe(
  iframe: HTMLIFrameElement,
  format: ImageFormat = 'png',
  filename: string = 'brochure'
): Promise<void> {
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
    await new Promise((resolve) => setTimeout(resolve, 1500))

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
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (format === 'svg') {
      // For SVG, convert the iframe content
      await exportAsSVG(body, filename)
    } else {
      // For PNG/JPG, use html2canvas
      await exportAsRasterImage(body, format, filename)
    }
  } catch (error) {
    console.error('Error generating image from iframe:', error)
    throw error
  }
}

/**
 * Export as raster image (PNG or JPG)
 */
async function exportAsRasterImage(
  element: HTMLElement,
  format: ImageFormat,
  filename: string
): Promise<void> {
  // Capture the element as canvas with high quality
  const canvas = await html2canvas(element, {
    // @ts-expect-error: html2canvas scale option missing in types

    scale: 2, // High quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    allowTaint: false,
    removeContainer: false,
  })

  // Convert to the requested format
  const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const fileExtension = format === 'jpg' || format === 'jpeg' ? 'jpg' : 'png'
  const quality = format === 'jpg' || format === 'jpeg' ? 0.95 : undefined

  const dataUrl = canvas.toDataURL(mimeType, quality)

  // Create download link
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${filename}.${fileExtension}`
  link.style.display = 'none'

  // Trigger download
  document.body.appendChild(link)
  link.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link)
  }, 100)
}

/**
 * Export as SVG (vector format)
 * Note: This is a simplified SVG export that embeds the canvas as base64
 * For true vector SVG, you'd need a more complex solution
 */
async function exportAsSVG(element: HTMLElement, filename: string): Promise<void> {
  // First, capture as canvas
  const canvas = await html2canvas(element, {
    // @ts-expect-error: html2canvas scale option missing in types
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    allowTaint: false,
  })

  // Convert canvas to SVG with embedded image
  const imgData = canvas.toDataURL('image/png')
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${imgData}"/>
</svg>`

  // Create blob and download
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.svg`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

