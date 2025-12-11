import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import { apiService } from '../services/api';
import { Button } from '../components/Button';
import { USER_SEEDER } from '../constants';
import { LogIn, MapPin, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        user = await supabaseService.signUp(email, password);
        alert('Account created! You can now log in.');
        setIsSignUp(false);
        setLoading(false);
        return;
      } else {
        // Try Supabase first
        try {
          user = await supabaseService.login(email, password);
        } catch (supaError: any) {
          console.warn('Supabase login failed', supaError);
          
          // If it's a specific Supabase auth error (like "Email not confirmed"), 
          // show it to the user instead of falling back to the mock (which would just say "Invalid credentials")
          const isAuthError = supaError.message && (
            supaError.message.includes('Email not confirmed') || 
            supaError.message.includes('Invalid login credentials')
          );

          // Only fallback if it's NOT a clear auth error OR if it's the demo user (to ensure demo always works)
          if (isAuthError && email !== USER_SEEDER.email) {
            throw supaError;
          }

          // Fallback to mock if Supabase is not configured or if it's the demo user
          user = await apiService.login(email, password);
        }
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillSeeder = () => {
    setEmail(USER_SEEDER.email);
    setPassword(USER_SEEDER.password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-lamar-green z-0"></div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10 border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-lamar-green/10 p-3 rounded-full">
            <div className="bg-lamar-green text-white p-2 rounded-full">
               <MapPin size={32} />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          {isSignUp ? 'Sign up to start tracking locations.' : 'Please sign in to access the GeoLocator dashboard.'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100 flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lamar-green focus:border-lamar-green outline-none transition-all"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lamar-green focus:border-lamar-green outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-2" isLoading={loading}>
            {isSignUp ? (
              <><UserPlus size={18} className="mr-2" /> Sign Up</>
            ) : (
              <><LogIn size={18} className="mr-2" /> Sign In</>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-lamar-green hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400 mb-2">Dev Helper</p>
          <button 
            onClick={fillSeeder}
            className="w-full text-xs text-lamar-green hover:underline text-center"
          >
            Auto-fill Test Credentials
          </button>
        </div>
      </div>
    </div>
  );
};