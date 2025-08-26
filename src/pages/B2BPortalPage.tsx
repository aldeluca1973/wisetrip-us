import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Building, MapPin, Mail, Phone, Globe, Star, Shield, TrendingUp, CreditCard } from 'lucide-react';

interface TouristOffice {
  id: string;
  name: string;
  region: string;
  contact_email: string;
  plan: string;
  created_at: string;
}

interface Business {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  url: string;
  description: string;
  verified: boolean;
  trust_flags: {
    rating?: number;
    reviews?: number;
    price_range?: string;
  };
}

export default function B2BPortalPage() {
  const [touristOffices, setTouristOffices] = useState<TouristOffice[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'offices' | 'businesses'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [officesResponse, businessesResponse] = await Promise.all([
        supabase.from('tourist_offices').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').order('created_at', { ascending: false })
      ]);
      
      if (officesResponse.error) throw officesResponse.error;
      if (businessesResponse.error) throw businessesResponse.error;
      
      setTouristOffices(officesResponse.data || []);
      setBusinesses(businessesResponse.data || []);
    } catch (error) {
      console.error('Error fetching B2B data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Users className="h-12 w-12" />
            <h1 className="text-4xl md:text-6xl font-bold">B2B Portal</h1>
          </div>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Partner with WiseTrip to showcase your verified experiences, reach millions of travelers, 
            and drive bookings with transparent pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg">
              <Building className="h-5 w-5 mr-2" />
              Business Signup
            </button>
            <button className="inline-flex items-center px-8 py-4 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-400 transition-all transform hover:scale-105 shadow-lg border border-indigo-400">
              <MapPin className="h-5 w-5 mr-2" />
              Tourist Office Signup
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Partnership Overview', icon: TrendingUp },
              { id: 'offices', label: 'Tourist Offices', icon: MapPin },
              { id: 'businesses', label: 'Partner Businesses', icon: Building }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && (
          <div>
            {/* Partnership Benefits */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Partner with WiseTrip?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Trust & Verification</h3>
                  <p className="text-gray-600">Build customer confidence with our comprehensive trust flag system showing safety, quality, value, and sustainability ratings.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Increased Visibility</h3>
                  <p className="text-gray-600">Reach millions of travelers through our AI-powered recommendation engine and personalized itinerary generation.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Transparent Pricing</h3>
                  <p className="text-gray-600">Benefit from our price lock system that builds trust and reduces booking hesitation with transparent, guaranteed pricing.</p>
                </div>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partnership Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold mb-2">Free</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-4">$0<span className="text-lg text-gray-500">/month</span></p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Basic listing</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">5% booking fee</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Basic analytics</span>
                    </li>
                  </ul>
                  <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                    Get Started
                  </button>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-indigo-500 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">Popular</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-4">$99<span className="text-lg text-gray-500">/month</span></p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Premium listing</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">3% booking fee</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Advanced analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Trust flags</span>
                    </li>
                  </ul>
                  <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Start Free Trial
                  </button>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-4">$299<span className="text-lg text-gray-500">/month</span></p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Featured placement</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">1% booking fee</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Full analytics suite</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">API access</span>
                    </li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offices' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Partner Tourist Offices</h2>
              <p className="text-gray-600">Official tourism organizations promoting destinations worldwide</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {touristOffices.map((office) => (
                <div key={office.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{office.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPlanColor(office.plan)}`}>
                      {office.plan}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{office.region}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{office.contact_email}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Partner since {new Date(office.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'businesses' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Partner Businesses</h2>
              <p className="text-gray-600">Verified accommodations, restaurants, and activity providers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <div key={business.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{business.name}</h3>
                      <span className="capitalize text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {business.type}
                      </span>
                    </div>
                    {business.verified && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {business.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {business.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{business.address}</span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                    {business.url && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a href={business.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 truncate">
                          {business.url}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {business.trust_flags && (
                    <div className="flex items-center justify-between text-sm">
                      {business.trust_flags.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{business.trust_flags.rating} ({business.trust_flags.reviews} reviews)</span>
                        </div>
                      )}
                      {business.trust_flags.price_range && (
                        <span className="capitalize text-gray-600">{business.trust_flags.price_range}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}