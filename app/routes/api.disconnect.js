import { authenticate } from "../shopify.server";
import db from "../db.server";

const GUPER_API = process.env.GUPER_BACKEND_URL;

// ✅ POST — credentials DB se delete karo + GUPER ko notify karo
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // GUPER backend ko bhi notify karo (optional — ignore if fails)
    try {
      await fetch(`${GUPER_API}/api/merchant/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop }),
      });
    } catch {
      // GUPER side error ignore karo — DB se toh delete karna hi hai
    }

    // DB se credentials delete karo
    await db.guperSettings.delete({ where: { shop } });

    return Response.json({ success: true, message: "GUPER account disconnected successfully." });
  } catch (error) {
    console.error("Disconnect error:", error);
    return Response.json(
      { success: false, message: "Failed to disconnect. Please try again." },
      { status: 500 }
    );
  }
};
