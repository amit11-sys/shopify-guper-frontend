export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  try {
    const response = await fetch(
      `${process.env.GUPER_BACKEND_URL}/merchant/customers/${shop}`
    );
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("STEP1 ERROR:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}