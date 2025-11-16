import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Tabla de userss
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,       
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Tabla de products
const createProductsTable = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  );
`;

//Tabla de chats
const createChatTable = `
  CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    sender VARCHAR(50) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  );
`;

//Tabla de chats del bot
const createChatTableBot = `
  CREATE TABLE IF NOT EXISTS chatsbot (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    sender VARCHAR(50) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  );
`;


const createTables = async () => {
  try {
    await pool.query(createUsersTable);
    console.log('Tabla "users" creada exitosamente');
    await pool.query(createProductsTable);
    console.log('Tabla "products" creada exitosamente');
    await pool.query(createChatTable);
    console.log('Tabla "chats" creada exitosamente');
    await pool.query(createChatTableBot);
    console.log('Tabla "chatsBot" creada exitosamente');
    // Ensure columns exist for running on existing databases (safe migrations)
    try {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;");
      console.log('Columna "is_admin" en users verificada/creada');
    } catch (err) {
      console.error('No se pudo asegurar columna is_admin en users:', err.message);
    }

    try {
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;");
      console.log('Columna "is_published" en products verificada/creada');
    } catch (err) {
      console.error('No se pudo asegurar columna is_published en products:', err.message);
    }
  } catch (error) {
    console.error('Error al crear las tablas:', error);
  }
};

// Llamada a la funcion para crear las tablas
createTables();
