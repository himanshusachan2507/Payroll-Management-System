# Referral Platform MVP

### How to run
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example` and fill database details.

3. Create MySQL database and run this SQL:

   ```sql
   CREATE DATABASE referral_platform;
   USE referral_platform;

   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100),
     email VARCHAR(100) UNIQUE,
     password VARCHAR(255)
   );

   CREATE TABLE referrals (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT,
     title VARCHAR(100),
     company VARCHAR(100),
     description TEXT,
     status VARCHAR(50) DEFAULT 'pending',
     FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

4. Start server:
   ```bash
   npm start
   ```

5. Visit: `http://localhost:3000`