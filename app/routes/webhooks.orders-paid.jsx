import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { shop, payload } = await authenticate.webhook(request);

  const order = payload;
  const orderId = `SHOP-ORD-${order.id}`;

  console.log("🎯 Order paid webhook received for:", shop);
  console.log("🔍 Order data:", {
    id:            order.id,
    contact_email: order.contact_email,
    email:         order.email,
    customer:      order.customer,
  });

  try {
    // ✅ Safety checks
    if (!order.customer) {
      console.log("❌ No customer found, skipping Guper");
      return new Response(null, { status: 200 });
    }

    if (!order.line_items || order.line_items.length === 0) {
      console.log("❌ No items in order, skipping Guper");
      return new Response(null, { status: 200 });
    }

    // ✅ Email - contact_email is most reliable
    const email =
      order.contact_email ||
      order.customer?.email ||
      order.email ||
      order.billing_address?.email;

    console.log("🧑 Email Check:", {
      customerEmail: order.customer?.email,
      orderEmail: order.email,
      billingEmail: order.billing_address?.email,
      finalEmail: email
    });

    if (!email) {
      console.log("❌ No email found, skipping");
      return new Response(null, { status: 200 });
    }

    const customerData = {
      id: String(order.customer.id),
      email: email,
      name:
        `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() ||
        "Customer",
    };

    // 🟢 STEP 1: CONNECT CUSTOMER (CRITICAL FIX)
    console.log("🔗 Connecting customer...");

    const connectRes = await fetch(
      "http://31.97.202.45:5000/api/members/connect",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop,
          shopifyCustomerId: customerData.id,
          identifierType: "email",
          identifierValue: customerData.email,
          customerName: customerData.name,
          customerPhone: "",
        }),
      }
    );

    const connectData = await connectRes.json();
    console.log("🔗 Connect Response:", connectData);

    // 🟡 Prepare order payload
    const payloadData = {
      shop,
      orderId,
      client: customerData,
      items: order.line_items.map((item) => ({
        id: String(item.product_id || item.variant_id),
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
    };

    console.log("📦 Sending to Guper (Award):", payloadData);

    // 🟠 STEP 2: AWARD
    const awardRes = await fetch(
      "http://31.97.202.45:5000/api/reward/award",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      }
    );

    const awardData = await awardRes.json();
    console.log("🎁 Award Response:", awardData);

    // ❌ Handle duplicate safely
    if (!awardData.success) {
      if (awardData.message === "Order already processed") {
        console.log("⚠️ Duplicate webhook — already processed");
        return new Response(null, { status: 200 });
      }

      console.log("❌ Award failed:", awardData);
      return new Response(null, { status: 200 });
    }

    // 🔵 STEP 3: CONFIRM
    if (awardData.data?.confirmToken) {
      console.log("🔐 Confirming order...");

      const confirmRes = await fetch(
        "http://31.97.202.45:5000/api/reward/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shop,
            confirmToken: awardData.data.confirmToken,
            orderId,
          }),
        }
      );

      const confirmData = await confirmRes.json();
      console.log("✅ Confirm Response:", confirmData);
    } else {
      console.log("❌ No confirmToken received");
    }

  } catch (error) {
    console.error("❌ Webhook error:", error);
  }

  return new Response(null, { status: 200 });
}