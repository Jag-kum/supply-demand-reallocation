const mongoose = require('mongoose');
const seedData = require('./utils/seedData');
const config = require('./config');

// Connect to MongoDB and seed data
async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if we need to seed data
    const Product = require('./models/Product');
    const Location = require('./models/Location');
    
    const productCount = await Product.countDocuments();
    const locationCount = await Location.countDocuments();
    
    if (productCount === 0 || locationCount === 0) {
      console.log('🌱 Seeding database with sample data...');
      await seedData();
      console.log('✅ Database seeded successfully');
    } else {
      console.log('📊 Database already has data, skipping seed');
    }

    // Start the server
    const app = require('./server');
    const PORT = config.PORT;
    
    // Start server on the specified port
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}`);
      console.log(`🔑 API Keys configured for all roles`);
      console.log('\n📋 Available API Keys:');
      console.log(`   Admin: ${config.ADMIN_API_KEY}`);
      console.log(`   Seller: ${config.SELLER_API_KEY}`);
      console.log(`   Buyer: ${config.BUYER_API_KEY}`);
      console.log('\n🎯 Ready to accept requests!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
