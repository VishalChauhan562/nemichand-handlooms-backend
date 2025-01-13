// src/controllers/cartController.ts
import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import CartItem from "../models/CartItem";
import { ValidationError } from "sequelize";
import { validateCartItem } from "../validators/cartValidator";
import { RequestHandler } from "express-serve-static-core";

export const getCart: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items", // Add this alias
          attributes: ["id", "quantity"],
          include: [
            {
              model: Product,
              as: "product", // Add this alias
              attributes: ["id", "name", "price", "image_url", "stock"],
            },
          ],
        },
      ],
      attributes: ["id"],
      order: [
        [
          { model: CartItem, as: "items" },
          { model: Product, as: "product" },
          "id",
          "ASC",
        ],
      ],
    });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Transform the response to return only necessary data
    const cartItems = cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product,
    }));

    const cart_response = {
      cart_id: cart.id,
      data: cartItems,
      total: cartItems.length,
      user_id: userId,
    };

    res.status(200).json(cart_response);
    return;
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const addItem: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { product_id, quantity } = req.body;

    const validationResult = validateCartItem(req.body);
    if (!validationResult.success) {
      res.status(400).json({ errors: validationResult.errors });
      return;
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (product.stock < quantity) {
      res.status(400).json({ message: "Insufficient stock" });
      return;
    }

    let cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    await cart.addItem(product_id, quantity);

    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [{ model: CartItem, include: [Product] }],
    });

    res.status(200).json(updatedCart);
    return;
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error("Error in addItem:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const updatedCart: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400).json({ message: "Invalid quantity" });
      return;
    }

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const cartItem = await CartItem.findOne({
      where: { id, cart_id: cart.id },
    });

    if (!cartItem) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }

    const product = await Product.findByPk(cartItem.product_id);
    if (product && product.stock < quantity) {
      res.status(400).json({ message: "Insufficient stock" });
      return;
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [{ model: CartItem, include: [Product] }],
    });

    res.status(200).json(updatedCart);
    return;
  } catch (error) {
    console.error("Error in updateItem:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const removeItem: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const deleted = await CartItem.destroy({
      where: { id, cart_id: cart.id },
    });

    if (!deleted) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }

    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [{ model: CartItem, include: [Product] }],
    });

    res.status(200).json(updatedCart);
    return;
  } catch (error) {
    console.error("Error in removeItem:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
