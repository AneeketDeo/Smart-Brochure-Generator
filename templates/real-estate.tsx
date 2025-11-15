import { TemplateProps } from './template-renderer'

export function renderRealEstateTemplate({
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
    <section class="relative py-32 px-8 text-white" style="background: linear-gradient(135deg, ${brandColor}, ${brandColor}dd);">
      <div class="max-w-5xl mx-auto relative z-10">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-24 mx-auto mb-8" />` : ''}
        <h1 class="text-6xl font-bold mb-6 text-center">${content.hero_title}</h1>
        <p class="text-2xl text-center opacity-90">${content.hero_subtitle}</p>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-8">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-16" style="color: ${brandColor};">Why Choose Us</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          ${content.features
            .map(
              (feature) => `
            <div class="flex gap-6">
              <div class="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style="background-color: ${brandColor};">
                ${content.features.indexOf(feature) + 1}
              </div>
              <div>
                <h3 class="text-2xl font-bold mb-3">${feature.title}</h3>
                <p class="text-gray-600 text-lg">${feature.description}</p>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-20 px-8 bg-gray-100">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-4xl font-bold mb-8" style="color: ${brandColor};">About Our Properties</h2>
        <p class="text-lg text-gray-700 leading-relaxed">${content.about}</p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-8" style="background-color: ${brandColor};">
      <div class="max-w-4xl mx-auto text-center text-white">
        <h2 class="text-4xl font-bold mb-8">${content.cta}</h2>
        <div class="flex flex-wrap justify-center gap-6 mt-10">
          ${contactDetails.phone ? `<a href="tel:${contactDetails.phone}" class="px-8 py-4 bg-white text-gray-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition">📞 Call Now</a>` : ''}
          ${contactDetails.whatsapp ? `<a href="https://wa.me/${contactDetails.whatsapp.replace(/[^0-9]/g, '')}" class="px-8 py-4 bg-white text-gray-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition">💬 WhatsApp</a>` : ''}
          ${contactDetails.email ? `<a href="mailto:${contactDetails.email}" class="px-8 py-4 bg-white text-gray-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition">✉️ Email</a>` : ''}
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 px-8 bg-gray-900 text-white">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl font-bold mb-8">Get In Touch</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            ${contactDetails.phone ? `<p class="text-lg mb-2"><strong>Phone:</strong> ${contactDetails.phone}</p>` : ''}
            ${contactDetails.whatsapp ? `<p class="text-lg mb-2"><strong>WhatsApp:</strong> ${contactDetails.whatsapp}</p>` : ''}
          </div>
          <div>
            ${contactDetails.email ? `<p class="text-lg mb-2"><strong>Email:</strong> ${contactDetails.email}</p>` : ''}
            ${contactDetails.website ? `<p class="text-lg mb-2"><strong>Website:</strong> <a href="${contactDetails.website}" class="underline">${contactDetails.website}</a></p>` : ''}
          </div>
        </div>
        <p class="mt-8 text-gray-400">${content.contact}</p>
      </div>
    </section>
  </div>
</body>
</html>
  `.trim()
}

