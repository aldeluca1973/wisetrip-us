import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-8 w-8 text-indigo-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                WiseTrip
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Your intelligent travel companion that creates personalized itineraries, 
              provides transparent pricing, and connects you with verified local experiences.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-gray-300">hello@wisetrip.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/inspire" className="text-gray-300 hover:text-white transition-colors">
                  Inspire Me
                </Link>
              </li>
              <li>
                <Link to="/price-locks" className="text-gray-300 hover:text-white transition-colors">
                  Price Transparency
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-gray-300 hover:text-white transition-colors">
                  Smart Itineraries
                </Link>
              </li>
              <li>
                <Link to="/b2b" className="text-gray-300 hover:text-white transition-colors">
                  B2B Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/docs/guide" className="text-gray-300 hover:text-white transition-colors">
                  User Guide
                </Link>
              </li>
              <li>
                <Link to="/docs/api" className="text-gray-300 hover:text-white transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="/docs/admin" className="text-gray-300 hover:text-white transition-colors">
                  Admin Guide
                </Link>
              </li>
              <li>
                <a href="mailto:support@wisetrip.com" className="text-gray-300 hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            © 2025 WiseTrip. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}