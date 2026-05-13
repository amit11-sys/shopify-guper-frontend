import { authenticate } from "../shopify.server";


export async function action({ request }) {
  const { shop, payload } = await authenticate.webhook(request);

  const refund = payload;
  const orderId = `SHOP-ORD-${refund.order_id}`;

  console.log("🔄 Refund webhook received for shop:", shop, "| Order ID:", orderId);

  try {
    const res = await fetch(`${process.env.GUPER_BACKEND_URL}/loyalty/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop,
        shopifyOrderId: orderId,
      }),
    });

    const data = await res.json();

    if (data.success) {
      console.log("✅ Points refund adjusted in GUPER:", data);
    } else {
      console.warn("⚠️ GUPER refund adjustment failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Refund webhook error:", error);
  }

  return new Response(null, { status: 200 });
}
