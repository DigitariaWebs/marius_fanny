import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadsDir } from '../config/paths.js';
import { createCloudinaryStorage, hasValidConfig } from '../config/cloudinary';
import { requireAuth, requireRole } from '../middleware/auth';

const router = express.Router();

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
} else {
  console.log('📁 Using existing uploads directory:', uploadsDir);
}

// Local file storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Determine which storage to use
const getUploadStorage = () => {
  // Only use Cloudinary if properly configured
  if (hasValidConfig) {
    try {
      console.log('📤 Using Cloudinary storage for uploads');
      return createCloudinaryStorage('products');
    } catch (error) {
      console.warn('⚠️  Cloudinary error, falling back to local storage:', (error as any).message);
      return localStorage;
    }
  }
  
  console.log('💾 Using local file storage for uploads');
  return localStorage;
};

// Create multer upload with proper storage
const upload = multer({
  storage: getUploadStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large (max 5MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  next();
};

// Upload single image
router.post('/single', requireAuth, requireRole('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Upload error:', err.message);
      
      // Check if it's a Cloudinary authentication error
      if (err.http_code === 403 || err.message?.includes('403')) {
        console.warn('⚠️  Cloudinary credentials invalid - using local storage fallback');
        // Don't fail - the storage has already fallen back to local
        // This is expected behavior
      }
      
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }

    try {
      if (!req.file) {
        console.log('❌ No file provided');
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Determine the URL based on storage type
      const isCloudinary = (req.file as any).path && (req.file as any).path.includes('cloudinary');
      const url = isCloudinary 
        ? (req.file as any).path  // Cloudinary URL
        : `/uploads/${(req.file as any).filename}`; // Local file path

      const storageType = isCloudinary ? 'Cloudinary' : 'Local Storage';
      console.log(`✅ Image uploaded successfully using ${storageType}:`, {
        filename: (req.file as any).filename,
        url: url,
      });

      // Return the URL
      res.json({
        success: true,
        url: url,
        public_id: (req.file as any).filename,
        storage: storageType,
      });
    } catch (error) {
      console.error('❌ Upload processing error:', error);
      res.status(500).json({ error: 'Failed to process upload' });
    }
  });
});

// Upload multiple images
router.post('/multiple', requireAuth, requireRole('admin'), (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }

    try {
      if (!req.files || (req.files as any[]).length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      const files = req.files as any[];
      const uploadedImages = files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));

      res.json({
        success: true,
        images: uploadedImages,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to process uploads' });
    }
  });
});

// Serve uploaded files from local storage
router.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    // Security: prevent directory traversal
    if (!filepath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

// Delete image from Cloudinary or local storage
router.delete('/:publicId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { publicId } = req.params;

    // Try Cloudinary first if configured
    if (hasValidConfig) {
      try {
        const { cloudinary } = await import('../config/cloudinary.js');
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
          return res.json({ success: true, message: 'Image deleted successfully' });
        }
      } catch (cloudinaryError) {
        console.log('⚠️  Cloudinary deletion failed, trying local storage');
      }
    }

    // Try local storage
    const localPath = path.join(uploadsDir, publicId);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return res.json({ success: true, message: 'Image deleted successfully' });
    }

    res.status(400).json({ error: 'File not found' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;