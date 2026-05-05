export async function action({ request }) {
  try {
    const body = await request.json();
    const {
      shop, shopifyCustomerId, identifierType,
      identifierValue, customerName, customerPhone
    } = body;

    const response = await fetch("http://31.97.202.45:5000/api/members/connect", {
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
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}