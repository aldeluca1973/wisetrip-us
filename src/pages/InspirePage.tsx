import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Sparkles, Heart, MapPin, Calendar, DollarSign, Star, ArrowRight, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Inspiration {
  id: string;
  title: string;
  description: string;
  destination: string;
  theme: string;
  season: string;
  image_urls: string[];
  inspiration_data: {
    inspiration_text: string;
    estimated_budget: number;
    currency: string;
    duration_days: number;
    difficulty_level: string;
    highlights: string[];
  };
  tags: string[];
  likes_count: number;
  created_at: string;
}

export default function InspirePage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [generateLoading, setGenerateLoading] = useState(false);

  useEffect(() => {
    fetchInspirations();
  }, [selectedTheme]);

  const fetchInspirations = async () => {
    try {
      let query = supabase
        .from('inspirations')
        .select('*')
        .order('likes_count', { ascending: false });
      
      if (selectedTheme !== 'all') {
        query = query.eq('theme', selectedTheme);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setInspirations(data || []);
    } catch (error) {
      console.error('Error fetching inspirations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInspiration = async () => {
    setGenerateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('inspire-me', {
        body: { 
          theme: selectedTheme === 'all' ? null : selectedTheme,
          style: 'surprise-me' 
        }
      });
      
      if (error) throw error;
      
      // For demo purposes, we'll show the AI response
      alert(`AI Inspiration Generated: ${data.inspiration}`);
      
      // Refresh inspirations to show any new ones
      fetchInspirations();
    } catch (error) {
      console.error('Error generating inspiration:', error);
      // Show demo inspiration for now
      alert('AI Generated: "Picture yourself sipping coffee at a cozy Parisian café, watching the world go by as the morning light dances through the windows. This is your moment of pure contentment in the City of Light."');
    } finally {
      setGenerateLoading(false);
    }
  };

  const themes = [
    { value: 'all', label: 'All Themes' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'wildlife', label: 'Wildlife' },
    { value: 'wellness', label: 'Wellness' },
  ];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
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
      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-12 w-12 text-yellow-300" />
            <h1 className="text-4xl md:text-6xl font-bold">Inspire Me</h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Discover your next adventure through AI-powered inspiration that sparks wanderlust 
            and transforms dreams into travel plans.
          </p>
          <button
            onClick={generateNewInspiration}
            disabled={generateLoading}
            className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
          >
            {generateLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
            ) : (
              <Shuffle className="h-5 w-5 mr-2" />
            )}
            Generate New Inspiration
          </button>
        </div>
      </section>

      {/* Theme Filter */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => setSelectedTheme(theme.value)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedTheme === theme.value
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Inspirations Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {inspirations.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No inspirations found</h3>
              <p className="text-gray-500">Try a different theme or generate a new inspiration!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {inspirations.map((inspiration) => (
                <div 
                  key={inspiration.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-400 to-purple-500">
                    {inspiration.image_urls[0] ? (
                      <img 
                        src={inspiration.image_urls[0]} 
                        alt={inspiration.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-white/70" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800 capitalize">
                        {inspiration.theme}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-800">{inspiration.likes_count}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {inspiration.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{inspiration.destination}</span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {inspiration.inspiration_data.inspiration_text}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>Budget: {inspiration.inspiration_data.estimated_budget} {inspiration.inspiration_data.currency}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{inspiration.inspiration_data.duration_days} days</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(inspiration.inspiration_data.difficulty_level)}`}>
                          {inspiration.inspiration_data.difficulty_level}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {inspiration.season} season
                        </span>
                      </div>
                    </div>

                    {/* Highlights */}
                    {inspiration.inspiration_data.highlights && inspiration.inspiration_data.highlights.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {inspiration.inspiration_data.highlights.slice(0, 3).map((highlight, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Link
                      to="/trips"
                      state={{ inspiration: inspiration }}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 group"
                    >
                      <span>Plan This Trip</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}