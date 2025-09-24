#!/usr/bin/env node

// Fix Admin User Script
// This script ensures the 'dana' user is set as admin

const { DatabaseHelper } = require('./src/database/DatabaseHelper');

async function fixAdminUser() {
  console.log('🔧 Fixing admin user setup...');
  
  try {
    const dbHelper = new DatabaseHelper();
    await dbHelper.initializeDatabase();
    
    // Check if dana user exists
    const danaUser = await dbHelper.getUserByUsername('dana');
    
    if (danaUser) {
      console.log('✅ Dana user found, setting as admin...');
      await dbHelper.setUserAsAdmin('dana');
      console.log('✅ Dana user is now set as admin!');
    } else {
      console.log('❌ Dana user not found. Creating dana user as admin...');
      await dbHelper.createUser('dana', 'password123', 'dana@example.com');
      await dbHelper.setUserAsAdmin('dana');
      console.log('✅ Dana user created and set as admin!');
    }
    
    // Verify admin status
    const updatedUser = await dbHelper.getUserByUsername('dana');
    console.log('📊 User details:', {
      username: updatedUser.username,
      is_admin: updatedUser.is_admin,
      viewed_count: updatedUser.viewed_count
    });
    
    console.log('🎉 Admin user setup complete!');
    
  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
  }
}

// Run the fix
fixAdminUser();
