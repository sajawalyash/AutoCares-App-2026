import { z } from 'zod'

// Common validation rules
const emailSchema = z.string().email('Invalid email address')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const nameSchema = z
  .string()
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Must be less than 50 characters')

const phoneSchema = z
  .string()
  .regex(
    /^03[0-9]{9}$/,
    'Phone number must be exactly 11 digits and start with 03'
  )

// Customer signup schema
export const customerSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  phoneNumber: phoneSchema,
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type CustomerSignupInput = z.infer<typeof customerSignupSchema>

// Mechanic signup schema
export const mechanicSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  phoneNumber: phoneSchema,
  businessName: z
    .string()
    .min(3, 'Business name must be at least 3 characters')
    .max(100, 'Business name must be less than 100 characters'),
  specializations: z.array(z.string()).optional(),
  yearsOfExperience: z
    .number()
    .min(0, 'Years of experience cannot be negative')
    .max(70, 'Years of experience must be realistic')
    .optional(),
  certifications: z.array(z.string()).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type MechanicSignupInput = z.infer<typeof mechanicSignupSchema>

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
