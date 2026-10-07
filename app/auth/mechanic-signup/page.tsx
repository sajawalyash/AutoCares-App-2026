'use client'

import Image from 'next/image'
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
import { mechanicSignupSchema, type MechanicSignupInput } from '@/lib/validation/auth-schemas'
import { parseJsonResponse } from '@/lib/utils'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

export default function MechanicSignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MechanicSignupInput>({
    resolver: zodResolver(mechanicSignupSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: MechanicSignupInput) => {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/auth/signup-mechanic', {
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
          businessName: data.businessName,
          mechanicType: data.mechanicType,
          cnicNumber: data.cnicNumber,
          specializations: data.specializations || [],
          yearsOfExperience: data.yearsOfExperience || null,
          certifications: data.certifications || [],
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          zipCode: data.zipCode || null,
          latitude: data.latitude,
          longitude: data.longitude,
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
            <Image
              src="/autocares-logo.png"
              alt="AutoCares Logo"
              width={100}
              height={100}
              priority
              className="w-20 h-20 rounded-lg"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Provider Sign Up</h2>
          <p className="text-gray-600 mb-6">Join our network and grow your business</p>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
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
                  Last Name <span className="text-red-500">*</span>
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
                Business Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('businessName')}
                placeholder="John's Auto Repair"
                disabled={isLoading}
              />
              {errors.businessName && (
                <p className="text-red-600 text-xs mt-1">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mechanic Type <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col space-y-2 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="Car Mechanic"
                    {...register('mechanicType')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">Car Mechanic</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="Bike Mechanic"
                    {...register('mechanicType')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">Bike Mechanic</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="Both (Car & Bike)"
                    {...register('mechanicType')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">Both (Car & Bike)</span>
                </label>
              </div>
              {errors.mechanicType && (
                <p className="text-red-600 text-xs mt-1">{errors.mechanicType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('cnicNumber')}
                placeholder="13 Digits CNIC Number"
                disabled={isLoading}
                maxLength={13}
              />
              {errors.cnicNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.cnicNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="mechanic@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('phoneNumber')}
                type="tel"
                placeholder="03123456789"
                disabled={isLoading}
              />
              {errors.phoneNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  {...register('city')}
                  placeholder="Karachi"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  {...register('state')}
                  placeholder="Sindh"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Hidden Inputs for Geolocation */}
            <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
            <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Service Location 📍
              </label>
              <p className="text-xs text-purple-700 mb-3">
                Help customers find you by pinpointing your exact GPS location.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600 font-mono">
                  {watch('latitude') && watch('longitude') ? (
                    <span className="text-green-600 font-bold">
                      Location saved! ({watch('latitude')?.toFixed(4)}, {watch('longitude')?.toFixed(4)})
                    </span>
                  ) : (
                    "No location saved"
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white border-purple-200 text-purple-700 hover:bg-purple-100"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setValue('latitude', position.coords.latitude, { shouldValidate: true })
                          setValue('longitude', position.coords.longitude, { shouldValidate: true })
                        },
                        (err) => console.error(err)
                      )
                    } else {
                      alert("Geolocation is not supported by your browser.")
                    }
                  }}
                >
                  Pinpoint Location
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience <span className="text-gray-400">(optional)</span>
              </label>
              <Input
                {...register('yearsOfExperience', { valueAsNumber: true })}
                type="number"
                placeholder="5"
                min="0"
                max="70"
                disabled={isLoading}
              />
              {errors.yearsOfExperience && (
                <p className="text-red-600 text-xs mt-1">{errors.yearsOfExperience.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
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
                Confirm Password <span className="text-red-500">*</span>
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
              {isLoading ? 'Creating Account...' : 'Create Service Provider Account'}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-600 hover:underline font-semibold">
              Login
            </Link>
          </p>

          <p className="text-center text-gray-600 mt-2 text-sm">
            Are you a driver?{' '}
            <Link href="/auth/customer-signup" className="text-purple-600 hover:underline font-semibold">
              Sign up here
            </Link>
          </p>

          <p className="text-center text-gray-500 mt-4 text-xs">
            Your account will be pending verification before accepting service requests
          </p>
        </div>
      </Card>
    </div>
  )
}
