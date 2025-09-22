import mongoose from 'mongoose';
import Admin from '../models/admin.model.js';
import dotenv from 'dotenv';
import readline from 'readline';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '../.env' });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions and get user input
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Function to ask for password without showing it
const askPassword = (question) => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    const onData = (char) => {
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.resume();
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl-C
          process.stdout.write('\n');
          process.exit(0);
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          if (char >= ' ') {
            password += char;
            process.stdout.write('*');
          }
          break;
      }
    };
    
    process.stdin.on('data', onData);
  });
};

// Function to validate username
const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return 'Username harus minimal 3 karakter';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username hanya boleh menggunakan huruf, angka, dan underscore';
  }
  return null;
};

// Function to validate password
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return 'Password harus minimal 6 karakter';
  }
  return null;
};

const createAdmin = async () => {
  console.log('🔧 SETUP ADMIN BARU - SISTEM VOTING SMA NEGERI 10 SAMARINDA');
  console.log('===========================================================\n');

  try {
    // Check MongoDB connection
    console.log('📡 Menghubungkan ke database...');
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI tidak ditemukan di file .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    });

    console.log('✅ Berhasil terhubung ke MongoDB\n');

    // Check if any admin already exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log('⚠️  Admin sudah ada di sistem');
      const createAnother = await askQuestion('Apakah Anda ingin membuat admin baru? (y/n): ');
      
      if (createAnother.toLowerCase() !== 'y' && createAnother.toLowerCase() !== 'yes') {
        console.log('🚫 Pembuatan admin dibatalkan');
        process.exit(0);
      }
      console.log('');
    }

    let username, password, confirmPassword;
    let isValid = false;

    // Get and validate username
    while (!isValid) {
      username = await askQuestion('👤 Masukkan username admin: ');
      
      const usernameError = validateUsername(username);
      if (usernameError) {
        console.log(`❌ ${usernameError}\n`);
        continue;
      }

      // Check if username already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        console.log('❌ Username sudah digunakan, silakan pilih username lain\n');
        continue;
      }

      isValid = true;
    }

    isValid = false;

    // Get and validate password
    while (!isValid) {
      password = await askPassword('🔐 Masukkan password admin: ');
      
      const passwordError = validatePassword(password);
      if (passwordError) {
        console.log(`❌ ${passwordError}\n`);
        continue;
      }

      confirmPassword = await askPassword('🔐 Konfirmasi password: ');
      
      if (password !== confirmPassword) {
        console.log('❌ Password tidak cocok, silakan coba lagi\n');
        continue;
      }

      isValid = true;
    }

    // Show confirmation
    console.log('\n📋 KONFIRMASI DATA ADMIN');
    console.log('======================');
    console.log(`Username: ${username}`);
    console.log(`Password: ${'*'.repeat(password.length)}`);
    
    const confirm = await askQuestion('\nApakah data sudah benar? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('🚫 Pembuatan admin dibatalkan');
      process.exit(0);
    }

    // Create new admin user
    console.log('💾 Menyimpan data admin...');
    const admin = new Admin({
      username: username,
      password: password
    });

    await admin.save();

    console.log('\n✅ ADMIN BERHASIL DIBUAT!');
    console.log('========================');
    console.log(`👤 Username: ${username}`);
    console.log('🔐 Password: [terenkripsi dengan aman]');
    console.log('🚀 Admin sekarang dapat login ke sistem');
    console.log('🎯 Gunakan kredensial ini untuk mengakses panel admin\n');

  } catch (error) {
    console.error('❌ Error saat membuat admin:', error.message);
    
    if (error.code === 11000) {
      console.error('💡 Hint: Username mungkin sudah digunakan');
    }
    
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('🔌 Koneksi database ditutup');
    console.log('👋 Terima kasih telah menggunakan setup admin!\n');
  }
};

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Proses dibatalkan oleh user');
  rl.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  console.error('❌ Unexpected error:', error.message);
  rl.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(1);
});

createAdmin();