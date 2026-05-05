export async function loader({ request }) {
  const url = new URL(request.url);

  const shop = url.searchParams.get("shop");
  const customerId = url.searchParams.get("customerId");

  console.log(" API HIT:", { shop, customerId });

  try {
    const res = await fetch(
      `http://31.97.202.45:5000/api/loyalty/balance?shop=${shop}&shopifyCustomerId=${customerId}`
    );

    const data = await res.json();

    return Response.json(data);

  } catch (err) {
    console.error(" API ERROR:", err);

    return Response.json({
      success: false,
      message: "Server error"
    });
  }
}