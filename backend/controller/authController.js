import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // validasi input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi'
      });
    }

    // cari username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // cek password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // generate jwt token
    const token = jwt.sign(
      { adminId: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi'
      });
    }

    // check apakah username sdh ada
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }

    // buat admin baru
    const newAdmin = new Admin({
      username,
      password // Password will be hashed by the pre-save middleware
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin baru berhasil dibuat',
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        createdAt: newAdmin.createdAt
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

//verivikasi token
export const verifyToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin tidak ditemukan'
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
};
