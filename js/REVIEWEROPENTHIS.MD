# Hey Reviewer! Please follow these steps: 

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
# Thanks for reviewing!
