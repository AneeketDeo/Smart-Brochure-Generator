# Troubleshooting Guide

## PDF Export Issues

### Local Development

If PDF export is not working locally, you may need to install Chromium:

**Windows:**
```bash
# Option 1: Install puppeteer (includes Chromium)
npm install puppeteer

# Option 2: Use Playwright instead (alternative)
npm install playwright
```

**Mac/Linux:**
```bash
# Install Chromium via package manager
# Ubuntu/Debian:
sudo apt-get install chromium-browser

# macOS:
brew install chromium
```

### Common PDF Export Errors

1. **"Failed to generate PDF"**
   - Check browser console for detailed error messages
   - Ensure you're signed in (session required)
   - Verify the preview HTML is loaded before exporting

2. **"Invalid PDF response"**
   - The server might be timing out
   - Try reducing the brochure content size
   - Check server logs for Puppeteer errors

3. **PDF is blank or missing styles**
   - Tailwind CSS CDN might not be loading in Puppeteer
   - Wait a few seconds after preview loads before exporting
   - Check if images/logos are loading correctly

### Serverless Deployment (Vercel)

The PDF export uses `@sparticuz/chromium` which is optimized for serverless environments. Make sure:

1. The function timeout is set to at least 30 seconds
2. Memory is set to at least 512MB (recommended: 1024MB)
3. The `@sparticuz/chromium` package is properly installed

### Debugging Tips

1. **Check Network Tab**: Look for failed requests to `/api/export/pdf`
2. **Check Console**: Look for JavaScript errors in the browser console
3. **Check Server Logs**: Look for Puppeteer/Chromium errors
4. **Test HTML**: Copy the preview HTML and test it in a standalone HTML file

### Alternative Solutions

If Puppeteer continues to have issues, consider:

1. **Client-side PDF generation** using libraries like:
   - `jsPDF` with `html2canvas`
   - `react-pdf`
   - `pdfmake`

2. **Third-party PDF service**:
   - PDFShift API
   - HTML/CSS to PDF API
   - Browserless.io

