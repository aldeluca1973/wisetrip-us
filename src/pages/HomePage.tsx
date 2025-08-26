import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Sparkles, Shield, Lock, Users, Vote, Wifi, Download } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Intelligent</span> Travel Companion
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              WiseTrip creates personalized itineraries with AI-powered insights, transparent pricing, 
              and verified local experiences you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/inspire"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105 shadow-lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Get Inspired
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/trips"
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-900 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Plan My Trip
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why WiseTrip is Different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've reimagined travel planning with features that actually matter to modern travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Inspire Me Feature */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inspire Me Mode</h3>
              <p className="text-gray-600 mb-4">
                Discover your next adventure through AI-powered inspiration that matches your travel style and dreams.
              </p>
              <Link to="/inspire" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                Explore Inspirations <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Price Transparency */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Price Lock Guarantee</h3>
              <p className="text-gray-600 mb-4">
                Lock in prices when you find them, with full transparency on pricing changes and no hidden fees.
              </p>
              <Link to="/price-locks" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                View Price Locks <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Trust Flags */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Trust Flags</h3>
              <p className="text-gray-600 mb-4">
                Every business is verified for safety, quality, value, and sustainability with transparent verification data.
              </p>
              <Link to="/trips" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                See Trust System <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Anonymous Voting */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Group Decision Voting</h3>
              <p className="text-gray-600 mb-4">
                Make group travel decisions easy with anonymous voting on activities, restaurants, and accommodations.
              </p>
              <Link to="/trips" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                Try Group Voting <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Offline Export */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Offline Trip Exports</h3>
              <p className="text-gray-600 mb-4">
                Download your complete itineraries as PDF with maps, contact info, and emergency details for offline access.
              </p>
              <Link to="/trips" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                Export Itinerary <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* B2B Portal */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Solutions</h3>
              <p className="text-gray-600 mb-4">
                Tourist offices and businesses can showcase verified experiences with transparent pricing and booking.
              </p>
              <Link to="/b2b" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                B2B Portal <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI assistant provides personalized recommendations and handles every aspect of your travel planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Itinerary Generation</h3>
              <p className="text-gray-600">AI creates day-by-day itineraries based on your preferences, budget, and travel style.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Itinerary Optimization</h3>
              <p className="text-gray-600">Continuously optimize your plans for time, cost, and experience quality as your trip evolves.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Packing Lists</h3>
              <p className="text-gray-600">AI-generated packing lists customized for your destination, activities, and weather conditions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Travel Experience?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of travelers who've discovered a smarter way to plan and book their adventures.
          </p>
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Start Planning Free
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}