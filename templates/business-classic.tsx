import { TemplateProps } from './template-renderer'
import { normalizeUrl } from '@/lib/utils/urlHelper'

export function renderBusinessClassicTemplate({
  content,
  brandColor,
  logoUrl,
  images,
  contactDetails,
}: TemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brochure</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Georgia', serif; }
  </style>
</head>
<body class="bg-white">
  <div class="min-h-screen">
    <!-- Header -->
    <header class="py-8 px-8 border-b-2" style="border-color: ${brandColor};">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-16" />` : '<div></div>'}
        <div class="text-right">
          ${contactDetails.phone ? `<p class="text-sm">${contactDetails.phone}</p>` : ''}
          ${contactDetails.email ? `<p class="text-sm">${contactDetails.email}</p>` : ''}
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="py-20 px-8">
      <div class="max-w-5xl mx-auto text-center">
        <h1 class="text-5xl font-bold mb-6" style="color: ${brandColor};">${content.hero_title}</h1>
        <p class="text-xl text-gray-700 leading-relaxed">${content.hero_subtitle}</p>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 px-8 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12" style="color: ${brandColor};">Our Services</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${content.features
            .map(
              (feature) => `
            <div class="bg-white p-8 rounded-lg shadow-md border-t-4" style="border-color: ${brandColor};">
              <h3 class="text-xl font-bold mb-4">${feature.title}</h3>
              <p class="text-gray-600 leading-relaxed">${feature.description}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-16 px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-8" style="color: ${brandColor};">About Our Company</h2>
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-700 leading-relaxed">${content.about}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-8" style="background-color: ${brandColor};">
      <div class="max-w-4xl mx-auto text-center text-white">
        <h2 class="text-3xl font-bold mb-6">${content.cta}</h2>
        <p class="text-lg mb-8 opacity-90">Contact us today to learn more about our services</p>
        <div class="flex flex-wrap justify-center gap-4">
          ${contactDetails.phone ? `<a href="tel:${contactDetails.phone}" class="px-6 py-3 bg-white text-gray-900 rounded font-semibold hover:bg-gray-100">Call Us</a>` : ''}
          ${contactDetails.email ? `<a href="mailto:${contactDetails.email}" class="px-6 py-3 bg-white text-gray-900 rounded font-semibold hover:bg-gray-100">Email Us</a>` : ''}
          ${contactDetails.website ? `<a href="${normalizeUrl(contactDetails.website)}" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-white text-gray-900 rounded font-semibold hover:bg-gray-100">Visit Website</a>` : ''}
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <footer class="py-12 px-8 bg-gray-900 text-white">
      <div class="max-w-5xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">Contact Information</h3>
            ${contactDetails.phone ? `<p>Phone: ${contactDetails.phone}</p>` : ''}
            ${contactDetails.email ? `<p>Email: ${contactDetails.email}</p>` : ''}
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Connect With Us</h3>
            ${contactDetails.website ? `<p><a href="${normalizeUrl(contactDetails.website)}" target="_blank" rel="noopener noreferrer" class="underline">${contactDetails.website}</a></p>` : ''}
            ${contactDetails.whatsapp ? `<p>WhatsApp: ${contactDetails.whatsapp}</p>` : ''}
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Additional Info</h3>
            <p class="text-gray-400">${content.contact}</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>
  `.trim()
}

