import { UserModel } from "../models/user.models.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ======================== CREAR USUARIO ADMIN POR DEFECTO ========================
export const createDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@tdos.com";
    const adminPassword = await bcryptjs.hash("admin123", 10);

    const existingAdmin = await UserModel.findByEmail(adminEmail);
    if (!existingAdmin) {
      await UserModel.newuser("Administrador", adminEmail, adminPassword, true);
      console.log("✅ Usuario administrador creado con éxito");
    } else {
      console.log("ℹ️ El usuario administrador ya existe");
    }
  } catch (error) {
    console.error("❌ Error al crear el usuario administrador:", error);
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

// ======================== PRODUCTOS ========================
export const createProducts = async (req, res) => {
  const { title, description, price, category } = req.body;
  const image_url = req.file ? req.file.path : null;

  try {
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
    return res.status(200).json({ message: "Producto eliminado", product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await UserModel.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({ message: "Error al obtener productos" });
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
    console.error("Error al obtener productos del usuario:", error);
    return res.status(500).json({ message: "Error al obtener productos del usuario" });
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
