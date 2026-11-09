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

const getAllProducts = async (viewerId = null) => {
  const result = await pool.query(
    `SELECT p.*, u.name AS seller_name,
       COALESCE(l.likes_count, 0)::INTEGER AS likes_count,
       COALESCE(c.comments_count, 0)::INTEGER AS comments_count,
       COALESCE(r.rating_avg, 0)::NUMERIC AS rating_avg,
       COALESCE(r.ratings_count, 0)::INTEGER AS ratings_count,
       EXISTS (
         SELECT 1 FROM product_likes pl
         WHERE pl.product_id = p.id AND pl.user_id = $1
       ) AS user_liked,
       (
         SELECT pr.rating FROM product_ratings pr
         WHERE pr.product_id = p.id AND pr.user_id = $1
       ) AS user_rating
     FROM products p
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN (
       SELECT product_id, COUNT(*) AS likes_count
       FROM product_likes GROUP BY product_id
     ) l ON l.product_id = p.id
     LEFT JOIN (
       SELECT product_id, COUNT(*) AS comments_count
       FROM comments GROUP BY product_id
     ) c ON c.product_id = p.id
     LEFT JOIN (
       SELECT product_id, AVG(rating)::NUMERIC(3, 2) AS rating_avg, COUNT(*) AS ratings_count
       FROM product_ratings GROUP BY product_id
     ) r ON r.product_id = p.id
     ORDER BY p.created_at DESC`,
    [viewerId]
  );
  return result.rows;
};

const getProductComments = async (productId) => {
  const result = await pool.query(
    `SELECT c.id, c.product_id, c.user_id, c.text, c.created_at, u.name AS user_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.product_id = $1
     ORDER BY c.created_at DESC`,
    [productId]
  );
  return result.rows;
};

const createComment = async (productId, userId, content) => {
  const result = await pool.query(
    `WITH inserted AS (
       INSERT INTO comments (product_id, user_id, text)
       VALUES ($1, $2, $3)
       RETURNING id, product_id, user_id, text, created_at
     )
     SELECT inserted.*, users.name AS user_name
     FROM inserted JOIN users ON users.id = inserted.user_id`,
    [productId, userId, content]
  );
  return result.rows[0];
};

const productExists = async (productId) => {
  const result = await pool.query(`SELECT 1 FROM products WHERE id = $1`, [productId]);
  return result.rowCount > 0;
};

const setProductLike = async (productId, userId, liked) => {
  if (liked) {
    await pool.query(
      `INSERT INTO product_likes (product_id, user_id)
       VALUES ($1, $2) ON CONFLICT (product_id, user_id) DO NOTHING`,
      [productId, userId]
    );
  } else {
    await pool.query(
      `DELETE FROM product_likes WHERE product_id = $1 AND user_id = $2`,
      [productId, userId]
    );
  }
  const result = await pool.query(
    `SELECT COUNT(*)::INTEGER AS likes_count FROM product_likes WHERE product_id = $1`,
    [productId]
  );
  return result.rows[0].likes_count;
};

const setProductRating = async (productId, userId, rating) => {
  await pool.query(
    `INSERT INTO product_ratings (product_id, user_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (product_id, user_id)
     DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP`,
    [productId, userId, rating]
  );
  const result = await pool.query(
    `SELECT AVG(rating)::NUMERIC(3, 2) AS rating_avg,
            COUNT(*)::INTEGER AS ratings_count
     FROM product_ratings WHERE product_id = $1`,
    [productId]
  );
  return result.rows[0];
};

const getAllComments = async () => {
  const result = await pool.query(
    `SELECT c.id, c.text, c.created_at, u.name AS user_name,
            p.id AS product_id, p.title AS product_title
     FROM comments c
     JOIN users u ON u.id = c.user_id
     JOIN products p ON p.id = c.product_id
     ORDER BY c.created_at DESC`
  );
  return result.rows;
};

const deleteComment = async (id) => {
  const result = await pool.query(
    `DELETE FROM comments WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
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

const getConversations = async (userId) => {
  const result = await pool.query(
    `SELECT c.id, c.product_id, p.title AS product_title, p.image_url,
            CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END AS other_user_id,
            CASE WHEN c.buyer_id = $1 THEN seller.name ELSE buyer.name END AS other_user_name,
            latest.text AS last_message, latest.sender_id AS last_sender_id,
            latest.created_at AS last_message_at,
            (SELECT COUNT(*)::INTEGER
             FROM chat_messages unread
             WHERE unread.conversation_id = c.id
               AND unread.sender_id <> $1
               AND unread.read_at IS NULL) AS unread_count
     FROM chat_conversations c
     JOIN products p ON p.id = c.product_id
     JOIN users buyer ON buyer.id = c.buyer_id
     JOIN users seller ON seller.id = c.seller_id
     LEFT JOIN LATERAL (
       SELECT m.text, m.sender_id, m.created_at
       FROM chat_messages m
       WHERE m.conversation_id = c.id
       ORDER BY m.created_at DESC, m.id DESC
       LIMIT 1
     ) latest ON true
     WHERE c.buyer_id = $1 OR c.seller_id = $1
     ORDER BY COALESCE(latest.created_at, c.updated_at) DESC, c.id DESC`,
    [userId]
  );
  return result.rows;
};

const startConversation = async (productId, buyerId, text) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const productResult = await client.query(
      `SELECT id, user_id, title, image_url
       FROM products
       WHERE id = $1 AND is_published = true AND user_id IS NOT NULL`,
      [productId]
    );
    const product = productResult.rows[0];
    if (!product) {
      await client.query("ROLLBACK");
      return { error: "product_not_found" };
    }
    if (Number(product.user_id) === Number(buyerId)) {
      await client.query("ROLLBACK");
      return { error: "self_contact" };
    }

    const conversationResult = await client.query(
      `INSERT INTO chat_conversations (product_id, buyer_id, seller_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, buyer_id)
       DO UPDATE SET updated_at = chat_conversations.updated_at
       RETURNING id, product_id, buyer_id, seller_id`,
      [productId, buyerId, product.user_id]
    );
    const conversation = conversationResult.rows[0];
    const messageResult = await client.query(
      `INSERT INTO chat_messages (conversation_id, sender_id, text)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id, sender_id, text, created_at, read_at`,
      [conversation.id, buyerId, text]
    );
    await client.query(
      `UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [conversation.id]
    );
    const sellerResult = await client.query(
      `SELECT name FROM users WHERE id = $1`,
      [product.user_id]
    );
    await client.query("COMMIT");
    return {
      conversation: {
        ...conversation,
        product_title: product.title,
        image_url: product.image_url,
        other_user_id: product.user_id,
        other_user_name: sellerResult.rows[0].name,
      },
      message: messageResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getConversationMessages = async (conversationId, userId) => {
  const accessResult = await pool.query(
    `SELECT id FROM chat_conversations
     WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)`,
    [conversationId, userId]
  );
  if (!accessResult.rowCount) return null;

  await pool.query(
    `UPDATE chat_messages
     SET read_at = CURRENT_TIMESTAMP
     WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL`,
    [conversationId, userId]
  );
  const result = await pool.query(
    `SELECT m.id, m.conversation_id, m.sender_id, m.text, m.created_at,
            m.read_at, u.name AS sender_name
     FROM chat_messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at, m.id`,
    [conversationId]
  );
  return result.rows;
};

const sendConversationMessage = async (conversationId, senderId, text) => {
  const result = await pool.query(
    `INSERT INTO chat_messages (conversation_id, sender_id, text)
     SELECT c.id, $2, $3
     FROM chat_conversations c
     WHERE c.id = $1 AND (c.buyer_id = $2 OR c.seller_id = $2)
     RETURNING id, conversation_id, sender_id, text, created_at, read_at`,
    [conversationId, senderId, text]
  );
  if (!result.rowCount) return null;

  await pool.query(
    `UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [conversationId]
  );
  const message = result.rows[0];
  const senderResult = await pool.query(
    `SELECT name FROM users WHERE id = $1`,
    [senderId]
  );
  return { ...message, sender_name: senderResult.rows[0].name };
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
  getProductComments,
  createComment,
  productExists,
  setProductLike,
  setProductRating,
  getAllComments,
  deleteComment,
  getUserProducts,
  updateProductPublished,
  getAllUsers,
  deleteUser,
  getConversations,
  startConversation,
  getConversationMessages,
  sendConversationMessage,
  createChat,
  createChatBot
};
