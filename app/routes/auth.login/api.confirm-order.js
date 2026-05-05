export async function action({ request }) {
  try {
    const body = await request.json();
    const { shop, confirmToken, orderId } = body;

    const response = await fetch("http://31.97.202.45:5000/api/reward/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, confirmToken, orderId }),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}