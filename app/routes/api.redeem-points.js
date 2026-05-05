export async function action({ request }) {
  try {
    const body = await request.json();
    const { shop, shopifyCustomerId, orderId, items } = body;

    const response = await fetch("http://31.97.202.45:5000/api/loyalty/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, shopifyCustomerId, orderId, items }),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}