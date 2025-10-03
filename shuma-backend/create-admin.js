// Run this script once to create an admin user
// Usage: node create-admin.js <username> <password> <email>

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'shuma_bookings',
  user: process.env.DB_USER || 'shuma_admin',
  password: process.env.DB_PASSWORD || 'ChangeThisSecurePassword123!',
});

async function createAdmin() {
  const [,, username, password, email] = process.argv;

  if (!username || !password) {
    console.error('Usage: node create-admin.js <username> <password> [email]');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admin_users (username, password_hash, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO UPDATE
       SET password_hash = $2, email = $3
       RETURNING id, username, email`,
      [username, hashedPassword, email || null]
    );

    console.log('✅ Admin user created/updated successfully:');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
