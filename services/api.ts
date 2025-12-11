import { API_URLS, USER_SEEDER, MOCK_TOKEN } from '../constants';
import { User, GeoData } from '../types';

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  /**
   * Attempts to login via API, falls back to mock if API fails (for demo purposes)
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      // Try the requested API URL first
      const response = await fetch(API_URLS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('API Login failed');
      }
    } catch (error) {
      console.warn('API unavailable or failed, falling back to local seeder for demo:', error);
      
      // Simulate network delay
      await delay(800);

      // Validate against seeder
      if (email === USER_SEEDER.email && password === USER_SEEDER.password) {
        return {
          email: USER_SEEDER.email,
          name: USER_SEEDER.name,
          token: MOCK_TOKEN,
        };
      }
      
      throw new Error('Invalid credentials');
    }
  },

  /**
   * Fetches Geo Data for a specific IP or the current user (empty ip)
   */
  getGeoData: async (ip?: string): Promise<GeoData> => {
    // Note: ipinfo.io has a free tier limit. 
    // If you have a token, use: `${API_URLS.IP_GEO}/${ip || ''}?token=YOUR_TOKEN`
    // For this demo, we use the free endpoint.
    
    let url = 'https://ipinfo.io/json';
    if (ip) {
      url = `https://ipinfo.io/${ip}/json`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch geolocation data. Ensure IP is valid.');
    }
    
    return await response.json();
  }
};