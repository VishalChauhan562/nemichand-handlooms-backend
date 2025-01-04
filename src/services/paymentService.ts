// src/services/paymentService.ts
import Razorpay from 'razorpay';
import * as crypto from 'crypto';  

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret'
});

interface PaymentInitializeParams {
  amount: number;
  orderId: number | string;
  currency: string;
}

export const initializeRazorpay = async ({
  amount,
  orderId,
  currency
}: PaymentInitializeParams) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `order_${orderId}`,
      payment_capture: 1
    };

    const response = await razorpay.orders.create(options);
    return {
      id: response.id,
      amount: response.amount,
      currency: response.currency,
      receipt: response.receipt
    };
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    throw new Error('Payment initialization failed');
  }
};

export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
) => {
  try {
    // Generate signature verification hash
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    shasum.update(`${orderId}|${paymentId}`);
    const generatedSignature = shasum.digest('hex');

    // Verify signature
    const isValid = generatedSignature === signature;
    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};