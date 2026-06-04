'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { customerSignupSchema, type CustomerSignupInput } from '@/lib/validation/auth-schemas'
import { parseJsonResponse } from '@/lib/utils'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

export default function CustomerSignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CustomerSignupInput>({
    resolver: zodResolver(customerSignupSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: CustomerSignupInput) => {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/auth/signup-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          vehicleType: data.vehicleType || null,
          vehicleMake: data.vehicleMake || null,
          vehicleModel: data.vehicleModel || null,
          vehicleYear: data.vehicleYear || null,
        }),
      })

      const result = await parseJsonResponse(response)

      if (!response.ok) {
        const errorText =
          typeof result === 'object'
            ? result?.error || result?.message || 'Failed to create account. Please try again.'
            : String(result || 'Failed to create account. Please try again.')
        setErrorMessage(errorText)
        return
      }

      setSuccessMessage('Account created successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      console.error('[v0] Signup error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          {/* Back Button */}
          <Link
            href="/auth/register"
            className="flex items-center text-purple-600 hover:text-purple-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/autocares-logo.png"
              alt="AutoCares Logo"
              width={100}
              height={100}
              className="w-20 h-20 rounded-lg"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Driver Sign Up</h2>
          <p className="text-gray-600 mb-6">Get roadside assistance in minutes</p>

          {errorMessage && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-800 ml-2">{errorMessage}</span>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 ml-2">{successMessage}</span>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  {...register('firstName')}
                  placeholder="Sarim"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  {...register('lastName')}
                  placeholder="Ali"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                {...register('phoneNumber')}
                type="tel"
                placeholder="+92317XXXXXXX"
                disabled={isLoading}
              />
              {errors.phoneNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Min 8 chars, 1 uppercase, 1 number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  {...register('vehicleType')}
                  placeholder="Car, Truck, Bike"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  {...register('vehicleMake')}
                  placeholder="Toyota, Honda"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  {...register('vehicleModel')}
                  placeholder="Camry, Civic"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  {...register('vehicleYear')}
                  placeholder="2020"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('agreeToTerms')}
                className="w-4 h-4 rounded border-gray-300 mt-1"
                disabled={isLoading}
              />
              <label className="ml-2 text-sm text-gray-700">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-600 text-xs">{errors.agreeToTerms.message}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 font-semibold"
            >
              {isLoading && <Spinner className="w-4 h-4" />}
              {isLoading ? 'Creating Account...' : 'Create Driver Account'}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-600 hover:underline font-semibold">
              Login
            </Link>
          </p>

          <p className="text-center text-gray-600 mt-2 text-sm">
            Are you a mechanic?{' '}
            <Link href="/auth/mechanic-signup" className="text-purple-600 hover:underline font-semibold">
              Sign up here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
