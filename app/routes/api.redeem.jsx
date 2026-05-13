export async function action({ request }) {
  try {
    const body = await request.json();

    console.log("Incoming redeem body:", body);

    //  FIX: Force string type
    const payload = {
      ...body,
      shopifyCustomerId: String(body.shopifyCustomerId),
      orderId: String(body.orderId),
      items: body.items?.map(item => ({
        ...item,
        id: String(item.id),
        name: String(item.name),
        quantity: Number(item.quantity),
        price: Number(item.price),
      }))
    };

    console.log(" Sending to Guper:", payload);

    const res = await fetch(`${process.env.GUPER_BACKEND_URL}/loyalty/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log(" Guper Response:", data);

    return Response.json(data);

  } catch (error) {
    console.error(" Redeem API Error:", error);

    return Response.json({
      success: false,
      message: "Redeem failed",
    });
  }
}