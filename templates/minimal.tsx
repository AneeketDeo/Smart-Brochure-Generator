import { TemplateProps } from './template-renderer'

export function renderMinimalTemplate({
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
    <section class="py-24 px-8 border-b-4" style="border-color: ${brandColor};">
      <div class="max-w-3xl mx-auto text-center">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-16 mx-auto mb-8" />` : ''}
        <h1 class="text-4xl font-light mb-6 tracking-wide">${content.hero_title}</h1>
        <p class="text-lg text-gray-600">${content.hero_subtitle}</p>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-8">
      <div class="max-w-5xl mx-auto">
        <div class="space-y-16">
          ${content.features
            .map(
              (feature) => `
            <div class="border-l-4 pl-8" style="border-color: ${brandColor};">
              <h3 class="text-2xl font-light mb-3">${feature.title}</h3>
              <p class="text-gray-600 leading-relaxed">${feature.description}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-20 px-8 bg-gray-50">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-light mb-8">About</h2>
        <p class="text-gray-700 leading-relaxed text-lg">${content.about}</p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-8">
      <div class="max-w-3xl mx-auto text-center">
        <p class="text-xl mb-8 text-gray-700">${content.cta}</p>
        <div class="flex flex-wrap justify-center gap-4">
          ${contactDetails.phone ? `<a href="tel:${contactDetails.phone}" class="px-8 py-3 border-2 rounded font-light hover:bg-gray-50" style="border-color: ${brandColor}; color: ${brandColor};">Call</a>` : ''}
          ${contactDetails.email ? `<a href="mailto:${contactDetails.email}" class="px-8 py-3 border-2 rounded font-light hover:bg-gray-50" style="border-color: ${brandColor}; color: ${brandColor};">Email</a>` : ''}
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 px-8 border-t">
      <div class="max-w-3xl mx-auto text-center text-gray-600">
        ${contactDetails.phone ? `<p>${contactDetails.phone}</p>` : ''}
        ${contactDetails.email ? `<p>${contactDetails.email}</p>` : ''}
        ${contactDetails.website ? `<p><a href="${contactDetails.website}" class="underline">${contactDetails.website}</a></p>` : ''}
      </div>
    </section>
  </div>
</body>
</html>
  `.trim()
}

