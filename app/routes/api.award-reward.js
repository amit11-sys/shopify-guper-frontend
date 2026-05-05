export async function action({ request }) {
  try {
    const body = await request.json();
    const { shop, orderId, client, items } = body;

    const response = await fetch("http://31.97.202.45:5000/api/reward/award", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, orderId, client, items }),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}