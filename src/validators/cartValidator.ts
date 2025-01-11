// src/validators/cartValidator.ts

interface CartItemInput {
  product_id: number;
  quantity: number;
}

interface ValidationResult {
  success: boolean;
  errors?: string[];
}

export const validateCartItem = (data: CartItemInput): ValidationResult => {
  const errors: string[] = [];

  if (!data.product_id || typeof data.product_id !== "number") {
    errors.push("Valid product_id is required");
  }

  if (
    !data.quantity ||
    typeof data.quantity !== "number" ||
    data.quantity < 1
  ) {
    errors.push("Quantity must be a positive number");
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
