import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend the Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can replace `any` with a more specific type for `user`
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "pinky";

// Authenticate token middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: "Authentication token is required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.user = decoded; // Assign decoded token to req.user
    next(); // Proceed to the next middleware
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Optional: Add admin authentication middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  authenticateToken(req, res, async () => {
    console.log("req.user===>",req.user);
    const userDb = await User.findByPk(req.user.id);
    if (req.user && userDb && userDb.is_admin === true) {
      next();
    } else {
      res.status(403).json({ message: "Admin access required" });
    }
  });
};


