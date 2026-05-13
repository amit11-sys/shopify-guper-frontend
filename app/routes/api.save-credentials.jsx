import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const body = await request.json();
  const { shop, account, apiKey, apiSecret } = body;

  console.log("🔥 Incoming request body:", body);
  console.log("🏪 Shop:", shop);

  try {
    const url = `${process.env.GUPER_BACKEND_URL}/merchant/save`;

    console.log("🚀 Calling backend URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, account, apiKey, apiSecret }),
    });

    console.log("📡 Response status:", response.status);

    const data = await response.json();

    console.log("📦 Backend response data:", data);

    if (data.success) {
      console.log("💾 Saving to DB...");

      await db.guperSettings.upsert({
        where: { shop },
        update: { account, apiKey, apiSecret, isActive: true },
        create: { shop, account, apiKey, apiSecret, isActive: true },
      });

      console.log("✅ DB updated successfully");
    } else {
      console.log("⚠️ Backend returned failure:", data);
    }

    return Response.json(data);
  } catch (error) {
    console.error("❌ Error in action:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};