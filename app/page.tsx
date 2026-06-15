import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/autocares-logo.png"
              alt="AutoCares Logo"
              width={48}
              height={48}
              priority
              className="w-12 h-12 rounded-lg"
            />
            <h1 className="text-2xl font-bold text-gray-900">AutoCares</h1>
          </div>
          <Link href="/auth/login">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Help is Just a Click Away
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get instant roadside assistance and AI-powered vehicle troubleshooting. Available 24/7 for cars, bikes, and scooters.
            </p>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button 
                  size="lg"
                  variant="outline"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 bg-white hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 relative mb-4 rounded-full overflow-hidden shadow-sm border border-gray-100">
                <Image src="/icons/chatbot.png" alt="AI Chatbot" fill className="object-cover" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Chatbot</h3>
              <p className="text-sm text-gray-600 mt-2">Get instant troubleshooting tips</p>
            </Card>
            <Card className="p-6 bg-white hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 relative mb-4 rounded-full overflow-hidden shadow-sm border border-gray-100">
                <Image src="/icons/mechanic.png" alt="Mechanics" fill className="object-cover" />
              </div>
              <h3 className="font-semibold text-gray-900">Mechanics</h3>
              <p className="text-sm text-gray-600 mt-2">Find nearby verified mechanics</p>
            </Card>
            <Card className="p-6 bg-white hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 relative mb-4 rounded-full overflow-hidden shadow-sm border border-gray-100">
                <Image src="/icons/obd.png" alt="OBD Diagnostics" fill className="object-cover" />
              </div>
              <h3 className="font-semibold text-gray-900">OBD Diagnostics</h3>
              <p className="text-sm text-gray-600 mt-2">Real-time vehicle health monitoring</p>
            </Card>
            <Card className="p-6 bg-white hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 relative mb-4 rounded-full overflow-hidden shadow-sm border border-gray-100">
                <Image src="/icons/sos.png" alt="SOS Button" fill className="object-cover" />
              </div>
              <h3 className="font-semibold text-gray-900">SOS Button</h3>
              <p className="text-sm text-gray-600 mt-2">Emergency assistance at your fingertips</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose AutoCares?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-0 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 relative mb-5 rounded-full overflow-hidden shadow-md border-2 border-purple-50">
                <Image src="/icons/fast-response.png" alt="Fast Response" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Response</h3>
              <p className="text-gray-600">
                Get connected with mechanics in minutes, not hours. Real-time tracking keeps you informed.
              </p>
            </Card>
            <Card className="p-8 border-0 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 relative mb-5 rounded-full overflow-hidden shadow-md border-2 border-purple-50">
                <Image src="/icons/chatbot.png" alt="Smart AI Assistant" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart AI Assistant</h3>
              <p className="text-gray-600">
                Our AI chatbot trained on vehicle data and OBD diagnostics helps diagnose issues before calling a mechanic.
              </p>
            </Card>
            <Card className="p-8 border-0 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 relative mb-5 rounded-full overflow-hidden shadow-md border-2 border-purple-50">
                <Image src="/icons/obd.png" alt="OBD-II Monitoring" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">OBD-II Monitoring</h3>
              <p className="text-gray-600">
                Connect your vehicle via Bluetooth OBD scanner for real-time diagnostics, health scores, and early issue detection.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-500 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Help?
          </h2>
          <p className="text-xl text-purple-50 mb-8">
            Join thousands of drivers who trust AutoCares for roadside assistance
          </p>
          <Link href="/auth/register">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
            >
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p>&copy; 2024 AutoCares. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
