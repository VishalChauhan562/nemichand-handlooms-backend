import { Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import Product from '../../models/Product';
import Category from '../../models/Category';

export const addCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
  
      const category = await Category.create({ name });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error creating category', error });
    }
  };
  
  export const updateCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name } = req.body;
  
      const category = await Category.findByPk(id);
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
  
      await category.update({ name });
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error updating category', error });
    }
  };
  
  export const deleteCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
  
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
  
      const productCount = await Product.count({ where: { category_id: id } });
      if (productCount > 0) {
        res.status(400).json({ 
          message: 'Cannot delete category with associated products' 
        });
        return;
      }
  
      await category.destroy();
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting category', error });
    }
  };