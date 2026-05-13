export async function action({ request }) {
  try {
    const body = await request.json();
    const { shop, shopifyOrderId } = body;

    const response = await fetch(`${process.env.GUPER_BACKEND_URL}/loyalty/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, shopifyOrderId }),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("STEP1 ERROR:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}