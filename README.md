# Language Archive – Seed Vault 
A secure, ethically designed database platform for preserving and providing tiered access to cultural heritage materials. This archive enables Indigenous communities, researchers, and scholars to interact with sensitive materials under strict, role-based governance and protection against unauthorized use and AI-generated content.

# Project Vision
To create a technologically robust and culturally respectful digital archive that prioritizes Indigenous Data Sovereignty. Our goal is to empower communities to control their digital heritage while facilitating secure academic research. It strives to be a platform to preserve and protect traditions. While our work is deeply informed by Indigenous values and practices, the archive is designed for all communities who seek to preserve, protect, and share their traditions, knowledge, and histories with integrity and respect. 

# Key Features  

## Security & Access Control
- **Layered Role-Based Access Control** - Five distinct user roles (admin, tribe1, tribe2, tribe3, guest) with granular permissions
- **Secure File Upload System** - Mitigation with file type whitelisting, MIME type verification, and secure filename generation
- **Access Level Management** - Files stored and accessed according to community permissions (public, tribe1, tribe2, tribe3)
- **Audit Logging** - All uploads, downloads, and access attempts are tracked for security compliance

## AI Detection & Content Validation
- **⚙︎ AI-Generated Content Detection** - Automatic detection and rejection of AI-generated materials to preserve authenticity
- **Text Analysis** - Analyzes upload descriptions and text file contents using RoBERTa OpenAI detector model
- **PDF Text Extraction** - Extracts and analyzes text from PDF documents for AI-generated patterns
- **Confidence Thresholds** - Configurable detection sensitivity (default: 70% confidence threshold)

## Database & Storage
- **SQL Database** - MySQL backend for handling community records, cultural protocols, and user permissions
- **Secure File Management** - Encrypted storage with role-based directory structure
- **Metadata Tracking** - Comprehensive artifact metadata including title, description, tribe, access level, upload date, and AI validation status
- **Version Control Support** - Database schema designed for long-term preservation and data integrity

## User Interface
- **Responsive Design** - Earth-tone color scheme (#e1d7c6, #281d05, #0f6939) reflecting natural heritage
- **Search & Filter** - Full-text search with access-level filtering
- **Dashboard Views** - Separate interfaces for admin, tribe members, and guests
- **File Preview** - In-browser viewing for images, audio, video, PDF, and text files

# Technology Stack

## Backend
- **Node.js** with Express.js server
- **MySQL** database with InnoDB engine
- **Multer** for secure file uploads
- **@xenova/transformers** for AI detection (RoBERTa model)
- **pdf-parse** for PDF text extraction
- **CORS** and body-parser for API handling

## Frontend
- **Vanilla JavaScript** (no frameworks)
- **CSS3** with custom design system
- **localStorage** for session management
- **Fetch API** for backend communication

## Security Measures
- File type whitelisting (images, audio, documents, video)
- MIME type verification
- File size limits (10MB max)
- Secure filename generation with crypto hashing
- Double extension prevention
- Null byte injection prevention
- Directory traversal protection

# Installation Steps

## 1. CLONE REPOSITORY
```bash
git clone https://github.com/ahskihdus/seed-vault.git
cd seed-vault
```

## 2. INSTALL NODE.JS (if not installed)
### macOS:
```bash
brew install node
```

### Windows: 
Download from https://nodejs.org

### Linux:
```bash
sudo apt install nodejs npm
```

## 3. INSTALL MYSQL (if not installed)
### macOS:
```bash
brew install mysql
brew services start mysql
```

### Windows: 
Download from https://dev.mysql.com/downloads/mysql/
- Run the installer and follow the setup.
- Crucial: During setup, you will be prompted to set a root password. Remember this password as you will need it for the next step.
- The installer will typically set up the MySQL server as a Windows service and start it automatically.

### Linux:
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

## 4. INSTALL NODE DEPENDENCIES
```bash
npm install
```

This installs:
- express
- multer
- body-parser
- cors
- @xenova/transformers (AI detection)
- pdf-parse (PDF text extraction)

## 5. CREATE MYSQL DATABASE
Windows: Since the original script uses Linux shell syntax, you must run the SQL commands either interactively or by saving them to a file.
- Copy all the SQL commands 
- Save them into a new plain text file named setup.sql inside your seed-vault directory.

```bash
mysql -u root << EOF
CREATE DATABASE seedvault;
USE seedvault;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'tribe1', 'tribe2', 'tribe3', 'guest') NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tribes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS artifacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tribe_id INT,
    mimetype VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    access_level ENUM('public', 'tribe1', 'tribe2', 'tribe3') NOT NULL,
    uploaded_by INT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500) NOT NULL,
    downloads INT DEFAULT 0,
    status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
    FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_access_level (access_level),
    INDEX idx_upload_date (upload_date),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    artifact_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (username, password, role, email) VALUES
('admin', 'seedvault', 'admin', 'admin@seedvault.org'),
('guest', 'guest123', 'guest', 'guest@seedvault.org'),
('tribe1', 'tribe1pass', 'tribe1', 'tribe1@seedvault.org'),
('tribe2', 'tribe2pass', 'tribe2', 'tribe2@seedvault.org'),
('tribe3', 'tribe3pass', 'tribe3', 'tribe3@seedvault.org');

INSERT INTO tribes (name, description, contact_email) VALUES
('Tribe 1', 'First indigenous community', 'contact@tribe1.org'),
('Tribe 2', 'Second indigenous community', 'contact@tribe2.org'),
('Tribe 3', 'Third indigenous community', 'contact@tribe3.org');
EOF
```

- Windows: Open your terminal in the seed-vault directory and run the following command. You will be prompted for the root password you set:
``` bash
mysql -u root -p < setup.sql
```

## 6. CREATE UPLOAD DIRECTORIES
If using PowerShell/Git Bash:
```bash
mkdir -p uploads/public uploads/tribe1 uploads/tribe2 uploads/tribe3
```
If using Command Prompt:
``` bash
md uploads
md uploads\public uploads\tribe1 uploads\tribe2 uploads\tribe3
```

## 7. UPDATE DATABASE PASSWORD IN SERVER FILE (if needed)
- Open `server/app.js` and change password: '' to your MySQL password

## 8. START THE SERVER
```bash
npm start
```

You should see:
```
✅ SeedVault Server running on http://localhost:3000
📁 File uploads directory: ./uploads
🔒 Security features enabled (CWE-434 mitigation)
⚙︎ AI detection enabled
```

**Note:** First startup may take 10-30 seconds as the AI detection model downloads.

## 9. OPEN IN BROWSER
- Go to: http://localhost:3000

# Usage 

## User Roles & Permissions

| Role | Upload | View Public | View Tribe 1 | View Tribe 2 | View Tribe 3 | Manage Users |
|------|--------|-------------|--------------|--------------|--------------|--------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tribe 1** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Tribe 2** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Tribe 3** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Guest** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

## Test Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | seedvault | Administrator |
| tribe1 | tribe1pass | Tribe 1 Member |
| tribe2 | tribe2pass | Tribe 2 Member |
| tribe3 | tribe3pass | Tribe 3 Member |
| guest | guest123 | Guest (Read-only) |

## Uploading Artifacts

1. **Login** with appropriate credentials
2. Navigate to **Upload** page
3. Fill in artifact details:
   - Title (required)
   - Description (required) - will be analyzed for AI content
   - Cultural Origin (optional)
   - Access Level (required)
4. **Select file** (max 10MB)
5. **Upload** - file will be validated for security and AI content

### Allowed File Types
- **Images:** JPG, PNG, GIF
- **Audio:** MP3, WAV, OGG
- **Documents:** PDF, DOCX, TXT
- **Video:** MP4, WEBM

## AI Content Detection

The system automatically analyzes:
- ✅ **Upload descriptions** - All text in description field
- ✅ **Text files (.txt)** - Complete file contents
- ✅ **PDF files (.pdf)** - Extracted text content
- ❌ **Images** - Not currently analyzed (requires specialized model)
- ❌ **Audio/Video** - Not analyzed

**Detection Threshold:** 70% confidence
**Model:** RoBERTa OpenAI Detector (Xenova/roberta-base-openai-detector)

### Examples of AI-Generated Text That Will Be Rejected:

❌ *"In examining this remarkable cultural artifact, we observe a comprehensive synthesis of traditional methodologies and indigenous knowledge systems. The intricate interplay between historical preservation techniques..."*

❌ *"Let me provide you with a comprehensive analysis of this cultural heritage item. Firstly, it's important to note that this artifact represents a significant milestone..."*

✅ *"This basket was made by a local elder using willow branches from Igiuig's ancestral lands. She taught the traditional patterns to commmunal youth."*

## Browsing the Archive

1. Navigate to **Browse Archive** page
2. Use search bar to find artifacts by title, author, or date
3. Filter by access level (All, Public, Tribe 1, Tribe 2, Tribe 3)
4. Click on any artifact to view details and download

# Architecture

## File Structure
```
seed-vault/
├── server/
│   ├── app.js              # Main Express server with AI detection
│   ├── aiDetector.js       # AI content detection module
│   └── upload.js           # Legacy upload handler
├── js/
│   ├── auth.js             # Authentication logic
│   ├── roles.js            # Role-based UI logic
│   └── auth.test.js        # Unit tests
├── css/
│   └── styles.css          # Global styles
├── uploads/                # Storage directory (gitignored)
│   ├── public/
│   ├── tribe1/
│   ├── tribe2/
│   ├── tribe3/
│   └── metadata.json       # File metadata
├── index.html              # Landing page
├── admin.html              # Admin dashboard
├── tribe-dashboard.html    # Tribe member dashboard
├── upload.html             # Upload interface
├── seed.html               # Browse archive
├── view-artifact.html      # Artifact detail view
├── schema.sql              # Database schema
├── package.json            # Dependencies
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /login` - User authentication

### File Operations
- `POST /api/upload` - Upload file with AI validation
- `GET /api/files?role={role}` - List accessible files
- `GET /api/file/:accessLevel/:filename?userRole={role}` - Download file

### Response Format
```json
{
  "success": true/false,
  "message": "...",
  "file": { /* metadata */ },
  "reason": "...",  // For rejections
  "details": { /* additional info */ }
}
```

# Testing

## Unit Tests
```bash
npm test
```

Tests cover:
- ✅ Login function validation
- ✅ Role-based permissions
- ✅ AI content detection
- ✅ File validation

## Manual Testing Checklist

### Security Testing
- [ ] Upload file with double extension (.jpg.exe) - should reject
- [ ] Upload file > 10MB - should reject
- [ ] Upload disallowed file type (.exe) - should reject
- [ ] Try accessing tribe1 file as tribe2 user - should deny

### AI Detection Testing
- [ ] Upload with human-written description - should accept
- [ ] Upload with AI-generated description - should reject
- [ ] Upload .txt file with AI content - should reject
- [ ] Upload PDF with AI content - should reject

### Access Control Testing
- [ ] Guest tries to upload - should deny
- [ ] Tribe1 tries to view tribe2 files - should deny
- [ ] Admin views all files - should succeed

# Configuration

## Adjusting AI Detection Sensitivity

Edit `server/aiDetector.js`:

```javascript
// Line 112 & 131 - Change confidence threshold
if (descResult.isAI && descResult.confidence > 0.7) {  // 70%
```

- **Lower (0.5)**: More strict, may reject authentic content
- **Higher (0.9)**: More lenient, may allow some AI content

## File Size Limits

Edit `server/app.js`:

```javascript
// Line 66
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

## Adding New File Types

Edit `server/app.js`:

```javascript
// Lines 56-66
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'your/mimetype': ['.ext'],  // Add here
  // ...
};
```

# License  
All data and cultural content stored within the archive remains the intellectual property of the contributing Indigenous communities, governed by their own protocols and the project's Ethical Use Policy. 

The SeedVault codebase is licensed under the Apache License 2.0. See LICENSE file for details.

By contributing to this project, you agree to respect these principles of Indigenous Data Sovereignty. 

# Credits 
The following people are working as developers and maintainers on the current version: 
-   Thrisha Duggisetty
-   Martin Goff
-   Colin Le
-   Kiara Nelson
-   Destiny Ngigi
-   Shaina Patel
-   Sudhiksha Sadige

# Acknowledgments

**AI Detection Model:**
- Xenova Transformers.js - https://github.com/xenova/transformers.js
- RoBERTa OpenAI Detector - Trained on GPT-2 outputs

**Inspiration:**
- Indigenous data sovereignty principles
- Community-driven cultural preservation initiatives

# Support & Contributing

For questions, issues, or contributions:
- Open an issue on GitHub
- Submit pull requests for improvements
- Contact the development team

**Note:** Please respect the cultural sensitivity of this project. All contributions should align with Indigenous Data Sovereignty principles and ethical data practices.

---

**Built with respect for Indigenous communities and cultural heritage preservation.**
