import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Lock, TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, ExternalLink, Shield } from 'lucide-react';

interface PriceLock {
  id: string;
  user_id: string;
  business_id: string;
  original_price: number;
  locked_price: number;
  currency: string;
  lock_expires_at: string;
  status: string;
  booking_reference: string;
  created_at: string;
  business?: {
    name: string;
    type: string;
    address: string;
  };
}

export default function PriceLocksPage() {
  const [priceLocks, setPriceLocks] = useState<PriceLock[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPriceLocks();
    }
  }, [user]);

  const fetchPriceLocks = async () => {
    try {
      const { data, error } = await supabase
        .from('price_locks')
        .select(`
          *,
          businesses (
            name,
            type,
            address
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPriceLocks(data || []);
    } catch (error) {
      console.error('Error fetching price locks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSavings = (original: number, locked: number) => {
    return original - locked;
  };

  const getSavingsPercentage = (original: number, locked: number) => {
    return ((original - locked) / original * 100).toFixed(1);
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSavings = priceLocks.reduce((total, lock) => {
    return total + getSavings(lock.original_price, lock.locked_price);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="h-12 w-12" />
            <div>
              <h1 className="text-4xl font-bold">Price Locks</h1>
              <p className="text-green-100 text-lg">Transparent pricing with guaranteed savings</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-green-200" />
                <div>
                  <p className="text-2xl font-bold">{priceLocks.length}</p>
                  <p className="text-green-100">Price Locks</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-green-200" />
                <div>
                  <p className="text-2xl font-bold">${totalSavings.toFixed(2)}</p>
                  <p className="text-green-100">Total Savings</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-green-200" />
                <div>
                  <p className="text-2xl font-bold">
                    {priceLocks.filter(lock => lock.status === 'active').length}
                  </p>
                  <p className="text-green-100">Active Locks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Locks Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {priceLocks.length === 0 ? (
          <div className="text-center py-20">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No price locks found</h3>
            <p className="text-gray-500 mb-6">
              Start browsing activities and accommodations to lock in great prices!
            </p>
            <a
              href="/trips"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Trips
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {priceLocks.map((lock) => (
              <div 
                key={lock.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Left Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {lock.business?.name || 'Business Name'}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="capitalize">{lock.business?.type || 'Service'}</span>
                          {lock.business?.address && (
                            <>
                              <span>•</span>
                              <span className="truncate">{lock.business.address}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(lock.status)}`}>
                          {lock.status}
                        </span>
                        {isExpiringSoon(lock.lock_expires_at) && !isExpired(lock.lock_expires_at) && (
                          <div className="flex items-center space-x-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Expiring Soon</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Original Price</p>
                        <p className="text-lg font-medium text-gray-900">
                          ${lock.original_price.toFixed(2)} {lock.currency}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Locked Price</p>
                        <p className="text-lg font-bold text-green-600">
                          ${lock.locked_price.toFixed(2)} {lock.currency}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">You Save</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-bold text-green-600">
                            ${getSavings(lock.original_price, lock.locked_price).toFixed(2)}
                          </p>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            {getSavingsPercentage(lock.original_price, lock.locked_price)}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className={`text-sm font-medium ${
                          isExpired(lock.lock_expires_at) 
                            ? 'text-red-600' 
                            : isExpiringSoon(lock.lock_expires_at) 
                            ? 'text-orange-600' 
                            : 'text-gray-900'
                        }`}>
                          {formatDate(lock.lock_expires_at)}
                        </p>
                      </div>
                    </div>

                    {/* Booking Reference */}
                    {lock.booking_reference && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Booking Reference</p>
                        <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                          {lock.booking_reference}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="lg:ml-6 mt-4 lg:mt-0">
                    <div className="flex flex-col space-y-2">
                      <button 
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          lock.status === 'active' && !isExpired(lock.lock_expires_at)
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={lock.status !== 'active' || isExpired(lock.lock_expires_at)}
                      >
                        {lock.status === 'active' && !isExpired(lock.lock_expires_at) 
                          ? 'Book Now' 
                          : 'Expired'
                        }
                      </button>
                      
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Price Transparency Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              WiseTrip's price locks give you confidence and savings on every booking
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Price Guarantee</h3>
              <p className="text-gray-600">Lock in prices when you find them, protected from increases for up to 48 hours.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Hidden Fees</h3>
              <p className="text-gray-600">Complete transparency on all costs, taxes, and fees before you commit to booking.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real Savings</h3>
              <p className="text-gray-600">Track your savings with detailed comparisons and historical price data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}