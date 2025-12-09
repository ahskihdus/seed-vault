// server/app.js - Updated with secure upload integration and AI detection
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const aiDetector = require('./aiDetector'); // NEW: Import AI detector

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// ===================================
// AUTHENTICATION
// ===================================

const users = {
  admin: { password: "seedvault", role: "admin" },
  guest: { password: "guest123", role: "guest" },
  tribe1: { password: "tribe1pass", role: "tribe1" },
  tribe2: { password: "tribe2pass", role: "tribe2" },
  tribe3: { password: "tribe3pass", role: "tribe3" }
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (user && user.password === password) {
    return res.status(200).json({ 
      success: true, 
      role: user.role,
      username: username
    });
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

// ===================================
// SECURE FILE UPLOAD (CWE-434 MITIGATION)
// ===================================

const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file) {
  const errors = [];
  
  if (!file) {
    errors.push("No file provided");
    return { valid: false, errors };
  }
  
  // MITIGATION 1: Whitelist MIME types
  if (!ALLOWED_FILE_TYPES[file.mimetype]) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }
  
  // MITIGATION 2: Verify extension matches MIME type
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ALLOWED_FILE_TYPES[file.mimetype];
  
  if (!allowedExts || !allowedExts.includes(ext)) {
    errors.push(`File extension ${ext} does not match declared type`);
  }
  
  // MITIGATION 3: File size limit
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File exceeds ${MAX_FILE_SIZE / (1024*1024)}MB limit`);
  }
  
  // MITIGATION 4: Prevent double extensions
  const basename = path.basename(file.originalname, ext);
  if (basename.includes('.')) {
    errors.push("Double extensions not allowed");
  }
  
  // MITIGATION 5: Check for null bytes (directory traversal)
  if (file.originalname.includes('\0')) {
    errors.push("Invalid filename characters");
  }
  
  return { valid: errors.length === 0, errors };
}

function generateSecureFilename(originalname, mimetype) {
  const hash = crypto.randomBytes(16).toString('hex');
  const allowedExts = ALLOWED_FILE_TYPES[mimetype];
  const ext = allowedExts ? allowedExts[0] : '';
  
  const sanitized = path.basename(originalname, path.extname(originalname))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50);
  
  return `${Date.now()}_${hash}_${sanitized}${ext}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const accessLevel = req.body.accessLevel || 'public';
    const uploadPath = path.join(__dirname, '../uploads', accessLevel);
    
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
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      return cb(new Error(validation.errors.join(', ')), false);
    }
    cb(null, true);
  }
});

// Upload endpoint with AI detection
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { username, role, title, description, tribe, accessLevel } = req.body;
    
    // Authentication check
    if (!username || !role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    // Permission check
    if (role === 'guest') {
      return res.status(403).json({
        success: false,
        message: "Guests cannot upload files"
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    // Final validation
    const validation = validateFile(req.file);
    if (!validation.valid) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors: validation.errors
      });
    }
    
    // ⭐ NEW: AI Detection Check
    console.log('[UPLOAD] Running AI detection...');
    const aiCheck = await aiDetector.validateUpload(req.file, description);
    
    if (!aiCheck.passed) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      
      console.log(`[UPLOAD REJECTED] AI content detected for user: ${username}`);
      
      return res.status(400).json({
        success: false,
        message: "Upload rejected: AI-generated content detected",
        reason: aiCheck.reason,
        details: "SeedVault preserves authentic cultural heritage. " +
                 "AI-generated materials are not permitted to maintain " +
                 "the integrity of indigenous knowledge and traditions."
      });
    }
    
    console.log('[UPLOAD] AI detection passed');
    
    // Create metadata record
    const metadata = {
      id: crypto.randomBytes(8).toString('hex'),
      filename: req.file.filename,
      originalName: req.file.originalname,
      title: title,
      description: description,
      tribe: tribe,
      mimetype: req.file.mimetype,
      size: req.file.size,
      accessLevel: accessLevel,
      uploadedBy: username,
      uploadedByRole: role,
      uploadDate: new Date().toISOString(),
      path: req.file.path,
      aiValidated: true // NEW: Mark as AI validated
    };
    
    // Save metadata to JSON file (in production, use database)
    const metadataPath = path.join(__dirname, '../uploads', 'metadata.json');
    let allMetadata = [];
    
    if (fs.existsSync(metadataPath)) {
      allMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
    
    allMetadata.push(metadata);
    fs.writeFileSync(metadataPath, JSON.stringify(allMetadata, null, 2));
    
    // Audit log
    console.log(`[UPLOAD SUCCESS] User: ${username}, Role: ${role}, File: ${req.file.filename}, Access: ${accessLevel}`);
    
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: metadata
    });
    
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    
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

// File retrieval with access control
app.get('/api/file/:accessLevel/:filename', (req, res) => {
  try {
    const { accessLevel, filename } = req.params;
    const requestingRole = req.query.userRole;
    
    // Access control check
    const canAccess = 
      requestingRole === 'admin' || 
      accessLevel === 'public' || 
      requestingRole === accessLevel;
    
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    
    const filePath = path.join(__dirname, '../uploads', accessLevel, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }
    
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('[FILE ACCESS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error accessing file"
    });
  }
});

// List files endpoint (with access control)
app.get('/api/files', (req, res) => {
  try {
    const role = req.query.role;
    
    if (!role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    const metadataPath = path.join(__dirname, '../uploads', 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return res.json({ success: true, files: [] });
    }
    
    let allMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Filter based on access rights
    const accessibleFiles = allMetadata.filter(file => {
      if (role === 'admin') return true;
      if (file.accessLevel === 'public') return true;
      if (file.accessLevel === role) return true;
      return false;
    });
    
    res.json({
      success: true,
      files: accessibleFiles
    });
    
  } catch (error) {
    console.error('[LIST FILES ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error listing files"
    });
  }
});

// Serve index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log('✅ SeedVault Server running on http://localhost:3000');
    console.log('📁 File uploads directory: ./uploads');
    console.log('🔒 Security features enabled (CWE-434 mitigation)');
    console.log('🤖 AI detection enabled');
  });
}

module.exports = app;
