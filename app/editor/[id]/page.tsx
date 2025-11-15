'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditorStore } from '@/store/editor-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Save, Download, Upload, Palette } from 'lucide-react'
import { renderTemplate } from '@/templates/template-renderer'

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

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

  const handleExportPDF = async () => {
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
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: previewHtml }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to generate PDF' }))
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      const blob = await res.blob()
      
      // Check if blob is actually a PDF
      if (blob.type !== 'application/pdf' && blob.size === 0) {
        throw new Error('Invalid PDF response from server')
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'brochure.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      })
    } catch (error: any) {
      console.error('PDF export error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate PDF. Please try again.',
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
            <Button onClick={handleExportPDF} disabled={exporting || !previewHtml}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
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

