'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Wrench, Car } from 'lucide-react'

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/autocares-logo.png"
            alt="AutoCares Logo"
            width={100}
            height={100}
            priority
            className="w-24 h-24 rounded-lg"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Join AutoCares</h1>
          <p className="text-xl text-gray-600">Choose your role to get started</p>
        </div>

        {/* Registration Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Customer Registration */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-300">
            <Link href="/auth/customer-signup" className="block">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-6">
                  <Car className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Driver/Customer</h3>
                <p className="text-gray-600 mb-6">
                  Need roadside assistance? Sign up as a customer to request help anytime.
                </p>
                <ul className="text-left space-y-2 mb-6 w-full">
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="text-purple-600 font-bold mr-2">✓</span>
                    Request roadside assistance
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="text-purple-600 font-bold mr-2">✓</span>
                    Get help in minutes
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="text-purple-600 font-bold mr-2">✓</span>
                    AI-powered troubleshooting
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="text-purple-600 font-bold mr-2">✓</span>
                    Track mechanics in real-time
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Sign Up as Customer
                </Button>
              </div>
            </Link>
          </Card>

          {/* Mechanic Registration */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-300">
            <Link href="/auth/mechanic-signup" className="block">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-6">
                  <Wrench className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Mechanic/Service Provider</h3>
                <p className="text-gray-600 mb-6">
                  Grow your business. Sign up to accept service requests and reach more customers.
                </p>
                <ul className="text-left space-y-2 mb-6 w-full">
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="text-purple-600 font-bold mr-2">✓</span>
                    Receive service requests
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="text-purple-600 font-bold mr-2">✓</span>
                    Build your reputation
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="text-purple-600 font-bold mr-2">✓</span>
                    Manage your availability
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="text-purple-600 font-bold mr-2">✓</span>
                    Grow your income
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Sign Up as Mechanic
                </Button>
              </div>
            </Link>
          </Card>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-600 hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
