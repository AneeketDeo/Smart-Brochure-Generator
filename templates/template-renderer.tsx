import { BrochureContent } from '@/lib/ai/generateBrochure'
import { renderBasicTemplate } from './basic'
import { renderMinimalTemplate } from './minimal'
import { renderRealEstateTemplate } from './real-estate'
import { renderBusinessClassicTemplate } from './business-classic'

export interface TemplateProps {
  template: string
  content: BrochureContent
  brandColor: string
  logoUrl: string | null
  images: string[]
  contactDetails: {
    phone?: string
    whatsapp?: string
    email?: string
    website?: string
  }
}

export function renderTemplate(props: TemplateProps): string {
  switch (props.template) {
    case 'minimal':
      return renderMinimalTemplate(props)
    case 'real-estate':
      return renderRealEstateTemplate(props)
    case 'business-classic':
      return renderBusinessClassicTemplate(props)
    case 'basic':
    default:
      return renderBasicTemplate(props)
  }
}

