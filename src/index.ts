import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./config/db";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import adminRoutes from "./routes/admin";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import webHookRoutes from "./routes/webHookRoutes";
const app = express();
const PORT = process.env.PORT || 8081;

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000", "https://jolly-puffpuff-57e942.netlify.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  })
);

// Middleware for JSON parsing
app.use(express.json());
app.use(cookieParser());

// Test route
app.post("/test", (req, res) => {
  console.log("req===>", req.body);
  res.json({ received: req.body });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/verify", webHookRoutes);

// Start the server
(async () => {
  await initializeDatabase(); // Connect to the database
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();
