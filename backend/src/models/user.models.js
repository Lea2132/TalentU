import { pool } from "../config/db.js";

const newuser = async (name, email, password, is_admin = false) => {
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, is_admin)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, password, is_admin]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al crear nuevo usuario:", error);
    throw new Error("Error al crear nuevo usuario");
  }
};

const findByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0];
};

const findById = async (id) => {
  const result = await pool.query(`SELECT id, name, email, is_admin FROM users WHERE id = $1`, [id]);
  return result.rows[0];
};
const createProduct = async (title, description, price, category, image_url, user_id) => {
  const result = await pool.query(
    `INSERT INTO products (title, description, price, category, image_url, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, description, price, category, image_url, user_id]
  );
  return result.rows[0];
};

const editProduct = async (id, title, description, price, category) => {
  const result = await pool.query(
    `UPDATE products
     SET title=$1, description=$2, price=$3, category=$4
     WHERE id=$5 RETURNING *`,
    [title, description, price, category, id]
  );
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const result = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
};

const getAllProducts = async () => {
  const result = await pool.query(`SELECT * FROM products`);
  return result.rows;
};

const getUserProducts = async (user_id) => {
  const result = await pool.query(`SELECT * FROM products WHERE user_id = $1`, [user_id]);
  return result.rows;
};

const updateProductPublished = async (id, is_published) => {
  const result = await pool.query(
    `UPDATE products
     SET is_published=$1
     WHERE id=$2 RETURNING *`,
    [is_published, id]
  );
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result.rows;
};

const deleteUser = async (id) => {
  const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
};

const createChat = async (text, sender, user_id) => {
  const result = await pool.query(
    `INSERT INTO chats (text, sender, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [text, sender, user_id]
  );
  return result.rows[0];
};

const createChatBot = async (text, sender, user_id) => {
  const result = await pool.query(
    `INSERT INTO chatsbot (text, sender, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [text, sender, user_id]
  );
  return result.rows[0];
};

export const UserModel = {
  newuser,
  findByEmail,
  findById,
  createProduct,
  editProduct,
  deleteProduct,
  getAllProducts,
  getUserProducts,
  updateProductPublished,
  getAllUsers,
  deleteUser,
  createChat,
  createChatBot
};
