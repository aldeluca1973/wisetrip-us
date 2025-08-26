import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Plus, MapPin, Calendar, DollarSign, Users, Eye, Sparkles, Filter } from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user, filterStatus]);

  const fetchTrips = async () => {
    try {
      let query = supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
              <p className="text-gray-600 mt-1">Plan, organize, and track all your travel adventures</p>
            </div>
            <Link
              to="/trip/new"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Trip
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <div className="flex space-x-2">
            {['all', 'planning', 'active', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips found</h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'all' 
                ? "You haven't created any trips yet. Start planning your next adventure!"
                : `No trips with status '${filterStatus}' found.`
              }
            </p>
            <Link
              to="/inspire"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Get Inspired
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trip/${trip.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* Trip Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1 truncate">
                      {trip.title}
                    </h3>
                    <div className="flex items-center space-x-1 text-white/90">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm truncate">{trip.destination}</span>
                    </div>
                  </div>
                  {trip.is_public && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                        <Eye className="h-3 w-3 text-gray-600" />
                        <span className="text-xs text-gray-600">Public</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {trip.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(trip.start_date)}</span>
                      </div>
                      <span className="text-gray-500">
                        {getDuration(trip.start_date, trip.end_date)} days
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>${trip.budget.toLocaleString()} {trip.currency}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Updated {new Date(trip.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}