import { Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import Category from '../models/Category';
import Product from '../models/Product';

export const getAllCategories: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

export const getCategoryById: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await Category.findByPk(id);
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

export const getProductsByCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      page = '1', 
      limit = '10', 
      sort = 'name', 
      order = 'ASC' 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const products = await Product.findAndCountAll({
      where: { 
        category_id: id,
        is_active: true 
      },
      limit: Number(limit),
      offset,
      order: [[sort.toString(), order.toString()]],
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    res.json({
      products: products.rows,
      total: products.count,
      currentPage: Number(page),
      totalPages: Math.ceil(products.count / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by category', error });
  }
};