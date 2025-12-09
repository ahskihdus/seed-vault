# Language Archive – Seed Vault 
A secure, ethically designed database platform for preserving and providing tiered access to cultural heritage materials. This archive enables Indigenous communities, researchers, and scholars to interact with sensitive materials under strict, role-based governance and protection against unauthorized use and AI-Scoping.  

# Project Vision
To create a technologically robust and culturally respectful digital archive that prioritizes Indigenous Data Sovereignty. Our goal is to empower communities to control their digital heritage while facilitating secure academic research. It strives to be a platform to preserve and protect traditions. While our work is deeply informed by Indigenous values and practices, the archive is designed for all communities who seek to preserve, protect, and share their traditions, knowledge, and histories with integrity and respect. 

# Key Features  
Layered Role-Based access control  
AI protection methods   
SQL – The backbone of our model will be the SQL Database. Using SQL, we can handle community records, cultural protocols, and user permissions in an organized system. It also supports features like search, version control, and secure access, making the archive both easy to use and dependable for long-term preservation. 
Secure File Management -- A secure upload and storage system for sensitive file types (e.g., audio recordings, documents, images) with encrypted storage. 

# Installation Steps
## 1. CLONE REPOSITORY
```
git clone https://github.com/ahskihdus/seed-vault.git
cd seed-vault
git checkout Kiara-Test-Branch
```

## 2. INSTALL NODE.JS (if not installed)
### macOS:
```
brew install node
```

### Windows: Download from https://nodejs.org
### Linux:
```
sudo apt install nodejs npm
```

## 3. INSTALL MYSQL (if not installed)
### macOS:
```
brew install mysql
brew services start mysql
```

### Windows: Download from https://dev.mysql.com/downloads/mysql/
### Linux:
```
sudo apt install mysql-server
sudo systemctl start mysql
```

## 4. INSTALL NODE DEPENDENCIES
```
npm install
```

## 5. CREATE MYSQL DATABASE (copy and paste all of this)
```
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

## 6. CREATE UPLOAD DIRECTORIES
```
mkdir -p uploads/public uploads/tribe1 uploads/tribe2 uploads/tribe3
```

## 7. UPDATE DATABASE PASSWORD IN SERVER FILE (if needed)
- Open server/app.js and change password: '' to your MySQL password

## 8. START THE SERVER
```
npm start
```

## 9. OPEN IN BROWSER
- Go to: http://localhost:3000

# Usage 
Individuals can submit data (digital artifact, pictures, language, scriptures) using the upload feature. Once the data is uploaded it is reviewed to check its authenticity. To access the data, users can navigate through the drop-down menu or the search bar using key words. All the data is organized according to its group so users can navigate easily throughout the site. 

# License  
All data and cultural content stored within the archive remains the intellectual property of the contributing Indigenous communities, governed by their own protocols and the project's Ethical Use Policy. By contributing to this project, you agree to respect these principles of Indigenous Data Sovereignty. 

# Credits 
The following people are working as developers and maintainers on the current version: 
-   Thrisha Duggisetty
-   Martin Goff
-   Colin Le
-   Kiara Nelson
-   Destiny Ngigi
-   Shaina Patel
-   Sudhiksha Sadige
