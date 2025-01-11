// src/controllers/categoryController.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import Category from "../models/Category";
import Product from "../models/Product";
import { RequestHandler } from "express-serve-static-core";

export const getAllProducts: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "name",
      order = "ASC",
      category,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = { is_active: true };

    // Apply filters
    if (category) {
      where.category_id = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const startTime = Date.now(); // Record the start time

    console.log("-----API Start Time-----", startTime);

    const products = await Product.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [[String(sort), String(order)]],
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const endTime = Date.now(); // Record the end time
    console.log("-----API End Time-----", endTime);

    const totalTime = endTime - startTime; // Calculate total time
    console.log(`-----Total API Execution Time: ${totalTime}ms-----`);

    res.json({
      products: products.rows,
      total: products.count,
      currentPage: Number(page),
      totalPages: Math.ceil(products.count / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

export const getProductById: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

export const searchProducts: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      res.status(400).json({ message: "Search query is required" });
    }

    const offset = (Number(page) - 1) * Number(limit);

    const products = await Product.findAndCountAll({
      where: {
        is_active: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { sku: { [Op.iLike]: `%${q}%` } },
        ],
      },
      limit: Number(limit),
      offset,
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    res.json({
      products: products.rows,
      total: products.count,
      currentPage: Number(page),
      totalPages: Math.ceil(products.count / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Error searching products", error });
  }
};
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.findAll({
      where: {
        is_active: true,
        stock: { [Op.gt]: 0 },
        is_featured: true, // featured flag
      },
      limit: Number(limit),
      order: [["stock", "DESC"]],
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching featured products", error });
  }
};
