// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

export function run(input) {
  const subtotal = parseFloat(input?.cart?.cost?.subtotalAmount?.amount ?? "0");
  const attributeValue = input?.cart?.attribute?.value;
  const discountAmount = attributeValue ? parseFloat(attributeValue) : 0;

  if (!discountAmount || discountAmount <= 0 || subtotal <= 0) {
    return {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts: [],
    };
  }

  const finalDiscount = Math.min(discountAmount, subtotal);

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        value: {
          fixedAmount: {
            amount: finalDiscount.toFixed(2),  
          },
        },
        targets: [{ orderSubtotal: { excludedVariantIds: [] } }],
        message: `Guper Cashback: -${finalDiscount.toFixed(2)}`,
      },
    ],
  };
}