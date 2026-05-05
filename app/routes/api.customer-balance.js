// ✅ Use appProxy authentication instead of admin
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  // This handles app proxy requests from storefront
  const { session } = await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const shopifyCustomerId = url.searchParams.get("shopifyCustomerId");

  if (!shopifyCustomerId) {
    return Response.json(
      { success: false, message: "shopifyCustomerId required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `http://31.97.202.45:5000/api/loyalty/balance?shop=${session.shop}&shopifyCustomerId=${shopifyCustomerId}`
    );
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}