'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function CreateBrochurePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    industry: '',
    audience: '',
    purpose: '',
    brief: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate AI content
      const generateRes = await fetch('/api/brochures/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formData.company,
          industry: formData.industry,
          audience: formData.audience,
          purpose: formData.purpose,
          brief: formData.brief,
        }),
      })

      if (!generateRes.ok) {
        throw new Error('Failed to generate content')
      }

      const { content } = await generateRes.json()

      // Create brochure
      const createRes = await fetch('/api/brochures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${formData.company} Brochure`,
          brief: formData.brief,
          content,
          template: 'basic',
          brandColor: '#3b82f6',
          contactDetails: {
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            email: formData.email,
            website: formData.website,
          },
        }),
      })

      if (!createRes.ok) {
        throw new Error('Failed to create brochure')
      }

      const { brochure } = await createRes.json()

      toast({
        title: 'Success',
        description: 'Brochure created successfully',
      })

      router.push(`/editor/${brochure.id}`)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Brochure</CardTitle>
            <CardDescription>
              Fill in the details below to generate your AI-powered brochure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience *</Label>
                <Input
                  id="audience"
                  value={formData.audience}
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Brochure *</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brief">Brief *</Label>
                <Textarea
                  id="brief"
                  value={formData.brief}
                  onChange={(e) =>
                    setFormData({ ...formData, brief: e.target.value })
                  }
                  rows={5}
                  required
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Brochure
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

