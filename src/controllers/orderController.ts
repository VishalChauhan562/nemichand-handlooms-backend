// src/controllers/orderController.ts
import { RequestHandler } from "express";
import {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Product,
  Payment,
  Shipment,
} from "../models";
import { ValidationError } from "sequelize";
import { validateOrder } from "../validators/orderValidator";
import { sequelize } from "../config/db";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const createOrder: RequestHandler = async (req, res) => {
  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user?.id;
    const { shipping_address, payment_method } = req.body;

    // Validate input
    const validationResult = validateOrder(req.body);
    if (!validationResult.success) {
      res.status(400).json({ errors: validationResult.errors });
      return;
    }

    // Get user's cart
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          include: [Product],
        },
      ],
      transaction,
    });

    if (!cart || cart.items.length === 0) {
      await transaction.rollback();
      res.status(400).json({ message: "Cart is empty" });
      return;
    }

    // Verify stock availability and lock products
    for (const item of cart.items) {
      const product = await Product.findOne({
        where: { id: item.product_id },
        lock: true, // Lock the row for update
        transaction,
      });

      if (!product || product.stock < item.quantity) {
        await transaction.rollback();
        res.status(400).json({
          message: `Insufficient stock for product: ${
            product?.name || item.product_id
          }`,
        });
        return;
      }

      // Update product stock
      await product.update(
        {
          stock: product.stock - item.quantity,
        },
        { transaction }
      );
    }

    // Calculate total price
    const total_price = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // Create order
    const order = await Order.create(
      {
        user_id: userId,
        total_price,
        order_date: new Date(),
        status: "PENDING", // Initial status
      },
      { transaction }
    );

    // Create order items
    await Promise.all(
      cart.items.map((cartItem) =>
        OrderItem.create(
          {
            order_id: order.id,
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            price: cartItem.product.price,
          },
          { transaction }
        )
      )
    );

    // Create shipment
    await Shipment.create(
      {
        order_id: order.id,
        ...shipping_address,
        shipment_date: new Date(),
        status: "PENDING",
      },
      { transaction }
    );

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total_price * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_order_${order.id}`,
      payment_capture: true, // Auto capture payment
    });

    // Create payment record with Razorpay order ID
    const payment = await Payment.create(
      {
        order_id: order.id,
        payment_method,
        amount: total_price,
        payment_date: new Date(),
        razorpay_order_id: razorpayOrder.id, // Save Razorpay order ID
        status: "PENDING",
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    // Return order details along with Razorpay order info
    res.status(201).json({
      order: {
        ...order.toJSON(),
        payment: payment.toJSON(),
      },
      razorpayOrder,
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();

    console.error("Error in createOrder:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrders: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "image_url"],
            },
          ],
        },
        Payment,
        Shipment,
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getOrders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price", "image_url"],
            },
          ],
        },
        Payment,
        Shipment,
      ],
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error in getOrderById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    // Optional: Check if user is admin
    const user = await req.user;
    if (!user.is_admin) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const order = await Order.findByPk(id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    await order.update({ status });

    res.status(200).json(order);
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyPayment: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const transaction = await sequelize.transaction(); // Start a new transaction

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart_id,
    } = req.body;

    // Retrieve payment record from the database
    const payment = await Payment.findOne({
      where: { razorpay_order_id },
      transaction, // Include the transaction in the query
    });

    if (!payment) {
      await transaction.rollback(); // Rollback on failure
      res.status(404).json({ message: "Payment record not found" });
      return;
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Update payment status as failed
      await payment.update({ status: "FAILED" }, { transaction });
      await transaction.rollback(); // Rollback on failure
      res.status(400).json({ message: "Invalid payment signature" });
      return;
    }

    // Update payment and order status
    await payment.update(
      {
        status: "SUCCESS",
        razorpay_payment_id,
      },
      { transaction }
    );

    await Order.update(
      { status: "CONFIRMED" },
      { where: { id: payment.order_id }, transaction }
    );

    // Clear cart
    await CartItem.destroy({
      where: { cart_id: cart_id },
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);

    // Rollback the transaction on any error
    await transaction.rollback();

    res.status(500).json({ message: "Payment verification failed" });
  }
};
