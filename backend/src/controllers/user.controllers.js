import { UserModel } from "../models/user.models.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { uploadProductImage } from "../services/cloudinary.js";

dotenv.config();

const serviceCategories = [
  "Clases y tutorías",
  "Belleza y cuidado personal",
  "Otros servicios",
];

// ======================== CREAR USUARIO ADMIN POR DEFECTO ========================
export const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("ADMIN_EMAIL y ADMIN_PASSWORD no configurados; se omite la creación del administrador");
      return;
    }

    const existingAdmin = await UserModel.findByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcryptjs.hash(adminPassword, 10);
      await UserModel.newuser("Administrador", adminEmail, hashedPassword, true);
      console.log("✅ Usuario administrador creado con éxito");
    } else {
      const hashedPassword = await bcryptjs.hash(adminPassword, 10);
      await UserModel.updateAdminCredentials(adminEmail, hashedPassword);
      console.log("ℹ️ Credenciales del administrador sincronizadas desde variables de entorno");
    }
  } catch (error) {
    console.error("❌ Error al crear el usuario administrador:", error);
    throw error;
  }
};

// ======================== REGISTRO DE USUARIOS ========================
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Faltan datos por rellenar" });
  }

  try {
    const emailExisting = await UserModel.findByEmail(email);
    if (emailExisting) {
      return res.status(409).json({ message: "Este email ya está en uso" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    const createUser = await UserModel.newuser(name, email, hashPassword, false);

    return res.status(201).json({ message: "Usuario registrado con éxito", user: createUser });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    return res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

// ======================== LOGIN DE USUARIOS ========================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Usuario autenticado",
      token,
      isAdmin: user.is_admin,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Error al autenticar el usuario:", error);
    return res.status(500).json({ message: "Error al autenticar el usuario" });
  }
};

// ======================== SERVICIOS ========================
export const createProducts = async (req, res) => {
  const { title, description, price, category } = req.body;

  if (!serviceCategories.includes(category)) {
    return res.status(400).json({ message: "Selecciona una categoría de servicio válida" });
  }

  try {
    const image_url = req.file
      ? req.file.buffer
        ? await uploadProductImage(req.file)
        : req.file.path
      : null;
    const userId = req.userId || null;
    const product = await UserModel.createProduct(title, description, price, category, image_url, userId);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

export const editProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category } = req.body;

  if (!serviceCategories.includes(category)) {
    return res.status(400).json({ message: "Selecciona una categoría de servicio válida" });
  }

  try {
    const product = await UserModel.editProduct(id, title, description, price, category);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await UserModel.deleteProduct(id);
    return res.status(200).json({ message: "Servicio eliminado", product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await UserModel.getAllProducts(req.userId || null);
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return res.status(500).json({ message: "Error al obtener servicios" });
  }
};

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

export const getProductComments = async (req, res) => {
  const { productId } = req.params;
  if (!isValidId(productId)) {
    return res.status(400).json({ message: "Servicio inválido" });
  }

  try {
    const comments = await UserModel.getProductComments(productId);
    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return res.status(500).json({ message: "Error al obtener comentarios" });
  }
};

export const createComment = async (req, res) => {
  const { productId } = req.params;
  const submittedText = req.body.text ?? req.body.content;
  const text = typeof submittedText === "string" ? submittedText.trim() : "";
  if (!isValidId(productId) || !text) {
    return res.status(400).json({ message: "El comentario y el servicio son obligatorios" });
  }
  if (text.length > 1000) {
    return res.status(400).json({ message: "El comentario no puede superar 1000 caracteres" });
  }

  try {
    if (!(await UserModel.productExists(productId))) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    const comment = await UserModel.createComment(productId, req.userId, text);
    return res.status(201).json(comment);
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return res.status(500).json({ message: "Error al crear comentario" });
  }
};

export const setProductLike = async (req, res) => {
  const { productId } = req.params;
  const { liked } = req.body;
  if (!isValidId(productId) || typeof liked !== "boolean") {
    return res.status(400).json({ message: "Servicio o estado de like inválido" });
  }

  try {
    if (!(await UserModel.productExists(productId))) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    const likesCount = await UserModel.setProductLike(productId, req.userId, liked);
    return res.status(200).json({ liked, likes_count: likesCount });
  } catch (error) {
    console.error("Error al actualizar like:", error);
    return res.status(500).json({ message: "Error al actualizar el like" });
  }
};

export const setProductRating = async (req, res) => {
  const { productId } = req.params;
  const rating = Number(req.body.rating);
  if (!isValidId(productId) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "La calificación debe ser de 1 a 5 estrellas" });
  }

  try {
    if (!(await UserModel.productExists(productId))) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    const ratingSummary = await UserModel.setProductRating(productId, req.userId, rating);
    return res.status(200).json({ rating, ...ratingSummary });
  } catch (error) {
    console.error("Error al guardar calificación:", error);
    return res.status(500).json({ message: "Error al guardar la calificación" });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await UserModel.getAllComments();
    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error al obtener comentarios para administración:", error);
    return res.status(500).json({ message: "Error al obtener comentarios" });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ message: "Comentario inválido" });
  }

  try {
    const comment = await UserModel.deleteComment(id);
    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }
    return res.status(200).json({ message: "Comentario eliminado" });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return res.status(500).json({ message: "Error al eliminar comentario" });
  }
};

export const updateProductPublished = async (req, res) => {
  const { id } = req.params;
  const { is_published } = req.body;

  try {
    const product = await UserModel.updateProductPublished(id, is_published);
    return res.status(200).json({ message: "Estado de publicación actualizado", product });
  } catch (error) {
    console.error("Error al actualizar estado de publicación:", error);
    return res.status(500).json({ message: "Error al actualizar estado de publicación" });
  }
};

export const getUserProducts = async (req, res) => {
  const { userId } = req.params;

  try {
    const products = await UserModel.getUserProducts(userId);
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener servicios del usuario:", error);
    return res.status(500).json({ message: "Error al obtener servicios del usuario" });
  }
};

// ======================== USUARIOS (SOLO ADMIN) ========================
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.deleteUser(id);
    return res.status(200).json({ message: "Usuario eliminado", user });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

// ======================== CHATS ========================
const validateChatText = (value) => {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= 2000 ? text : null;
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await UserModel.getConversations(req.userId);
    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    return res.status(500).json({ message: "No se pudieron cargar las conversaciones" });
  }
};

export const startConversation = async (req, res) => {
  const productId = Number(req.body.product_id);
  const text = validateChatText(req.body.text);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "La publicación no es válida" });
  }
  if (!text) {
    return res.status(400).json({ message: "Escribe un mensaje de hasta 2000 caracteres" });
  }

  try {
    const result = await UserModel.startConversation(productId, req.userId, text);
    if (result.error === "product_not_found") {
      return res.status(404).json({ message: "La publicación ya no está disponible" });
    }
    if (result.error === "self_contact") {
      return res.status(403).json({ message: "No puedes iniciar una conversación contigo mismo" });
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error al iniciar conversación:", error);
    return res.status(500).json({ message: "No se pudo enviar el mensaje" });
  }
};

export const getConversationMessages = async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ message: "La conversación no es válida" });
  }

  try {
    const messages = await UserModel.getConversationMessages(conversationId, req.userId);
    if (!messages) return res.status(404).json({ message: "Conversación no encontrada" });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error al cargar mensajes:", error);
    return res.status(500).json({ message: "No se pudieron cargar los mensajes" });
  }
};

export const sendConversationMessage = async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  const text = validateChatText(req.body.text);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ message: "La conversación no es válida" });
  }
  if (!text) {
    return res.status(400).json({ message: "Escribe un mensaje de hasta 2000 caracteres" });
  }

  try {
    const message = await UserModel.sendConversationMessage(conversationId, req.userId, text);
    if (!message) return res.status(404).json({ message: "Conversación no encontrada" });
    return res.status(201).json(message);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return res.status(500).json({ message: "No se pudo enviar el mensaje" });
  }
};

export const chat = async (req, res) => {
  const { text, sender, user_id } = req.body;

  try {
    const createdChat = await UserModel.createChat(text, sender, user_id);
    return res.status(201).json({ message: "Chat creado con éxito", chat: createdChat });
  } catch (error) {
    console.error("Error al crear el chat:", error);
    return res.status(500).json({ message: "Error al crear el chat" });
  }
};

export const chatBot = async (req, res) => {
  const { text, sender, user_id } = req.body;

  try {
    const createdChat = await UserModel.createChatBot(text, sender, user_id);
    return res.status(201).json({ message: "ChatBot creado con éxito", chat: createdChat });
  } catch (error) {
    console.error("Error al crear el chatBot:", error);
    return res.status(500).json({ message: "Error al crear el chatBot" });
  }
};
