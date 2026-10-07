'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, AlertCircle, Car, Loader } from 'lucide-react'

export interface IncomingRequestData {
  id: string
  problem: string
  location: string
  vehicle_info: string
  additional_notes?: string
  created_at: string
}

interface IncomingRequestModalProps {
  request: IncomingRequestData | null
  onAccept: (requestId: string) => Promise<void>
  onReject: (requestId: string) => Promise<void>
}

export function IncomingRequestModal({ request, onAccept, onReject }: IncomingRequestModalProps) {
  const [loadingAction, setLoadingAction] = useState<'accept' | 'reject' | null>(null)

  // Play a sound when a new request arrives
  useEffect(() => {
    if (request) {
      const audio = new Audio('/notification.mp3') // Assume an audio file exists or will be added
      audio.play().catch(e => console.log('Audio play blocked:', e))
    }
  }, [request])

  if (!request) return null

  const handleAccept = async () => {
    setLoadingAction('accept')
    try {
      await onAccept(request.id)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleReject = async () => {
    setLoadingAction('reject')
    try {
      await onReject(request.id)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <Dialog open={!!request} onOpenChange={(open) => {
      // Prevent closing by clicking outside
      if (!open) {
        // Do nothing, force user to accept or reject
      }
    }}>
      <DialogContent className="sm:max-w-md border-l-4 border-l-purple-600 bg-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <div className="animate-pulse bg-purple-100 p-2 rounded-full">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold">New Service Request!</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            A driver nearby needs your assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="bg-purple-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Issue</p>
                <p className="text-sm font-medium text-gray-900">{request.problem}</p>
                {request.additional_notes && (
                  <p className="text-xs text-gray-600 mt-1">{request.additional_notes}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Location</p>
                <p className="text-sm font-medium text-gray-900">{request.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Car className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Vehicle</p>
                <p className="text-sm font-medium text-gray-900">{request.vehicle_info || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleReject}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'reject' ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            Decline
          </Button>
          <Button
            type="button"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleAccept}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'accept' ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            Accept Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
