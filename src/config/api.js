// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5003',
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'buyer_api_key_789',
  TIMEOUT: 10000, // 10 seconds
};

// Available API Keys for different roles
export const API_KEYS = {
  ADMIN: 'admin_api_key_123',
  SELLER: 'seller_api_key_456', 
  BUYER: 'buyer_api_key_789',
  SAMPLE: 'sample_api_key_123'
};
