// src/controllers/admin/productController.ts
import { Request, Response } from "express";
import { RequestHandler } from "express-serve-static-core";
import Product from "../../models/Product";
import Category from "../../models/Category";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../../config/db";

export const addProduct: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
      is_active = true,
      is_featured,
    } = req.body;

    const category = await Category.findByPk(category_id);
    if (!category) {
      res.status(400).json({ message: "Invalid category" });
      return;
    }

    // Get the category code (first 3 letters uppercase)
    const categoryCode = category.name.slice(0, 3).toUpperCase();

    // Get the count of existing products in this category to generate sequence
    const productCount = await Product.count({
      where: {
        category_id,
      },
    });

    // Generate SKU: CATEGORY-YEARMONTH-SEQUENCE
    // Example: BED-202401-001
    const date = new Date();
    const yearMonth =
      date.getFullYear().toString().slice(-2) +
      (date.getMonth() + 1).toString().padStart(2, "0");
    const sequence = (productCount + 1).toString().padStart(3, "0");
    const sku = `${categoryCode}-${yearMonth}-${sequence}`;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category_id,
      sku,
      image_url,
      is_active,
      is_featured,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};

export const updateProduct: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      category_id,
      sku,
      image_url,
      is_active,
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }
    }

    await product.update({
      name,
      description,
      price,
      stock,
      category_id,
      sku,
      image_url,
      is_active,
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

export const deleteProduct: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

export const getAllProducts: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      sort = "createdAt",
      order = "DESC",
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const products = await Product.findAndCountAll({
      limit: Number(limit),
      offset,
      order: [[sort.toString(), order.toString()]],
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    });

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

// Bulk

export const addProductsBulk: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const productsData = req.body.products; // Expecting an array of products

    if (!Array.isArray(productsData) || productsData.length === 0) {
      res.status(400).json({ message: "No products provided" });
      return;
    }

    // Collect unique category IDs from products
    const categoryIds = [
      ...new Set(productsData.map((product) => product.category_id)),
    ];

    // Fetch categories to validate and get their names
    const categories = await Category.findAll({
      where: { id: categoryIds },
      transaction, // Use the transaction
    });

    if (categories.length !== categoryIds.length) {
      await transaction.rollback();
      res.status(400).json({ message: "One or more invalid categories" });
      return;
    }

    // Create a map of category id to category object
    const categoryMap = new Map<number, Category>();
    categories.forEach((category) => {
      categoryMap.set(category.id, category);
    });

    // Prepare products for insertion
    const productsToCreate = [];
    const date = new Date();
    const yearMonth =
      date.getFullYear().toString().slice(-2) +
      (date.getMonth() + 1).toString().padStart(2, "0");

    // Initialize sequence numbers for each category
    const categorySequences: { [key: number]: number } = {};

    // Fetch current product counts per category and year-month
    for (const categoryId of categoryIds) {
      const productCount = await Product.count({
        where: {
          category_id: categoryId,
          sku: {
            [Op.like]: `%${yearMonth}%`,
          },
        },
        transaction, // Use the transaction
      });
      categorySequences[categoryId] = productCount;
    }

    for (const productData of productsData) {
      const {
        name,
        description,
        price,
        stock,
        category_id,
        image_url,
        is_active = true,
        is_featured,
      } = productData;

      const category = categoryMap.get(category_id);
      const categoryCode = category?.name.slice(0, 3).toUpperCase();

      // Increment the sequence
      categorySequences[category_id] += 1;
      const sequence = categorySequences[category_id]
        .toString()
        .padStart(3, "0");

      // Generate SKU: CATEGORY-YEARMONTH-SEQUENCE
      const sku = `${categoryCode}-${yearMonth}-${sequence}`;

      productsToCreate.push({
        name,
        description,
        price,
        stock,
        category_id,
        sku,
        image_url,
        is_active,
        is_featured,
      });
    }

    // Bulk create products within the transaction
    const createdProducts = await Product.bulkCreate(productsToCreate, {
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    res.status(201).json(createdProducts);
  } catch (error) {
    // Rollback the transaction on error
    if (transaction) await transaction.rollback();

    res.status(500).json({ message: "Error creating products", error });
  }
};
