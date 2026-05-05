import { authenticate } from "../shopify.server";

export async function action({ request }) {
  try {
    const { admin } = await authenticate.public.appProxy(request);
    const body = await request.json();
    const { shopifyCustomerId, discountAmount } = body;

    console.log("💾 Saving pending discount:", shopifyCustomerId, discountAmount);

    const response = await admin.graphql(`
      mutation {
        customerUpdate(
          input: {
            id: "gid://shopify/Customer/${shopifyCustomerId}"
            metafields: [
              {
                namespace: "guper"
                key: "pending_discount"
                value: "${discountAmount}"
                type: "number_decimal"
              }
            ]
          }
        ) {
          customer {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `);

    const data = await response.json();
    console.log("💾 Metafield save response:", JSON.stringify(data, null, 2));

    const userErrors = data?.data?.customerUpdate?.userErrors;
    if (userErrors?.length > 0) {
      return Response.json({ success: false, errors: userErrors });
    }

    return Response.json({ success: true });

  } catch (err) {
    console.error("❌ save-pending-discount error:", err);
    return Response.json({ success: false, error: err.message });
  }
}