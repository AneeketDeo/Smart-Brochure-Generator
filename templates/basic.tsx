import { TemplateProps } from './template-renderer'

export function renderBasicTemplate({
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
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-white">
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-8" style="background: linear-gradient(to right, ${brandColor}, ${brandColor}dd);">
      <div class="max-w-4xl mx-auto text-center">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-20 mx-auto mb-8" />` : ''}
        <h1 class="text-5xl font-bold mb-6">${content.hero_title}</h1>
        <p class="text-xl opacity-90">${content.hero_subtitle}</p>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 px-8">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12">Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${content.features
            .map(
              (feature) => `
            <div class="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 class="text-xl font-semibold mb-3" style="color: ${brandColor};">${feature.title}</h3>
              <p class="text-gray-600">${feature.description}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-16 px-8 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-8">About Us</h2>
        <p class="text-lg text-gray-700 leading-relaxed">${content.about}</p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-8" style="background-color: ${brandColor};">
      <div class="max-w-4xl mx-auto text-center text-white">
        <h2 class="text-3xl font-bold mb-6">${content.cta}</h2>
        <div class="flex flex-wrap justify-center gap-4 mt-8">
          ${contactDetails.phone ? `<a href="tel:${contactDetails.phone}" class="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100">Call Us</a>` : ''}
          ${contactDetails.email ? `<a href="mailto:${contactDetails.email}" class="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100">Email Us</a>` : ''}
          ${contactDetails.website ? `<a href="${contactDetails.website}" target="_blank" class="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100">Visit Website</a>` : ''}
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 px-8 bg-gray-900 text-white">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-8">Contact Us</h2>
        <div class="space-y-4">
          ${contactDetails.phone ? `<p><strong>Phone:</strong> ${contactDetails.phone}</p>` : ''}
          ${contactDetails.whatsapp ? `<p><strong>WhatsApp:</strong> ${contactDetails.whatsapp}</p>` : ''}
          ${contactDetails.email ? `<p><strong>Email:</strong> ${contactDetails.email}</p>` : ''}
          ${contactDetails.website ? `<p><strong>Website:</strong> <a href="${contactDetails.website}" class="underline">${contactDetails.website}</a></p>` : ''}
        </div>
        <p class="mt-8 text-gray-400">${content.contact}</p>
      </div>
    </section>
  </div>
</body>
</html>
  `.trim()
}

