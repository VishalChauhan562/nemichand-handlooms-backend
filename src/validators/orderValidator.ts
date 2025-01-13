// src/validators/orderValidator.ts
interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

interface OrderInput {
  shipping_address: ShippingAddress;
  payment_method: "CARD" | "UPI" | "NETBANKING" | "CASH";
}

interface ValidationResult {
  success: boolean;
  errors?: string[];
}

export const validateOrder = (data: OrderInput): ValidationResult => {
  const errors: string[] = [];

  // Validate shipping address
  if (!data.shipping_address) {
    errors.push("Shipping address is required");
  } else {
    const { address, city, state, country, zip_code } = data.shipping_address;
    if (!address) errors.push("Address is required");
    if (!city) errors.push("City is required");
    if (!state) errors.push("State is required");
    if (!country) errors.push("Country is required");
    if (!zip_code) errors.push("ZIP code is required");
  }

  // Validate payment method
  const validPaymentMethods = ["CARD", "UPI", "NETBANKING", "CASH", "razorpay"];
  if (!data.payment_method) {
    errors.push("Payment method is required");
  } else if (!validPaymentMethods.includes(data.payment_method)) {
    errors.push("Invalid payment method");
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
