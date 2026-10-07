import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      businessName,
      specializations,
      yearsOfExperience,
      certifications,
      mechanicType,
      cnicNumber,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phoneNumber || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Validate years of experience is a number
    if (yearsOfExperience && (isNaN(yearsOfExperience) || yearsOfExperience < 0)) {
      return NextResponse.json(
        { error: 'Years of experience must be a valid number' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          user_type: 'mechanic',
        },
      },
    })

    if (authError) {
      console.error('[v0] Auth signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      )
    }

    // Create mechanic profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        user_type: 'mechanic',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('[v0] Profile creation error:', profileError)
      // Don't fail signup if profile creation fails
    }

    // Create mechanic-specific record
    const { error: mechanicError } = await supabase
      .from('mechanics')
      .insert({
        user_id: authData.user.id,
        business_name: businessName,
        email,
        phone: phoneNumber,
        specializations: specializations || [],
        years_of_experience: yearsOfExperience || null,
        certifications: certifications || [],
        mechanic_type: mechanicType,
        cnic_number: cnicNumber,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
        latitude: latitude || null,
        longitude: longitude || null,
        rating: 5.0,
        total_reviews: 0,
        is_verified: false,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (mechanicError) {
      console.error('[v0] Mechanic record creation error:', mechanicError)
      // Don't fail signup if mechanic record creation fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Mechanic account created successfully',
        userId: authData.user.id,
        requiresEmailVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Unexpected error in mechanic signup:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
