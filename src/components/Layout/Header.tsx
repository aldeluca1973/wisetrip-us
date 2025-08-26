import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, MapPin, Sparkles, Lock, Users } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WiseTrip
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/trips" 
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              My Trips
            </Link>
            <Link 
              to="/inspire" 
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center space-x-1"
            >
              <Sparkles className="h-4 w-4" />
              <span>Inspire Me</span>
            </Link>
            <Link 
              to="/price-locks" 
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center space-x-1"
            >
              <Lock className="h-4 w-4" />
              <span>Price Locks</span>
            </Link>
            <Link 
              to="/b2b" 
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center space-x-1"
            >
              <Users className="h-4 w-4" />
              <span>B2B Portal</span>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Welcome, {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/trips"
              className="block px-3 py-2 text-gray-700 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              My Trips
            </Link>
            <Link
              to="/inspire"
              className="block px-3 py-2 text-gray-700 hover:text-indigo-600 flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Sparkles className="h-4 w-4" />
              <span>Inspire Me</span>
            </Link>
            <Link
              to="/price-locks"
              className="block px-3 py-2 text-gray-700 hover:text-indigo-600 flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Lock className="h-4 w-4" />
              <span>Price Locks</span>
            </Link>
            <Link
              to="/b2b"
              className="block px-3 py-2 text-gray-700 hover:text-indigo-600 flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span>B2B Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}