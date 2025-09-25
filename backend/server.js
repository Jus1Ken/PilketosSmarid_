import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './lib/db.js';
import { getCandidates, validateCode, voteCandidate, addCandidate, updateCandidate, deleteCandidate, createUniqueCode, uploadUniqueCodesCSV, exportWinnerPDF } from './controller/votingController.js';
import multer from 'multer';
import cloudinary from './lib/claudinary.js';
import { loginAdmin } from './controller/authController.js';
import { authenticateAdmin } from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// Configure multer for memory storage (for images)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure multer for disk storage (for CSV files)
const csvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const csvUpload = multer({ storage: csvStorage });

const PORT = process.env.PORT || 5000;

// Connect to DB

connectDB();

// Routes
app.post('/api/admin/login', loginAdmin);

app.get('/api/candidates', getCandidates);
app.post('/api/validate-code', validateCode);
app.post('/api/vote', voteCandidate);

// Admin account creation route
import { createAdmin } from './controller/authController.js';

app.post('/api/admin/create-account', authenticateAdmin, createAdmin);

// Admin kandidat route managemen
app.post('/api/admin/candidates', authenticateAdmin, addCandidate);
app.put('/api/admin/candidates/:id', authenticateAdmin, updateCandidate);
app.delete('/api/admin/candidates/:id', authenticateAdmin, deleteCandidate);

// Admin kode untik routes
app.post('/api/admin/create-unique-code', authenticateAdmin, createUniqueCode);
app.post('/api/admin/upload-unique-codes-csv', authenticateAdmin, csvUpload.single('csvFile'), uploadUniqueCodesCSV);

// Export pdf untuk pemenang
app.get('/api/admin/export-winner-pdf', authenticateAdmin, exportWinnerPDF);

// Upload foto kandidat
app.post('/api/admin/upload-photo', authenticateAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload ke cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "candidates",
          allowed_formats: ["jpg", "png", "jpeg"],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ message: 'Upload successful', url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
})
