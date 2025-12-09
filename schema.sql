-- SeedVault Database Schema
-- Run this file to set up the complete database

-- Create database
CREATE DATABASE IF NOT EXISTS seedvault;
USE seedvault;

-- Users table
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

-- Tribes/Communities table
CREATE TABLE IF NOT EXISTS tribes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Files/Artifacts table
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

-- Audit log table (for CWE-434 compliance and security tracking)
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

-- Insert default users
-- NOTE: In production, passwords should be hashed using bcrypt!
INSERT INTO users (username, password, role, email) VALUES
('admin', 'seedvault', 'admin', 'admin@seedvault.org'),
('guest', 'guest123', 'guest', 'guest@seedvault.org'),
('tribe1', 'tribe1pass', 'tribe1', 'tribe1@seedvault.org'),
('tribe2', 'tribe2pass', 'tribe2', 'tribe2@seedvault.org'),
('tribe3', 'tribe3pass', 'tribe3', 'tribe3@seedvault.org')
ON DUPLICATE KEY UPDATE username=username;

-- Insert default tribes
INSERT INTO tribes (name, description, contact_email) VALUES
('Tribe 1', 'First indigenous community preserving their cultural heritage', 'contact@tribe1.org'),
('Tribe 2', 'Second indigenous community with rich oral traditions', 'contact@tribe2.org'),
('Tribe 3', 'Third indigenous community protecting ancestral knowledge', 'contact@tribe3.org')
ON DUPLICATE KEY UPDATE name=name;

-- Create a view for easy artifact browsing
CREATE OR REPLACE VIEW artifact_details AS
SELECT 
    a.id,
    a.filename,
    a.original_name,
    a.title,
    a.description,
    a.mimetype,
    a.size,
    a.access_level,
    a.upload_date,
    a.downloads,
    a.status,
    u.username as uploaded_by_name,
    u.role as uploader_role,
    t.name as tribe_name,
    t.description as tribe_description
FROM artifacts a
LEFT JOIN users u ON a.uploaded_by = u.id
LEFT JOIN tribes t ON a.tribe_id = t.id
WHERE a.status = 'active';

-- Sample data for demonstration (optional)
-- Uncomment to add sample artifacts
/*
INSERT INTO artifacts (filename, original_name, title, description, tribe_id, mimetype, size, access_level, uploaded_by, file_path) VALUES
('sample_image.jpg', 'traditional_basket.jpg', 'Traditional Basket Weaving', 'Ancient basket weaving technique passed down through generations', 1, 'image/jpeg', 245760, 'public', 3, 'uploads/public/sample_image.jpg'),
('sample_audio.mp3', 'elder_story.mp3', 'Elder Story Recording', 'Recording of tribal elder sharing traditional stories', 2, 'audio/mpeg', 3145728, 'tribe2', 4, 'uploads/tribe2/sample_audio.mp3'),
('sample_doc.pdf', 'language_guide.pdf', 'Language Preservation Guide', 'Documentation of endangered language words and phrases', 3, 'application/pdf', 524288, 'tribe3', 5, 'uploads/tribe3/sample_doc.pdf');
*/

-- Display setup completion
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as tribe_count FROM tribes;
SELECT COUNT(*) as artifact_count FROM artifacts;
