import express from "express"
import rutas from "./routes/rutas.js"
import cors from "cors"
import morgan from "morgan"

const app = express()

app.use(morgan("dev"));
app.use(express.json())
const allowedOrigins = process.env.FRONTEND_URL
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !allowedOrigins?.length || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
}));
app.use("/api",rutas)
app.use('/uploads', express.static('uploads'));
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

export default app
