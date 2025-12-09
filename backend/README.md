# Retail Inventory Management Backend

A Node.js + Express + MongoDB backend for multi-location retail inventory management with AI-driven transfer recommendations.

## Features

- **Authentication**: JWT-based user authentication with role-based access control
- **API Security**: API key validation for all endpoints
- **Multi-location Support**: Manage inventory across multiple store locations
- **Real-time Stock Tracking**: Track product quantities per location
- **Order Management**: Reserve and purchase products
- **AI Recommendations**: Transfer recommendations between locations
- **RESTful APIs**: Clean, well-documented API endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example config
cp config.js.example .env

# Edit .env with your values
MONGO_URI=mongodb://localhost:27017/retail_db
JWT_SECRET=your_jwt_secret_key_here
ADMIN_API_KEY=admin_api_key_123
SELLER_API_KEY=seller_api_key_456
BUYER_API_KEY=buyer_api_key_789
PORT=5000
NODE_ENV=development
```

3. Start MongoDB (make sure MongoDB is running on your system)

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Seller+)
- `PUT /api/products/:id` - Update product (Seller+)
- `DELETE /api/products/:id` - Delete product (Manager+)

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get single location
- `POST /api/locations` - Create location (Manager+)
- `PUT /api/locations/:id` - Update location (Manager+)
- `DELETE /api/locations/:id` - Delete location (Admin)

### Stock
- `GET /api/stock/location/:locationId` - Get stock by location
- `GET /api/stock/all` - Get all stock
- `GET /api/stock/summary` - Get stock summary
- `PUT /api/stock` - Update stock (Seller+)

### Orders
- `POST /api/orders/order` - Order product
- `POST /api/orders/purchase/:orderId` - Purchase product
- `GET /api/orders/user/:userId` - Get user orders
- `PUT /api/orders/cancel/:orderId` - Cancel order

### Recommendations
- `GET /api/recommendations` - Get all recommendations
- `GET /api/recommendations/:id` - Get single recommendation
- `POST /api/recommendations/:id/approve` - Approve recommendation (Seller+)
- `POST /api/recommendations` - Create recommendation (Manager+)

## Authentication

All API requests require:
1. **API Key**: Include `x-api-key` header with valid key
2. **JWT Token**: Include `Authorization: Bearer <token>` header for authenticated endpoints

## User Roles

- **Buyer**: Can view products, reserve, and purchase
- **Seller**: Can manage products and stock, approve transfers
- **Manager**: Can manage locations and create recommendations
- **Admin**: Full system access

## Database Schema

### Users
- email, passwordHash, role, createdAt

### Products
- name, category, price, description, createdAt, updatedAt

### Locations
- name, city, address, latitude, longitude, createdAt

### Stock
- productId, locationId, quantity, updatedAt

### Orders
- userId, productId, locationId, quantity, status, timestamp

### Recommendations
- productId, fromLocationId, toLocationId, quantity, priority, approved, createdAt

## Development

The server includes a data seeding utility to populate the database with sample data for testing.

```javascript
// Run seed data (uncomment in server.js)
const seedData = require('./utils/seedData');
await seedData();
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/retail_db |
| JWT_SECRET | Secret key for JWT tokens | your_jwt_secret_key_here |
| ADMIN_API_KEY | API key for admin access | admin_api_key_123 |
| SELLER_API_KEY | API key for seller access | seller_api_key_456 |
| BUYER_API_KEY | API key for buyer access | buyer_api_key_789 |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
