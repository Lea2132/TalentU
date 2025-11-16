import { Router } from "express";
import multer from "multer";
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
} from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
const router = Router();

// Usuarios
router.post("/login", login);
router.post("/register", register);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Productos
router.post("/products", verifyToken, upload.single("image"), createProducts);
router.put("/products/:id", verifyToken, upload.single("image"), editProduct);
router.patch("/products/:id/publish", verifyToken, updateProductPublished);
router.delete("/products/:id", verifyToken, deleteProduct);
router.get("/allproducts", getProducts);
router.get("/products/user/:userId", verifyToken, getUserProducts);

// Perfil actual
router.get("/me", verifyToken, getMe);

// Chat
router.post("/chat", chat);
router.post("/chatbot", chatBot);

export default router;
