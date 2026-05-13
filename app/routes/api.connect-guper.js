export async function action({ request }) {
  try {
    const body = await request.json();

    const { shop, account, apiKey, apiSecret } = body;

    if (!shop || !apiKey || !apiSecret) {
      return Response.json(
        { success: false, message: "shop, apiKey and apiSecret are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
  `${process.env.GUPER_BACKEND_URL}/merchant/save`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shop, account, apiKey, apiSecret }),
  }
);

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("STEP1 ERROR:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}