const Product = require('../models/Product');
const Location = require('../models/Location');
const Stock = require('../models/Stock');
const Recommendation = require('../models/Recommendation');

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Create locations
    const locations = await Location.insertMany([
      {
        name: 'Chennai Central',
        city: 'Chennai',
        address: '123 MG Road, Chennai, Tamil Nadu',
        latitude: 13.0827,
        longitude: 80.2707
      },
      {
        name: 'Bangalore Tech Park',
        city: 'Bangalore',
        address: '456 IT Park, Bangalore, Karnataka',
        latitude: 12.9716,
        longitude: 77.5946
      },
      {
        name: 'Hyderabad IT Hub',
        city: 'Hyderabad',
        address: '789 HITEC City, Hyderabad, Telangana',
        latitude: 17.3850,
        longitude: 78.4867
      }
    ]);

    console.log('Locations created:', locations.length);

    // Create products
    const products = await Product.insertMany([
      {
        name: 'Laptop Pro 15',
        category: 'Electronics',
        price: 1299.99,
        description: 'High-performance laptop for professionals'
      },
      {
        name: 'Wireless Headphones',
        category: 'Electronics',
        price: 199.99,
        description: 'Noise-cancelling wireless headphones'
      },
      {
        name: 'Office Chair',
        category: 'Furniture',
        price: 299.99,
        description: 'Ergonomic office chair with lumbar support'
      },
      {
        name: 'Coffee Maker',
        category: 'Appliances',
        price: 89.99,
        description: 'Programmable drip coffee maker'
      },
      {
        name: 'Desk Lamp',
        category: 'Furniture',
        price: 45.99,
        description: 'LED desk lamp with adjustable brightness'
      }
    ]);

    console.log('Products created:', products.length);

    // Create stock entries
    const stockEntries = [];
    for (const product of products) {
      for (const location of locations) {
        // Generate random stock quantities
        const quantity = Math.floor(Math.random() * 20) + 1;
        stockEntries.push({
          productId: product._id,
          locationId: location._id,
          quantity
        });
      }
    }

    await Stock.insertMany(stockEntries);
    console.log('Stock entries created:', stockEntries.length);

    // Create sample recommendations
    const recommendations = await Recommendation.insertMany([
      {
        productId: products[1]._id, // Wireless Headphones
        fromLocationId: locations[0]._id, // Chennai
        toLocationId: locations[1]._id, // Bangalore
        quantity: 15,
        priority: 'high'
      },
      {
        productId: products[3]._id, // Coffee Maker
        fromLocationId: locations[1]._id, // Bangalore
        toLocationId: locations[2]._id, // Hyderabad
        quantity: 10,
        priority: 'medium'
      },
      {
        productId: products[0]._id, // Laptop Pro 15
        fromLocationId: locations[2]._id, // Hyderabad
        toLocationId: locations[0]._id, // Chennai
        quantity: 8,
        priority: 'high'
      }
    ]);

    console.log('Recommendations created:', recommendations.length);
    console.log('Data seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
