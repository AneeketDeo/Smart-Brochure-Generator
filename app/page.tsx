import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-6xl font-bold text-gray-900">
          Smart Brochure Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create professional brochures in minutes with AI-powered content generation
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

