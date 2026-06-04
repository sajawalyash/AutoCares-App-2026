'use client'

import { useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Camera, Loader2 } from 'lucide-react'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  userType: 'customer' | 'mechanic'
  onSuccess: () => void
}

export function EditProfileModal({ isOpen, onClose, user, userType, onSuccess }: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    phone: user?.user_metadata?.phone || '',
    businessName: user?.user_metadata?.business_name || '',
    vehicleType: user?.user_metadata?.vehicle_type || 'car',
    shopAddress: user?.user_metadata?.shop_address || '',
  })

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return
    
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}-${Math.random()}.${fileExt}`

    setUploadingAvatar(true)
    setError(null)

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image. Make sure the avatars bucket exists.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setIsLoading(true)
    setError(null)

    try {
      const updates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        avatar_url: avatarUrl,
        ...(userType === 'mechanic' 
          ? { business_name: formData.businessName, shop_address: formData.shopAddress } 
          : { vehicle_type: formData.vehicleType }),
      }

      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) throw error
      
      // If mechanic, we should also update the mechanics table
      if (userType === 'mechanic' && formData.businessName) {
        await supabase
          .from('mechanics')
          .update({ business_name: formData.businessName })
          .eq('user_id', user.id)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and picture.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-3xl">
                    {formData.firstName?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition shadow-sm"
              >
                {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {userType === 'mechanic' ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopAddress">Shop Address (Optional)</Label>
                <Input
                  id="shopAddress"
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  placeholder="123 Auto Lane, City, State"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
