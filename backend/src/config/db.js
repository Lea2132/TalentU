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

const createCommentsTable = `
  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createProductLikesTable = `
  CREATE TABLE IF NOT EXISTS product_likes (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, user_id)
  );
`;

const createProductRatingsTable = `
  CREATE TABLE IF NOT EXISTS product_ratings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, user_id)
  );
`;

const createChatConversationsTable = `
  CREATE TABLE IF NOT EXISTS chat_conversations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, buyer_id),
    CHECK (buyer_id <> seller_id)
  );
`;

const createChatMessagesTable = `
  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
  );
`;

const createChatMessageIndexes = `
  CREATE INDEX IF NOT EXISTS chat_messages_conversation_created_idx
    ON chat_messages (conversation_id, created_at, id);
  CREATE INDEX IF NOT EXISTS chat_messages_unread_idx
    ON chat_messages (conversation_id, sender_id)
    WHERE read_at IS NULL;
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
    await pool.query(createCommentsTable);
    console.log('Tabla "comments" verificada/creada');
    await pool.query(createProductLikesTable);
    console.log('Tabla "product_likes" verificada/creada');
    await pool.query(createProductRatingsTable);
    console.log('Tabla "product_ratings" verificada/creada');
    await pool.query(createChatConversationsTable);
    await pool.query(createChatMessagesTable);
    await pool.query(createChatMessageIndexes);
    console.log('Tablas de conversaciones y mensajes verificadas/creadas');
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
