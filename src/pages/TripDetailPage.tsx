import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { MapPin, Calendar, DollarSign, Clock, Users, Sparkles, Download, Vote, ArrowLeft, Plus } from 'lucide-react';

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
}

interface TripDay {
  id: string;
  day_number: number;
  date: string;
  title: string;
  notes: string;
  activities: Activity[];
}

interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  cost: number;
  category: string;
  booking_url: string;
  notes: string;
}

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'ai' | 'voting'>('itinerary');

  useEffect(() => {
    if (id) {
      fetchTripDetails(id);
    }
  }, [id]);

  const fetchTripDetails = async (tripId: string) => {
    try {
      // Fetch trip details
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();
      
      if (tripError) throw tripError;
      setTrip(tripData);

      // Fetch trip days and activities
      const { data: daysData, error: daysError } = await supabase
        .from('trip_days')
        .select(`
          *,
          activities (*)
        `)
        .eq('trip_id', tripId)
        .order('day_number', { ascending: true });
      
      if (daysError) throw daysError;
      
      setTripDays(daysData || []);
    } catch (error) {
      console.error('Error fetching trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateItinerary = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-itinerary', {
        body: { 
          destination: trip?.destination,
          duration: getDuration(),
          budget: trip?.budget,
          preferences: ['cultural', 'food'] 
        }
      });
      
      if (error) throw error;
      alert(`AI Generated Itinerary: ${data.itinerary}`);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Demo: AI would generate a detailed day-by-day itinerary based on your preferences and budget.');
    }
  };

  const optimizeItinerary = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('optimize-itinerary', {
        body: { 
          tripId: trip?.id,
          optimizationType: 'time' 
        }
      });
      
      if (error) throw error;
      alert(`AI Optimization: ${data.optimization}`);
    } catch (error) {
      console.error('Error optimizing itinerary:', error);
      alert('Demo: AI would optimize your itinerary for better time management and cost efficiency.');
    }
  };

  const generatePackingList = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-packing-list', {
        body: { 
          destination: trip?.destination,
          duration: getDuration(),
          season: 'current',
          activities: ['cultural', 'dining'] 
        }
      });
      
      if (error) throw error;
      alert(`AI Packing List: ${data.packingList}`);
    } catch (error) {
      console.error('Error generating packing list:', error);
      alert('Demo: AI would create a personalized packing list based on your destination, weather, and planned activities.');
    }
  };

  const exportOffline = () => {
    alert('Demo: Your complete itinerary would be exported as a PDF with offline maps, contact information, and emergency details.');
  };

  const getDuration = () => {
    if (!trip) return 0;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <Link to="/trips" className="text-indigo-600 hover:text-indigo-800">
            ← Back to trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/trips" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to trips
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(trip.status)}`}>
                  {trip.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{getDuration()} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${trip.budget.toLocaleString()} {trip.currency}</span>
                </div>
              </div>
              
              <p className="text-gray-700">{trip.description}</p>
            </div>
            
            <div className="mt-6 lg:mt-0 lg:ml-6">
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={exportOffline}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Offline
                </button>
                
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="h-4 w-4 mr-2" />
                  Share Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'itinerary', label: 'Itinerary', icon: Calendar },
              { id: 'ai', label: 'AI Assistant', icon: Sparkles },
              { id: 'voting', label: 'Group Voting', icon: Vote }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'itinerary' && (
          <div>
            {tripDays.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No itinerary yet</h3>
                <p className="text-gray-500 mb-6">Use our AI assistant to generate a personalized itinerary for your trip.</p>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Itinerary
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {tripDays.map((day) => (
                  <div key={day.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Day {day.day_number}: {day.title}</h3>
                        <p className="text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-800">
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {day.notes && (
                      <p className="text-gray-700 mb-4">{day.notes}</p>
                    )}
                    
                    <div className="space-y-4">
                      {day.activities && day.activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 min-w-0">
                            {activity.start_time && (
                              <div>{formatTime(activity.start_time)}</div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                            {activity.description && (
                              <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              {activity.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                              
                              {activity.cost > 0 && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>${activity.cost}</span>
                                </div>
                              )}
                              
                              {activity.category && (
                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs capitalize">
                                  {activity.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Travel Assistant</h3>
              <p className="text-gray-600 mb-6">
                Let our AI help you create the perfect itinerary, optimize your plans, and prepare for your trip.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={generateItinerary}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Generate Itinerary</h4>
                  <p className="text-sm text-gray-600">Create a day-by-day plan based on your preferences</p>
                </button>
                
                <button 
                  onClick={optimizeItinerary}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Optimize Plans</h4>
                  <p className="text-sm text-gray-600">Improve timing, cost, and logistics</p>
                </button>
                
                <button 
                  onClick={generatePackingList}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Packing List</h4>
                  <p className="text-sm text-gray-600">Smart suggestions for what to pack</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voting' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Group Decision Making</h3>
            <p className="text-gray-600 mb-6">
              Create anonymous polls to let your travel group decide on activities, restaurants, and accommodations.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <Vote className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">No active polls</h4>
              <p className="text-gray-600 mb-4">Create your first poll to get group input on trip decisions.</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Create Poll
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}