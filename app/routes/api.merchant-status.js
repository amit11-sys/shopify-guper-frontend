export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json({ success: false, message: "shop is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `http://31.97.202.45:5000/api/merchant/status/${shop}`
    );
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}