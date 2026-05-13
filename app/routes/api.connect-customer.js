export async function action({ request }) {
  try {
    const body = await request.json();
    const {
      shop, shopifyCustomerId, identifierType,
      identifierValue, customerName, customerPhone
    } = body;

    const response = await fetch(`${process.env.GUPER_BACKEND_URL}/members/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop, shopifyCustomerId, identifierType,
        identifierValue, customerName, customerPhone,
      }),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("STEP1 ERROR:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}