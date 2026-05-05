import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      maxWidth: "900px",
      margin: "0 auto",
      padding: "60px 20px",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
        🏆 Guper Loyalty Cloud
      </h1>

      <p style={{ fontSize: "20px", color: "#666", marginBottom: "40px" }}>
        Reward your customers with loyalty points and cashback on every purchase
      </p>

      {/* Features */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginBottom: "60px"
      }}>
        <div style={{ padding: "20px", border: "1px solid #eee", borderRadius: "8px" }}>
          <h3>🎯 Loyalty Points</h3>
          <p>Customers earn points on every purchase automatically</p>
        </div>
        <div style={{ padding: "20px", border: "1px solid #eee", borderRadius: "8px" }}>
          <h3>💰 Cashback Rewards</h3>
          <p>Redeem points as cashback discount at checkout</p>
        </div>
        <div style={{ padding: "20px", border: "1px solid #eee", borderRadius: "8px" }}>
          <h3>🔄 Auto Refund</h3>
          <p>Points automatically reversed on order refunds</p>
        </div>
      </div>

      {/* Install Form */}
      {showForm && (
        <div style={{
          background: "#f9f9f9",
          padding: "40px",
          borderRadius: "12px",
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          <h2 style={{ marginBottom: "20px" }}>Install on your Shopify store</h2>
          <Form method="post" action="/auth/login">
            <input
              type="text"
              name="shop"
              placeholder="your-store.myshopify.com"
              required
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                marginBottom: "12px",
                boxSizing: "border-box"
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                background: "#008060",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Install App
            </button>
          </Form>
        </div>
      )}

      {/* Footer Links */}
      <div style={{ marginTop: "40px", color: "#666" }}>
        <a href="/privacy-policy" style={{ marginRight: "20px", color: "#666" }}>
          Privacy Policy
        </a>
        <a href="/terms-of-service" style={{ marginRight: "20px", color: "#666" }}>
          Terms of Service
        </a>
        <a href="/support" style={{ color: "#666" }}>
          Support
        </a>
      </div>
    </div>
  );
}
