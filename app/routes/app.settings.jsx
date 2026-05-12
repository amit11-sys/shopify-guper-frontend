import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// ✅ Load saved credentials from DB
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await db.guperSettings.findUnique({
    where: { shop }
  });

  return { 
    shop, 
    savedAccount:   settings?.account   || "",
    savedApiKey:    settings?.apiKey    || "",
    savedApiSecret: settings?.apiSecret || "",
    isActive:       settings?.isActive  || false,
  };
};

export default function Settings() {
  const { shop, savedAccount, savedApiKey, savedApiSecret, isActive } = useLoaderData();
  const API_BASE = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [account,      setAccount]      = useState(savedAccount);
  const [apiKey,       setApiKey]       = useState(savedApiKey);
  const [apiSecret,    setApiSecret]    = useState(savedApiSecret);
  const [message,      setMessage]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [active,       setActive]       = useState(isActive);
  const [disconnecting, setDisconnecting] = useState(false);

 const handleSave = async () => {
  console.log("1 HANDLE START");

  setLoading(true);
  setMessage(null);

  try {
    console.log("2 API_BASE", API_BASE);

    const url = `${API_BASE}/api/save-credentials`;

    console.log("3 URL", url);

    const payload = { shop, account, apiKey, apiSecret };

    console.log("4 PAYLOAD", payload);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("5 RESPONSE RECEIVED", res);

    const data = await res.json();

    console.log("6 DATA", data);

    if (data.success) {
      setActive(true);
      setMessage({
        type: "success",
        text: "✅ Credentials saved successfully!"
      });
    } else {
      setMessage({
        type: "error",
        text: "❌ " + data.message
      });
    }
  } catch (err) {
    console.error("7 ERROR", err);

    setMessage({
      type: "error",
      text: "❌ Network error"
    });
  }

  console.log("8 HANDLE END");

  setLoading(false);
};

  // ✅ Disconnect handler
  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect your GUPER account?")) return;
    setDisconnecting(true);
    setMessage(null);
    try {
      const res  = await fetch(`${API_BASE}/api/disconnect`, { method: "POST",
        headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success) {
        setActive(false);
        setAccount("");
        setApiKey("");
        setApiSecret("");
        setMessage({ type: "success", text: "✅ GUPER account disconnected successfully!" });
        setTimeout(() => navigate("/app"), 1500);
      } else {
        setMessage({ type: "error", text: "❌ " + data.message });
      }
    } catch {
      setMessage({ type: "error", text: "❌ Network error" });
    }
    setDisconnecting(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ GUPER Loyalty Settings</h1>
      <p style={styles.subtitle}>Connect your GUPER account to enable loyalty rewards</p>

      {/* Status Badge */}
      <div style={active ? styles.activeBadge : styles.inactiveBadge}>
        {active ? "✅ Connected to GUPER" : "❌ Not Connected"}
      </div>

      {message && (
        <div style={message.type === "success" ? styles.successBanner : styles.errorBanner}>
          {message.text}
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🏪 Store Information</h2>
        <div style={styles.field}>
          <label style={styles.label}>Shopify Store (auto-detected)</label>
          <input style={{...styles.input, background: "#f0f0f0"}} value={shop} disabled />
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔑 GUPER API Credentials</h2>
        <p style={styles.hint}>Get these from your GUPER dashboard → Settings → API Keys</p>

        <div style={styles.field}>
          <label style={styles.label}>GUPER Account Name</label>
          <input
            style={styles.input}
            value={account}
            onChange={e => setAccount(e.target.value)}
            placeholder="e.g. shopify"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>API Key</label>
          <input
            style={styles.input}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="e.g. shopify-Shubham-TDGACIJU"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>API Secret</label>
          <input
            style={styles.input}
            type="password"
            value={apiSecret}
            onChange={e => setApiSecret(e.target.value)}
            placeholder="Your secret key"
          />
        </div>

        <button
          style={loading ? styles.buttonDisabled : styles.button}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "💾 Save & Verify Credentials"}
        </button>
        <button
  type="button"
  onClick={() => {
    alert("CLICK WORKING");
    console.log("CLICK WORKING");
  }}
>
  TEST BUTTON
</button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📖 How to Get Your Credentials</h2>
        <p style={styles.hint}>1. Login to your GUPER dashboard</p>
        <p style={styles.hint}>2. Go to Settings → API Keys</p>
        <p style={styles.hint}>3. Copy Account Name, API Key and API Secret</p>
        <p style={styles.hint}>4. Paste above and click Save</p>
      </div>

      {/* ── Danger Zone: Disconnect ── */}
      {active && (
        <div style={styles.dangerCard}>
          <h2 style={styles.dangerTitle}>⚠️ Danger Zone</h2>
          <p style={styles.dangerText}>
            Disconnecting your GUPER account will stop the loyalty program.
            New customers will not be registered and points will not be awarded.
          </p>
          <button
            style={disconnecting ? styles.disconnectBtnDisabled : styles.disconnectBtn}
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? "Disconnecting..." : "🔌 Disconnect from GUPER"}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container:     { maxWidth: "700px", margin: "0 auto", padding: "30px", fontFamily: "sans-serif" },
  title:         { fontSize: "24px", fontWeight: "bold", marginBottom: "8px" },
  subtitle:      { color: "#666", marginBottom: "16px" },
  activeBadge:   { display: "inline-block", background: "#d4edda", color: "#155724", padding: "6px 14px", borderRadius: "20px", marginBottom: "16px", fontWeight: "600" },
  inactiveBadge: { display: "inline-block", background: "#f8d7da", color: "#721c24", padding: "6px 14px", borderRadius: "20px", marginBottom: "16px", fontWeight: "600" },
  card:          { background: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px", padding: "24px", marginBottom: "20px" },
  cardTitle:     { fontSize: "18px", fontWeight: "600", marginBottom: "16px" },
  hint:          { color: "#888", fontSize: "13px", marginBottom: "8px" },
  field:         { marginBottom: "16px" },
  label:         { display: "block", fontWeight: "500", marginBottom: "6px", fontSize: "14px" },
  input:         { width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  button:        { background: "#008060", color: "#fff", padding: "12px 24px", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer", width: "100%" },
  buttonDisabled:{ background: "#ccc", color: "#fff", padding: "12px 24px", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "not-allowed", width: "100%" },
  successBanner:          { background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" },
  errorBanner:            { background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" },
  dangerCard:             { background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "12px", padding: "24px", marginBottom: "20px" },
  dangerTitle:            { fontSize: "17px", fontWeight: "700", color: "#991b1b", marginBottom: "10px" },
  dangerText:             { color: "#7f1d1d", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" },
  disconnectBtn:          { background: "#dc2626", color: "#fff", padding: "11px 22px", border: "none", borderRadius: "8px", fontSize: "14px", cursor: "pointer", fontWeight: "600" },
  disconnectBtnDisabled:  { background: "#ccc", color: "#fff", padding: "11px 22px", border: "none", borderRadius: "8px", fontSize: "14px", cursor: "not-allowed", fontWeight: "600" },
};