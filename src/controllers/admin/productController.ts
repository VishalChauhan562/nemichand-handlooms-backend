// src/controllers/admin/productController.ts
import { Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import Product from '../../models/Product';
import Category from '../../models/Category';

export const addProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category_id,
      sku,
      image_url,
      is_active = true,
      is_featured
    } = req.body;

    const category = await Category.findByPk(category_id);
    if (!category) {
      res.status(400).json({ message: 'Invalid category' });
      return;
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category_id,
      sku,
      image_url,
      is_active,
      is_featured
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

export const updateProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
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
      is_active
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        res.status(400).json({ message: 'Invalid category' });
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
      is_active
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

export const getAllProducts: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', sort = 'createdAt', order = 'DESC' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const products = await Product.findAndCountAll({
      limit: Number(limit),
      offset,
      order: [[sort.toString(), order.toString()]],
      include: [{
        model: Category,
        attributes: ['id', 'name']
      }]
    });

    res.json({
      products: products.rows,
      total: products.count,
      currentPage: Number(page),
      totalPages: Math.ceil(products.count / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

