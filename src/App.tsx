import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import InspirePage from './pages/InspirePage';
import PriceLocksPage from './pages/PriceLocksPage';
import B2BPortalPage from './pages/B2BPortalPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const auth = useAuthProvider();

  if (auth.loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/inspire" element={<InspirePage />} />
              <Route 
                path="/trips" 
                element={
                  <ProtectedRoute>
                    <TripsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trip/:id" 
                element={
                  <ProtectedRoute>
                    <TripDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/price-locks" 
                element={
                  <ProtectedRoute>
                    <PriceLocksPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/b2b" element={<B2BPortalPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;