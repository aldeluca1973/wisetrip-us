import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Users, 
  Map, 
  Smartphone, 
  Star, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Globe,
  Calendar,
  MapPin,
  Plane
} from 'lucide-react'
import { Navigation } from '@/components/navigation'

const features = [
  {
    icon: Brain,
    title: "AI-Powered Planning",
    description: "Our advanced AI creates personalized itineraries based on your preferences, budget, and travel style."
  },
  {
    icon: Users,
    title: "Collaborative Planning",
    description: "Invite friends and family to plan together. Vote on activities, share ideas, and make decisions as a group."
  },
  {
    icon: Map,
    title: "Interactive Maps",
    description: "Visualize your trip with interactive maps. Drag and drop activities to optimize your daily routes."
  },
  {
    icon: Smartphone,
    title: "Mobile-First Experience",
    description: "Access your trips offline, get real-time updates, and navigate seamlessly on any device."
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description: "Get personalized suggestions for restaurants, attractions, and hidden gems based on your interests."
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Plan trips anywhere in the world with local insights and up-to-date information."
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Travel Planning
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Plan Your Perfect Trip with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Magic
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your travel dreams into reality with intelligent itinerary generation, 
              collaborative planning, and personalized recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="#features">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Free forever plan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Perfect Trips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with intuitive collaboration tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Travel Planning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the future of trip planning. 
            Start your journey with AI-powered itineraries today.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Planning Your Dream Trip
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 rounded-lg p-2">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">WiseTrip</span>
              </div>
              <p className="text-gray-400">
                AI-powered travel planning that transforms your trip dreams into reality.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Mobile App</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/businesses" className="hover:text-white">For Businesses</Link></li>
                <li><Link href="/tourist-offices" className="hover:text-white">For Tourist Offices</Link></li>
                <li><Link href="#" className="hover:text-white">Travel Agencies</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WiseTrip. All rights reserved. Made with ❤️ by MiniMax Agent.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}