# Hey Reviewer! If you're here that means you're at My Branch repo and not my directed link where everything is! 
Don't worry. The instructions follow the same here. Please follow these steps: 

 # 1. Open your Terminal and clone this Repo. 
 ```
git clone https://github.com/ahskihdus/seed-vault.git
cd seed-vault
git checkout Kiara-Test-Branch
```
# 2. This Unit Test Requires some Platforms. 
  * Node.js v18 or higher
  * npm (Node Package Manager) -- Installed automatically with Node

     -If node isn't installed yet, on your terminal:--
    * macOs: ```brew install node```
    * Windows: download from https://nodejs.org/en
      
# 3. Now that you have it installed node, install dependencies.
    
  ``` npm install```
This installs all runtime and developer dependencies, including:

Express (for the backend server)

Jest and Supertest (for unit testing)

CORS and Body-Parser (for handling requests)

# 4. Run the server 
``` npm start```
Open your browser and visit http://localhost:3000

You should see the SeedVault homepage with the login modal.

# 5. Run Unit Tests
``` npm test```
This executes all Jest test suites, including:

js/auth.test.js → tests the login logic (admin/guest roles)

# Submission Requirements
After tests pass:

Take screenshots of the terminal test results.

(Optional) Run with coverage:

```npx jest --coverage```


Save all screenshots in a single PDF named:

```StudentID_UnitTests_CS3203Fall2025.pdf```


# If everything works, your terminal should look like something similar to this: 
```
 PASS  js/auth.test.js
  Login function (pure logic tests)
    ✓ ✅ logs in successfully with correct credentials (1 ms)
    ✓ ❌ fails login with incorrect password
    ✓ ❌ fails login with incorrect username
    ✓ ❌ fails login with both invalid username and password

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.11 s, estimated 1 s
Ran all test suites.
```

# Thanks for reviewing!



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
### Phase I (preinstallation) - Before installing, ensure that the server meets the hardware and software requirements for sustainable storage and access. Confirm that the infrastructure supports: 
-   Data ethics protocols, including privacy safeguards and respect for cultural sensitivities. 
-   Tiered access controls, so that different user groups (e.g., community members, researchers, general public) can be appropriately supported. 
-   Long-term preservation standards, ensuring interoperability with archival formats and metadata schemas used in cultural heritage stewardship. 
### Phase II (Installation)  - Run the installer to: 
-   Copy program files and create directories in a way that protects the integrity of cultural data. 
-   Register the platform with the operating system while applying secure authentication frameworks to respect community access agreements. 
-   Configure environment variables and libraries to support inclusive metadata standards (e.g., multilingual support, Indigenous knowledge labels). 
-   Establish default tiered access settings that recognize the rights and permissions defined by source communities. 
### Phase III (post-installation) – After installation, configure the environment with cultural sensitivity in mind: 
-   Install extensions and packages that support ethical metadata enrichment (e.g., provenance tracking, cultural sensitivity notices). 
-   Test access layers by running sample queries to verify that restricted, community-only, and public access tiers work as intended. 
-   Document the configuration process transparently, so that future stewards and community partners can audit, trust, and sustain the platform.  

# Usage 
Individuals can submit data (digital artifact, pictures, language, scriptures) using the upload feature. Once the data is uploaded it is reviewed to check its authenticity. To access the data, users can navigate through the drop-down menu or the search bar using key words. All the data is organized according to its group so users can navigate easily throughout the site. 

# License  
All data and cultural content stored within the archive remains the intellectual property of the contributing Indigenous communities, governed by their own protocols and the project's Ethical Use Policy. By contributing to this project, you agree to respect these principles of Indigenous Data Sovereignty. 

# Credits 
The following people are working as developers and maintainers on the current version: 
-   Destiny Ngigi  
-   Kiara Nelson 
-   Thrisha Duggisetty 
-   Sudhiksha Sadige 
-   Martin Goff 
-   Colin Le 
-   Shaina Patel
