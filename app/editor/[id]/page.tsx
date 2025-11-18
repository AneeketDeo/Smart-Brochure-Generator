'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditorStore } from '@/store/editor-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Save, Download, Upload, Palette, Phone, Mail, Globe, MessageCircle } from 'lucide-react'
import { renderTemplate } from '@/templates/template-renderer'
import { generatePDFFromHTML, generatePDFFromIframe } from '@/lib/pdf/generatePDF'
import { generateImageFromHTML, generateImageFromIframe, ImageFormat } from '@/lib/export/imageExport'

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpg' | 'svg'>('pdf')
  const previewIframeRef = useRef<HTMLIFrameElement>(null)

  const {
    content,
    template,
    brandColor,
    logoUrl,
    images,
    contactDetails,
    setContent,
    setTemplate,
    setBrandColor,
    setLogoUrl,
    setContactDetails,
    updateContent,
  } = useEditorStore()

  useEffect(() => {
    fetchBrochure()
  }, [params.id])

  useEffect(() => {
    if (content) {
      updatePreview()
    }
  }, [content, template, brandColor, logoUrl, images, contactDetails])

  const fetchBrochure = async () => {
    try {
      const res = await fetch(`/api/brochures/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch brochure')
      const { brochure } = await res.json()

      if (brochure.content) {
        setContent(brochure.content as any)
      }
      setTemplate(brochure.template || 'basic')
      setBrandColor(brochure.brandColor || '#3b82f6')
      setLogoUrl(brochure.logoUrl || null)
      setContactDetails((brochure.contactDetails as any) || {})
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePreview = () => {
    if (!content) return
    const html = renderTemplate({
      template,
      content,
      brandColor,
      logoUrl,
      images,
      contactDetails,
    })
    setPreviewHtml(html)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/brochures/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          template,
          brandColor,
          logoUrl,
          images,
          contactDetails,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast({
        title: 'Success',
        description: 'Brochure saved successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    if (!previewHtml) {
      toast({
        title: 'Error',
        description: 'No content to export. Please wait for the preview to load.',
        variant: 'destructive',
      })
      return
    }

    setExporting(true)
    
    try {
      const filename = 'brochure'
      
      if (exportFormat === 'pdf') {
        // PDF export
        if (previewIframeRef.current) {
          try {
            await generatePDFFromIframe(previewIframeRef.current, 'brochure.pdf')
          } catch (iframeError: any) {
            console.warn('Iframe method failed, using HTML method:', iframeError)
            await generatePDFFromHTML(previewHtml, 'brochure.pdf')
          }
        } else {
          await generatePDFFromHTML(previewHtml, 'brochure.pdf')
        }
        
        toast({
          title: 'Success',
          description: 'PDF downloaded successfully',
        })
      } else {
        // Image export (PNG, JPG, SVG)
        const imageFormat = exportFormat as ImageFormat
        
        if (previewIframeRef.current) {
          try {
            await generateImageFromIframe(previewIframeRef.current, imageFormat, filename)
          } catch (iframeError: any) {
            console.warn('Iframe method failed, using HTML method:', iframeError)
            await generateImageFromHTML(previewHtml, imageFormat, filename)
          }
        } else {
          await generateImageFromHTML(previewHtml, imageFormat, filename)
        }
        
        toast({
          title: 'Success',
          description: `${exportFormat.toUpperCase()} downloaded successfully`,
        })
      }
    } catch (error: any) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: error.message || `Failed to generate ${exportFormat.toUpperCase()}. Please try again.`,
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const { url } = await res.json()
      setLogoUrl(url)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Brochure Editor</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <div className="flex gap-2">
              <Button 
                onClick={handleExport} 
                disabled={exporting || !previewHtml}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'png' | 'jpg' | 'svg')}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={exporting || !previewHtml}
                title="Select export format"
              >
                <option value="pdf">PDF</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="svg">SVG</option>
              </select>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="basic">Basic</option>
                  <option value="minimal">Minimal</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="business-classic">Business Classic</option>
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Color</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-10 w-20 rounded border"
                />
                <Input
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
              </CardHeader>
              <CardContent>
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" className="h-20 mb-4" />
                )}
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={content.hero_title}
                    onChange={(e) =>
                      updateContent({ hero_title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Textarea
                    value={content.hero_subtitle}
                    onChange={(e) =>
                      updateContent({ hero_subtitle: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.features.map((feature, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded">
                    <Label>Feature {index + 1} Title</Label>
                    <Input
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...content.features]
                        newFeatures[index].title = e.target.value
                        updateContent({ features: newFeatures })
                      }}
                    />
                    <Label>Description</Label>
                    <Textarea
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...content.features]
                        newFeatures[index].description = e.target.value
                        updateContent({ features: newFeatures })
                      }}
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content.about}
                  onChange={(e) => updateContent({ about: e.target.value })}
                  rows={5}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CTA</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content.cta}
                  onChange={(e) => updateContent({ cta: e.target.value })}
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={contactDetails.phone || ''}
                    onChange={(e) =>
                      setContactDetails({ ...contactDetails, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Label>
                  <Input
                    id="contact-whatsapp"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={contactDetails.whatsapp || ''}
                    onChange={(e) =>
                      setContactDetails({ ...contactDetails, whatsapp: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="contact@example.com"
                    value={contactDetails.email || ''}
                    onChange={(e) =>
                      setContactDetails({ ...contactDetails, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="contact-website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={contactDetails.website || ''}
                    onChange={(e) =>
                      setContactDetails({ ...contactDetails, website: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border rounded-lg overflow-hidden bg-white"
                  style={{ minHeight: '800px' }}
                >
                  <iframe
                    ref={previewIframeRef}
                    srcDoc={previewHtml}
                    className="w-full h-full"
                    style={{ minHeight: '800px', border: 'none' }}
                    title="Preview"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

