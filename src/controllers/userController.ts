import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { Op } from "sequelize";

// Register a new user
export const registerUser: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password, phone_number, first_name, last_name } = req.body;

    // Input validation
    if (!email || !password || !phone_number || !first_name || !last_name) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters long." });
      return;
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone_number }] },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email or phone number already in use." });
      return;
    }

    // Create the user
    const user = await User.create({
      email,
      password: password,
      phone_number,
      first_name,
      last_name,
    });

    res.status(201).json({ message: "User registered successfully!", user });
  } catch (error) {
    res.status(500).json({ message: "Registration failed.", error: (error as Error).message });
  }
};

// Login a user
export const loginUser: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { identifier, password } = req.body;
     // Identifier can be email or phone number

    // Validate input
    if (!identifier || !password) {
      res.status(400).json({ message: "Email/phone and password are required." });
      return;
    }

    // Find user by email or phone number
    const user = await User.findOne({
      where: { [Op.or]: [{ email: identifier }, { phone_number: identifier }] },
    });

    
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "pinky",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: (error as Error).message });
  }
};

// Fetch user profile
export const getProfile: RequestHandler = async (req, res): Promise<void> => {
  try {
    const user = req.user; // User set in middleware
    res.status(200).json({ message: "Profile fetched successfully!", user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile.", error: (error as Error).message });
  }
};

// Admin


export const createAdmin: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password, phone_number, first_name, last_name } = req.body;

    // Input validation
    if (!email || !password || !phone_number || !first_name || !last_name) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters long." });
      return;
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone_number }] },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email or phone number already in use." });
      return;
    }

    // Create the user
    const user = await User.create({
      email,
      password: password,
      phone_number,
      first_name,
      last_name,
      is_admin : true
    });

    res.status(201).json({ message: "Admin registered successfully!", user });
  } catch (error) {
    res.status(500).json({ message: "Registration failed.", error: (error as Error).message });
  }
};