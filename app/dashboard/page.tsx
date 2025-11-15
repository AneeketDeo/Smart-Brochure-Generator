'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Edit, FileText } from 'lucide-react'

interface Brochure {
  id: string
  title: string
  template: string
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [brochures, setBrochures] = useState<Brochure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrochures()
  }, [])

  const fetchBrochures = async () => {
    try {
      const res = await fetch('/api/brochures')
      if (!res.ok) throw new Error('Failed to fetch brochures')
      const data = await res.json()
      setBrochures(data.brochures || [])
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brochure?')) return

    try {
      const res = await fetch(`/api/brochures/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete brochure')

      toast({
        title: 'Success',
        description: 'Brochure deleted successfully',
      })

      fetchBrochures()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Smart Brochure Generator</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">My Brochures</h2>
            <p className="text-muted-foreground mt-2">
              Create and manage your brochure projects
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/create">
              <Plus className="mr-2 h-4 w-4" />
              New Brochure
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : brochures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No brochures yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first brochure
              </p>
              <Button asChild>
                <Link href="/dashboard/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Brochure
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brochures.map((brochure) => (
              <Card key={brochure.id}>
                <CardHeader>
                  <CardTitle className="truncate">{brochure.title}</CardTitle>
                  <CardDescription>
                    Template: {brochure.template}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
                      <Link href={`/editor/${brochure.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(brochure.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Updated: {new Date(brochure.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

