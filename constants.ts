export const API_URLS = {
  LOGIN: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/login`,
  IP_GEO: 'https://ipinfo.io/json', // Using standard endpoint, can append /<ip>
};

// User Seeder as requested
export const USER_SEEDER = {
  email: 'admin@lamar.com',
  password: 'password123',
  name: 'Kayla Davis', // From reference image
};

export const MOCK_TOKEN = 'lamar_mock_token_12345';
