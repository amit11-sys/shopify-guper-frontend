import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { shop, payload } = await authenticate.webhook(request);
  const customer = payload;

  console.log("👤 New customer webhook received:", customer.email);

  try {
    const res = await fetch(`${process.env.GUPER_BACKEND_URL}/members/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop,
        shopifyCustomerId: String(customer.id),
        identifierType:    "email",
        identifierValue:   customer.email,
        customerName:      `${customer.first_name} ${customer.last_name}`,
        customerPhone:     customer.phone || "",
      }),
    });

    const data = await res.json();
    console.log("✅ Customer connected to GUPER:", data);

  } catch (error) {
    console.error("❌ Customer webhook error:", error);
  }

  return new Response(null, { status: 200 });
}