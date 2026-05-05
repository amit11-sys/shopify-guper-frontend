import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const functionId = "019ddcf1-f37c-7126-87ef-c701016a6e5f";

    const response = await admin.graphql(`
      mutation {
        discountAutomaticAppCreate(
          automaticAppDiscount: {
            title: "Guper Cashback"
            functionId: "${functionId}"
            startsAt: "${new Date().toISOString()}"
            combinesWith: {
              orderDiscounts: true
              productDiscounts: true
              shippingDiscounts: true
            }
          }
        ) {
          automaticAppDiscount {
            discountId
          }
          userErrors {
            field
            message
          }
        }
      }
    `);

    const data = await response.json();
    console.log("✅ Discount created:", data);

  } catch (err) {
    console.error("❌ Error creating discount:", err);
  }

  return new Response();
};