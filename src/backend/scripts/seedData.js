import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Bundle from '../models/Bundle.js';
import User from '../models/User.js';
import connectDB from '../config/database.js';
import { sampleProducts, sampleBundles, testUser } from './sampleData.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Bundle.deleteMany({});
    await User.deleteMany({});

    console.log('📦 Seeding products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('📦 Seeding bundles...');
    // Add product references to bundles
    // Map bundles to actual product IDs
    const bundlesWithProducts = sampleBundles.map((bundle, index) => {
      // Assign products based on bundle category
      let productRefs = [];
      
      if (bundle.category === 'audio') {
        // Audio bundle gets headphones and earbuds
        const audioProducts = createdProducts.filter(p => p.category === 'audio');
        productRefs = audioProducts.slice(0, 2).map(p => ({ 
          product: p._id, 
          quantity: 1 
        }));
      } else if (bundle.category === 'gaming') {
        // Gaming bundle gets gaming products
        const gamingProducts = createdProducts.filter(p => p.category === 'gaming');
        productRefs = gamingProducts.slice(0, 2).map(p => ({ 
          product: p._id, 
          quantity: 1 
        }));
      } else if (bundle.category === 'wearables') {
        // Wearables bundle
        const wearableProducts = createdProducts.filter(p => p.category === 'wearables');
        productRefs = wearableProducts.map(p => ({ 
          product: p._id, 
          quantity: 1 
        }));
      } else if (bundle.category === 'smart-home') {
        // Smart home bundle
        const smartHomeProducts = createdProducts.filter(p => p.category === 'smart-home');
        productRefs = smartHomeProducts.map(p => ({ 
          product: p._id, 
          quantity: 1 
        }));
      }
      
      return {
        ...bundle,
        products: productRefs
      };
    });

    const createdBundles = await Bundle.insertMany(bundlesWithProducts);
    console.log(`✅ Created ${createdBundles.length} bundles`);

    console.log('👤 Creating test user...');
    const createdUser = await User.create(testUser);
    console.log('✅ Test user created:', createdUser.email);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\n📊 Database Summary:');
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Bundles: ${createdBundles.length}`);
    console.log(`   Users: 1`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();