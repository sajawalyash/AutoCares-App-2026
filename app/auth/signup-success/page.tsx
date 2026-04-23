'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Mail } from 'lucide-react'

export default function SignUpSuccess() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth/login')
    }, 10000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Welcome to AutoCares!
          </h1>

          <p className="text-gray-600 text-center mb-6">
            Your account has been created successfully. Please verify your email to access all features.
          </p>

          {/* Email Verification Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  Verify Your Email
                </p>
                <p className="text-sm text-gray-600">
                  We've sent a confirmation link to your email address. Click the link to verify your account.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <p className="text-sm text-gray-700">Check your email inbox</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <p className="text-sm text-gray-700">Click the verification link</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <p className="text-sm text-gray-700">Return and sign in to your account</p>
            </div>
          </div>

          {/* Buttons */}
          <Link href="/auth/login">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-3">
              Go to Login
            </Button>
          </Link>

          <p className="text-center text-sm text-gray-600">
            Redirecting to login in 10 seconds...
          </p>
        </div>
      </Card>
    </div>
  )
}
