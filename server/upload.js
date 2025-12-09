
const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const router = express.Router();

// ===================================
// CWE-434 MITIGATION STRATEGIES
// ===================================

// 1. WHITELIST of allowed file types
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  
  // Audio (for language recordings)
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  
  // Video
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm']
};

// 2. Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 3. File validation function
function validateFile(file) {
  const errors = [];
  
  // Check file exists
  if (!file) {
    errors.push("No file provided");
    return { valid: false, errors };
  }
  
  // Check MIME type against whitelist
  if (!ALLOWED_FILE_TYPES[file.mimetype]) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }
  
  // Check file extension matches MIME type
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ALLOWED_FILE_TYPES[file.mimetype];
  
  if (!allowedExts || !allowedExts.includes(ext)) {
    errors.push(`File extension ${ext} does not match declared type`);
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024*1024)}MB`);
  }
  
  // Additional security: Check for double extensions
  const basename = path.basename(file.originalname, ext);
  if (basename.includes('.')) {
    errors.push("Files with double extensions are not allowed");
  }
  
  // Check for null bytes in filename (directory traversal attempt)
  if (file.originalname.includes('\0')) {
    errors.push("Invalid filename characters detected");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// 4. Secure filename generation
function generateSecureFilename(originalname, mimetype) {
  // Generate random hash
  const hash = crypto.randomBytes(16).toString('hex');
  
  // Get proper extension based on MIME type
  const allowedExts = ALLOWED_FILE_TYPES[mimetype];
  const ext = allowedExts ? allowedExts[0] : '';
  
  // Create sanitized original name (remove special chars)
  const sanitized = path.basename(originalname, path.extname(originalname))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50);
  
  // Combine: timestamp_hash_sanitizedname.ext
  return `${Date.now()}_${hash}_${sanitized}${ext}`;
}

// 5. Configure multer with security settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Separate uploads by tribe/role for access control
    const role = req.body.role || 'public';
    const uploadPath = path.join(__dirname, '../uploads', role);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const secureFilename = generateSecureFilename(file.originalname, file.mimetype);
    cb(null, secureFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only allow 1 file per upload
  },
  fileFilter: (req, file, cb) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      return cb(new Error(validation.errors.join(', ')), false);
    }
    
    cb(null, true);
  }
});

// ===================================
// UPLOAD ENDPOINT
// ===================================

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    // Check authentication
    const username = req.body.username;
    const role = req.body.role;
    
    if (!username || !role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    // Check upload permission
    if (role === 'guest') {
      return res.status(403).json({
        success: false,
        message: "Guests do not have upload permissions"
      });
    }
    
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    // Final validation check
    const validation = validateFile(req.file);
    if (!validation.valid) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors: validation.errors
      });
    }
    
    // Log upload for audit trail
    console.log(`[UPLOAD] User: ${username}, Role: ${role}, File: ${req.file.filename}, Size: ${req.file.size} bytes`);
    
    // Return success with file metadata
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: username,
        uploadDate: new Date().toISOString(),
        accessLevel: role
      }
    });
    
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    
    // Delete file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message
    });
  }
});

// ===================================
// FILE RETRIEVAL (with access control)
// ===================================

router.get('/file/:role/:filename', (req, res) => {
  try {
    const { role, filename } = req.params;
    const requestingRole = req.query.userRole;
    
    // Verify access rights
    if (!canAccessFile(requestingRole, role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    
    const filePath = path.join(__dirname, '../uploads', role, filename);
    
    // Check file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }
    
    // Send file
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('[FILE ACCESS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error accessing file"
    });
  }
});

// Helper function for access control
function canAccessFile(requestingRole, fileRole) {
  if (requestingRole === 'admin') return true;
  if (fileRole === 'public') return true;
  if (requestingRole === fileRole) return true;
  return false;
}

module.exports = router;
