import express from "express";
import cors from "cors";
import { initializeDatabase } from "./config/db";
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes'
import categoryRoutes from './routes/categoryRoutes'
import adminRoutes from './routes/admin'
const app = express();
const PORT = process.env.PORT || 8081;


app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  }));

// Middleware for JSON parsing
app.use(express.json());

// Test route
app.post("/test", (req, res) => {
  console.log("req===>", req.body);
  res.json({ received: req.body });
});


app.use('/api/users', userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

// Start the server
(async () => {
  await initializeDatabase(); // Connect to the database
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();
