import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);
  
  const body = await request.json();
  const { shop, account, apiKey, apiSecret } = body;

  try {
    // Send to GUPER
    const response = await fetch("http://31.97.202.45:5000/api/merchant/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, account, apiKey, apiSecret }),
    });

    const data = await response.json();

    if (data.success) {
      // ✅ Save to database
      await db.guperSettings.upsert({
        where:  { shop },
        update: { account, apiKey, apiSecret, isActive: true },
        create: { shop, account, apiKey, apiSecret, isActive: true },
      });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
};