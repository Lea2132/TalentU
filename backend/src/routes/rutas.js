import { Router } from "express";
import multer from "multer";
import { cloudinaryConfigured } from "../services/cloudinary.js";
import {
  login,
  register,
  createProducts,
  editProduct,
  deleteProduct,
  getProducts,
  getUserProducts,
  updateProductPublished,
  getAllUsers,
  deleteUser,
  chat,
  chatBot,
  getMe,
  getProductComments,
  createComment,
  setProductLike,
  setProductRating,
  getAllComments,
  deleteComment,
  getConversations,
  startConversation,
  getConversationMessages,
  sendConversationMessage,
} from "../controllers/user.controllers.js";
import { verifyToken, optionalVerifyToken, requireAdmin } from "../middlewares/authMiddleware.js";

const storage = cloudinaryConfigured
  ? multer.memoryStorage()
  : multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

const upload = multer({ storage });
if (!cloudinaryConfigured && process.env.NODE_ENV === "production") {
  console.warn("Cloudinary no está configurado; los archivos subidos en Render no serán persistentes.");
}
const router = Router();

// Usuarios
router.post("/login", login);
router.post("/register", register);
router.get("/users", verifyToken, requireAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, requireAdmin, deleteUser);

// Productos
router.post("/products", verifyToken, upload.single("image"), createProducts);
router.put("/products/:id", verifyToken, upload.single("image"), editProduct);
router.patch("/products/:id/publish", verifyToken, updateProductPublished);
router.delete("/products/:id", verifyToken, deleteProduct);
router.get("/allproducts", optionalVerifyToken, getProducts);
router.get("/products/user/:userId", verifyToken, getUserProducts);
router.get("/products/:productId/comments", getProductComments);
router.post("/products/:productId/comments", verifyToken, createComment);
router.put("/products/:productId/like", verifyToken, setProductLike);
router.put("/products/:productId/rating", verifyToken, setProductRating);

// Administración de comentarios
router.get("/admin/comments", verifyToken, requireAdmin, getAllComments);
router.delete("/admin/comments/:id", verifyToken, requireAdmin, deleteComment);

// Perfil actual
router.get("/me", verifyToken, getMe);

// Chat
router.get("/conversations", verifyToken, getConversations);
router.post("/conversations", verifyToken, startConversation);
router.get("/conversations/:conversationId/messages", verifyToken, getConversationMessages);
router.post("/conversations/:conversationId/messages", verifyToken, sendConversationMessage);
router.post("/chat", chat);
router.post("/chatbot", chatBot);

export default router;
