import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface BrochureContent {
  hero_title: string
  hero_subtitle: string
  features: Array<{ title: string; description: string }>
  about: string
  cta: string
  contact: string
}

export async function generateBrochureContent(params: {
  company: string
  industry: string
  audience: string
  purpose: string
  brief: string
}): Promise<BrochureContent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `You are an expert marketing copywriter.
Generate brochure content in structured JSON.

Business:
${params.company}
Industry:
${params.industry}
Target Audience:
${params.audience}
Purpose:
${params.purpose}
Brief:
${params.brief}

Return JSON only (no markdown, no code blocks):
{
  "hero_title": "",
  "hero_subtitle": "",
  "features": [{"title": "", "description": ""}],
  "about": "",
  "cta": "",
  "contact": ""
}`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const content = JSON.parse(cleanedText) as BrochureContent

    // Validate structure
    if (!content.hero_title || !content.hero_subtitle || !Array.isArray(content.features)) {
      throw new Error('Invalid content structure from AI')
    }

    return content
  } catch (error) {
    console.error('Error generating brochure content:', error)
    throw new Error('Failed to generate brochure content')
  }
}

